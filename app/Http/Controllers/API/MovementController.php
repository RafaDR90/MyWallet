<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BankDeposit;
use App\Models\Expense;
use App\Models\TransferRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class MovementController extends Controller
{
    public function index(Request $request)
    {
        try {
            $userId = Auth::id();
            $page = $request->query('page', 1);
            $perPage = 10;

            $movements = collect();

            // Obtener depósitos bancarios
            $deposits = BankDeposit::where('user_id', $userId)
                ->select(
                    'id',
                    'cantidad',
                    'descripcion',
                    'fecha',
                    'balance_posterior',
                    'created_at',
                    'tipo as tipo_deposito',
                    DB::raw("'deposito' as tipo_movimiento"),
                    DB::raw('NULL as tipo')
                );

            // Obtener gastos
            $expenses = Expense::where('user_id', $userId)
                ->select(
                    'id',
                    'monto as cantidad',
                    'descripcion',
                    'fecha',
                    'cajon_posterior as balance_posterior',
                    'created_at',
                    DB::raw("NULL as tipo_deposito"),
                    DB::raw("'gasto' as tipo_movimiento"),
                    DB::raw('NULL as tipo')
                );

            // Obtener transferencias
            $transfers = TransferRecord::where('user_id', $userId)
                ->select(
                    'id',
                    'cantidad',
                    'descripcion',
                    'fecha',
                    'cajon_posterior as balance_posterior',
                    'created_at',
                    DB::raw("NULL as tipo_deposito"),
                    DB::raw("'transferencia' as tipo_movimiento"),
                    'tipo'
                );

            // Unir y ordenar todos los movimientos
            $allMovements = $deposits
                ->union($expenses)
                ->union($transfers)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json($allMovements);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los movimientos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getIngresosMes(Request $request, $fecha)
    {
        try {
            $userId = Auth::id();
            $startOfMonth = \Carbon\Carbon::parse($fecha)->startOfMonth();
            $endOfMonth = \Carbon\Carbon::parse($fecha)->endOfMonth();

            // Obtener depósitos a cartera del mes
            $deposits = BankDeposit::where('user_id', $userId)
                ->where('tipo', 'cartera')
                ->whereBetween('fecha', [$startOfMonth, $endOfMonth])
                ->select(
                    'id',
                    'cantidad',
                    'descripcion',
                    'fecha',
                    'balance_posterior',
                    'created_at',
                    'tipo as tipo_deposito',
                    DB::raw("'deposito' as tipo_movimiento")
                )
                ->orderBy('fecha', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($deposits);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los ingresos del mes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getIngresosTemporada(Request $request)
    {
        try {
            $userId = Auth::id();
            
            // Obtener fecha de inicio de temporada de la tabla correcta
            $seasonStart = DB::table('season_settings')
                ->where('user_id', $userId)
                ->value('season_start');

            if (!$seasonStart) {
                $seasonStart = now()->startOfMonth();
            }

            // Obtener depósitos a cartera de la temporada
            $deposits = BankDeposit::where('user_id', $userId)
                ->where('tipo', 'cartera')
                ->where('fecha', '>=', $seasonStart)
                ->select(
                    'id',
                    'cantidad',
                    'descripcion',
                    'fecha',
                    'balance_posterior',
                    'created_at',
                    'tipo as tipo_deposito',
                    DB::raw("'deposito' as tipo_movimiento")
                )
                ->orderBy('fecha', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($deposits);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los ingresos de la temporada',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 