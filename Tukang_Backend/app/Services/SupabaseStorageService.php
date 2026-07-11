<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SupabaseStorageService
{
    protected string $url;
    protected string $key;
    protected string $bucket;

    public function __construct()
    {
        $this->url = rtrim(config('services.supabase.url', env('SUPABASE_URL', '')), '/');
        $this->key = config('services.supabase.key', env('SUPABASE_KEY', ''));
        $this->bucket = config('services.supabase.bucket', env('SUPABASE_BUCKET', 'profil'));
    }

    /**
     * Upload file ke Supabase Storage bucket.
     *
     * @param string $fileContent  Binary content dari file
     * @param string $path         Path di dalam bucket (misal: "tukang/profil/abc123.webp")
     * @param string $contentType  MIME type (misal: "image/webp")
     * @return string|null         Public URL dari file yang diupload, atau null jika gagal
     */
    public function upload(string $fileContent, string $path, string $contentType = 'image/webp'): ?string
    {
        $endpoint = "{$this->url}/storage/v1/object/{$this->bucket}/{$path}";

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->key}",
            'Content-Type' => $contentType,
            'x-upsert' => 'true', // Overwrite jika sudah ada
        ])->withBody($fileContent, $contentType)->post($endpoint);

        if ($response->successful()) {
            // Return public URL
            return "{$this->url}/storage/v1/object/public/{$this->bucket}/{$path}";
        }

        // Log error untuk debugging
        \Log::error('Supabase Storage upload failed', [
            'status' => $response->status(),
            'body' => $response->body(),
            'path' => $path,
        ]);

        return null;
    }

    /**
     * Hapus file dari Supabase Storage bucket.
     *
     * @param string $path  Path file di dalam bucket
     * @return bool
     */
    public function delete(string $path): bool
    {
        $endpoint = "{$this->url}/storage/v1/object/{$this->bucket}";

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->key}",
            'Content-Type' => 'application/json',
        ])->delete($endpoint, [
            'prefixes' => [$path],
        ]);

        return $response->successful();
    }

    /**
     * Dapatkan public URL dari file di bucket.
     *
     * @param string $path
     * @return string
     */
    public function getPublicUrl(string $path): string
    {
        return "{$this->url}/storage/v1/object/public/{$this->bucket}/{$path}";
    }
}
