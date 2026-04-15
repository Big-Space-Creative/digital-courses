<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use Aws\S3\S3Client;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StorageController extends Controller
{
    public function uploadUrl(Request $request)
    {
        $request->validate([
            'filename'     => 'required|string',
            'content_type' => 'required|string',
        ]);

        $filename  = $request->input('filename');
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        $path      = 'uploads/' . date('Y/m/d') . '/' . Str::uuid() . ($extension ? '.' . $extension : '');

        $config = config('filesystems.disks.s3');

        // Use the public endpoint for presigned URL generation so the browser's
        // Host header matches what is signed — avoids 403 SignatureDoesNotMatch.
        $publicEndpoint = env('AWS_PUBLIC_ENDPOINT', $config['endpoint'] ?? null);

        $client = new S3Client([
            'version'                 => 'latest',
            'region'                  => $config['region'] ?? 'us-east-1',
            'endpoint'                => $publicEndpoint,
            'use_path_style_endpoint' => $config['use_path_style_endpoint'] ?? false,
            'credentials'             => [
                'key'    => $config['key'],
                'secret' => $config['secret'],
            ],
        ]);

        $command = $client->getCommand('PutObject', [
            'Bucket'      => $config['bucket'],
            'Key'         => $path,
            'ContentType' => $request->input('content_type'),
        ]);

        $presignedRequest = $client->createPresignedRequest($command, '+60 minutes');

        return response()->json([
            'success'    => true,
            'upload_url' => (string) $presignedRequest->getUri(),
            'path'       => $path,
        ]);
    }
}
