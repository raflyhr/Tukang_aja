<?php

define('IS_VERCEL', true);

// Override cache paths to /tmp so Laravel doesn't write to bootstrap/cache
$_ENV['APP_SERVICES_CACHE'] = '/tmp/storage/framework/cache/services.php';
$_ENV['APP_PACKAGES_CACHE'] = '/tmp/storage/framework/cache/packages.php';
$_ENV['APP_CONFIG_CACHE'] = '/tmp/storage/framework/cache/config.php';
$_ENV['APP_ROUTES_CACHE'] = '/tmp/storage/framework/cache/routes.php';
$_ENV['APP_EVENTS_CACHE'] = '/tmp/storage/framework/cache/events.php';

try {
    require __DIR__ . '/../public/index.php';
} catch (\Throwable $e) {
    echo "<h1>Fatal Error Caught in api/index.php</h1>";
    echo "<pre>";
    $current = $e;
    while ($current) {
        echo "Exception: " . get_class($current) . "\n";
        echo "Message: " . $current->getMessage() . "\n";
        echo "File: " . $current->getFile() . ":" . $current->getLine() . "\n";
        echo "Trace:\n" . $current->getTraceAsString() . "\n\n";
        echo "----------------------------------------\n\n";
        $current = $current->getPrevious();
    }
    echo "</pre>";
}
