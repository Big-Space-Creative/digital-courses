<?php
require '/var/www/vendor/autoload.php';
use Aws\S3\S3Client;

$client = new S3Client([
    'version'  => 'latest',
    'region'   => 'us-east-1',
    'endpoint' => 'http://minio:9000',
    'use_path_style_endpoint' => true,
    'credentials' => ['key' => 'minioadmin', 'secret' => 'minioadmin'],
]);

$cmd = $client->getCommand('PutObject', [
    'Bucket'      => 'digital-courses-bucket',
    'Key'         => 'test/test.mp4',
    'ContentType' => 'video/mp4',
]);

$req = $client->createPresignedRequest($cmd, '+10 minutes');
echo (string)$req->getUri() . PHP_EOL;
echo "OK" . PHP_EOL;
