import React from 'react';
import { MonthSchedule, DayInfo, Agent, InhabileMode } from '../types';
import { 
  HOURS_PER_SHIFT, 
  MONTH_NAMES, 
  isAgentInhabileActiva, 
  getAgentInhabileMode 
} from '../utils/calendar';
import { 
  Clock, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Check, 
  UserCheck, 
  CalendarDays,
  Sparkles,
  Award,
  AlertCircle
} from 'lucide-react';

interface InhabileShiftsTabProps {
  schedule: MonthSchedule;
  days: DayInfo[];
  onUpdateInhabilShift: (
    dateStr: string,
    shift: 'manana' | 'tarde',
    agentId: string | null,
    mode: InhabileMode
  ) => void;
  onSetAllInhabileMode: (mode: InhabileMode) => void;
  onAutoAssignInhabiles: () => void;
  onApplyOfficialPolicy?: () => void;
}

export const InhabileShiftsTab: React.FC<InhabileShiftsTabProps> = ({
  schedule,
  days,
  onUpdateInhabilShift,
  onSetAllInhabileMode,
  onAutoAssignInhabiles,
  onApplyOfficialPolicy,
}) => {
  const weekendAndHolidays = days.filter(d => d.isWeekend || d.isHoliday);

  // Totales de horas inhábiles del mes
  let totalActivas = 0;
  let totalPasivas = 0;

  const agentInhabilStats: Record<string, { activas: number; pasivas: number }> = {};
  schedule.agents.forEach(a => {
    agentInhabilStats[a.id] = { activas: 0, pasivas: 0 };
  });

  weekendAndHolidays.forEach(day => {
    schedule.agents.forEach(agent => {
      const key = `${agent.id}_${day.dateStr}`;
      const assign = schedule.assignments[key];
      if (!assign) return;

      if (assign.extraInhabilManana) {
        if (assign.extraInhabilMananaTipo === 'activa') {
          totalActivas += HOURS_PER_SHIFT;
          agentInhabilStats[agent.id].activas += HOURS_PER_SHIFT;
        } else {
          totalPasivas += HOURS_PER_SHIFT;
          agentInhabilStats[agent.id].pasivas += HOURS_PER_SHIFT;
        }
      }

      if (assign.extraInhabilTarde) {
        if (assign.extraInhabilTardeTipo === 'activa') {
          totalActivas += HOURS_PER_SHIFT;
          agentInhabilStats[agent.id].activas += HOURS_PER_SHIFT;
        } else {
          totalPasivas += HOURS_PER_SHIFT;
          agentInhabilStats[agent.id].pasivas += HOURS_PER_SHIFT;
        }
      }
    });
  });

  const isInformatica = schedule.serviceId === 'serv_informatica' || 
    (schedule.serviceConfig?.serviceName || '').toLowerCase().includes('informát') || 
    (schedule.serviceConfig?.serviceName || '').toLowerCase().includes('informat');

  const [isPolicyExpanded, setIsPolicyExpanded] = React.useState(isInformatica);

  return (
    <div className="flex flex-col gap-4">
      {/* Policy Notice Box - Clean, collapsible & service-aware */}
      <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-900/80 text-purple-300 rounded-lg shrink-0">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-white">
                  {isInformatica 
                    ? 'Régimen Oficial de Guardias Inhábiles y Rotación de Duplas'
                    : `Guardias Inhábiles y Fines de Semana (${schedule.serviceConfig?.serviceName || 'Servicio'})`
                  }
                </h3>
                <span className="bg-emerald-900 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-700/60">
                  {weekendAndHolidays.length} días inhábiles en {MONTH_NAMES[schedule.month - 1]}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribución de guardias Activas (presenciales) y Pasivas (a disponibilidad) los fines de semana y feriados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isInformatica && onApplyOfficialPolicy && (
              <button
                id="btn-apply-official-policy"
                onClick={onApplyOfficialPolicy}
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                title="Ajusta automáticamente todas las asignaciones del mes con las duplas y modalidades oficiales"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Aplicar Regla Oficial</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsPolicyExpanded(!isPolicyExpanded)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isPolicyExpanded ? 'Ocultar pautas' : 'Ver pautas'}
            </button>
          </div>
        </div>

        {isPolicyExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1.5 animate-in fade-in duration-150">
            {isInformatica ? (
              <>
                <p>• <strong>Único habilitado para Inhábiles ACTIVAS:</strong> <strong className="text-amber-300 underline underline-offset-2">Cantero, Miguel Angel</strong> (el resto cumple Inhábiles PASIVAS a disponibilidad).</p>
                <p>• <strong>Dupla 1 (Fines de semana de por medio):</strong> <strong className="text-white">Cantero, Miguel Angel</strong> (Activa) y <strong className="text-white">Escobar, Eduardo Martin</strong> (Pasiva) hacen guardias juntos.</p>
                <p>• <strong>Dupla 2 (Fines de semana alternados):</strong> <strong className="text-white">Galeano, Cristian Alejandro</strong> (Pasiva) y <strong className="text-white">Amarilla, Nestor Ivan</strong> (Pasiva) hacen guardias los otros fines de semana.</p>
                <p>• <strong>Régimen Amarilla, Nestor Ivan:</strong> Realiza <strong className="text-amber-300">ÚNICAMENTE Inhábiles PASIVAS</strong> (no realiza horas extras hábiles de 13 a 20 hs en días hábiles; las horas extras hábiles de SIGHO son cubiertas por Galeano).</p>
              </>
            ) : (
              <>
                <p>• <strong>Guardias Activas:</strong> Cumplen presencia física efectiva en la unidad asistencial.</p>
                <p>• <strong>Guardias Pasivas:</strong> Personal disponible ante llamado o contingencia del servicio.</p>
                <p>• <strong>Duraciones:</strong> Soporta guardias completas de 24 horas, módulos de 12 horas o fraccionadas mañana (06-13) y tarde (13-20).</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Overview & Mode Switcher Bar */}
      <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 text-amber-800 rounded-md">
                <Clock className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Control de Horas Extras Inhábiles: Activas vs Pasivas
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              En días inhábiles (sábados, domingos y feriados) las guardias se realizan en dos intervalos de 7 horas: 
              <strong> 06:00 a 13:00 hs (Mañana)</strong> y <strong>13:00 a 20:00 hs (Tarde)</strong>.
              Puedes alternar individualmente o de forma masiva entre modalidad 
              <strong className="text-purple-700"> Activa (Presencial)</strong> y 
              <strong className="text-amber-700"> Pasiva (A disponibilidad)</strong>.
            </p>
          </div>

          {/* Quick Bulk Selector */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 shrink-0">
            <span className="text-xs font-semibold text-slate-700 mr-1">
              Acción Rápida Global:
            </span>
            <button
              id="btn-auto-inhabiles"
              onClick={onAutoAssignInhabiles}
              className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded shadow-xs transition-colors cursor-pointer"
              title="Asigna turnos de fin de semana rotando equitativamente entre los 4 agentes respetando la regla oficial"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Rotar Agentes (Regla Oficial)
            </button>
            <button
              id="btn-all-active"
              onClick={() => onSetAllInhabileMode('activa')}
              className="flex items-center gap-1.5 text-xs font-semibold bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded shadow-xs transition-colors cursor-pointer"
            >
              <Sun className="w-3.5 h-3.5" />
              Todas ACTIVAS
            </button>
            <button
              id="btn-all-passive"
              onClick={() => onSetAllInhabileMode('pasiva')}
              className="flex items-center gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded shadow-xs transition-colors cursor-pointer"
            >
              <Moon className="w-3.5 h-3.5" />
              Todas PASIVAS
            </button>
          </div>
        </div>

        {/* Counter KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200 text-slate-800">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-purple-900 uppercase tracking-wide">
                Total Inhábiles Activas
              </div>
              <div className="text-xl font-bold text-purple-950 mt-0.5">
                {totalActivas} hs
              </div>
              <div className="text-[11px] text-purple-700 mt-0.5">
                {totalActivas / HOURS_PER_SHIFT} turnos cumplidos (presenciales de Cantero)
              </div>
            </div>
            <div className="p-2.5 bg-purple-200/70 text-purple-800 rounded-full">
              <Sun className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                Total Inhábiles Pasivas
              </div>
              <div className="text-xl font-bold text-amber-950 mt-0.5">
                {totalPasivas} hs
              </div>
              <div className="text-[11px] text-amber-700 mt-0.5">
                {totalPasivas / HOURS_PER_SHIFT} turnos de disponibilidad (pasivas del resto)
              </div>
            </div>
            <div className="p-2.5 bg-amber-200/70 text-amber-800 rounded-full">
              <Moon className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-lg p-3 flex items-center justify-between border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Total Horas Inhábiles
              </div>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                {totalActivas + totalPasivas} hs
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {weekendAndHolidays.length} días inhábiles en {MONTH_NAMES[schedule.month - 1]}
              </div>
            </div>
            <div className="p-2.5 bg-slate-800 text-emerald-400 rounded-full">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Detail Inhábiles Table */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CalendarDays className="w-4 h-4 text-amber-400" />
            <span>Cronograma de Fines de Semana y Feriados ({weekendAndHolidays.length} días)</span>
          </div>
          <span className="text-xs text-slate-300">
            {MONTH_NAMES[schedule.month - 1]} {schedule.year}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] border-b border-slate-300">
              <tr>
                <th className="p-3 font-bold">Fecha / Día</th>
                <th className="p-3 font-bold">Tipo de Inhábil</th>
                <th className="p-3 font-bold bg-purple-50/70 border-l border-r border-purple-200">
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-purple-700" />
                    <span>Turno Mañana (06:00 a 13:00 hs - 7hs)</span>
                  </div>
                </th>
                <th className="p-3 font-bold bg-amber-50/70 border-r border-amber-200">
                  <div className="flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-amber-700" />
                    <span>Turno Tarde (13:00 a 20:00 hs - 7hs)</span>
                  </div>
                </th>
                <th className="p-3 font-bold text-center">Total Día</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {weekendAndHolidays.map((day, idx) => {
                // Encontrar los agentes asignados a mañana y tarde
                let morningAgentId: string | null = null;
                let morningMode: InhabileMode = 'pasiva';
                let afternoonAgentId: string | null = null;
                let afternoonMode: InhabileMode = 'pasiva';

                for (const agent of schedule.agents) {
                  const key = `${agent.id}_${day.dateStr}`;
                  const assign = schedule.assignments[key];
                  if (assign?.extraInhabilManana) {
                    morningAgentId = agent.id;
                    morningMode = assign.extraInhabilMananaTipo || getAgentInhabileMode(agent);
                  }
                  if (assign?.extraInhabilTarde) {
                    afternoonAgentId = agent.id;
                    afternoonMode = assign.extraInhabilTardeTipo || getAgentInhabileMode(agent);
                  }
                }

                const morningAgentObj = schedule.agents.find(a => a.id === morningAgentId);
                const afternoonAgentObj = schedule.agents.find(a => a.id === afternoonAgentId);

                const isMorningActive = morningMode === 'activa';
                const isAfternoonActive = afternoonMode === 'activa';

                const dayHours = (morningAgentId ? HOURS_PER_SHIFT : 0) + (afternoonAgentId ? HOURS_PER_SHIFT : 0);

                return (
                  <tr 
                    key={day.dateStr}
                    className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  >
                    {/* Date and Day */}
                    <td className="p-3 font-medium text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{day.dayNameLong} {day.dayNumber}</span>
                        <span className="text-[11px] text-slate-500 font-mono">({day.dateStr})</span>
                      </div>
                    </td>

                    {/* Type of Day */}
                    <td className="p-3">
                      {day.isHoliday ? (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-300 font-semibold px-2 py-0.5 rounded text-[11px]">
                          🔴 FERIADO: {day.holidayName || 'Feriado'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-300 font-medium px-2 py-0.5 rounded text-[11px]">
                          {day.dayNameLong} (Fin de Semana)
                        </span>
                      )}
                    </td>

                    {/* Turno Mañana (06-13 hs) */}
                    <td className="p-3 bg-purple-50/30 border-l border-r border-purple-100">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        {/* Agent Selector */}
                        <select
                          id={`select-morning-agent-${day.dateStr}`}
                          value={morningAgentId || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const chosenAgent = schedule.agents.find(a => a.id === val);
                            const autoMode = chosenAgent ? getAgentInhabileMode(chosenAgent) : 'pasiva';
                            onUpdateInhabilShift(day.dateStr, 'manana', val ? val : null, autoMode);
                          }}
                          className="bg-white text-slate-800 text-xs font-semibold py-1.5 px-2.5 rounded border border-slate-300 focus:outline-none focus:border-purple-500 flex-1 cursor-pointer"
                        >
                          <option value="">-- Sin agente asignado --</option>
                          {schedule.agents.map(a => {
                            const isCantero = isAgentInhabileActiva(a);
                            return (
                              <option key={a.id} value={a.id}>
                                {a.name} ({isCantero ? '🟣 Habilitado Activa' : '🟠 Habilitado Pasiva'})
                              </option>
                            );
                          })}
                        </select>

                        {/* Mode Selector (Activa vs Pasiva) */}
                        {morningAgentId && (
                          <div className="flex items-center rounded-md border border-slate-300 overflow-hidden shrink-0 shadow-2xs">
                            <button
                              id={`btn-morning-activa-${day.dateStr}`}
                              type="button"
                              onClick={() => onUpdateInhabilShift(day.dateStr, 'manana', morningAgentId, 'activa')}
                              className={`px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                                isMorningActive
                                  ? 'bg-purple-700 text-white'
                                  : 'bg-white text-slate-700 hover:bg-slate-100'
                              }`}
                              title={isAgentInhabileActiva(morningAgentObj) ? 'Habilitado oficialmente para Inhábiles Activas' : 'Inhábil Activa'}
                            >
                              Activa
                            </button>
                            <button
                              id={`btn-morning-pasiva-${day.dateStr}`}
                              type="button"
                              onClick={() => onUpdateInhabilShift(day.dateStr, 'manana', morningAgentId, 'pasiva')}
                              className={`px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                                !isMorningActive
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-white text-slate-700 hover:bg-slate-100'
                              }`}
                              title={!isAgentInhabileActiva(morningAgentObj) ? 'Habilitado oficialmente para Inhábiles Pasivas' : 'Inhábil Pasiva'}
                            >
                              Pasiva
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Turno Tarde (13-20 hs) */}
                    <td className="p-3 bg-amber-50/30 border-r border-amber-100">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        {/* Agent Selector */}
                        <select
                          id={`select-afternoon-agent-${day.dateStr}`}
                          value={afternoonAgentId || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const chosenAgent = schedule.agents.find(a => a.id === val);
                            const autoMode = chosenAgent ? getAgentInhabileMode(chosenAgent) : 'pasiva';
                            onUpdateInhabilShift(day.dateStr, 'tarde', val ? val : null, autoMode);
                          }}
                          className="bg-white text-slate-800 text-xs font-semibold py-1.5 px-2.5 rounded border border-slate-300 focus:outline-none focus:border-amber-500 flex-1 cursor-pointer"
                        >
                          <option value="">-- Sin agente asignado --</option>
                          {schedule.agents.map(a => {
                            const isCantero = isAgentInhabileActiva(a);
                            return (
                              <option key={a.id} value={a.id}>
                                {a.name} ({isCantero ? '🟣 Habilitado Activa' : '🟠 Habilitado Pasiva'})
                              </option>
                            );
                          })}
                        </select>

                        {/* Mode Selector (Activa vs Pasiva) */}
                        {afternoonAgentId && (
                          <div className="flex items-center rounded-md border border-slate-300 overflow-hidden shrink-0 shadow-2xs">
                            <button
                              id={`btn-afternoon-activa-${day.dateStr}`}
                              type="button"
                              onClick={() => onUpdateInhabilShift(day.dateStr, 'tarde', afternoonAgentId, 'activa')}
                              className={`px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                                isAfternoonActive
                                  ? 'bg-purple-700 text-white'
                                  : 'bg-white text-slate-700 hover:bg-slate-100'
                              }`}
                              title={isAgentInhabileActiva(afternoonAgentObj) ? 'Habilitado oficialmente para Inhábiles Activas' : 'Inhábil Activa'}
                            >
                              Activa
                            </button>
                            <button
                              id={`btn-afternoon-pasiva-${day.dateStr}`}
                              type="button"
                              onClick={() => onUpdateInhabilShift(day.dateStr, 'tarde', afternoonAgentId, 'pasiva')}
                              className={`px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                                !isAfternoonActive
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-white text-slate-700 hover:bg-slate-100'
                              }`}
                              title={!isAgentInhabileActiva(afternoonAgentObj) ? 'Habilitado oficialmente para Inhábiles Pasivas' : 'Inhábil Pasiva'}
                            >
                              Pasiva
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Total Day Hours */}
                    <td className="p-3 text-center font-bold text-slate-900">
                      <span className={`inline-block px-2.5 py-1 rounded text-xs ${
                        dayHours === 14 ? 'bg-emerald-100 text-emerald-900 font-extrabold' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {dayHours} hs
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution by Agent for Inhábiles */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          Distribución de Horas Inhábiles por Agente en el Mes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {schedule.agents.map(agent => {
            const stats = agentInhabilStats[agent.id] || { activas: 0, pasivas: 0 };
            const total = stats.activas + stats.pasivas;
            const isCantero = isAgentInhabileActiva(agent);

            return (
              <div key={agent.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {agent.name}
                    </span>
                    {isCantero ? (
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0">
                        Activas
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                        Pasivas
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {agent.roleLabel} • {agent.legajo}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-purple-700 font-semibold">
                      Activas: <strong>{stats.activas}h</strong>
                    </span>
                    <span className="text-amber-700 font-semibold">
                      Pasivas: <strong>{stats.pasivas}h</strong>
                    </span>
                  </div>

                  <div className="mt-1.5 text-right font-black text-slate-900 text-xs">
                    Total Inhábil: <span className="text-emerald-700">{total} hs</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
