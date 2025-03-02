<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api([
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->statefulApi();
        
        // Excluir todas las rutas API de la validación CSRF
        $middleware->validateCsrfTokens([
            'api/*',
            'sanctum/csrf-cookie',
            'login',
            'logout',
            'register'
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
