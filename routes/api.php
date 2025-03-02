<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\API\BalanceController;
use App\Http\Controllers\API\ExpenseController;
use App\Http\Controllers\API\ExpenseTypeController;
use App\Http\Controllers\API\MonthlyBudgetController;
use App\Http\Controllers\API\TransferController;
use App\Http\Controllers\API\MovementController;
use App\Http\Controllers\API\GoogleController;
use Illuminate\Support\Facades\Mail;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Rutas protegidas por autenticación
Route::middleware('auth:sanctum')->group(function () {
    // Balance routes
    Route::get('/balance', [BalanceController::class, 'show']);
    Route::post('/balance/add-to-banco', [BalanceController::class, 'addToBanco']);
    Route::get('/balance/deposit-history', [BalanceController::class, 'depositHistory']);
    Route::post('/balance/add-to-cajon', [BalanceController::class, 'addToCajon']);

    // Expense routes
    Route::get('/expenses/season-summary', [ExpenseController::class, 'getSeasonExpensesSummary']);
    Route::get('/expenses/monthly-summary', [ExpenseController::class, 'getMonthlySummary']);
    Route::get('/expenses/by-type/{typeId}', [ExpenseController::class, 'getExpensesByType']);
    Route::post('/expenses/reset-season', [ExpenseController::class, 'resetSeason']);
    Route::apiResource('expenses', ExpenseController::class);

    // Expense Type routes
    Route::get('/expense-types', [ExpenseTypeController::class, 'index']);
    Route::post('/expense-types', [ExpenseTypeController::class, 'store']);
    Route::delete('/expense-types/{expenseType}', [ExpenseTypeController::class, 'destroy']);

    // Monthly Budget routes
    Route::get('/monthly-budgets', [MonthlyBudgetController::class, 'index']);
    Route::post('/monthly-budgets', [MonthlyBudgetController::class, 'store']);
    Route::delete('/monthly-budgets/{monthlyBudget}', [MonthlyBudgetController::class, 'destroy']);

    // Transfer routes
    Route::get('/transfers', [TransferController::class, 'index']);
    Route::post('/transfers', [TransferController::class, 'store']);
    Route::delete('/transfers/{transfer}', [TransferController::class, 'destroy']);

    // Movement routes
    Route::prefix('movements')->group(function () {
        Route::get('/', [MovementController::class, 'index']);
        Route::get('/ingresos/mes/{fecha}', [MovementController::class, 'getIngresosMes']);
        Route::get('/ingresos/temporada', [MovementController::class, 'getIngresosTemporada']);
    });
});

// Rutas de autenticación
Route::post('/register', [RegisteredUserController::class, 'store'])
    ->middleware('guest')
    ->name('register');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest')
    ->name('login');

Route::post('/forgot-password', [PasswordResetLinkController::class, 'store']);

Route::post('/reset-password', [NewPasswordController::class, 'store'])
    ->middleware('guest')
    ->name('password.store');

Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['auth:sanctum', 'signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->name('verification.send');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:sanctum')
    ->name('logout');

Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);
    




