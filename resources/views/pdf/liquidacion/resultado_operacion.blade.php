<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Resultado Operación {{ $embarque['numero_file'] }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #1f2937; }
        h1 { font-size: 20px; color: #042753; margin: 0; text-align: center; }
        h2 { font-size: 12px; color: #042753; margin: 18px 0 6px; border-bottom: 2px solid #71BFA6; padding-bottom: 4px; text-transform: uppercase; }
        .encabezado { width: 100%; margin-bottom: 14px; }
        .encabezado td { vertical-align: top; }

        table.datos { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
        table.datos td { padding: 5px 6px; border: 1px solid #e5e7eb; }
        table.datos td.etiqueta { color: #6b7280; font-size: 9px; text-transform: uppercase; background-color: #f9fafb; width: 15%; }
        table.datos td.valor { color: #042753; font-weight: bold; }

        table.movimientos { width: 100%; border-collapse: collapse; margin-top: 6px; }
        table.movimientos th, table.movimientos td { border: 1px solid #d1d5db; padding: 5px 7px; font-size: 10px; }
        table.movimientos th { background-color: #042753; color: #fff; text-align: left; }
        table.movimientos td.derecha, table.movimientos th.derecha { text-align: right; }
        table.movimientos tbody tr:nth-child(even) { background-color: #f9fafb; }

        .col-2 { width: 100%; }
        .col-2 td { vertical-align: top; width: 50%; padding: 0 6px; }

        table.totales { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.totales th, table.totales td { border: 1px solid #d1d5db; padding: 6px 8px; font-size: 11px; }
        table.totales th { background-color: #f3f4f6; text-align: left; color: #042753; }
        table.totales td.derecha, table.totales th.derecha { text-align: right; font-weight: bold; }
        table.totales tr.profit td { background-color: #71BFA6; color: #042753; font-weight: bold; font-size: 13px; }

        .cerrada { margin-top: 16px; padding: 8px; background-color: #fef3c7; color: #92400e; font-size: 10px; text-align: center; }
        .footer { margin-top: 30px; font-size: 9px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>
    <table class="encabezado">
        <tr>
            <td style="width: 30%;">
                <img src="{{ public_path('images/logoOpenAccess.png') }}" style="height: 45px;">
            </td>
            <td style="text-align: center; width: 40%;">
                <h1>RESULTADO OPERACIÓN</h1>
            </td>
            <td style="width: 30%;"></td>
        </tr>
    </table>

    <table class="datos">
        <tr>
            <td class="etiqueta">N° File</td>
            <td class="valor">{{ $embarque['numero_file'] }}</td>
            <td class="etiqueta">Cliente</td>
            <td class="valor">{{ $embarque['cliente'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">Comercial</td>
            <td class="valor">{{ $embarque['comercial'] ?? '—' }}</td>
            <td class="etiqueta">Modo</td>
            <td class="valor">{{ $embarque['modo_transporte'] }}</td>
        </tr>
        <tr>
            <td class="etiqueta">Carrier</td>
            <td class="valor">{{ $embarque['naviera_aerolinea'] ?? '—' }}</td>
            <td class="etiqueta">MBL / MAWB</td>
            <td class="valor">{{ $embarque['mbl'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">POL</td>
            <td class="valor">{{ $embarque['pol'] ?? '—' }}</td>
            <td class="etiqueta">POD</td>
            <td class="valor">{{ $embarque['pod'] ?? '—' }}</td>
        </tr>
    </table>

    <table class="col-2">
        <tr>
            <td>
                <h2>Ingresos</h2>
                <table class="movimientos">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Documento</th>
                            <th>N°</th>
                            <th class="derecha">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($ingresos as $linea)
                            <tr>
                                <td>{{ $linea['contraparte'] }}</td>
                                <td>{{ $linea['tipo'] }}</td>
                                <td>{{ $linea['numero'] }}</td>
                                <td class="derecha">{{ number_format($linea['monto'], 2) }} {{ $linea['moneda'] }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="4" style="text-align: center; color: #9ca3af;">Sin documentos de cobro generados.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </td>
            <td>
                <h2>Egresos</h2>
                <table class="movimientos">
                    <thead>
                        <tr>
                            <th>Proveedor</th>
                            <th>Documento</th>
                            <th>N°</th>
                            <th class="derecha">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($egresos as $linea)
                            <tr>
                                <td>{{ $linea['contraparte'] }}</td>
                                <td>{{ $linea['tipo'] }}</td>
                                <td>{{ $linea['numero'] }}</td>
                                <td class="derecha">{{ number_format($linea['monto'], 2) }} {{ $linea['moneda'] }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="4" style="text-align: center; color: #9ca3af;">Sin documentos de pago generados.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </td>
        </tr>
    </table>

    <h2>Totales</h2>
    <table class="totales">
        <thead>
            <tr>
                <th>Moneda</th>
                <th class="derecha">Total Venta</th>
                <th class="derecha">Total Compra</th>
                <th class="derecha">Profit Neto</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($profitNetoPorMoneda as $moneda => $profit)
                <tr class="profit">
                    <td>{{ $moneda }}</td>
                    <td class="derecha">{{ number_format($totalVentaPorMoneda[$moneda] ?? 0, 2) }}</td>
                    <td class="derecha">{{ number_format($totalCompraPorMoneda[$moneda] ?? 0, 2) }}</td>
                    <td class="derecha">{{ number_format($profit, 2) }}</td>
                </tr>
            @empty
                <tr><td colspan="4" style="text-align: center; color: #9ca3af;">Todavía no hay documentos de liquidación generados para este embarque.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="cerrada">
        LIQUIDACIÓN CERRADA el {{ $embarque['liquidacion_cerrada_en'] }} — Costos, Gastos de Destino y nuevos documentos quedan bloqueados para este file.
    </div>

    <div class="footer">
        Documento generado por el sistema de Open Access Bolivia S.R.L. el {{ $generadoEn }}.
    </div>
</body>
</html>
