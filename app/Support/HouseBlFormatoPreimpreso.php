<?php

namespace App\Support;

use chillerlan\QRCode\Common\EccLevel;
use chillerlan\QRCode\Output\QRGdImagePNG;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use App\Models\HouseBl;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Carbon;

/**
 * Arma los textos del HBL tal como van en el formulario pre-impreso de Open
 * Access (mismas posiciones y formato que la planilla Excel con la que se
 * imprimía: mayúsculas, números "17.533,00", fecha "20-Aug-26", QR...).
 *
 * Variantes:
 *  - dam:              digital, sobre el pre-impreso escaneado, con la marca
 *                      "DOCUMENTO VALIDO PARA REGISTRO DE DAM" y fletes AS AGREED.
 *  - copia / original: solo los datos, sin fondo ni líneas, para imprimir
 *                      encima del papel pre-impreso.
 *  - original_digital: digital, sobre el pre-impreso escaneado (anverso y
 *                      reverso), con firma y sello.
 *  - consulta:         copia digital de solo lectura (Comercial / Operativo).
 */
class HouseBlFormatoPreimpreso
{
    // Tamaño de la hoja escaneada del pre-impreso (pt). Las coordenadas del
    // Excel coinciden con ella medidas desde la esquina superior izquierda.
    public const PAGINA_ESCANEADA = [606, 836];

    public const PAGINA_A4 = [595.28, 841.89];

    private const VARIANTES = [
        'dam' => ['fondo' => true, 'reverso' => false, 'firma' => false, 'marca_dam' => true, 'etiqueta' => null, 'fletes_as_agreed' => true],
        'copia' => ['fondo' => false, 'reverso' => false, 'firma' => false, 'marca_dam' => false, 'etiqueta' => 'COPY NON NEGOTIABLE', 'fletes_as_agreed' => false],
        'original' => ['fondo' => false, 'reverso' => false, 'firma' => false, 'marca_dam' => false, 'etiqueta' => 'ORIGINAL', 'fletes_as_agreed' => false],
        'original_digital' => ['fondo' => true, 'reverso' => true, 'firma' => true, 'marca_dam' => false, 'etiqueta' => 'ORIGINAL', 'fletes_as_agreed' => false],
        'consulta' => ['fondo' => true, 'reverso' => false, 'firma' => false, 'marca_dam' => false, 'etiqueta' => 'COPY NON NEGOTIABLE', 'fletes_as_agreed' => false],
    ];

    // Filas de flete del recuadro "Freight & Charges" (filas 63-68 del Excel).
    private const FILAS_FLETE = 5;

    public static function variantes(): array
    {
        return array_keys(self::VARIANTES);
    }

    public static function pdf(HouseBl $house, string $tipo): \Barryvdh\DomPDF\PDF
    {
        return Pdf::loadView('pdf.house_bl_preimpreso', [
            'hbl' => self::para(HouseBlPdfDatos::para($house), $tipo),
        ])->setOption('isFontSubsettingEnabled', true);
    }

    public static function para(array $datos, string $tipo): array
    {
        $variante = self::VARIANTES[$tipo] ?? self::VARIANTES['dam'];
        $embarque = $datos['embarque'];
        $house = $datos['house'];

        // Renglones como en el pre-impreso: el shipper tiene lugar para 3 y el
        // consignee para 4; las direcciones largas se parten por palabras.
        $consignee = self::renglones([
            self::mayus($embarque['consignatario_nombre']),
            $embarque['consignatario_nit'] ? 'NIT '.$embarque['consignatario_nit'] : null,
            self::mayus($embarque['consignatario_direccion']),
        ], 4);

        $contenedores = array_map(fn (array $c) => [
            'marcas' => implode(' / ', array_filter([
                $c['numero_contenedor'] ?? null,
                $c['numero_sello'] ?? null,
                FormatoContenedor::conPies($c['tipo_contenedor'] ?? null),
            ])),
            'descripcion' => self::mayus($c['descripcion_mercancia'] ?? null),
            'peso' => self::numero($c['peso_kg'] ?? null),
            'volumen' => self::numero($c['volumen_cbm'] ?? null),
        ], $datos['contenedores']);

        [$fletes, $totalPrepaid, $totalCollect] = self::fletes($datos, $variante['fletes_as_agreed']);

        $pagina = $variante['fondo'] ? self::PAGINA_ESCANEADA : self::PAGINA_A4;

        return [
            'variante' => $variante,
            'pagina' => ['ancho' => $pagina[0], 'alto' => $pagina[1]],
            'mbl' => $embarque['mbl'] ?: '—',
            'hbl' => $house['numero_hbl'],
            'shipper' => self::renglones([self::mayus($embarque['shipper_nombre']), self::mayus($embarque['shipper_direccion'])], 3),
            'consignee' => $consignee,
            'notify' => 'SAME AS ABOVE',
            'nave_viaje' => trim(implode(' / ', array_filter([self::mayus($embarque['nave']), self::mayus($embarque['viaje'])]))),
            'pol' => self::mayus($embarque['pol']),
            'pod' => self::mayus($embarque['pod']),
            'lugar_entrega' => self::mayus($embarque['destino_final']) ?: 'XXXXXXXX',
            'contenedores' => $contenedores,
            'resumen' => trim(($datos['resumenContenedores'] ?? '').' - '.($embarque['tipo_servicio'] ?: 'FCL'), ' -'),
            'flete_pagadero' => 'FREIGHT '.$house['condicion_pago_resumen'],
            'fecha_emision' => $house['fecha_emision'] ? Carbon::parse($house['fecha_emision'])->locale('en')->format('d-M-y') : '',
            'fletes' => $fletes,
            'total_prepaid' => $totalPrepaid,
            'total_collect' => $totalCollect,
            'qr' => self::qr($embarque, $house, $consignee, $contenedores),
        ];
    }

    /**
     * Filas del recuadro de fletes: una por contenedor (OCEAN FREIGHT) con el
     * monto en la columna Prepaid o Collect según su condición; el resto de
     * las filas van con "-" como en el pre-impreso.
     */
    private static function fletes(array $datos, bool $asAgreed): array
    {
        $contenedores = $datos['contenedores'];
        $varios = count($contenedores) > 1;
        $filas = [];

        foreach (array_slice($contenedores, 0, self::FILAS_FLETE) as $c) {
            $monto = $asAgreed ? 'AS AGREED' : self::monto($c['flete_valor_texto'] ?? null);
            $filas[] = [
                'concepto' => 'OCEAN FREIGHT'.($varios ? ' - '.str_replace(' ', '', $c['tipo_contenedor'] ?? '') : ''),
                'prepaid' => $c['condicion_pago'] === 'Prepaid' ? $monto : '-',
                'collect' => $c['condicion_pago'] === 'Collect' ? $monto : '-',
            ];
        }

        while (count($filas) < self::FILAS_FLETE) {
            $filas[] = ['concepto' => '', 'prepaid' => '-', 'collect' => '-'];
        }

        $hay = fn (string $condicion) => collect($contenedores)->contains('condicion_pago', $condicion);
        $total = function (string $condicion, ?string $calculado) use ($asAgreed, $hay) {
            if (! $hay($condicion)) {
                return '-';
            }

            return $asAgreed || $calculado === null ? 'AS AGREED' : self::monto($calculado);
        };

        return [
            $filas,
            $total('Prepaid', $datos['totalFletePrepaid'] ?? null),
            $total('Collect', $datos['totalFleteCollect'] ?? null),
        ];
    }

    /**
     * QR con la referencia del HBL — mismo contenido que armaba el Excel:
     * "(M) MBL - (H) HBL - SHIPPER - CONSIGNEE - CONTENEDOR".
     */
    private static function qr(array $embarque, array $house, array $consignee, array $contenedores): string
    {
        $texto = implode(' - ', array_filter([
            '(M) '.($embarque['mbl'] ?: '—'),
            '(H) '.$house['numero_hbl'],
            self::mayus($embarque['shipper_nombre']),
            $consignee[0] ?? null,
            $contenedores[0]['marcas'] ?? null,
        ]));

        $opciones = new QROptions([
            'outputInterface' => QRGdImagePNG::class,
            'eccLevel' => EccLevel::M,
            'scale' => 6,
            'quietzoneSize' => 1,
            'outputBase64' => true,
        ]);

        return (new QRCode($opciones))->render($texto);
    }

    // Caracteres por renglón que entran en el recuadro de Shipper / Consignee.
    private const CARACTERES_POR_RENGLON = 64;

    private static function renglones(array $textos, int $maximo): array
    {
        $renglones = [];

        foreach (array_filter($textos) as $texto) {
            foreach (explode("\n", wordwrap($texto, self::CARACTERES_POR_RENGLON, "\n", true)) as $renglon) {
                $renglones[] = trim($renglon);
            }
        }

        return array_slice($renglones, 0, $maximo);
    }

    private static function mayus(?string $texto): ?string
    {
        return filled($texto) ? mb_strtoupper(trim($texto)) : null;
    }

    private static function numero(mixed $valor): string
    {
        return is_numeric($valor) ? number_format((float) $valor, 2, ',', '.') : '';
    }

    /**
     * El monto del flete es texto libre: si es un número se escribe como en
     * el pre-impreso ("7.432,00"); si no (ej. "AS AGREED"), tal cual.
     */
    private static function monto(?string $valor): string
    {
        if (blank($valor)) {
            return 'AS AGREED';
        }

        $limpio = str_replace(',', '', $valor);

        return is_numeric($limpio) ? number_format((float) $limpio, 2, ',', '.') : mb_strtoupper($valor);
    }
}
