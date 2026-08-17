<?php

namespace App\Support;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;

class CloudinaryUploader
{
    public static function subir(UploadedFile $archivo, string $carpeta): string
    {
        $cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key' => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret'),
            ],
        ]);

        $resultado = $cloudinary->uploadApi()->upload($archivo->getRealPath(), [
            'folder' => $carpeta,
            'resource_type' => 'auto',
        ]);

        return $resultado['secure_url'];
    }
}
