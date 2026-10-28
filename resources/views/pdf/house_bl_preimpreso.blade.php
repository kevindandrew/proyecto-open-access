{{--
    HBL con el formato del pre-impreso de Open Access. Cada dato va en la
    misma posición que en la planilla Excel con la que se imprimía (pulgadas
    desde la esquina superior izquierda de la hoja; ver
    App\Support\HouseBlFormatoPreimpreso). Las variantes digitales llevan de
    fondo el pre-impreso escaneado; Copia y Original van solo con los datos,
    sin líneas, para imprimir encima del papel pre-impreso.
--}}
@php
    $v = $hbl['variante'];
    $anchoPt = $hbl['pagina']['ancho'];
    $altoPt = $hbl['pagina']['alto'];
    // Calibración contra el HBL DAM impreso y escaneado por el cliente: las
    // coordenadas del Excel (fila/columna) llevadas a la hoja real.
    $x = fn (float $pulgadas) => round($pulgadas - 0.07, 3).'in';
    $y = fn (float $pulgadas) => round($pulgadas * 0.986 - 0.082, 3).'in';
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>House BL {{ $hbl['hbl'] }}</title>
    <style>
        @page { size: {{ $anchoPt }}pt {{ $altoPt }}pt; margin: 0; }
        body { margin: 0; font-family: 'DejaVu Sans', sans-serif; font-size: 6.5pt; color: #111; }
        .pagina { position: relative; width: {{ $anchoPt }}pt; height: {{ $altoPt }}pt; overflow: hidden; }
        .pagina + .pagina { page-break-before: always; }
        .fondo { position: absolute; top: 0; left: 0; width: {{ $anchoPt }}pt; height: {{ $altoPt }}pt; }
        .c { position: absolute; line-height: 0.155in; white-space: nowrap; }
        .bloque { position: absolute; line-height: 0.13in; overflow: hidden; }
        .centro { text-align: center; }
        .derecha { text-align: right; }
        .numero-bl { font-size: 8.4pt; font-weight: bold; }
        .marca-dam {
            position: absolute; font-size: 12.5pt; font-style: italic; color: #9ca3af;
            letter-spacing: 1.5pt; white-space: nowrap;
        }
        table.carga { position: absolute; left: {{ $x(0.74) }}; top: {{ $y(5.84) }}; width: 6.85in; border-collapse: collapse; }
        table.carga td { padding: 0 0 0.08in; vertical-align: top; line-height: 0.13in; }
    </style>
</head>
<body>
    <div class="pagina">
        @if ($v['fondo'])
            <img class="fondo" src="{{ public_path('images/documentos/hbl_preimpreso_anverso.jpg') }}">
        @endif

        @if ($v['marca_dam'])
            <div class="marca-dam" style="left: {{ $x(2.95) }}; top: {{ $y(1.20) }};">DOCUMENTO VALIDO PARA REGISTRO DE DAM</div>
        @endif

        {{-- Shipper (C3:I5) --}}
        @foreach ($hbl['shipper'] as $i => $renglon)
            <div class="c" style="left: {{ $x(0.74) }}; top: {{ $y(1.91 + $i * 0.155) }};">{{ $renglon }}</div>
        @endforeach

        {{-- Bill of Lading No. (K3:N6) --}}
        <div class="c centro numero-bl" style="left: {{ $x(6.34) }}; width: 1.69in; top: {{ $y(1.91) }};">(M)&nbsp; {{ $hbl['mbl'] }}</div>
        <div class="c centro numero-bl" style="left: {{ $x(6.34) }}; width: 1.69in; top: {{ $y(2.06) }};">(H)&nbsp; {{ $hbl['hbl'] }}</div>
        @if ($v['etiqueta'])
            <div class="c centro numero-bl" style="left: {{ $x(6.34) }}; width: 1.69in; top: {{ $y(2.37) }};">{{ $v['etiqueta'] }}</div>
        @endif

        {{-- Consignee (C8:I11) --}}
        @foreach ($hbl['consignee'] as $i => $renglon)
            <div class="c" style="left: {{ $x(0.74) }}; top: {{ $y(2.68 + $i * 0.115) }};">{{ $renglon }}</div>
        @endforeach

        {{-- Name of Carrier (J8:N11) --}}
        <div class="bloque centro" style="left: {{ $x(4.37) }}; top: {{ $y(2.68) }}; width: 3.46in; height: 0.6in; line-height: 0.12in;">
            OPEN ACCESS BOLIVIA SRL<br>
            DIRECCION AV ARCE No 2631 EDIF MULTICINE PISO 8 OF 802<br>
            TELEFONO 591 22912411<br>
            LA PAZ BOLIVIA
        </div>

        {{-- Notify Party (C13) y Ocean Vessel & Voyage (C17) --}}
        <div class="c" style="left: {{ $x(0.74) }}; top: {{ $y(3.44) }};">{{ $hbl['notify'] }}</div>
        <div class="c" style="left: {{ $x(0.74) }}; top: {{ $y(4.09) }};">{{ $hbl['nave_viaje'] }}</div>

        {{-- Pre-carriage / Place of Receipt (fila 19) --}}
        <div class="c" style="left: {{ $x(0.74) }}; top: {{ $y(4.46) }};">XXXXXXXXXX</div>
        <div class="c" style="left: {{ $x(2.83) }}; top: {{ $y(4.46) }};">XXXXXXXXXX</div>

        {{-- Puertos (fila 23) --}}
        <div class="c" style="left: {{ $x(0.74) }}; top: {{ $y(5.02) }};">{{ $hbl['pol'] }}</div>
        <div class="c" style="left: {{ $x(2.83) }}; top: {{ $y(5.02) }};">{{ $hbl['pod'] }}</div>
        <div class="c" style="left: {{ $x(4.37) }}; top: {{ $y(5.02) }};">{{ $hbl['lugar_entrega'] }}</div>
        <div class="c" style="left: {{ $x(7.16) }}; top: {{ $y(5.02) }};">XXXXXXXXX</div>

        {{-- Mercadería (filas 26-45) --}}
        <div class="c" style="left: {{ $x(2.83) }}; top: {{ $y(5.49) }};">Said to contain</div>
        <table class="carga">
            @foreach ($hbl['contenedores'] as $contenedor)
                <tr>
                    <td style="width: 2.09in;">{{ $contenedor['marcas'] }}</td>
                    <td style="width: 3.31in; white-space: pre-line;">{{ $contenedor['descripcion'] }}</td>
                    <td class="derecha" style="width: 0.73in;">{{ $contenedor['peso'] }}</td>
                    <td class="derecha" style="width: 0.72in;">{{ $contenedor['volumen'] }}</td>
                </tr>
            @endforeach
        </table>

        <div class="c" style="left: {{ $x(2.83) }}; top: {{ $y(8.22) }};">SHIPPER'S LOAD, STOW, WEIGHT COUNT &amp; SEAL</div>
        <div class="c" style="left: {{ $x(2.83) }}; top: {{ $y(8.45) }};">{{ $hbl['resumen'] }}</div>
        <div class="c" style="left: {{ $x(2.83) }}; top: {{ $y(8.74) }};">CARGO IN TRANSIT TO BOLIVIA</div>

        @if ($v['marca_dam'])
            <div class="marca-dam" style="left: {{ $x(1.24) }}; top: {{ $y(9.11) }};">DOCUMENTO VALIDO PARA REGISTRO DE DAM</div>
        @endif

        <div class="c centro" style="left: {{ $x(6.87) }}; width: 0.96in; top: {{ $y(9.28) }};">PAGE 1 OF 1</div>

        {{-- Currency / Freight payable at / Place and Date of Issue (fila 60) --}}
        <div class="c" style="left: {{ $x(0.74) }}; top: {{ $y(9.70) }};">US DOLAR</div>
        <div class="c centro" style="left: {{ $x(2.83) }}; width: 1.54in; top: {{ $y(9.70) }};">{{ $hbl['flete_pagadero'] }}</div>
        <div class="c derecha" style="left: {{ $x(4.37) }}; width: 1.72in; top: {{ $y(9.70) }};">{{ $hbl['pol'] }}</div>
        <div class="c" style="left: {{ $x(6.30) }}; top: {{ $y(9.70) }};">{{ $hbl['fecha_emision'] }}</div>

        {{-- Freight & Charges Prepaid / Collect (filas 63-67) --}}
        @foreach ($hbl['fletes'] as $i => $flete)
            @php $top = $y(10.13 + $i * 0.155); @endphp
            <div class="c" style="left: {{ $x(0.74) }}; top: {{ $top }};">{{ $flete['concepto'] }}</div>
            <div class="c centro" style="left: {{ $x(1.95) }}; width: 1.13in; top: {{ $top }};">{{ $flete['prepaid'] }}</div>
            <div class="c centro" style="left: {{ $x(3.30) }}; width: 1.22in; top: {{ $top }};">{{ $flete['collect'] }}</div>
        @endforeach

        {{-- Total freight Prepaid / Collect (fila 71) --}}
        <div class="c centro" style="left: {{ $x(1.95) }}; width: 1.13in; top: {{ $y(11.37) }};">{{ $hbl['total_prepaid'] }}</div>
        <div class="c centro" style="left: {{ $x(3.30) }}; width: 1.22in; top: {{ $y(11.37) }};">{{ $hbl['total_collect'] }}</div>

        <img src="{{ $hbl['qr'] }}" style="position: absolute; left: 6.84in; top: 9.94in; width: 0.85in; height: 0.85in;">

        @if ($v['firma'])
            <img src="{{ public_path('images/documentos/sello.png') }}" style="position: absolute; left: 4.70in; top: 10.40in; width: 2.05in;">
            <img src="{{ public_path('images/documentos/firma.png') }}" style="position: absolute; left: 5.15in; top: 9.95in; width: 1.25in;">
        @endif
    </div>

    @if ($v['reverso'])
        <div class="pagina">
            <img class="fondo" src="{{ public_path('images/documentos/hbl_preimpreso_reverso.jpg') }}">
        </div>
    @endif
</body>
</html>
