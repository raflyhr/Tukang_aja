<?php

define('IS_VERCEL', true);

// Forward Vercel requests to Laravel's index.php
require __DIR__ . '/../public/index.php';
