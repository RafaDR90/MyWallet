<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Balance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseController extends Controller
{
    /**
     * Listar todos los gastos del usuario
     */
    public function index(Request $request)
    {
        $expenses = Expense::with('expenseType')
            ->where('user_id', $request->user()->id)
            ->orderBy('fecha', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'expenses' => $expenses,
            'balance_actual' => Balance::where('user_id', $request->user()->id)
                ->first()
                ->cajon
        ]);
    }

    /**
     * Almacenar un nuevo gasto
     */
    public function store(Request $request)
    {
        $request->validate([
            'expense_type_id' => 'required|exists:expense_types,id',
            'monto' => 'required|numeric|min:0',
            'descripcion' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            // Obtener el balance actual
            $balance = Balance::where('user_id', $request->user()->id)->firstOrFail();

            // Actualizar el cajón
            $balance->cajon -= $request->monto;
            $balance->save();

            // Crear el gasto con la fecha actual
            $expense = new Expense($request->all());
            $expense->user_id = $request->user()->id;
            $expense->fecha = now()->format('Y-m-d'); // Fecha actual en formato YYYY-MM-DD
            $expense->cajon_posterior = $balance->cajon;
            $expense->save();

            DB::commit();

            return response()->json([
                'expense' => $expense->load('expenseType'),
                'balance' => $balance
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al procesar el gasto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar un gasto específico
     */
    public function show(Request $request, Expense $expense)
    {
        // Verificar que el gasto pertenezca al usuario
        if ($expense->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($expense->load('expenseType'));
    }

    /**
     * Eliminar un gasto
     */
    public function destroy(Request $request, Expense $expense)
    {
        try {
            DB::beginTransaction();

            // Verificar si el gasto pertenece al usuario
            if ($expense->user_id !== $request->user()->id) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            // Obtener los últimos 10 gastos del usuario
            $lastExpenses = Expense::where('user_id', $request->user()->id)
                ->orderBy('fecha', 'desc')
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();

            // Verificar si el gasto está entre los últimos 10
            if (!$lastExpenses->contains($expense)) {
                return response()->json([
                    'message' => 'Solo se pueden eliminar los últimos 10 gastos'
                ], 422);
            }

            // Obtener el balance actual
            $balance = Balance::where('user_id', $request->user()->id)->firstOrFail();

            // Devolver el dinero al cajón
            $balance->cajon += $expense->monto;
            $balance->save();

            // Obtener todos los gastos posteriores para actualizar cajon_posterior
            $posteriores = Expense::where('user_id', $request->user()->id)
                ->where('fecha', '>=', $expense->fecha)
                ->where('created_at', '>', $expense->created_at)
                ->orderBy('fecha', 'asc')
                ->orderBy('created_at', 'asc')
                ->get();

            // Actualizar cajon_posterior de los gastos posteriores
            foreach ($posteriores as $gasto) {
                $gasto->cajon_posterior += $expense->monto;
                $gasto->save();
            }

            // Eliminar el gasto
            $expense->delete();

            DB::commit();

            return response()->json([
                'message' => 'Gasto eliminado correctamente',
                'balance' => $balance,
                'gastos_actualizados' => count($posteriores)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar el gasto: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getMonthlySummary(Request $request)
    {
        try {
            $userId = $request->user()->id;
            $date = $request->query('date', now()->format('Y-m'));
            
            // Crear fechas de inicio y fin del mes seleccionado
            $firstDayOfMonth = \Carbon\Carbon::createFromFormat('Y-m', $date)->startOfMonth();
            $lastDayOfMonth = \Carbon\Carbon::createFromFormat('Y-m', $date)->endOfMonth();

            // Obtener resumen de gastos
            $expensesSummary = DB::table('expenses')
                ->join('expense_types', 'expenses.expense_type_id', '=', 'expense_types.id')
                ->select(
                    'expense_types.id as expense_type_id',
                    'expense_types.nombre as tipo_nombre',
                    DB::raw('CAST(SUM(monto) AS FLOAT) as total')
                )
                ->where('expenses.user_id', $userId)
                ->whereBetween('expenses.fecha', [$firstDayOfMonth, $lastDayOfMonth])
                ->groupBy('expense_types.id', 'expense_types.nombre');

            // Obtener ingresos de cartera
            $ingresos = DB::table('bank_deposits')
                ->where('user_id', $userId)
                ->where('tipo', 'cartera')
                ->whereBetween('fecha', [$firstDayOfMonth, $lastDayOfMonth])
                ->sum('cantidad');

            return response()->json([
                'gastos' => $expensesSummary->get(),
                'ingresos' => floatval($ingresos)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el resumen mensual',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getExpensesByType(Request $request, $typeId)
    {
        try {
            $userId = $request->user()->id;
            $date = $request->query('date');
            $isSeasonView = filter_var($request->query('isSeasonView', false), FILTER_VALIDATE_BOOLEAN);
            
            \Log::info('Getting expenses by type', [
                'typeId' => $typeId,
                'date' => $date,
                'isSeasonView' => $isSeasonView
            ]);

            $query = Expense::with('expenseType')
                ->where('user_id', $userId)
                ->where('expense_type_id', $typeId);

            if ($isSeasonView) {
                $seasonStart = DB::table('season_settings')
                    ->where('user_id', $userId)
                    ->value('season_start');
                
                $query->where('created_at', '>=', $seasonStart);
            } else {
                $query->whereYear('fecha', substr($date, 0, 4))
                      ->whereMonth('fecha', substr($date, 5, 2));
            }

            $expenses = $query->orderBy('fecha', 'desc')
                             ->orderBy('created_at', 'desc')
                             ->paginate(10);

            \Log::info('Expenses query result', [
                'count' => $expenses->count(),
                'total' => $expenses->total()
            ]);

            return response()->json($expenses);
        } catch (\Exception $e) {
            \Log::error('Error getting expenses by type', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al obtener los gastos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getSeasonExpensesSummary(Request $request)
    {
        try {
            $userId = $request->user()->id;
            
            // Obtener la fecha de inicio de temporada del usuario
            $seasonStart = DB::table('season_settings')
                ->where('user_id', $userId)
                ->value('season_start');

            // Si no existe, crear una nueva entrada con la fecha y hora actual
            if (!$seasonStart) {
                $seasonStart = now();
                DB::table('season_settings')->insert([
                    'user_id' => $userId,
                    'season_start' => $seasonStart,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Obtener el resumen de gastos desde la fecha y hora de inicio
            $expensesSummary = DB::table('expenses')
                ->join('expense_types', 'expenses.expense_type_id', '=', 'expense_types.id')
                ->select(
                    'expense_types.id as expense_type_id',
                    'expense_types.nombre as tipo_nombre',
                    DB::raw('CAST(SUM(monto) AS FLOAT) as total')
                )
                ->where('expenses.user_id', $userId)
                ->where('expenses.created_at', '>=', $seasonStart)
                ->groupBy('expense_types.id', 'expense_types.nombre');

            // Obtener ingresos de cartera de la temporada
            $ingresos = DB::table('bank_deposits')
                ->where('user_id', $userId)
                ->where('tipo', 'cartera')
                ->where('created_at', '>=', $seasonStart)
                ->sum('cantidad');

            return response()->json([
                'summary' => $expensesSummary->get(),
                'ingresos' => floatval($ingresos),
                'seasonStart' => $seasonStart
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el resumen de temporada',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function resetSeason(Request $request)
    {
        try {
            $userId = $request->user()->id;
            $now = now(); // Capturamos el momento exacto
            
            // Actualizar o crear nueva fecha de inicio de temporada con timestamp completo
            DB::table('season_settings')
                ->updateOrInsert(
                    ['user_id' => $userId],
                    [
                        'season_start' => $now,
                        'updated_at' => $now
                    ]
                );

            return response()->json([
                'message' => 'Temporada reiniciada exitosamente',
                'seasonStart' => $now
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al reiniciar la temporada',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
