<?php

namespace App\Support;

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
}
