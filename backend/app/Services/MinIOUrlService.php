<?php

namespace App\Services;

/**
 * Service para validar e gerenciar URLs seguras de MinIO.
 *
 * Garante que apenas URLs de MinIO autorizado são aceitas,
 * previne injeção e exposição de credenciais.
 */
class MinIOUrlService
{
    /**
     * Lista de hosts MinIO permitidos (whitelist).
     * Configure via .env: MINIO_ALLOWED_HOSTS (comma-separated)
     *
     * Exemplo: MINIO_ALLOWED_HOSTS=minio.example.com,cdn.example.com
     */
    private array $allowedHosts;

    public function __construct()
    {
        $hosts = env('MINIO_ALLOWED_HOSTS', 'localhost:9000');
        $this->allowedHosts = array_map('trim', explode(',', $hosts));
    }

    /**
     * Valida se uma URL é de um host MinIO permitido.
     *
     * @param  string  $url  URL a validar
     * @return bool true se válida, false caso contrário
     */
    public function isValid(?string $url): bool
    {
        if (empty($url)) {
            return true; // URLs vazias são opcionais
        }

        // Verificar se é URL válida
        if (! filter_var($url, FILTER_VALIDATE_URL)) {
            return false;
        }

        // Extrair host da URL
        $host = parse_url($url, PHP_URL_HOST);
        if (! $host) {
            return false;
        }

        // Adicionar porta se existir
        $port = parse_url($url, PHP_URL_PORT);
        if ($port) {
            $host = "{$host}:{$port}";
        }

        // Verificar se host está na whitelist
        foreach ($this->allowedHosts as $allowedHost) {
            if (strtolower($host) === strtolower($allowedHost)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Sanitiza URL do MinIO (remove espaços, caracteres inválidos).
     *
     * @param  string  $url  URL a sanitizar
     * @return string URL sanitizada
     */
    public function sanitize(?string $url): ?string
    {
        if (empty($url)) {
            return null;
        }

        // Remover espaços em branco
        $url = trim($url);

        // Remover caracteres de controle
        $url = preg_replace('/[\x00-\x1F\x7F]/', '', $url);

        return $url;
    }

    /**
     * Valida e sanitiza URL em uma única chamada.
     *
     * @param  string  $url  URL a validar/sanitizar
     * @return string|null URL sanitizada se válida, null se inválida
     */
    public function validateAndSanitize(?string $url): ?string
    {
        if (empty($url)) {
            return null;
        }

        $sanitized = $this->sanitize($url);

        if (! $this->isValid($sanitized)) {
            return null;
        }

        return $sanitized;
    }

    /**
     * Obtém a lista de hosts permitidos (para logging/debug).
     *
     * @return array Hosts permitidos
     */
    public function getAllowedHosts(): array
    {
        return $this->allowedHosts;
    }
}
