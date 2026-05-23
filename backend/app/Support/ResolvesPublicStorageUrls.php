<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;


trait ResolvesPublicStorageUrls
{
    protected function toPublicStorageUrl(?string $value): ?string
    {
        $path = $this->extractDiskPathFromUrl($value);

        if (! $path) {
            return null;
        }

        $baseUrl = $this->publicStorageBaseUrl();

        if ($baseUrl === '') {
            return $path;
        }

        return $baseUrl.'/'.ltrim($path, '/');
    }

    protected function extractDiskPathFromUrl(?string $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        $normalizedValue = trim($value);

        if (! filter_var($normalizedValue, FILTER_VALIDATE_URL)) {
            return ltrim($normalizedValue, '/');
        }

        $path = ltrim((string) parse_url($normalizedValue, PHP_URL_PATH), '/');

        if ($path === '') {
            return null;
        }

        $bucket = trim((string) config('filesystems.disks.s3.bucket'), '/');

        if ($bucket !== '' && ($path === $bucket || str_starts_with($path, $bucket.'/'))) {
            return ltrim(Str::after($path, $bucket), '/');
        }

        return $path;
    }

    protected function publicStorageBaseUrl(): string
    {
        $configuredBaseUrl = (string) (
            env('AWS_PUBLIC_ENDPOINT')
            ?: config('filesystems.disks.s3.url')
            ?: config('filesystems.disks.s3.endpoint')
        );

        $configuredBaseUrl = rtrim($configuredBaseUrl, '/');
        $bucket = trim((string) config('filesystems.disks.s3.bucket'), '/');

        if ($configuredBaseUrl === '') {
            return '';
        }

        if ($bucket === '') {
            return $configuredBaseUrl;
        }

        $basePath = trim((string) parse_url($configuredBaseUrl, PHP_URL_PATH), '/');

        if ($basePath === $bucket || str_ends_with($basePath, '/'.$bucket)) {
            return $configuredBaseUrl;
        }

        return $configuredBaseUrl.'/'.$bucket;
    }

    protected function toPresignedUrl(?string $value, int $minutes = 60): ?string
    {
        $path = $this->extractDiskPathFromUrl($value);

        if (! $path) {
            return null;
        }

        try {
            $config = config('filesystems.disks.s3');
            $publicEndpoint = env('AWS_PUBLIC_ENDPOINT', $config['endpoint'] ?? null);

            $client = new \Aws\S3\S3Client([
                'version'                 => 'latest',
                'region'                  => $config['region'] ?? 'us-east-1',
                'endpoint'                => $publicEndpoint,
                'use_path_style_endpoint' => $config['use_path_style_endpoint'] ?? false,
                'credentials'             => [
                    'key'    => $config['key'],
                    'secret' => $config['secret'],
                ],
            ]);

            $command = $client->getCommand('GetObject', [
                'Bucket' => $config['bucket'],
                'Key'    => $path,
            ]);

            $presignedRequest = $client->createPresignedRequest($command, "+{$minutes} minutes");
            return (string) $presignedRequest->getUri();
        } catch (\Throwable $e) {
            // Fallback para URL normal se a geração falhar
            return $this->toPublicStorageUrl($path);
        }
    }
}
