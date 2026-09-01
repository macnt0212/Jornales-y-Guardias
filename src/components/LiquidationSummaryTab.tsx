import React from 'react';
import { MonthSchedule, DayInfo } from '../types';
import { 
  calculateAgentStats, 
  MONTH_NAMES, 
  HOURS_PER_SHIFT,
  getAgentWorkModality,
  getAgentJornalShift,
  getContraturnoShiftForAgent
} from '../utils/calendar';
import { CheckCircle2, FileSpreadsheet, Printer, Award, BarChart3, Users, Shield, Building2, Sun, Moon, Briefcase } from 'lucide-react';

interface LiquidationSummaryTabProps {
  schedule: MonthSchedule;
  days: DayInfo[];
  onExportExcel: () => void;
  onPrint: () => void;
}

export const LiquidationSummaryTab: React.FC<LiquidationSummaryTabProps> = ({
  schedule,
  days,
  onExportExcel,
  onPrint,
}) => {
  const monthName = MONTH_NAMES[schedule.month - 1];

  let totalJornalHs = 0;
  let totalExtHabilHs = 0;
  let totalInhabActivaHs = 0;
  let totalInhabPasivaHs = 0;
  let totalExtrasHs = 0;
  let totalGeneralHs = 0;

  const agentStatsList = schedule.agents.map(agent => {
    const stats = calculateAgentStats(agent, schedule, days);
    totalJornalHs += stats.horasJornal;
    totalExtHabilHs += stats.horasExtraHabil;
    totalInhabActivaHs += stats.horasInhabilActiva;
    totalInhabPasivaHs += stats.horasInhabilPasiva;
    totalExtrasHs += stats.totalHorasExtras;
    totalGeneralHs += stats.totalHorasMes;
    return { agent, stats };
  });

  const maxHours = Math.max(...agentStatsList.map(a => a.stats.totalHorasMes), 1);
  const serviceName = schedule.serviceConfig?.serviceName || 'Servicio Hospitalario';
  const hospitalName = schedule.serviceConfig?.hospitalName || 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"';
  const jefeName = schedule.serviceConfig?.jefeName || 'Cantero, Miguel Angel';
  const jefeCargo = schedule.serviceConfig?.jefeCargo || 'Jefe del Servicio de Informática';

  return (
    <div className="flex flex-col gap-5">
      {/* Action and Info Header */}
      <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-800 rounded-md">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Resumen Oficial de Horas para Liquidación y Recursos Humanos
            </h2>
            <p className="text-xs text-slate-500">
              Informe consolidado de {serviceName} • {hospitalName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Descargar Excel
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir Reporte
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6 printable-area">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                PROVINCIA DE FORMOSA • MINISTERIO DE DESARROLLO HUMANO
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                {hospitalName}
              </h1>
              <div className="text-xs font-bold text-emerald-800 uppercase mt-0.5">
                {serviceName}
              </div>
            </div>

            <div className="inline-block sm:text-right bg-slate-50 border border-slate-300 p-3 rounded-lg">
              <span className="text-xs text-slate-500 block">PLANILLA MENSUAL:</span>
              <strong className="text-base font-black text-slate-900 uppercase">
                {monthName} {schedule.year}
              </strong>
            </div>
          </div>
        </div>

        {/* Master Summary Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-2.5 border border-slate-700 text-center w-8">N°</th>
                <th className="p-2.5 border border-slate-700">Agente (Apellido y Nombre)</th>
                <th className="p-2.5 border border-slate-700 text-center">Legajo</th>
                <th className="p-2.5 border border-slate-700">Modalidad / Turno</th>
                <th className="p-2.5 border border-slate-700 text-center bg-blue-950">Jornal</th>
                <th className="p-2.5 border border-slate-700 text-center bg-emerald-950">Ext. Hábil</th>
                <th className="p-2.5 border border-slate-700 text-center bg-purple-950">Inháb. Activa</th>
                <th className="p-2.5 border border-slate-700 text-center bg-amber-950">Inháb. Pasiva</th>
                <th className="p-2.5 border border-slate-700 text-center bg-emerald-900 font-bold">Total Extras</th>
                <th className="p-2.5 border border-slate-700 text-center bg-slate-950 font-black">TOTAL MES</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-800">
              {agentStatsList.map(({ agent, stats }, index) => {
                const isEven = index % 2 === 0;
                const modality = getAgentWorkModality(agent);
                const jTurno = getAgentJornalShift(agent);

                return (
                  <tr key={agent.id} className={`${isEven ? 'bg-white' : 'bg-slate-50'} hover:bg-emerald-50/40 transition-colors`}>
                    <td className="p-2.5 border border-slate-300 text-center font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="p-2.5 border border-slate-300 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{agent.name}</span>
                        {agent.isJefe && (
                          <span className="text-[9px] bg-indigo-100 text-indigo-800 border border-indigo-200 px-1 py-0.2 rounded font-semibold">
                            Jefe
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">{agent.roleLabel}</div>
                    </td>
                    <td className="p-2.5 border border-slate-300 text-center font-mono text-slate-600 font-semibold">
                      {agent.legajo}
                    </td>
                    <td className="p-2.5 border border-slate-300">
                      {modality === 'solo_guardias' ? (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-200">
                          Solo Guardias ({agent.externalInstitution || 'Ext.'})
                        </span>
                      ) : modality === 'solo_jornal' ? (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                          Solo Jornal ({jTurno === 'tarde' ? 'Tarde' : 'Mañana'})
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                          {jTurno === 'tarde' ? 'J. Tarde + Ext. Mañana' : 'J. Mañana + Ext. Tarde'}
                        </span>
                      )}
                    </td>

                    {/* Jornal */}
                    <td className="p-2.5 border border-slate-300 text-center bg-blue-50/40">
                      {modality === 'solo_guardias' ? (
                        <span className="text-[10px] text-teal-700 italic font-semibold">[En otra inst.]</span>
                      ) : (
                        <>
                          <div className="font-bold text-blue-900">{stats.horasJornal} hs</div>
                          <div className="text-[10px] text-slate-500">{stats.diasJornal} días</div>
                        </>
                      )}
                    </td>

                    {/* Extra Hábil */}
                    <td className="p-2.5 border border-slate-300 text-center bg-emerald-50/40">
                      <div className="font-bold text-emerald-900">{stats.horasExtraHabil} hs</div>
                      <div className="text-[10px] text-slate-500">{stats.diasExtraHabil} días</div>
                    </td>

                    {/* Inhábil Activa */}
                    <td className="p-2.5 border border-slate-300 text-center bg-purple-50/40">
                      <div className="font-bold text-purple-900">{stats.horasInhabilActiva} hs</div>
                      <div className="text-[10px] text-slate-500">{stats.turnosInhabilActiva} turnos</div>
                    </td>

                    {/* Inhábil Pasiva */}
                    <td className="p-2.5 border border-slate-300 text-center bg-amber-50/40">
                      <div className="font-bold text-amber-900">{stats.horasInhabilPasiva} hs</div>
                      <div className="text-[10px] text-slate-500">{stats.turnosInhabilPasiva} turnos</div>
                    </td>

                    {/* Total Horas Extras */}
                    <td className="p-2.5 border border-slate-300 text-center bg-emerald-100/60 font-black text-emerald-950 text-sm">
                      {stats.totalHorasExtras} hs
                    </td>

                    {/* Total General Mes */}
                    <td className="p-2.5 border border-slate-300 text-center bg-slate-200/80 font-black text-slate-950 text-sm">
                      {stats.totalHorasMes} hs
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Totales Generales del Servicio */}
            <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-slate-950 text-xs">
              <tr>
                <td colSpan={4} className="p-3 border border-slate-700 text-right uppercase tracking-wider">
                  TOTALES GENERALES DEL SERVICIO:
                </td>
                <td className="p-3 border border-slate-700 text-center text-blue-300 font-extrabold">
                  {totalJornalHs} hs
                </td>
                <td className="p-3 border border-slate-700 text-center text-emerald-300 font-extrabold">
                  {totalExtHabilHs} hs
                </td>
                <td className="p-3 border border-slate-700 text-center text-purple-300 font-extrabold">
                  {totalInhabActivaHs} hs
                </td>
                <td className="p-3 border border-slate-700 text-center text-amber-300 font-extrabold">
                  {totalInhabPasivaHs} hs
                </td>
                <td className="p-3 border border-slate-700 text-center text-emerald-400 font-black text-sm">
                  {totalExtrasHs} hs
                </td>
                <td className="p-3 border border-slate-700 text-center text-white font-black text-base bg-emerald-950">
                  {totalGeneralHs} hs
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Visual Balance & Workload Distribution */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            Distribución y Carga Horaria del Personal
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agentStatsList.map(({ agent, stats }) => {
              return (
                <div key={agent.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-1.5">
                    <span className="truncate">{agent.name}</span>
                    <span className="font-bold text-emerald-800">{stats.totalHorasMes} hs ({stats.totalHorasExtras}h extras)</span>
                  </div>

                  {/* Multi-segment Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-3 flex overflow-hidden">
                    {stats.totalHorasMes > 0 ? (
                      <>
                        <div 
                          className="bg-blue-600 h-full" 
                          style={{ width: `${(stats.horasJornal / stats.totalHorasMes) * 100}%` }}
                          title={`Jornal: ${stats.horasJornal} hs`}
                        />
                        <div 
                          className="bg-emerald-500 h-full" 
                          style={{ width: `${(stats.horasExtraHabil / stats.totalHorasMes) * 100}%` }}
                          title={`Extra Hábil: ${stats.horasExtraHabil} hs`}
                        />
                        <div 
                          className="bg-purple-500 h-full" 
                          style={{ width: `${(stats.horasInhabilActiva / stats.totalHorasMes) * 100}%` }}
                          title={`Inhábil Activa: ${stats.horasInhabilActiva} hs`}
                        />
                        <div 
                          className="bg-amber-500 h-full" 
                          style={{ width: `${(stats.horasInhabilPasiva / stats.totalHorasMes) * 100}%` }}
                          title={`Inhábil Pasiva: ${stats.horasInhabilPasiva} hs`}
                        />
                      </>
                    ) : (
                      <div className="bg-slate-300 h-full w-full" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                    <span>Jornal: {stats.horasJornal}h</span>
                    <span>Ext. Hábil: {stats.horasExtraHabil}h</span>
                    <span>Inháb. Act.: {stats.horasInhabilActiva}h</span>
                    <span>Inháb. Pas.: {stats.horasInhabilPasiva}h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Institutional Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10 pt-8 border-t-2 border-slate-300 text-center text-xs text-slate-700">
          <div className="flex flex-col items-center">
            <div className="w-48 border-b-2 border-slate-400 mb-2"></div>
            <strong className="text-slate-900">{jefeName}</strong>
            <span className="text-[11px] text-slate-500">{jefeCargo}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-48 border-b-2 border-slate-400 mb-2"></div>
            <strong className="text-slate-900">Depto. Recursos Humanos</strong>
            <span className="text-[11px] text-slate-500">{hospitalName}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-48 border-b-2 border-slate-400 mb-2"></div>
            <strong className="text-slate-900">Dirección Ejecutiva / Médica</strong>
            <span className="text-[11px] text-slate-500">{hospitalName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
