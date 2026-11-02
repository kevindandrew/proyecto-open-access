{{-- Hoja principal del file (resumen del embarque) — misma estructura que la hoja Excel de Open Access. --}}
@php
    $e = $embarque;
    $n = fn ($v) => $v === null || $v === '' ? '' : number_format((float) $v, 2, ',', '.');
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Hoja principal {{ $e['identificador'] }}</title>
    <style>
        @page { margin: 26px 30px; }
        body { font-family: 'Helvetica', sans-serif; font-size: 9px; color: #111827; }
        .hoja { background-color: #e5e7eb; padding: 10px 12px 14px; border: 1px solid #9ca3af; }
        .logo { text-align: center; padding: 4px 0 8px; border-bottom: 3px solid #71BFA6; margin-bottom: 8px; }
        .logo img { height: 52px; }
        table.grilla { width: 100%; border-collapse: separate; border-spacing: 4px 2px; }
        .caja { background-color: #f9fafb; border: 1px solid #9ca3af; padding: 3px 5px; font-weight: bold; min-height: 12px; }
        .caja.grande { font-size: 15px; }
        .caja.mediana { font-size: 12px; font-weight: normal; }
        .caja.file { font-size: 15px; text-align: right; }
        .etq { font-size: 6.5px; color: #4b5563; padding: 0 1px 2px; }
        .seccion { border-top: 1px solid #6b7280; margin-top: 8px; padding-top: 6px; }
        .centro { text-align: center; }
        .derecha { text-align: right; }

        table.costos { width: 100%; border-collapse: separate; border-spacing: 4px 3px; }
        table.costos th { font-size: 8px; color: #fff; padding: 3px; text-transform: uppercase; }
        th.compra { background-color: #b91c1c; }
        th.venta { background-color: #0e7490; }
        table.costos td { background-color: #f9fafb; border: 1px solid #9ca3af; padding: 3px 5px; height: 11px; }
        td.monto { text-align: right; font-size: 10px; }
        td.chico { font-size: 6.5px; font-weight: bold; }
        .total { font-weight: bold; font-size: 10.5px; }
        table.costos td.profit, .profit { background-color: #16a34a; color: #fff; font-weight: bold; font-size: 13px; text-align: center; padding: 3px; }
        .notas { background-color: #fff; border: 1px solid #9ca3af; height: 60px; padding: 4px; }
        .pie { margin-top: 6px; font-size: 7px; color: #6b7280; text-align: right; }
    </style>
</head>
<body>
<div class="hoja">
    <div class="logo"><img src="{{ public_path('images/logoOpenAccess.png') }}"></div>

    {{-- Datos generales --}}
    <table class="grilla">
        <tr>
            <td style="width: 16%;"><div class="caja">{{ $e['modo'] }}</div><div class="etq">Modo de transporte</div></td>
            <td style="width: 16%;"><div class="caja">{{ $e['tipo_embarque'] }}</div><div class="etq">Tipo de Embarque</div></td>
            <td style="width: 16%;"><div class="caja">{{ mb_strtoupper((string) $e['oficina_venta']) }}</div><div class="etq">Oficina de Venta</div></td>
            <td style="width: 18%;"><div class="caja">{{ $e['generado_por'] }}</div><div class="etq">Generado por</div></td>
            <td style="width: 16%;"><div class="caja">{{ mb_strtoupper((string) $e['oficina_operacional']) }}</div><div class="etq">Oficina Operacional</div></td>
            <td><div class="caja file">{{ $e['file'] ?: 'SIN FILE' }}</div><div class="etq">FILE</div></td>
        </tr>
    </table>
    <table class="grilla">
        <tr>
            <td style="width: 84%;"><div class="etq">RAZÓN SOCIAL</div><div class="caja grande">{{ $e['cliente'] }}</div></td>
            <td class="centro"><div class="etq">&nbsp;</div><div class="caja centro">{{ $e['codigo_cliente'] }}</div></td>
        </tr>
        <tr>
            <td><div class="etq"><em>CONSIGNATARIO</em></div><div class="caja" style="font-size: 12px;">{{ $e['consignatario'] }}</div></td>
            <td></td>
        </tr>
    </table>

    {{-- Ruta, códigos, cotización, master y houses --}}
    <table class="grilla">
        @php
            $filas = [
                ['POL Puerto de embarque', $e['pol'], $e['pol_codigo']],
                ['POD Puerto de Destino', $e['pod'], $e['pod_codigo']],
                ['Destino final', $e['destino_final'], null],
                ['Agente en Origen / Destino', $e['agente'], $e['agente_codigo']],
                ['Línea Naviera / Aérea', $e['naviera'], $e['naviera_codigo']],
            ];
            $houses = $houses;
        @endphp
        <tr>
            <td style="width: 32%;"><div class="etq">{{ $filas[0][0] }}</div><div class="caja mediana">{{ mb_strtoupper((string) $filas[0][1]) }}</div></td>
            <td style="width: 14%;"><div class="etq"><strong>Códigos</strong></div><div class="caja mediana">{{ $filas[0][2] }}</div></td>
            <td style="width: 22%;"><div class="etq"><strong>QUOTE REFERENCE</strong></div><div class="caja centro">{{ $e['cotizacion'] }}</div></td>
            <td><div class="etq">MASTER (MBL / MAWB)</div><div class="caja grande centro">{{ $e['mbl'] }}</div></td>
        </tr>
        @for ($i = 1; $i < 5; $i++)
            <tr>
                <td><div class="etq">{{ $filas[$i][0] }}</div><div class="caja mediana">{{ mb_strtoupper((string) $filas[$i][1]) }}</div></td>
                <td><div class="etq">&nbsp;</div><div class="caja mediana">{{ $filas[$i][2] }}</div></td>
                <td></td>
                <td>
                    <div class="etq">HOUSE (HBL / HAWB){{ $i > 1 ? ' '.$i : '' }}</div>
                    <div class="caja mediana centro">{{ $houses[$i - 1] ?? '' }}</div>
                </td>
            </tr>
        @endfor
        @foreach (array_slice($houses, 4) as $j => $house)
            <tr>
                <td></td><td></td><td></td>
                <td><div class="etq">HOUSE (HBL / HAWB) {{ $j + 5 }}</div><div class="caja mediana centro">{{ $house }}</div></td>
            </tr>
        @endforeach
    </table>

    {{-- Fechas, carga y transporte --}}
    <table class="grilla">
        <tr>
            <td style="width: 16%;"><div class="etq">ETD</div><div class="caja">{{ $e['etd'] }}</div></td>
            <td style="width: 16%;"><div class="etq">ETA</div><div class="caja">{{ $e['eta'] }}</div></td>
            <td style="width: 18%;"><div class="etq">Tipo de Carga</div><div class="caja">{{ $e['tipo_carga'] }}</div></td>
            @for ($i = 0; $i < 3; $i++)
                <td style="width: 16%;"><div class="etq">Cantidad</div><div class="caja">{{ $unidades[$i]['cantidad'] ?? '' }}</div></td>
            @endfor
        </tr>
        <tr>
            <td><div class="etq">Pago Master</div><div class="caja">{{ $e['pago_master'] }}</div></td>
            <td><div class="etq">Pago House</div><div class="caja">{{ $e['pago_house'] }}</div></td>
            <td><div class="etq">MTS CÚBICOS</div><div class="caja">{{ $n($e['volumen']) }}</div></td>
            @for ($i = 0; $i < 3; $i++)
                <td><div class="etq">Unidad</div><div class="caja">{{ $unidades[$i]['unidad'] ?? '' }}</div></td>
            @endfor
        </tr>
        <tr>
            <td><div class="etq">NAVE</div><div class="caja">{{ $e['nave'] }}</div></td>
            <td><div class="etq">VIAJE</div><div class="caja">{{ $e['viaje'] }}</div></td>
            <td><div class="etq">KGS</div><div class="caja">{{ $n($e['peso']) }}</div></td>
            <td colspan="3"></td>
        </tr>
    </table>

    {{-- Condición de pago --}}
    <div class="seccion">
        <table class="grilla">
            <tr>
                <td style="width: 62%;"></td>
                <td class="derecha" style="width: 16%;">{{ $e['etiqueta_flete'] }}</td>
                <td><div class="caja" style="font-weight: normal;">{{ $e['condicion_pago'] }}</div></td>
            </tr>
            <tr>
                <td></td>
                <td class="derecha">Currency</td>
                <td><div class="caja" style="font-weight: normal;">{{ implode(' / ', $monedas) ?: 'USD' }}</div></td>
            </tr>
        </table>

        {{-- Compra / Venta --}}
        <table class="costos">
            <tr>
                <th class="compra" style="width: 17%;">Concepto</th>
                <th class="compra" style="width: 17%;">Pagar a:</th>
                <th class="compra" style="width: 16%;">Monto</th>
                <th class="venta" style="width: 16%;">Monto</th>
                <th class="venta" style="width: 17%;">Cobrar a:</th>
                <th class="venta" style="width: 17%;">Concepto</th>
            </tr>
            @php $filasCosto = max(8, count($costos)); @endphp
            @for ($i = 0; $i < $filasCosto; $i++)
                @php $c = $costos[$i] ?? null; @endphp
                <tr>
                    <td class="chico">{{ $c && $c['compra'] ? $c['concepto'] : '' }}</td>
                    <td class="chico">{{ $c && $c['compra'] ? $c['pagar_a'] : '' }}</td>
                    <td class="monto">{{ $c && $c['compra'] ? $n($c['compra']).(count($monedas) > 1 ? ' '.$c['moneda'] : '') : '' }}</td>
                    <td class="monto">{{ $c && $c['venta'] ? $n($c['venta']).(count($monedas) > 1 ? ' '.$c['moneda'] : '') : '' }}</td>
                    <td class="chico">{{ $c['cobrar_a'] ?? '' }}</td>
                    <td class="chico">{{ $c && $c['venta'] ? $c['concepto'] : '' }}</td>
                </tr>
            @endfor
            @forelse ($totales as $moneda => $t)
                <tr>
                    <td style="background: none; border: none;"></td>
                    <td class="total" style="background: none; border: none;">Total Compra{{ count($totales) > 1 ? " ($moneda)" : '' }}</td>
                    <td class="monto total" style="background: none; border: none;">{{ $n($t['compra']) }}</td>
                    <td class="monto total" style="background: none; border: none;">{{ $n($t['venta']) }}</td>
                    <td class="total" style="background: none; border: none;">Total Venta{{ count($totales) > 1 ? " ($moneda)" : '' }}</td>
                    <td style="background: none; border: none;"></td>
                </tr>
                <tr>
                    <td style="background: none; border: none;" colspan="2"></td>
                    <td colspan="2" class="profit">{{ $n($t['profit']) }}{{ count($totales) > 1 ? " $moneda" : '' }}</td>
                    <td style="background: none; border: none;" colspan="2"></td>
                </tr>
                <tr>
                    <td style="background: none; border: none;" colspan="2"></td>
                    <td colspan="2" class="centro total" style="background: none; border: none; font-size: 7.5px;">Total profit</td>
                    <td style="background: none; border: none;" colspan="2"></td>
                </tr>
            @empty
                <tr><td colspan="6" class="centro" style="background: none; border: none; color: #6b7280;">Sin costos cargados.</td></tr>
            @endforelse
        </table>

        <div style="font-weight: bold; font-size: 10px; margin-top: 4px;">Notas:</div>
        <div class="notas"></div>
    </div>
</div>
<p class="pie">Generado por el sistema de Open Access Bolivia S.R.L. el {{ $generadoEn }}.</p>
</body>
</html>
