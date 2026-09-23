<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $documento['etiqueta'] }} {{ $documento['numero'] }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #1f2937; }
        h2 { font-size: 18px; color: #042753; margin: 0 0 4px; }
        .encabezado { width: 100%; margin-bottom: 12px; border-bottom: 3px solid #71BFA6; padding-bottom: 10px; }
        .encabezado td { vertical-align: top; }
        .titulo-doc { text-align: right; }
        table.numero { border: 1px solid #d1d5db; border-collapse: collapse; margin-left: auto; }
        table.numero td { padding: 3px 8px; border: 1px solid #d1d5db; }
        table.numero td.etiqueta { color: #6b7280; background-color: #f3f4f6; font-weight: bold; }

        .pagar-a { margin: 10px 0; border: 1px solid #71BFA6; }
        .pagar-a p.titulo { background-color: #71BFA6; color: #042753; font-weight: bold; padding: 4px 8px; margin: 0; text-transform: uppercase; font-size: 10px; }
        .pagar-a p.nombre { padding: 8px; margin: 0; font-size: 14px; font-weight: bold; color: #042753; }

        table.datos { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        table.datos td { padding: 5px 6px; border: 1px solid #e5e7eb; }
        table.datos td.etiqueta { color: #6b7280; font-size: 9px; text-transform: uppercase; background-color: #f9fafb; width: 16%; }
        table.datos td.valor { color: #042753; font-weight: bold; }

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

    <div class="pagar-a">
        <p class="titulo">Pagar a</p>
        <p class="nombre">{{ $contraparte['nombre'] ?? '—' }}</p>
    </div>

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

    <div class="footer">
        Documento generado por el sistema de Open Access Bolivia S.R.L. el {{ $generadoEn }}.
    </div>
</body>
</html>
