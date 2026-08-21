<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>House BL {{ $house['numero_hbl'] }}</title>
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
        table.costos { width: 100%; border-collapse: collapse; }
        table.costos th { background-color: #f3f4f6; color: #042753; text-align: left; padding: 6px; border-bottom: 1px solid #d1d5db; }
        table.costos td { padding: 6px; border-bottom: 1px solid #e5e7eb; }
        table.costos td.derecha, table.costos th.derecha { text-align: right; }
        .total-general td { border-top: 2px solid #042753; font-weight: bold; color: #042753; font-size: 12px; }
        .footer { margin-top: 24px; font-size: 9px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>
    <table class="encabezado">
        <tr>
            <td>
                <h1>OPEN ACCESS BOLIVIA S.R.L.</h1>
                <p class="marca">House Bill of Lading</p>
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

    <h2>Cliente y Consignatario</h2>
    <table class="datos">
        <tr>
            <td class="etiqueta">Cliente (Shipper)</td>
            <td class="valor">{{ $embarque['cliente'] ?? '—' }}</td>
            <td class="etiqueta">Consignatario</td>
            <td class="valor">{{ $embarque['consignatario_nombre'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">NIT Consignatario</td>
            <td class="valor">{{ $embarque['consignatario_nit'] ?? '—' }}</td>
            <td class="etiqueta">Celular Consignatario</td>
            <td class="valor">{{ $embarque['consignatario_celular'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">Dirección Consignatario</td>
            <td class="valor" colspan="3">{{ $embarque['consignatario_direccion'] ?? '—' }}</td>
        </tr>
    </table>

    <h2>Ruta y Transporte</h2>
    <table class="datos">
        <tr>
            <td class="etiqueta">Modo de Transporte</td>
            <td class="valor">{{ $embarque['modo_transporte'] }}</td>
            <td class="etiqueta">Tipo de Servicio</td>
            <td class="valor">{{ $embarque['tipo_servicio'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">POL</td>
            <td class="valor">{{ $embarque['pol'] ?? '—' }}</td>
            <td class="etiqueta">POD</td>
            <td class="valor">{{ $embarque['pod'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">Destino Final</td>
            <td class="valor">{{ $embarque['destino_final'] ?? '—' }}</td>
            <td class="etiqueta">Naviera / Aerolínea</td>
            <td class="valor">{{ $embarque['naviera_aerolinea'] ?? '—' }}</td>
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
        <tr>
            <td class="etiqueta">Flete (House)</td>
            <td class="valor">{{ $house['condicion_pago'] ?? '—' }}</td>
            <td class="etiqueta">Fecha de Emisión</td>
            <td class="valor">{{ $house['fecha_emision'] ?? '—' }}</td>
        </tr>
    </table>

    <h2>Contenedores</h2>
    @if (count($contenedores) > 0)
        <table class="costos">
            <thead>
                <tr>
                    <th>Contenedor N°</th>
                    <th>Sello N°</th>
                    <th>Tipo</th>
                    <th class="derecha">Cant.</th>
                    <th class="derecha">Peso (kg)</th>
                    <th class="derecha">Vol. (cbm)</th>
                    <th>Descripción de Mercancía</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($contenedores as $item)
                    <tr>
                        <td>{{ $item['numero_contenedor'] ?? '—' }}</td>
                        <td>{{ $item['numero_sello'] ?? '—' }}</td>
                        <td>{{ $item['tipo_contenedor'] ?? '—' }}</td>
                        <td class="derecha">{{ $item['cantidad'] ?? 1 }}</td>
                        <td class="derecha">{{ $item['peso_kg'] ?? '—' }}</td>
                        <td class="derecha">{{ $item['volumen_cbm'] ?? '—' }}</td>
                        <td>{{ $item['descripcion_mercancia'] ?? '—' }}</td>
                    </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr class="total-general">
                    <td colspan="4" class="derecha">Totales</td>
                    <td class="derecha">{{ $totalPeso }}</td>
                    <td class="derecha">{{ $totalVolumen }}</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    @else
        <p>Este house todavía no tiene contenedores vinculados.</p>
    @endif

    <div class="footer">
        Documento generado por el sistema de Open Access Bolivia S.R.L. el {{ $generadoEn }}.
    </div>
</body>
</html>
