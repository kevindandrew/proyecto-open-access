<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Cotización {{ $cotizacion['numero_referencia'] }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #1f2937; }
        h1 { font-size: 18px; color: #042753; margin: 0; }
        h2 { font-size: 13px; color: #042753; margin: 18px 0 6px; border-bottom: 2px solid #71BFA6; padding-bottom: 4px; }
        .encabezado { width: 100%; margin-bottom: 12px; }
        .encabezado td { vertical-align: top; }
        .marca { font-size: 11px; color: #6b7280; }
        .estado {
            display: inline-block; padding: 3px 10px; border-radius: 4px;
            font-size: 11px; font-weight: bold; color: #042753; background-color: #e5e7eb;
        }
        table.datos { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
        table.datos td { padding: 4px 6px; }
        table.datos td.etiqueta { color: #6b7280; width: 33%; }
        table.datos td.valor { color: #042753; font-weight: bold; }
        table.costos { width: 100%; border-collapse: collapse; }
        table.costos th { background-color: #f3f4f6; color: #042753; text-align: left; padding: 6px; border-bottom: 1px solid #d1d5db; }
        table.costos td { padding: 6px; border-bottom: 1px solid #e5e7eb; }
        table.costos td.derecha, table.costos th.derecha { text-align: right; }
        .total-general td { border-top: 2px solid #042753; font-weight: bold; color: #042753; font-size: 13px; }
        .motivo { margin-top: 10px; padding: 8px; background-color: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
        .footer { margin-top: 24px; font-size: 9px; color: #9ca3af; text-align: center; }
        .terminos { margin: 0; padding-left: 16px; }
        .terminos li { margin-bottom: 5px; text-align: justify; }
    </style>
</head>
<body>
    <table class="encabezado">
        <tr>
            <td>
                <h1>OPEN ACCESS BOLIVIA S.R.L.</h1>
                <p class="marca">Cotización de Servicio de Transporte Internacional</p>
            </td>
            <td style="text-align: right;">
                <p><strong>Referencia:</strong> {{ $cotizacion['numero_referencia'] }}</p>
                <span class="estado">{{ $cotizacion['estado'] }}</span>
            </td>
        </tr>
    </table>

    <h2>Cliente y Ruta</h2>
    <table class="datos">
        <tr>
            <td class="etiqueta">Cliente</td>
            <td class="valor">{{ $cotizacion['cliente'] ?? '—' }}</td>
            <td class="etiqueta">Comercial</td>
            <td class="valor">{{ $cotizacion['comercial'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">Modo de Transporte</td>
            <td class="valor">{{ $cotizacion['modo_transporte'] }}</td>
            <td class="etiqueta">Tipo de Servicio</td>
            <td class="valor">{{ $cotizacion['tipo_servicio'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">Incoterm</td>
            <td class="valor">{{ $cotizacion['incoterm'] ?? '—' }}</td>
            <td class="etiqueta">Días de Tránsito</td>
            <td class="valor">{{ $cotizacion['dias_transito'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">POL</td>
            <td class="valor">{{ $cotizacion['pol'] ?? '—' }}</td>
            <td class="etiqueta">POD</td>
            <td class="valor">{{ $cotizacion['pod'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">Destino Final</td>
            <td class="valor">{{ $cotizacion['destino_final'] ?? '—' }}</td>
            <td class="etiqueta">Mercancía Peligrosa</td>
            <td class="valor">{{ $cotizacion['mercancia_peligrosa'] ? 'Sí' : 'No' }}</td>
        </tr>
        <tr>
            <td class="etiqueta">Fecha de Emisión</td>
            <td class="valor">{{ $cotizacion['fecha_emision'] }}</td>
            <td class="etiqueta">Válida Hasta</td>
            <td class="valor">{{ $cotizacion['fecha_validez'] }}</td>
        </tr>
    </table>

    @if ($cotizacion['estado'] === 'Rechazado' && $cotizacion['motivo_rechazo'])
        <div class="motivo">
            <strong>Motivo del Rechazo:</strong> {{ $cotizacion['motivo_rechazo'] }}
        </div>
    @endif

    <h2>Carga</h2>
    @if (count($contenedores) > 0)
        <table class="costos">
            <thead>
                <tr>
                    <th>Tipo de Contenedor</th>
                    <th class="derecha">Cantidad</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($contenedores as $item)
                    <tr>
                        <td>{{ $item['tipo_contenedor'] }}</td>
                        <td class="derecha">{{ $item['cantidad'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <table class="datos">
            <tr>
                <td class="etiqueta">Peso (kg)</td>
                <td class="valor">{{ $cotizacion['peso_kg'] ?? '—' }}</td>
                <td class="etiqueta">Volumen (cbm)</td>
                <td class="valor">{{ $cotizacion['volumen_cbm'] ?? '—' }}</td>
            </tr>
        </table>
    @endif

    <h2>Detalle de Costos</h2>
    <table class="costos">
        <thead>
            <tr>
                <th>Descripción</th>
                <th>Unidad</th>
                <th class="derecha">Costo Unit.</th>
                <th class="derecha">Base</th>
                <th>Moneda</th>
                <th class="derecha">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($detalle as $linea)
                <tr>
                    <td>{{ $linea['descripcion'] }}</td>
                    <td>{{ $linea['tipo_tarifa_unidad'] ?? '—' }}</td>
                    <td class="derecha">{{ $linea['costo_unitario'] }}</td>
                    <td class="derecha">{{ $linea['base_calculo'] }}</td>
                    <td>{{ $linea['moneda'] }}</td>
                    <td class="derecha">{{ $linea['costo_total'] }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="total-general">
                <td colspan="5" class="derecha">Total General</td>
                <td class="derecha">{{ $total }}</td>
            </tr>
        </tfoot>
    </table>

    @if ($cotizacion['tipo_servicio'] === 'FCL')
        <h2>Términos y Condiciones</h2>
        <ol class="terminos">
            <li>Esta cotización es válida hasta {{ $cotizacion['fecha_validez'] }} salvo que se indique lo contrario.</li>
            <li>Las tarifas están sujetas a cambios en función de los ajustes en las tarifas de las líneas navieras, los recargos por combustible y las fluctuaciones monetarias.</li>
            <li>Se aplicarán cargos por demora y detención una vez transcurrido el período gratuito especificado por la línea naviera.</li>
            <li>Las mercancías peligrosas, carga sobredimensionada o mercancías con temperatura controlada pueden conllevar cargos adicionales.</li>
            <li>No incluye seguro de mercadería.</li>
            <li>Términos de pago: 10 antes del arribo de la carga.</li>
            <li>Todas las tarifas excluyen aranceles, impuestos y tasas gubernamentales en destino, a menos que se indique lo contrario.</li>
            <li>No incluye inspecciones en puertos de origen ni transbordo.</li>
            <li>No incluye liberaciones de los contenedores que las líneas navieras soliciten para el transporte a Bolivia.</li>
            <li>El tiempo de tránsito que figura en la presente cotización es netamente referencial según lo que informan las líneas navieras.</li>
            <li>Las líneas navieras se reservan la potestad de programar o reprogramar los embarques a conveniencia. Por tanto, Open Access no se compromete al arribo de cargas en fechas específicas.</li>
            <li>Una vez el booking es asignado, en caso de cancelar, modificar o posponer el mismo, pueden aplicarse multas por parte de la naviera, el agente en origen o el transportista.</li>
            <li>En toda cotización EXW, posicionamos el contenedor en bodega del shipper, y el llenado y trincado de la carga dentro del contenedor va por cuenta y responsabilidad del shipper.</li>
        </ol>
    @elseif ($cotizacion['tipo_servicio'] === 'LCL')
        <h2>Términos y Condiciones</h2>
        <ol class="terminos">
            <li>Esta cotización es válida hasta {{ $cotizacion['fecha_validez'] }} salvo que se indique lo contrario.</li>
            <li>Las tarifas están sujetas a cambios en función de los ajustes en las tarifas de las líneas navieras, los recargos por combustible y las fluctuaciones monetarias.</li>
            <li>El flete LCL se cotiza por Ton/CBM (1 tonelada = 1 metro cúbico), cobrándose siempre el valor que resulte mayor.</li>
            <li>Las tarifas finales se recalculan en el almacén de consolidación (LCL Warehouse / CFS). Si las dimensiones finales superan las declaradas, el costo aumentará proporcionalmente.</li>
            <li>La carga debe ser apta para el transporte marítimo internacional, preferiblemente paletizada, filmada y correctamente etiquetada.</li>
            <li>El transportista puede rechazar carga mal embalada que ponga en riesgo del contenido.</li>
            <li>Las mercancías peligrosas, carga sobredimensionada y mercancías con temperatura controlada pueden conllevar cargos adicionales.</li>
            <li>No incluye seguro de mercadería.</li>
            <li>Términos de pago: 10 antes del arribo de la carga.</li>
            <li>Todas las tarifas excluyen aranceles, impuestos y tasas gubernamentales en destino, a menos que se indique lo contrario.</li>
            <li>No incluye inspecciones en puertos de origen ni transbordo.</li>
            <li>El tiempo de tránsito que figura en la presente cotización es netamente referencial según lo que informan las líneas navieras.</li>
            <li>Las líneas navieras se reservan la potestad de programar o reprogramar los embarques a conveniencia. Por tanto, Open Access no se compromete al arribo de cargas en fechas específicas.</li>
        </ol>
    @endif

    <div class="footer">
        Documento generado por el sistema de Open Access Bolivia S.R.L. el {{ $generadoEn }}. Cotización sujeta a
        disponibilidad y variación de tarifas hasta la fecha de validez indicada.
    </div>
</body>
</html>
