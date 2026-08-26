import React, { useState } from 'react';
import { MonthSchedule, DayInfo, Agent } from '../types';
import { calculateAgentStats, HOURS_PER_SHIFT, MONTH_NAMES } from '../utils/calendar';
import { User, FileText, Printer, CheckCircle, Shield } from 'lucide-react';

interface AgentDetailTabProps {
  schedule: MonthSchedule;
  days: DayInfo[];
  onPrint: () => void;
}

export const AgentDetailTab: React.FC<AgentDetailTabProps> = ({
  schedule,
  days,
  onPrint,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(schedule.agents[0]?.id || '');

  const currentAgent = schedule.agents.find(a => a.id === selectedAgentId) || schedule.agents[0];
  const stats = currentAgent ? calculateAgentStats(currentAgent, schedule, days) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Agent Selector */}
      <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-800 rounded-md">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Ficha Individual Mensual de Asistencia y Horas Extras
            </h2>
            <p className="text-xs text-slate-500">
              Detalle día por día con cálculo de horas y casillero de firma individual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="select-agent-detail" className="text-xs font-semibold text-slate-700">
            Seleccionar Agente:
          </label>
          <select
            id="select-agent-detail"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="bg-slate-50 text-slate-900 text-xs font-bold py-1.5 px-3 rounded-md border border-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            {schedule.agents.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} - {a.roleLabel} ({a.legajo})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Sheet for the Selected Agent */}
      {currentAgent && stats && (
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6 printable-area">
          {/* Header of the timesheet */}
          <div className="border-b-2 border-slate-800 pb-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano
                </div>
                <h1 className="text-lg font-black text-slate-900">
                  HOSPITAL CENTRAL DE EMERGENCIAS DE FORMOSA
                </h1>
                <div className="text-xs font-semibold text-emerald-800">
                  SERVICIO DE INFORMÁTICA Y ESTADÍSTICA HOSPITALARIA
                </div>
              </div>

              <div className="bg-slate-100 border border-slate-300 p-2.5 rounded-lg text-right">
                <div className="text-xs text-slate-500 font-medium">Período Mensual:</div>
                <div className="text-sm font-black text-slate-900 uppercase">
                  {MONTH_NAMES[schedule.month - 1]} {schedule.year}
                </div>
              </div>
            </div>

            {/* Agent Info Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Agente:</span>
                <strong className="text-slate-900 text-sm font-bold">{currentAgent.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Legajo / DNI:</span>
                <strong className="text-slate-900 font-mono">{currentAgent.legajo}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Función / Cargo:</span>
                <strong className="text-slate-900">{currentAgent.roleLabel}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Área / Categoría:</span>
                <span className="inline-block bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-[11px] mt-0.5">
                  {currentAgent.category}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-800 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-2 border border-slate-700 text-center w-12">Día</th>
                  <th className="p-2 border border-slate-700">Fecha / Nombre</th>
                  <th className="p-2 border border-slate-700 text-center bg-blue-900/80">Jornal (06-13 hs)</th>
                  <th className="p-2 border border-slate-700 text-center bg-emerald-900/80">Ext. Hábil (13-20 hs)</th>
                  <th className="p-2 border border-slate-700 text-center bg-purple-900/80">Inhábil Mañ. (06-13 hs)</th>
                  <th className="p-2 border border-slate-700 text-center bg-amber-900/80">Inhábil Tarde (13-20 hs)</th>
                  <th className="p-2 border border-slate-700 text-center">Total Horas</th>
                  <th className="p-2 border border-slate-700">Concepto / Modalidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {days.map((day) => {
                  const key = `${currentAgent.id}_${day.dateStr}`;
                  const assign = schedule.assignments[key];

                  const hasJornal = assign?.jornal;
                  const hasExtraHabil = assign?.extraHabil;
                  const hasInhabilM = assign?.extraInhabilManana;
                  const hasInhabilT = assign?.extraInhabilTarde;

                  let dayHours = 0;
                  if (hasJornal) dayHours += HOURS_PER_SHIFT;
                  if (hasExtraHabil) dayHours += HOURS_PER_SHIFT;
                  if (hasInhabilM) dayHours += HOURS_PER_SHIFT;
                  if (hasInhabilT) dayHours += HOURS_PER_SHIFT;

                  const concepts: string[] = [];
                  if (hasJornal) concepts.push('Jornal Ordinario');
                  if (hasExtraHabil) concepts.push('Extra Hábil 13-20hs');
                  if (hasInhabilM) concepts.push(`Inhábil Mañana (${assign?.extraInhabilMananaTipo?.toUpperCase() || 'ACTIVA'})`);
                  if (hasInhabilT) concepts.push(`Inhábil Tarde (${assign?.extraInhabilTardeTipo?.toUpperCase() || 'ACTIVA'})`);
                  if (concepts.length === 0) {
                    concepts.push(day.isWeekend || day.isHoliday ? 'Franco / Descanso' : 'Descanso');
                  }

                  const isSun = day.dayOfWeek === 0;
                  const isSat = day.dayOfWeek === 6;
                  const isHol = day.isHoliday;

                  let rowBg = 'bg-white';
                  if (isHol) rowBg = 'bg-rose-50/70';
                  else if (isSun || isSat) rowBg = 'bg-slate-50';

                  return (
                    <tr key={day.dateStr} className={`${rowBg} hover:bg-emerald-50/30 transition-colors`}>
                      <td className="p-1.5 border border-slate-300 text-center font-bold text-slate-900">
                        {day.dayNumber}
                      </td>
                      <td className="p-1.5 border border-slate-300 font-medium text-slate-800">
                        <span className="font-semibold">{day.dayNameShort}</span>
                        {day.isHoliday && <span className="ml-1 text-[10px] text-rose-700 font-bold">({day.holidayName})</span>}
                      </td>

                      {/* Jornal */}
                      <td className="p-1.5 border border-slate-300 text-center">
                        {hasJornal ? (
                          <span className="inline-block bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[11px]">
                            7 hs (06-13)
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Extra Hábil */}
                      <td className="p-1.5 border border-slate-300 text-center">
                        {hasExtraHabil ? (
                          <span className="inline-block bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[11px]">
                            7 hs (13-20)
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Inhábil Mañana */}
                      <td className="p-1.5 border border-slate-300 text-center">
                        {hasInhabilM ? (
                          <span className={`inline-block font-bold px-2 py-0.5 rounded text-[11px] ${
                            assign?.extraInhabilMananaTipo === 'activa'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            7 hs ({assign?.extraInhabilMananaTipo === 'activa' ? 'Activa' : 'Pasiva'})
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Inhábil Tarde */}
                      <td className="p-1.5 border border-slate-300 text-center">
                        {hasInhabilT ? (
                          <span className={`inline-block font-bold px-2 py-0.5 rounded text-[11px] ${
                            assign?.extraInhabilTardeTipo === 'activa'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            7 hs ({assign?.extraInhabilTardeTipo === 'activa' ? 'Activa' : 'Pasiva'})
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Total Horas */}
                      <td className="p-1.5 border border-slate-300 text-center font-black text-slate-900">
                        {dayHours > 0 ? (
                          <span className={`px-2 py-0.5 rounded ${dayHours >= 14 ? 'bg-indigo-100 text-indigo-900' : 'bg-slate-100'}`}>
                            {dayHours} hs
                          </span>
                        ) : (
                          <span className="text-slate-400">0 hs</span>
                        )}
                      </td>

                      {/* Conceptos */}
                      <td className="p-1.5 border border-slate-300 text-slate-600 text-[11px]">
                        {concepts.join(' • ')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Monthly Totals Footer */}
              <tfoot className="bg-slate-100 text-slate-900 font-bold border-t-2 border-slate-800 text-xs">
                <tr>
                  <td colSpan={2} className="p-2 border border-slate-300 text-right uppercase">
                    Totales Mensuales del Agente:
                  </td>
                  <td className="p-2 border border-slate-300 text-center text-blue-900">
                    <div>{stats.diasJornal} días</div>
                    <div className="font-extrabold">{stats.horasJornal} hs</div>
                  </td>
                  <td className="p-2 border border-slate-300 text-center text-emerald-900">
                    <div>{stats.diasExtraHabil} días</div>
                    <div className="font-extrabold">{stats.horasExtraHabil} hs</div>
                  </td>
                  <td className="p-2 border border-slate-300 text-center text-purple-900">
                    <div>{stats.turnosInhabilActiva} turnos Act.</div>
                    <div className="font-extrabold">{stats.horasInhabilActiva} hs</div>
                  </td>
                  <td className="p-2 border border-slate-300 text-center text-amber-900">
                    <div>{stats.turnosInhabilPasiva} turnos Pas.</div>
                    <div className="font-extrabold">{stats.horasInhabilPasiva} hs</div>
                  </td>
                  <td className="p-2 border border-slate-300 text-center font-black text-sm bg-emerald-100 text-emerald-950">
                    <div>Total Ext: {stats.totalHorasExtras} hs</div>
                    <div className="text-slate-900 text-base">MES: {stats.totalHorasMes} hs</div>
                  </td>
                  <td className="p-2 border border-slate-300 text-slate-600 text-[11px]">
                    Planilla validada conforme
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-300 text-center text-xs text-slate-700">
            <div className="flex flex-col items-center">
              <div className="w-48 border-b-2 border-slate-400 mb-2"></div>
              <strong className="text-slate-900">{currentAgent.name}</strong>
              <span className="text-[11px] text-slate-500">Firma del Agente</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-48 border-b-2 border-slate-400 mb-2"></div>
              <strong className="text-slate-900">Lic. Romero, Carlos Alberto</strong>
              <span className="text-[11px] text-slate-500">Jefe de Servicio Informática</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-48 border-b-2 border-slate-400 mb-2"></div>
              <strong className="text-slate-900">Dirección Médica / Ejecutiva</strong>
              <span className="text-[11px] text-slate-500">Hospital Central de Emergencias Formosa</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
