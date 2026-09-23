<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $documento['etiqueta'] }} {{ $documento['numero'] }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #1f2937; }
        h1 { font-size: 20px; color: #042753; margin: 0; }
        .encabezado { width: 100%; margin-bottom: 12px; border-bottom: 3px solid #71BFA6; padding-bottom: 10px; }
        .encabezado td { vertical-align: top; }
        .titulo-doc { text-align: right; }
        .titulo-doc h2 { font-size: 18px; color: #042753; margin: 0 0 4px; }
        table.numero { border: 1px solid #d1d5db; border-collapse: collapse; margin-left: auto; }
        table.numero td { padding: 3px 8px; border: 1px solid #d1d5db; }
        table.numero td.etiqueta { color: #6b7280; background-color: #f3f4f6; font-weight: bold; }

        table.datos { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        table.datos td { padding: 5px 6px; border: 1px solid #e5e7eb; }
        table.datos td.etiqueta { color: #6b7280; font-size: 9px; text-transform: uppercase; background-color: #f9fafb; width: 16%; }
        table.datos td.valor { color: #042753; font-weight: bold; }

        .bloque-titulo { background-color: #042753; color: #fff; padding: 4px 8px; font-size: 10px; font-weight: bold; text-transform: uppercase; }

        table.lineas { width: 100%; border-collapse: collapse; margin: 10px 0; }
        table.lineas th, table.lineas td { border: 1px solid #d1d5db; padding: 6px 8px; }
        table.lineas th { background-color: #042753; color: #fff; text-align: left; font-size: 10px; text-transform: uppercase; }
        table.lineas td.derecha, table.lineas th.derecha { text-align: right; }
        table.lineas tbody tr:nth-child(even) { background-color: #f9fafb; }

        table.totales { width: 100%; border-collapse: collapse; margin-top: 6px; }
        table.totales td { padding: 4px 8px; }
        table.totales td.caja { border: 1px solid #d1d5db; }
        table.totales td.caja-etiqueta { background-color: #71BFA6; color: #042753; font-weight: bold; text-align: center; }
        table.totales td.caja-valor { text-align: right; font-weight: bold; font-size: 13px; color: #042753; }

        .son { margin-top: 8px; font-style: italic; }
        .disclaimer { margin-top: 18px; font-size: 9px; line-height: 1.5; color: #4b5563; }
        .disclaimer p { margin: 0 0 4px; }
        .footer { margin-top: 30px; font-size: 9px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>
    <table class="encabezado">
        <tr>
            <td style="width: 45%;">
                <img src="{{ public_path('images/logoOpenAccess.png') }}" style="height: 45px;">
            </td>
            <td class="titulo-doc">
                <h2>{{ strtoupper($documento['etiqueta']) }}</h2>
                <table class="numero">
                    <tr>
                        <td class="etiqueta">N°</td>
                        <td>{{ $documento['numero'] }}</td>
                    </tr>
                    <tr>
                        <td class="etiqueta">Fecha</td>
                        <td>{{ $documento['fecha'] }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="datos">
        <tr>
            <td class="etiqueta">MAWB / MBL</td>
            <td class="valor">{{ $embarque['mbl'] ?: '—' }}</td>
            <td class="etiqueta">HAWB / HBL</td>
            <td class="valor">{{ $embarque['hbl'] ?: '—' }}</td>
            <td class="etiqueta">N° File</td>
            <td class="valor">{{ $embarque['numero_file'] }}</td>
        </tr>
        <tr>
            <td class="etiqueta">Origen</td>
            <td class="valor">{{ $embarque['pol'] ?? '—' }}</td>
            <td class="etiqueta">Destino</td>
            <td class="valor">{{ $embarque['pod'] ?? '—' }}</td>
            <td class="etiqueta">ETD / ETA</td>
            <td class="valor">{{ $embarque['etd'] ?? '—' }} / {{ $embarque['eta'] ?? '—' }}</td>
        </tr>
    </table>

    <table class="datos">
        <tr>
            <td class="etiqueta" style="width: 12%;">
                {{ $documento['tipo'] === 'invoice' ? 'Cliente' : 'Cliente / Customer' }}
            </td>
            <td class="valor" style="width: 38%;">{{ $contraparte['nombre'] ?? '—' }}</td>
            <td class="etiqueta" style="width: 12%;">
                {{ $documento['tipo'] === 'invoice' ? 'Señores' : 'Consignatario / Cnee' }}
            </td>
            <td class="valor">
                {{ $documento['tipo'] === 'invoice' ? ($embarque['shipper_nombre'] ?? '—') : ($contraparte['nombre'] ?? '—') }}
            </td>
        </tr>
    </table>

    <table class="lineas">
        <thead>
            <tr>
                <th>Descripción / Description</th>
                <th class="derecha" style="width: 20%;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($lineas as $linea)
                <tr>
                    <td>{{ $linea['descripcion'] }}</td>
                    <td class="derecha">{{ number_format($linea['monto'], 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="datos">
        <tr>
            <td class="etiqueta" style="width: 20%;">Condición de Pago</td>
            <td class="valor">{{ $documento['condicion_pago'] ?? 'Al Contado' }}</td>
            @if ($documento['tipo_cambio'])
                <td class="etiqueta" style="width: 10%;">T/C</td>
                <td class="valor">{{ number_format($documento['tipo_cambio'], 2) }}</td>
            @endif
        </tr>
    </table>

    <table class="totales">
        <tr>
            <td style="width: 70%;"></td>
            <td class="caja caja-etiqueta" style="width: 15%;">Total {{ $documento['moneda'] }}</td>
            <td class="caja caja-valor" style="width: 15%;">{{ number_format($documento['monto'], 2) }}</td>
        </tr>
    </table>

    <p class="son"><strong>SON:</strong> {{ $documento['monto_en_letras'] }}</p>

    @if ($documento['observaciones'])
        <p style="margin-top: 8px;"><strong>Observaciones:</strong> {{ $documento['observaciones'] }}</p>
    @endif

    @if ($documento['llevaDisclaimer'])
        <div class="disclaimer">
            @if ($documento['tipo'] === 'nota_reembolso')
                <p>1.- El monto de esta {{ $documento['etiqueta'] }} debe ser cancelado en Dólares Americanos.</p>
            @else
                <p>1.- El monto de esta {{ $documento['etiqueta'] }} puede ser cancelado en Bolivianos al tipo de cambio flexible.</p>
            @endif
            <p>2.- El Cliente declara estar de acuerdo con el monto y las condiciones de pago que se señalan en este documento. En caso de existir una observación con relación al monto, esta deberá ser comunicada en un lapso de cinco días, caso contrario se dará por aceptados.</p>
            <p>3.- En caso de incumplimiento del pago el cliente autoriza a OPEN ACCESS BOLIVIA SRL a disponer de una parte o la totalidad de la mercadería transportada, de modo tal que cubra el monto de este documento y/o cualquier otro costo adicional que nos fuera imputado.</p>
            <p>4.- OPEN ACCESS BOLIVIA SRL actúa únicamente como intermediario en la comercialización del transporte de contenedores, por lo tanto no es responsable por el contenido, medidas, cantidad y condiciones de la mercadería en los mismos. Se recomienda al importador asegurar su carga, caso contrario toda responsabilidad por discrepancia deberán ser atendidas únicamente por la línea dueña de equipos y naves y/o el embarcador (proveedor) en origen.</p>
            <p>5.- La firma o sello de recepción de este documento implica el conocimiento y aceptación de los puntos señalados en el mismo.</p>
        </div>
    @endif

    <div class="footer">
        Documento generado por el sistema de Open Access Bolivia S.R.L. el {{ $generadoEn }}.
    </div>
</body>
</html>
