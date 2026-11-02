<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Embarque;
use App\Models\EmbarqueCosto;
use App\Support\ConsigneeHouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmbarqueCostoController extends Controller
{
    public function store(Request $request, Embarque $embarque): RedirectResponse
    {
        abort_if($embarque->liquidacion_cerrada_en, 403, 'La liquidación de este embarque ya está cerrada.');

        $data = $request->validate([
            'concepto' => ['required', 'string', 'max:100'],
            'id_proveedor' => ['nullable', 'integer', 'exists:proveedores,id_proveedor'],
            // "cliente:{id}" / "consignatario:{id}" — '' = el cliente del embarque.
            'cobrar_a' => ['nullable', 'string', 'max:50'],
            'costo_compra' => ['nullable', 'numeric'],
            'costo_venta' => ['nullable', 'numeric'],
            'moneda' => ['required', 'string', 'max:5'],
        ]);

        $embarque->costos()->create([...self::sinCobrarA($data), ...self::cobrarA($data, $embarque)]);

        return redirect()
            ->route('gerente-operativo.embarques.show', $embarque->id_embarque)
            ->with('success', 'Costo agregado correctamente.');
    }

    public function update(Request $request, EmbarqueCosto $costo): RedirectResponse
    {
        abort_if($costo->embarque->liquidacion_cerrada_en, 403, 'La liquidación de este embarque ya está cerrada.');

        $data = $request->validate([
            'concepto' => ['required', 'string', 'max:100'],
            'id_proveedor' => ['nullable', 'integer', 'exists:proveedores,id_proveedor'],
            'cobrar_a' => ['nullable', 'string', 'max:50'],
            'costo_compra' => ['nullable', 'numeric'],
            'costo_venta' => ['nullable', 'numeric'],
            'moneda' => ['required', 'string', 'max:5'],
        ]);

        $costo->update([...self::sinCobrarA($data), ...self::cobrarA($data, $costo->embarque, $costo->valorCobrarA())]);

        return redirect()
            ->route('gerente-operativo.embarques.show', $costo->id_embarque)
            ->with('success', 'Costo actualizado correctamente.');
    }

    public function destroy(EmbarqueCosto $costo): RedirectResponse
    {
        abort_if($costo->embarque->liquidacion_cerrada_en, 403, 'La liquidación de este embarque ya está cerrada.');

        $idEmbarque = $costo->id_embarque;
        $costo->delete();

        return redirect()
            ->route('gerente-operativo.embarques.show', $idEmbarque)
            ->with('success', 'Costo eliminado correctamente.');
    }

    /**
     * "Cobrar a" del concepto: el cliente del embarque o uno de sus
     * consignatarios (mismas opciones que el consignee de un house).
     */
    private static function cobrarA(array $data, Embarque $embarque, ?string $actual = null): array
    {
        $columnas = ConsigneeHouse::resolver($data['cobrar_a'] ?? null, $embarque, null, 'cobrar_a', $actual);

        return [
            'id_cliente_cobro' => $columnas['id_cliente'],
            'id_consignatario_cobro' => $columnas['id_consignatario'],
        ];
    }

    /**
     * Datos de la fila sin el selector "Cobrar a". Un monto vacío se guarda
     * como 0 (ej. un concepto extra que solo se le cobra al cliente no tiene
     * costo de compra).
     */
    private static function sinCobrarA(array $data): array
    {
        unset($data['cobrar_a']);

        $data['costo_compra'] = $data['costo_compra'] ?? 0;
        $data['costo_venta'] = $data['costo_venta'] ?? 0;

        return $data;
    }
}
