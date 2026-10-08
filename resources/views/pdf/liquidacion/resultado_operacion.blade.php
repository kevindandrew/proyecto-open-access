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

        table.profits { width: 100%; border-collapse: collapse; margin-top: 12px; }
        table.profits th { background-color: #71BFA6; color: #042753; padding: 6px 8px; font-size: 10px; text-transform: uppercase; border: 1px solid #d1d5db; }
        table.profits td { padding: 10px 8px; font-size: 15px; font-weight: bold; text-align: center; color: #042753; border: 1px solid #d1d5db; }
        .emitido { display: block; font-size: 8px; color: #6b7280; font-weight: normal; }

        table.firmas { width: 100%; margin-top: 50px; border-collapse: collapse; }
        table.firmas td { width: 33%; padding: 0 20px; text-align: center; }
        .linea-firma { border-top: 1px solid #6b7280; padding-top: 4px; color: #042753; font-weight: bold; font-size: 10px; }

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
            <td class="etiqueta">Consignatario</td>
            <td class="valor">{{ $embarque['consignatario'] ?? '—' }}</td>
            <td class="etiqueta">Embarque</td>
            <td class="valor">{{ collect([$embarque['modo_transporte'], $embarque['tipo_embarque']])->filter()->implode(' / ') }}</td>
        </tr>
        <tr>
            <td class="etiqueta">Comercial</td>
            <td class="valor">
                {{ $embarque['comercial'] ?? '—' }}
                @if ($embarque['categoria_comision'])
                    ({{ $embarque['categoria_comision'] }})
                @endif
            </td>
            <td class="etiqueta">% Comisión</td>
            <td class="valor">{{ number_format($porcentajeComision, 2) }}%</td>
        </tr>
        <tr>
            <td class="etiqueta">Agente</td>
            <td class="valor">{{ $embarque['agente'] ?? '—' }}</td>
            <td class="etiqueta">Carrier</td>
            <td class="valor">{{ $embarque['naviera_aerolinea'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">MBL / MAWB</td>
            <td class="valor">{{ $embarque['mbl'] ?? '—' }}</td>
            <td class="etiqueta">HBL / HAWB</td>
            <td class="valor">{{ $embarque['hbl'] ?: '—' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">POL / POD</td>
            <td class="valor">{{ $embarque['pol'] ?? '—' }} / {{ $embarque['pod'] ?? '—' }}</td>
            <td class="etiqueta">ETD / ETA</td>
            <td class="valor">{{ $embarque['etd'] ?? '—' }} / {{ $embarque['eta'] ?? '—' }}</td>
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
                                <td class="derecha">
                                    {{ number_format($linea['monto'], 2) }} {{ $linea['moneda'] }}
                                    @if ($linea['emitido'])
                                        <span class="emitido">Emitido: {{ $linea['emitido'] }}</span>
                                    @endif
                                </td>
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
                                <td class="derecha">
                                    {{ number_format($linea['monto'], 2) }} {{ $linea['moneda'] }}
                                    @if ($linea['emitido'])
                                        <span class="emitido">Emitido: {{ $linea['emitido'] }}</span>
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="4" style="text-align: center; color: #9ca3af;">Sin documentos de pago generados.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </td>
        </tr>
    </table>

    @forelse ($totales as $moneda => $total)
        <h2>Totales {{ $moneda }}</h2>
        <table class="totales">
            <tr>
                <th>Total Venta</th>
                <td class="derecha">{{ number_format($total['venta'], 2) }}</td>
                <th>Total Compra</th>
                <td class="derecha">{{ number_format($total['compra'], 2) }}</td>
            </tr>
            <tr>
                <th>(+) Crédito Fiscal por facturas ({{ $porcentajeCreditoFiscal }}% OP con CF)</th>
                <td class="derecha">{{ number_format($total['credito_fiscal'], 2) }}</td>
                <th>(+) Débito Fiscal e IT por emisión de facturas ({{ $porcentajeDebitoFiscal }}%)</th>
                <td class="derecha">{{ number_format($total['debito_fiscal'], 2) }}</td>
            </tr>
            <tr class="profit">
                <td>Total Neto Venta</td>
                <td class="derecha">{{ number_format($total['neto_venta'], 2) }}</td>
                <td>Total Neto Compra</td>
                <td class="derecha">{{ number_format($total['neto_compra'], 2) }}</td>
            </tr>
        </table>

        <table class="profits">
            <tr>
                <th>Profit Preliminar</th>
                <th>Profit Comercial ({{ number_format($porcentajeComision, 2) }}%)</th>
                <th>Profit Final Empresa</th>
            </tr>
            <tr>
                <td>{{ number_format($total['profit_preliminar'], 2) }}</td>
                <td>{{ number_format($total['profit_comercial'], 2) }}</td>
                <td>{{ number_format($total['profit_final'], 2) }}</td>
            </tr>
        </table>
    @empty
        <h2>Totales</h2>
        <p style="text-align: center; color: #9ca3af;">Todavía no hay documentos de liquidación generados para este embarque.</p>
    @endforelse

    <table class="firmas">
        <tr>
            <td><div class="linea-firma">VºBº Operaciones</div></td>
            <td><div class="linea-firma">VºBº Vendedor</div></td>
            <td><div class="linea-firma">VºBº Contabilidad</div></td>
        </tr>
    </table>

    <div class="cerrada">
        LIQUIDACIÓN CERRADA el {{ $embarque['liquidacion_cerrada_en'] }} — Costos, Gastos de Destino y nuevos documentos quedan bloqueados para este file.
    </div>

    <div class="footer">
        Documento generado por el sistema de Open Access Bolivia S.R.L. el {{ $generadoEn }}.
    </div>
</body>
</html>
