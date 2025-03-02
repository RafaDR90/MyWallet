<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Exception;
use Illuminate\Support\Facades\Log;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        try {
            Log::info('1. Iniciando redirección a Google');
            return Socialite::driver('google')
                ->stateless()
                ->redirect();
        } catch (Exception $e) {
            Log::error('Error en redirectToGoogle', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->away(env('FRONTEND_URL') . '/login?error=google_redirect_failed');
        }
    }

    public function handleGoogleCallback()
    {
        try {
            Log::info('Recibiendo callback de Google');
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();
            
            Log::info('Usuario de Google obtenido', ['email' => $googleUser->email]);

            $existingUser = User::where('email', $googleUser->email)->first();

            if ($existingUser) {
                Log::info('Usuario existente encontrado');
                $existingUser->update([
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                ]);
                $user = $existingUser;
            } else {
                Log::info('Creando nuevo usuario');
                $user = User::create([
                    'email' => $googleUser->email,
                    'name' => $googleUser->name,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'password' => encrypt(rand(1,1000)),
                ]);
            }

            $user->tokens()->delete();
            $token = $user->createToken('auth-token')->plainTextToken;
            
            $redirectUrl = env('FRONTEND_URL') . '/auth/callback?' . http_build_query([
                'token' => $token,
                'email' => $user->email,
                'name' => $user->name,
                'avatar' => $user->avatar
            ]);

            return redirect()->away($redirectUrl);

        } catch (Exception $e) {
            Log::error('Error en handleGoogleCallback: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->away(env('FRONTEND_URL') . '/login?error=auth_failed');
        }
    }
}