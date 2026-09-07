<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Aviso de Arribo {{ $embarque['numero_file'] }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 10px; color: #111827; }
        .encabezado-logo { width: 100%; margin-bottom: 8px; }
        .encabezado-logo img { height: 55px; }
        .titulo-barra {
            background-color: #042753; color: #ffffff; text-align: center;
            font-size: 15px; font-weight: bold; letter-spacing: 1px; padding: 8px 0; margin-bottom: 10px;
        }

        table.form { width: 100%; border-collapse: collapse; margin-bottom: 2px; }
        table.form td { border: 1px solid #111827; padding: 5px 8px; vertical-align: top; width: 50%; }
        .etiqueta { font-size: 8px; color: #4b5563; margin: 0; }
        .valor { font-size: 10px; font-weight: bold; color: #111827; margin: 2px 0 0; }

        h2.seccion { font-size: 11px; color: #042753; margin: 14px 0 4px; border-bottom: 2px solid #71BFA6; padding-bottom: 3px; }

        table.hbl { width: 100%; border-collapse: collapse; }
        table.hbl th, table.hbl td { border: 1px solid #111827; padding: 5px 8px; font-size: 9px; }
        table.hbl th { background-color: #f3f4f6; text-align: left; }

        table.fletes { width: 100%; border-collapse: collapse; }
        table.fletes th, table.fletes td { border: 1px solid #111827; padding: 5px 8px; font-size: 9px; }
        table.fletes th { background-color: #f3f4f6; text-align: left; }
        table.fletes td.derecha, table.fletes th.derecha { text-align: right; }
        .total-fila td { font-weight: bold; border-top: 2px solid #042753; }

        .importante { margin-top: 14px; padding: 10px; background-color: #fffbeb; border: 1px solid #fde68a; }
        .importante h3 { margin: 0 0 6px; font-size: 10px; color: #92400e; }
        .importante ul { margin: 0; padding-left: 16px; }
        .importante li { margin-bottom: 5px; font-size: 8.5px; text-align: justify; color: #78350f; }

        .footer { margin-top: 20px; font-size: 8px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>
    <table class="encabezado-logo">
        <tr>
            <td style="border: none; padding: 0;">
                <img src="{{ public_path('images/logoOpenAccess.png') }}">
            </td>
        </tr>
    </table>

    <div class="titulo-barra">AVISO DE ARRIBO</div>

    <table class="form">
        <tr>
            <td>
                <p class="etiqueta">Cnee / Consignatario</p>
                <p class="valor">{{ $embarque['consignatario_nombre'] ?? '—' }}</p>
            </td>
            <td>
                <p class="etiqueta">Shipper / Embarcador</p>
                <p class="valor">{{ $embarque['shipper_nombre'] ?? '—' }}</p>
            </td>
        </tr>
        <tr>
            <td>
                <p class="etiqueta">Port Of Loading / Puerto de Embarque</p>
                <p class="valor">{{ $embarque['pol'] ?? '—' }}</p>
            </td>
            <td>
                <p class="etiqueta">Port Of Discharge / Puerto de Descarga</p>
                <p class="valor">{{ $embarque['pod'] ?? '—' }}</p>
            </td>
        </tr>
        <tr>
            <td>
                <p class="etiqueta">ETA / Fecha Estimada de Llegada</p>
                <p class="valor">{{ $embarque['eta'] ?? '—' }}</p>
            </td>
            <td>
                <p class="etiqueta">Freight &amp; Charges</p>
                <p class="valor">{{ strtoupper($embarque['pago_master'] ?? '—') }}</p>
            </td>
        </tr>
    </table>

    <h2 class="seccion">Bill Of Lading No / Container No</h2>
    <table class="hbl">
        <thead>
            <tr>
                <th style="width: 25%;">Bill Of Lading No</th>
                <th>Container No</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($houses as $house)
                <tr>
                    <td>{{ $house['numero_hbl'] }}</td>
                    <td>{{ $house['contenedores_texto'] ?: '—' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h2 class="seccion">Freight &amp; Charges</h2>
    <table class="fletes">
        <thead>
            <tr>
                <th>Contenedores</th>
                <th>Concepto</th>
                <th class="derecha">Monto</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($totalesPorMoneda as $moneda => $monto)
                <tr>
                    <td>{{ $resumenContenedores }}</td>
                    <td>Ocean Freight</td>
                    <td class="derecha">{{ number_format($monto, 2) }} {{ $moneda }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="3">Sin líneas de flete cargadas para este embarque.</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="total-fila">
                <td colspan="2">Condición de pago: {{ $embarque['pago_master'] ?? '—' }}</td>
                <td class="derecha">
                    @foreach ($totalesPorMoneda as $moneda => $monto)
                        TOTAL {{ $moneda }} {{ number_format($monto, 2) }}<br>
                    @endforeach
                </td>
            </tr>
        </tfoot>
    </table>

    <div class="importante">
        <h3>IMPORTANTE</h3>
        <ul>
            <li>
                El plazo que señala la línea naviera para la devolución de contenedores vacíos corre a
                partir de la fecha de arribo de la nave a puerto de descarga.
            </li>
            <li>
                Los costos por conceptos de demoras y/o reparación serán asumidos por el consignatario
                señalado en el Bill Of Lading: {{ $numerosHbl }}.
            </li>
            <li>Todos los pagos deberán ser entregados en Dólares Americanos.</li>
            <li>
                Los documentos originales de embarque (Bill of Lading)
                @if ($embarque['naviera_aerolinea'])
                    de {{ $embarque['naviera_aerolinea'] }}
                @endif
                deberán ser presentados en nuestras oficinas para certificar la propiedad de la
                mercancía.
            </li>
            <li>
                La responsabilidad de OPEN ACCESS BOLIVIA SRL termina con la entrega de los
                contenedores en puerto de descarga.
            </li>
        </ul>
    </div>

    <div class="footer">
        Documento generado por el sistema de Open Access Bolivia S.R.L. el {{ $generadoEn }}.
    </div>
</body>
</html>
