import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { QuarryScenario } from '../types';
import { calculateScenarioSummary } from '../utils/calculations';
import { formatCurrency } from '../utils/format';
import { TrendingUp, TrendingDown, Activity, DollarSign, PieChart as PieChartIcon } from 'lucide-react';

interface AnalyticsViewProps {
  scenario: QuarryScenario;
}

const EXPENSE_COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ scenario }) => {
  const summary = calculateScenarioSummary(scenario);

  // Prepare data for Processus Breakdown (Bar Chart)
  const processData = summary.items.map(item => ({
    name: item.nom,
    'Gasoil': item.gasoilCout,
    'Pièces': item.piecesRechangeCout,
    'Salaires': item.personnelPaieCout,
    'Location': item.locationCout,
    'Amortissement': item.amortissementCout,
    'Taxes': item.taxesCout,
    'Total': item.totalCout
  }));

  // Prepare data for Total Expense Breakdown (Pie Chart)
  const expenseBreakdown = [
    { name: 'Gasoil', value: summary.items.reduce((acc, curr) => acc + curr.gasoilCout, 0) },
    { name: 'Pièces', value: summary.items.reduce((acc, curr) => acc + curr.piecesRechangeCout, 0) },
    { name: 'Location', value: summary.items.reduce((acc, curr) => acc + curr.locationCout, 0) },
    { name: 'Salaires', value: summary.items.reduce((acc, curr) => acc + curr.personnelPaieCout + curr.personnelRepasCout + curr.personnelHebergementCout, 0) },
    { name: 'Amort.', value: summary.items.reduce((acc, curr) => acc + curr.amortissementCout, 0) },
    { name: 'Taxes', value: summary.items.reduce((acc, curr) => acc + curr.taxesCout, 0) },
  ].filter(item => item.value > 0);

  const profitMargin = summary.totalVentes - summary.totalGlobal;
  const marginPercentage = summary.totalVentes > 0 ? (profitMargin / summary.totalVentes) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Analyse & Graphiques</h2>
          <p className="text-xs text-zinc-400 font-medium">Visualisation détaillée des coûts et de la rentabilité</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign className="h-16 w-16 text-emerald-500" />
          </div>
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Chiffre d'Affaires</h3>
          <p className="text-2xl font-black text-white">{formatCurrency(summary.totalVentes, scenario.devise)}</p>
          <div className="mt-2 text-xs font-bold text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Prix moyen: {formatCurrency(scenario.prixVenteMoyenParTonne, scenario.devise)} / T
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden group hover:border-rose-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <PieChartIcon className="h-16 w-16 text-rose-500" />
          </div>
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Coût de Revient Total</h3>
          <p className="text-2xl font-black text-white">{formatCurrency(summary.totalGlobal, scenario.devise)}</p>
          <div className="mt-2 text-xs font-bold text-rose-400 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" /> Coût unitaire: {formatCurrency(summary.coutParTonneGlobal, scenario.devise)} / T
          </div>
        </div>

        <div className={`border p-5 rounded-2xl relative overflow-hidden ${profitMargin >= 0 ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-rose-950/20 border-rose-900/50'}`}>
          <h3 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${profitMargin >= 0 ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
            {profitMargin >= 0 ? 'Marge Bénéficiaire Nette' : 'Déficit (Perte)'}
          </h3>
          <p className={`text-2xl font-black ${profitMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {profitMargin > 0 ? '+' : ''}{formatCurrency(profitMargin, scenario.devise)}
          </p>
          <div className={`mt-2 text-xs font-bold flex items-center gap-1 ${profitMargin >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {profitMargin >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {marginPercentage.toFixed(2)}% de rentabilité
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Cost Breakdown Bar Chart */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex flex-col">
          <h3 className="text-xs font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <BarChart className="h-4 w-4 text-indigo-400" />
            Répartition des coûts par processus
          </h3>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickMargin={10} />
                <YAxis stroke="#a1a1aa" fontSize={10} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#e4e4e7', fontWeight: 'bold' }}
                  formatter={(value: number) => formatCurrency(value, scenario.devise)}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="Gasoil" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Pièces" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Salaires" stackId="a" fill="#ef4444" />
                <Bar dataKey="Location" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="Amortissement" stackId="a" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Expense Distribution Pie Chart */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex flex-col">
          <h3 className="text-xs font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-emerald-400" />
            Structure Globale des Dépenses
          </h3>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#52525b', strokeWidth: 1 }}
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}
                  formatter={(value: number) => formatCurrency(value, scenario.devise)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
