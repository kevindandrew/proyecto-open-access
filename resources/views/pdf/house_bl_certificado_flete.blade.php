{{--
    Certificado de Flete sobre el membrete de Open Access. El contenido va
    dentro del área libre de la hoja membretada (debajo del logo y encima del
    pie con dirección / teléfono / correo), así que:
     - impreso ($digital = false): solo el contenido, para imprimir sobre la
       hoja membretada pre-impresa;
     - digital: con el membrete escaneado de fondo, firma y sello.
--}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificado de Flete {{ $house['numero_hbl'] }}</title>
    <style>
        @page { margin: 1.55in 0.75in 1.95in 0.75in; }
        body { font-family: 'Helvetica', sans-serif; font-size: 10.5px; color: #1f2937; }
        .membrete { position: fixed; top: -1.55in; left: -0.75in; width: 606pt; height: 836pt; z-index: -1000; }
        .cabecera { position: fixed; top: -1.0in; right: 0; text-align: right; font-size: 10.5px; line-height: 1.6; }
        h1 { text-align: center; font-size: 15px; color: #042753; letter-spacing: 1px; margin: 0 0 6px; }
        h2 { font-size: 12.5px; color: #042753; margin: 14px 0 6px; border-bottom: 2px solid #71BFA6; padding-bottom: 4px; }
        table.datos { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
        table.datos td { padding: 3px 6px; vertical-align: top; }
        table.datos td.etiqueta { color: #6b7280; width: 25%; }
        table.datos td.valor { color: #042753; font-weight: bold; }
        table.detalle { width: 100%; border-collapse: collapse; border: 1px solid #d1d5db; }
        table.detalle td { padding: 4px 6px; vertical-align: top; }
        table.detalle tr.titulos td { color: #6b7280; background-color: #f3f4f6; }
        .declaracion {
            margin-top: 14px; padding: 10px 12px; border: 1px solid #d1d5db;
            text-align: justify; line-height: 1.5;
        }
        .firma { margin-top: 24px; position: relative; height: 95px; }
        .firma .linea { position: absolute; left: 0; top: 52px; border-top: 1px solid #1f2937; width: 250px; }
        .firma .texto { position: absolute; left: 0; top: 56px; line-height: 1.6; }
        .firma .imagen-firma { position: absolute; left: 40px; top: -6px; width: 115px; }
        .firma .imagen-sello { position: absolute; left: 270px; top: 18px; width: 190px; }
        .generado { margin-top: 10px; font-size: 8.5px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>
    @if ($digital)
        <img class="membrete" src="{{ public_path('images/documentos/membrete.jpg') }}">
    @endif

    <div class="cabecera">
        <strong><em>House BL N°:</em></strong> <em>{{ $house['numero_hbl'] }}</em><br>
        <strong>Fecha de Emisión:</strong> {{ $fechaEmisionCertificado }}<br>
        @if ($embarque['mbl'])
            <strong>Master BL:</strong> {{ $embarque['mbl'] }}
        @endif
    </div>

    <h1>CERTIFICADO DE FLETE</h1>

    <h2>Shipper y Consignee</h2>
    <table class="datos">
        <tr>
            <td class="etiqueta">Shipper</td>
            <td class="valor">{{ $embarque['shipper_nombre'] ?? '—' }}</td>
            <td class="etiqueta">Consignee</td>
            <td class="valor">{{ $embarque['consignatario_nombre'] ?? '—' }}</td>
        </tr>
    </table>

    <h2>Ruta y Transporte</h2>
    <table class="datos">
        <tr>
            <td class="etiqueta">POL</td>
            <td class="valor">{{ $embarque['pol'] ?? '—' }}</td>
            <td class="etiqueta">POD</td>
            <td class="valor">{{ $embarque['pod'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">Nave</td>
            <td class="valor">{{ $embarque['nave'] ?? '—' }}</td>
            <td class="etiqueta">Viaje</td>
            <td class="valor">{{ $embarque['viaje'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">ETD</td>
            <td class="valor">{{ $embarque['etd'] ?? '—' }}</td>
            <td class="etiqueta">ETA</td>
            <td class="valor">{{ $embarque['eta'] ?? '—' }}</td>
        </tr>
    </table>

    <h2>Mercancía</h2>
    <table class="datos">
        <tr>
            <td class="etiqueta">Peso Total</td>
            <td class="valor">{{ $totalPeso }} kg</td>
            <td class="etiqueta">Volumen Total</td>
            <td class="valor">{{ $totalVolumen }} cbm</td>
        </tr>
    </table>

    <table class="detalle">
        <tr class="titulos">
            <td style="width: 26%;">Contenedor</td>
            <td style="width: 40%;">Descripción de Mercancía</td>
            <td style="width: 17%;">Peso</td>
            <td style="width: 17%;">Volumen</td>
        </tr>
        @foreach ($contenedores as $contenedor)
            <tr>
                <td class="valor" style="font-weight: bold; color: #042753;">
                    {{ $contenedor['numero_contenedor'] ?? '—' }} — {{ \App\Support\FormatoContenedor::conPies($contenedor['tipo_contenedor'] ?? '') }}
                </td>
                <td style="white-space: pre-line; color: #042753;">{{ $contenedor['descripcion_mercancia'] ?? '—' }}</td>
                <td style="font-weight: bold; color: #042753;">{{ $contenedor['peso_kg'] ?? '—' }} kg</td>
                <td style="font-weight: bold; color: #042753;">{{ $contenedor['volumen_cbm'] ?? '—' }} cbm</td>
            </tr>
        @endforeach
    </table>

    @if (count($contenedores) > 1)
        <h2>Flete por Contenedor</h2>
        <table class="detalle">
            <tr class="titulos">
                <td style="width: 40%;">Contenedor</td>
                <td style="width: 30%;">Condición de Pago</td>
                <td style="width: 30%;">Monto</td>
            </tr>
            @foreach ($contenedores as $contenedor)
                <tr>
                    <td style="font-weight: bold; color: #042753;">
                        {{ $contenedor['numero_contenedor'] ?? '—' }} — {{ \App\Support\FormatoContenedor::conPies($contenedor['tipo_contenedor'] ?? '') }}
                    </td>
                    <td style="font-weight: bold; color: #042753;">{{ $contenedor['condicion_pago'] ?? '—' }}</td>
                    <td style="font-weight: bold; color: #042753;">{{ $contenedor['flete_valor_texto'] ?? '—' }}</td>
                </tr>
            @endforeach
        </table>
    @endif

    <div class="declaracion">
        Por medio del presente certificado, <strong>OPEN ACCESS BOLIVIA S.R.L.</strong> certifica que el flete
        internacional correspondiente al embarque amparado bajo el House Bill of Lading N°
        <strong>{{ $house['numero_hbl'] }}</strong>
        @if (count($contenedores) > 1 && str_contains($house['condicion_pago_resumen'], '/'))
            ha sido pactado según el detalle de condición de pago y monto indicado por contenedor en el cuadro anterior.
        @elseif ($house['condicion_pago'] === 'Prepaid')
            ha sido <strong>pagado en origen (Prepaid)</strong>, no existiendo saldo pendiente por este concepto a cargo del consignatario en destino.
        @elseif ($house['condicion_pago'] === 'Collect')
            <strong>es pagadero en destino (Collect)</strong> por el consignatario, conforme a la condición de pago pactada para este embarque.
        @else
            se encuentra sujeto a la condición de pago pactada entre las partes para este embarque.
        @endif
    </div>

    <div class="firma">
        @if ($digital)
            <img class="imagen-sello" src="{{ public_path('images/documentos/sello.png') }}">
            <img class="imagen-firma" src="{{ public_path('images/documentos/firma.png') }}">
        @endif
        <div class="linea"></div>
        <div class="texto">
            Firma y sello autorizado — Open Access Bolivia S.R.L.<br>
            AS AGENT OF {{ $embarque['agente_origen'] ?? '..........................' }}
        </div>
    </div>

    <p class="generado">Documento generado por el sistema de Open Access Bolivia S.R.L. el {{ $generadoEn }}.</p>
</body>
</html>
