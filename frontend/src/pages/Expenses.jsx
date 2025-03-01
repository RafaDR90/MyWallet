// export default function Expenses() {
//   return (
//     <div className="flex flex-col md:flex-row md:gap-6">
//       {/* Lista de Gastos */}
//       <div className="w-full md:w-2/3">
//         <h2 className="text-xl font-bold mb-4 text-dark-on-surface">Gastos</h2>
//         <div className="space-y-3">
//           {[1, 2, 3, 4, 5].map((item) => (
//             <div 
//               key={item} 
//               className="bg-dark-surface rounded-lg shadow-lg p-4 hover:bg-dark-surface/80 transition-colors cursor-pointer"
//             >
//               <div className="flex justify-between items-start mb-2">
//                 <div>
//                   <p className="font-medium text-dark-on-surface">Gasto en Comida</p>
//                   <p className="text-sm text-dark-on-surface/60">23 Feb 2024</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-lg font-semibold text-dark-error">-25.00 €</p>
//                   <p className="text-sm text-dark-on-surface/60">Cartera: €175.00 €</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Panel de Resumen (visible solo en desktop) */}
//       <div className="hidden md:block w-1/3">
//         <div className="bg-dark-surface rounded-lg shadow-lg p-5 sticky top-20">
//           <h2 className="text-lg font-semibold mb-4 text-dark-on-surface">Resumen</h2>
//           <div className="space-y-4">
//             <div className="p-4 bg-dark-bg/30 rounded-lg">
//               <p className="text-sm text-dark-on-surface/60 mb-1">Total Mes</p>
//               <p className="text-2xl font-bold text-dark-error">-345.00 €</p>
//             </div>
//             <div className="p-4 bg-dark-bg/30 rounded-lg">
//               <p className="text-sm text-dark-on-surface/60 mb-1">Cartera Actual</p>
//               <p className="text-2xl font-bold text-dark-on-surface">€175.00</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Botón flotante para añadir gasto */}
//       <button 
//         className="fixed bottom-20 md:bottom-6 right-4 w-14 h-14 bg-dark-primary text-dark-on-primary rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
//         aria-label="Añadir gasto"
//       >
//         <span className="text-2xl">+</span>
//       </button>
//     </div>
//   )
// } 