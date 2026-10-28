<?php

namespace App\Http\Controllers\Operativo;

use App\Http\Controllers\Controller;
use App\Models\HouseBl;
use App\Support\HouseBlFormatoPreimpreso;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class HouseBlController extends Controller
{
    public function pdf(HouseBl $house): HttpResponse
    {
        $idOperativo = Auth::user()->empleado->id_empleado;

        abort_unless($house->embarque->id_operativo === $idOperativo, 403);

        $pdf = HouseBlFormatoPreimpreso::pdf($house, 'consulta');

        $nombreArchivo = str_replace(['/', '\\'], '-', $house->numero_hbl);

        return $pdf->stream("House-{$nombreArchivo}.pdf");
    }
}
