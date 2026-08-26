<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificado de Flete {{ $house['numero_hbl'] }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #1f2937; }
        h1 { font-size: 18px; color: #042753; margin: 0; }
        h2 { font-size: 13px; color: #042753; margin: 18px 0 6px; border-bottom: 2px solid #71BFA6; padding-bottom: 4px; }
        .encabezado { width: 100%; margin-bottom: 12px; }
        .encabezado td { vertical-align: top; }
        .marca { font-size: 11px; color: #6b7280; }
        table.datos { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
        table.datos td { padding: 4px 6px; }
        table.datos td.etiqueta { color: #6b7280; width: 25%; }
        table.datos td.valor { color: #042753; font-weight: bold; }
        .declaracion {
            margin-top: 16px; padding: 12px; border: 1px solid #d1d5db; background-color: #f9fafb;
            text-align: justify; line-height: 1.5;
        }
        .firma { margin-top: 40px; }
        .firma .linea { border-top: 1px solid #1f2937; width: 260px; margin-bottom: 4px; }
        .footer { margin-top: 24px; font-size: 9px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>
    <table class="encabezado">
        <tr>
            <td>
                <h1>OPEN ACCESS BOLIVIA S.R.L.</h1>
                <p class="marca">Certificado de Flete</p>
            </td>
            <td style="text-align: right;">
                <p><strong>House BL N°:</strong> {{ $house['numero_hbl'] }}</p>
                <p><strong>File:</strong> {{ $embarque['numero_file'] }}</p>
                @if ($embarque['mbl'])
                    <p><strong>Master BL:</strong> {{ $embarque['mbl'] }}</p>
                @endif
            </td>
        </tr>
    </table>

    <h2>Shipper y Consignee</h2>
    <table class="datos">
        <tr>
            <td class="etiqueta">Shipper</td>
            <td class="valor">{{ $embarque['cliente'] ?? '—' }}</td>
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

    <div class="declaracion">
        Por medio del presente certificado, <strong>OPEN ACCESS BOLIVIA S.R.L.</strong> certifica que el flete
        internacional correspondiente al embarque amparado bajo el House Bill of Lading N°
        <strong>{{ $house['numero_hbl'] }}</strong>
        @if ($house['condicion_pago'] === 'Prepaid')
            ha sido <strong>pagado en origen (Prepaid)</strong>, no existiendo saldo pendiente por este concepto a cargo del consignatario en destino.
        @elseif ($house['condicion_pago'] === 'Collect')
            es <strong>pagadero en destino (Collect)</strong> por el consignatario, conforme a la condición de pago pactada para este embarque.
        @else
            se encuentra sujeto a la condición de pago pactada entre las partes para este embarque.
        @endif
    </div>

    <div class="firma">
        <div class="linea"></div>
        <p>Firma y sello autorizado — Open Access Bolivia S.R.L.</p>
    </div>

    <div class="footer">
        Documento generado por el sistema de Open Access Bolivia S.R.L. el {{ $generadoEn }}.
    </div>
</body>
</html>
