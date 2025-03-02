<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\RateLimiter;

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

        $middleware->throttleApi([
            'global' => RateLimiter::perMinute(100), // 60 peticiones por minuto globalmente
            '*' => [
                RateLimiter::perMinute(30)->by(fn () => request()->ip()), // 30 peticiones por minuto por IP
            ],
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
