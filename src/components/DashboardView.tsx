import React from 'react';
import { QuarryScenario } from '../types';
import { calculateScenarioSummary } from '../utils/calculations';
import { formatCurrency, formatPercent, formatTonnage, formatCostPerTon, formatVolume, formatCostPerM3, formatCostPerUnit } from '../utils/format';
import { MetricCard } from './MetricCard';
import { t } from '../utils/translations';
import {
  TrendingUp,
  Coins,
  Truck,
  Activity,
  Layers,
  Wrench,
  Fuel,
  Users,
  Percent,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardViewProps {
  scenario: QuarryScenario;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ scenario }) => {
  const summary = calculateScenarioSummary(scenario);
  const { items, totalGlobal, coutParTonneGlobal, totalVentes, margeGlobale, margeParTonne, margePourcent, breakdownByCategory } = summary;

  // Préparation des données pour le diagramme en barres (processus)
  const barChartData = items.map(item => ({
    name: item.nom,
    'Gasoil': Math.round(item.gasoilCout),
    'Pièces Rechange': Math.round(item.piecesRechangeCout),
    'Amortissement': Math.round(item.amortissementCout),
    'Location Externe': Math.round(item.locationCout),
    'Personnel': Math.round(item.personnelPaieCout + item.personnelRepasCout + item.personnelHebergementCout),
    'Taxes': Math.round(item.taxesCout),
    'Total': Math.round(item.totalCout)
  }));

  // Map to link item types to SVG gradient colors
  const gradientMap: Record<string, string> = {
    'Gasoil': 'url(#pieGasoil)',
    'Pièces Rechange': 'url(#piePieces)',
    'Amortissement': 'url(#pieAmortissement)',
    'Location Matériel': 'url(#pieLocation)',
    'Personnel (Paie/Repas/Logement)': 'url(#piePersonnel)',
    'Impôts & Taxes': 'url(#pieTaxes)'
  };

  // Préparation des données pour le diagramme circulaire (nature des coûts)
  const pieChartData = [
    { name: t('gasoil', scenario.lang), value: breakdownByCategory.gasoil, color: gradientMap['Gasoil'] },
    { name: t('spare_parts', scenario.lang), value: breakdownByCategory.pieces, color: gradientMap['Pièces Rechange'] },
    { name: t('amortization', scenario.lang), value: breakdownByCategory.amortissement, color: gradientMap['Amortissement'] },
    { name: t('ext_location', scenario.lang), value: breakdownByCategory.location, color: gradientMap['Location Matériel'] },
    { name: t('personnel', scenario.lang), value: breakdownByCategory.personnelTotal, color: gradientMap['Personnel (Paie/Repas/Logement)'] },
    { name: t('taxes', scenario.lang), value: breakdownByCategory.taxes, color: gradientMap['Impôts & Taxes'] }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8" id="dashboard-view-root">
      {/* Dynamic Company Branding Header */}
      {(scenario.nomEntreprise || scenario.localisation || scenario.logoUrl || scenario.periodeConcerne) && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 p-6 rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-900/40 via-zinc-900/20 to-zinc-950/60 backdrop-blur-md relative overflow-hidden group shadow-lg shadow-black/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/3 rounded-full blur-3xl -z-10 pointer-events-none group-hover:bg-emerald-500/5 transition-colors duration-500"></div>
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full">
            {scenario.logoUrl && (
              <div className="bg-zinc-950/60 p-2.5 rounded-2xl border border-zinc-800/80 shrink-0 flex items-center justify-center h-16 w-28 shadow-inner shadow-black">
                <img src={scenario.logoUrl} alt="Logo" className="max-h-12 max-w-full object-contain rounded-md" />
              </div>
            )}
            <div className="space-y-1">
              {scenario.nomEntreprise && (
                <h2 className="text-xl font-black tracking-tight text-white uppercase">{scenario.nomEntreprise}</h2>
              )}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-zinc-400 font-mono">
                {scenario.localisation && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-emerald-400">📍</span> {scenario.localisation}
                  </span>
                )}
                {scenario.localisation && scenario.periodeConcerne && (
                  <span className="text-zinc-700">|</span>
                )}
                {scenario.periodeConcerne && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-blue-400">📅</span> {t('period_concerned', scenario.lang)} : <strong className="text-zinc-200">{scenario.periodeConcerne}</strong>
                  </span>
                )}
              </div>
              {(scenario.substance || scenario.destination) && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-300 mt-2.5 uppercase tracking-wider bg-zinc-950/65 py-1.5 px-3 border border-zinc-850 rounded-xl w-fit">
                  <span className="text-amber-450 text-xs">🪨</span>
                  <span>{scenario.substance || '-'}</span>
                  {scenario.destination && (
                    <>
                      <span className="text-zinc-500 font-normal">➔</span>
                      <span className="text-emerald-400 font-extrabold">{scenario.destination}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 text-right w-full md:w-auto border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0">
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-xs">
              {t('active_exploitation', scenario.lang)}
            </span>
            <span className="text-[10px] text-zinc-555 font-mono">{t('scenario_manager', scenario.lang)} : {scenario.nom}</span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('kpi_total_cost', scenario.lang)}
          value={formatCurrency(totalGlobal, scenario.devise)}
          subValue={`${t('kpi_total_cost_sub', scenario.lang)} ${formatTonnage(scenario.productionTonnage)} (${formatVolume(scenario.productionTonnage / (scenario.densite || 1.6))})`}
          icon={<Coins className="h-5 w-5 text-emerald-400" />}
          color="primary"
          id="kpi-total-cost"
        />
        <MetricCard
          title={t('kpi_avg_cost', scenario.lang)}
          value={formatCostPerUnit(coutParTonneGlobal, scenario.densite || 1.6, scenario.unitePrincipale || 'T', scenario.devise).primary}
          subValue={`${t('kpi_avg_cost_sub', scenario.lang)} (${formatCostPerUnit(coutParTonneGlobal, scenario.densite || 1.6, scenario.unitePrincipale || 'T', scenario.devise).secondary})`}
          icon={<Truck className="h-5 w-5 text-blue-400" />}
          color="info"
          id="kpi-cost-per-tonne"
        />
        <MetricCard
          title={t('kpi_sales', scenario.lang)}
          value={formatCurrency(totalVentes, scenario.devise)}
          subValue={`${t('kpi_sales_sub', scenario.lang)} : ${formatCostPerUnit(scenario.prixVenteMoyenParTonne, scenario.densite || 1.6, scenario.unitePrincipale || 'T', scenario.devise).combined}`}
          icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
          color="success"
          id="kpi-estimated-sales"
        />
        <MetricCard
          title={t('kpi_margin', scenario.lang)}
          value={formatCurrency(margeGlobale, scenario.devise)}
          subValue={`${t('kpi_margin_sub', scenario.lang)} : ${formatPercent(margePourcent)} (${formatCostPerUnit(margeParTonne, scenario.densite || 1.6, scenario.unitePrincipale || 'T', scenario.devise).combined})`}
          icon={<Percent className="h-5 w-5 text-amber-400" />}
          color={margeGlobale >= 0 ? "success" : "danger"}
          id="kpi-net-margin"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Process Cost Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md p-6 shadow-xl shadow-black/30" id="chart-bar-container">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-emerald-400" />
              {t('chart_process_title', scenario.lang)}
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-1">{t('chart_process_subtitle', scenario.lang)} {scenario.devise}</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorGasoil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#047857" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="colorPieces" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#064e3b" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="colorAmortissement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="colorLocation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#6b21a8" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="colorPersonnel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#b45309" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="colorTaxes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#9f1239" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value), scenario.devise), '']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 17, 28, 0.95)', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255, 255, 255, 0.08)', 
                    color: '#ffffff',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                <Bar dataKey="Gasoil" name={t('gasoil', scenario.lang)} stackId="a" fill="url(#colorGasoil)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Pièces Rechange" name={t('spare_parts', scenario.lang)} stackId="a" fill="url(#colorPieces)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Amortissement" name={t('amortization', scenario.lang)} stackId="a" fill="url(#colorAmortissement)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Location Externe" name={t('ext_location', scenario.lang)} stackId="a" fill="url(#colorLocation)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Personnel" name={t('personnel', scenario.lang)} stackId="a" fill="url(#colorPersonnel)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Taxes" name={t('taxes', scenario.lang)} stackId="a" fill="url(#colorTaxes)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nature Breakdown Pie Chart */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md p-6 shadow-xl shadow-black/30" id="chart-pie-container">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-emerald-400" />
              {t('chart_nature_title', scenario.lang)}
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-1">{t('chart_nature_subtitle', scenario.lang)}</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="pieGasoil" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10b981"/>
                    <stop offset="100%" stopColor="#047857"/>
                  </linearGradient>
                  <linearGradient id="piePieces" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#059669"/>
                    <stop offset="100%" stopColor="#064e3b"/>
                  </linearGradient>
                  <linearGradient id="pieAmortissement" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#1d4ed8"/>
                  </linearGradient>
                  <linearGradient id="pieLocation" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a855f7"/>
                    <stop offset="100%" stopColor="#6b21a8"/>
                  </linearGradient>
                  <linearGradient id="piePersonnel" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f59e0b"/>
                    <stop offset="100%" stopColor="#b45309"/>
                  </linearGradient>
                  <linearGradient id="pieTaxes" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f43f5e"/>
                    <stop offset="100%" stopColor="#b91c1c"/>
                  </linearGradient>
                </defs>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value), scenario.devise), '']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 17, 28, 0.95)', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255, 255, 255, 0.08)', 
                    color: '#ffffff',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center flex flex-col justify-center items-center pointer-events-none">
              <span className="text-[10px] text-zinc-550 block uppercase tracking-widest font-semibold">{t('total', scenario.lang)}</span>
              <span className="text-base font-extrabold text-white mt-0.5">{formatCurrency(totalGlobal, scenario.devise)}</span>
            </div>
          </div>
          {/* Custom Legends list */}
          <div className="mt-4 space-y-2 overflow-y-auto max-h-32 pr-1">
            {pieChartData.map((entry, idx) => {
              const p = totalGlobal > 0 ? (entry.value / totalGlobal) * 100 : 0;
              const legendColors: Record<string, string> = {
                [t('gasoil', scenario.lang)]: '#10b981',
                [t('spare_parts', scenario.lang)]: '#059669',
                [t('amortization', scenario.lang)]: '#3b82f6',
                [t('ext_location', scenario.lang)]: '#a855f7',
                [t('personnel', scenario.lang)]: '#f59e0b',
                [t('taxes', scenario.lang)]: '#f43f5e'
              };
              const col = legendColors[entry.name] || '#71717a';
              return (
                <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col, boxShadow: `0 0 6px ${col}80` }} />
                    <span className="truncate">{entry.name}</span>
                  </div>
                  <span className="font-mono text-zinc-450 whitespace-nowrap">{formatPercent(p)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Analytical Cost Matrix Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-xl shadow-black/30" id="cost-matrix-container">
        <div className="p-6 border-b border-zinc-800/60 bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-400" />
              {t('cost_matrix', scenario.lang)}
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-1">{t('cost_matrix_desc', scenario.lang)}</p>
          </div>
          <div className="text-xs font-mono text-zinc-300 bg-zinc-900/80 py-1.5 px-3 border border-zinc-800 rounded-lg whitespace-nowrap">
            {t('production', scenario.lang)} : <strong className="text-emerald-400 font-bold">{formatTonnage(scenario.productionTonnage)} ({formatVolume(scenario.productionTonnage / (scenario.densite || 1.6))})</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-5 min-w-[150px]">{t('process_section', scenario.lang)}</th>
                <th className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 font-bold">
                    <Fuel className="h-3.5 w-3.5 text-emerald-400" /> {t('gasoil', scenario.lang)}
                  </div>
                </th>
                <th className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 font-bold">
                    <Wrench className="h-3.5 w-3.5 text-emerald-500" /> {t('spare_parts', scenario.lang)}
                  </div>
                </th>
                <th className="py-4 px-4 text-right font-bold">{t('amortization', scenario.lang)}</th>
                <th className="py-4 px-4 text-right font-bold">{t('ext_location', scenario.lang)}</th>
                <th className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 font-bold">
                    <Users className="h-3.5 w-3.5 text-amber-400" /> {t('personnel', scenario.lang)}
                  </div>
                </th>
                <th className="py-4 px-4 text-right font-bold">{t('taxes', scenario.lang)}</th>
                <th className="py-4 px-5 text-right bg-emerald-500/5 font-bold text-emerald-400 border-l border-zinc-800/80">{t('total_cost', scenario.lang)}</th>
                <th className="py-4 px-5 text-right bg-zinc-950/20 font-bold text-white border-l border-zinc-800/80">{scenario.unitePrincipale === 'm3' ? "Coût / m³" : t('cost_per_ton', scenario.lang)}</th>
                <th className="py-4 px-5 text-center text-zinc-500 border-l border-zinc-800/80">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {items.map((item) => {
                const personnelTotal = item.personnelPaieCout + item.personnelRepasCout + item.personnelHebergementCout;
                return (
                  <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="py-4 px-5 font-bold text-white">
                      <div>{t(item.id as any, scenario.lang)}</div>
                      <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-1 truncate max-w-[200px]">
                        {t(`${item.id}_sub` as any, scenario.lang)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-zinc-400">
                      {item.gasoilCout > 0 ? formatCurrency(item.gasoilCout, '') : '-'}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-zinc-400">
                      {item.piecesRechangeCout > 0 ? formatCurrency(item.piecesRechangeCout, '') : '-'}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-zinc-400">
                      {item.amortissementCout > 0 ? formatCurrency(item.amortissementCout, '') : '-'}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-zinc-400">
                      {item.locationCout > 0 ? formatCurrency(item.locationCout, '') : '-'}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-zinc-400">
                      {personnelTotal > 0 ? formatCurrency(personnelTotal, '') : '-'}
                      {personnelTotal > 0 && (
                        <div className="text-[9px] text-zinc-500 font-semibold tracking-wider uppercase mt-0.5">
                          P: {Math.round(item.personnelPaieCout)} | R: {Math.round(item.personnelRepasCout)} | H: {Math.round(item.personnelHebergementCout)}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-zinc-400">
                      {item.taxesCout > 0 ? formatCurrency(item.taxesCout, '') : '-'}
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-bold text-emerald-400 bg-emerald-500/5 border-l border-zinc-800/80">
                      {formatCurrency(item.totalCout, scenario.devise)}
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-bold text-white bg-zinc-950/20 border-l border-zinc-800/80">
                      <div>
                        {scenario.unitePrincipale === 'm3' 
                          ? formatCostPerM3(item.coutParTonne * (scenario.densite || 1.6), scenario.devise)
                          : formatCostPerTon(item.coutParTonne, scenario.devise)}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-normal mt-0.5">
                        {scenario.unitePrincipale === 'm3'
                          ? formatCostPerTon(item.coutParTonne, scenario.devise)
                          : formatCostPerM3(item.coutParTonne * (scenario.densite || 1.6), scenario.devise)}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center font-mono text-zinc-400 border-l border-zinc-800/80">
                      {formatPercent(item.pourcentage)}
                    </td>
                  </tr>
                );
              })}

              {/* Total Consolidated Row */}
              <tr className="bg-zinc-950/90 border-t-2 border-zinc-800 text-white font-bold">
                <td className="py-4.5 px-5 font-bold uppercase text-white">{t('total_general', scenario.lang)}</td>
                <td className="py-4.5 px-4 text-right font-mono text-zinc-200">
                  {formatCurrency(breakdownByCategory.gasoil, '')}
                </td>
                <td className="py-4.5 px-4 text-right font-mono text-zinc-200">
                  {formatCurrency(breakdownByCategory.pieces, '')}
                </td>
                <td className="py-4.5 px-4 text-right font-mono text-zinc-200">
                  {formatCurrency(breakdownByCategory.amortissement, '')}
                </td>
                <td className="py-4.5 px-4 text-right font-mono text-zinc-200">
                  {formatCurrency(breakdownByCategory.location, '')}
                </td>
                <td className="py-4.5 px-4 text-right font-mono text-zinc-200">
                  {formatCurrency(breakdownByCategory.personnelTotal, '')}
                  <div className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase mt-0.5">
                    P: {Math.round(breakdownByCategory.personnelPaie)} | R: {Math.round(breakdownByCategory.personnelRepas)} | H: {Math.round(breakdownByCategory.personnelHebergement)}
                  </div>
                </td>
                <td className="py-4.5 px-4 text-right font-mono text-zinc-200">
                  {formatCurrency(breakdownByCategory.taxes, '')}
                </td>
                <td className="py-4.5 px-5 text-right font-mono font-bold text-emerald-400 bg-emerald-500/10 border-l border-zinc-800/80">
                  {formatCurrency(totalGlobal, scenario.devise)}
                </td>
                <td className="py-4.5 px-5 text-right font-mono font-bold text-white bg-zinc-950/40 border-l border-zinc-800/80">
                  <div>
                    {scenario.unitePrincipale === 'm3'
                      ? formatCostPerM3(coutParTonneGlobal * (scenario.densite || 1.6), scenario.devise)
                      : formatCostPerTon(coutParTonneGlobal, scenario.devise)}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-normal mt-0.5">
                    {scenario.unitePrincipale === 'm3'
                      ? formatCostPerTon(coutParTonneGlobal, scenario.devise)
                      : formatCostPerM3(coutParTonneGlobal * (scenario.densite || 1.6), scenario.devise)}
                  </div>
                </td>
                <td className="py-4.5 px-5 text-center font-mono text-zinc-300 border-l border-zinc-800/80">
                  100%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Observations & Notes Panel */}
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-6 shadow-xl shadow-black/30 print:hidden">
        <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          📝 Notes & Observations d'Exploitation
        </h3>
        {scenario.observations ? (
          <div className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed bg-zinc-950/70 p-4 border border-zinc-850 rounded-xl">
            {scenario.observations}
          </div>
        ) : (
          <div className="text-xs text-zinc-500 italic bg-zinc-950/20 p-4 border border-dashed border-zinc-800 rounded-xl">
            Aucune note d'exploitation (pannes, arrêts, absences, incidents...) renseignée pour cette période. Vous pouvez saisir vos observations en ouvrant le volet d'identification (bouton d'édition) en haut de la page.
          </div>
        )}
      </div>

    </div>
  );
};
