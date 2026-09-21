import React from 'react';
import { Agent, DayInfo, MonthSchedule, PrintSettings } from '../types';
import { 
  MONTH_NAMES, 
  calculateAgentStats, 
  getAgentWorkModality, 
  getAgentJornalShift, 
  getContraturnoShiftForAgent 
} from '../utils/calendar';

interface PrintSinglePageViewProps {
  schedule: MonthSchedule;
  days: DayInfo[];
  printSettings: PrintSettings;
  isPreviewMode: boolean;
}

export const PrintSinglePageView: React.FC<PrintSinglePageViewProps> = ({
  schedule,
  days,
  printSettings,
  isPreviewMode,
}) => {
  const monthName = MONTH_NAMES[schedule.month - 1];
  const isLegal = printSettings.paperSize === 'legal';
  const isArial12 = printSettings.fontSizeScale === 'arial12';
  const isNoTotals = printSettings.totalsMode === 'none';
  const isCompactTotals = printSettings.totalsMode === 'compact';

  // Calculate global totals
  const fullTotals = {
    diasJornal: schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, days).diasJornal, 0),
    horasJornal: schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, days).horasJornal, 0),
    diasExtraHabil: schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, days).diasExtraHabil, 0),
    horasExtraHabil: schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, days).horasExtraHabil, 0),
    horasInhabilActiva: schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, days).horasInhabilActiva, 0),
    horasInhabilPasiva: schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, days).horasInhabilPasiva, 0),
    totalHorasExtras: schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, days).totalHorasExtras, 0),
    totalHorasMes: schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, days).totalHorasMes, 0),
  };

  // Render shift code with Arial 12 legible styling
  const renderCellCode = (code: string, hours: string, isExtra = false) => {
    if (!code) return <span className="text-slate-300 font-light">-</span>;

    const textColor = isExtra ? 'text-purple-950 font-black' : 'text-slate-950 font-black';

    // In single page Letter, codes are shown cleanly without wrapping
    if (printSettings.badgeDetail === 'codes_only' || !isLegal) {
      return (
        <span 
          className={`inline-block font-black ${textColor} leading-none tracking-tight shift-code`}
          style={{ fontSize: isArial12 ? '11.5pt' : '10pt' }}
        >
          {code}
        </span>
      );
    }

    // On Legal (wider paper, 35.6 cm), hours can fit underneath
    return (
      <div className="flex flex-col items-center justify-center leading-none">
        <span 
          className={`font-black ${textColor} tracking-tight leading-tight shift-code`}
          style={{ fontSize: isArial12 ? '11.5pt' : '10pt' }}
        >
          {code}
        </span>
        <span className="text-[7.5px] font-bold text-slate-700 tracking-tighter mt-0.5 leading-none">
          {hours}
        </span>
      </div>
    );
  };

  return (
    <div 
      className={`print-single-page-sheet ${isPreviewMode ? 'block my-4 space-y-4' : 'hidden print:block'}`}
      style={{ fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif' }}
    >
      <div className="bg-white p-2 border border-slate-700 shadow-sm print:shadow-none print:border-0 print:p-0">
        
        {/* Cabecera Institucional Compacta (1 Hoja) */}
        {(printSettings.includeHeader ?? true) && (
          <div className="border-b-2 border-slate-900 pb-1 mb-1.5 flex justify-between items-end">
            <div>
              <div className="text-[8.5px] font-bold text-slate-600 uppercase tracking-wider leading-tight">
                {schedule.serviceConfig?.hospitalSubtitle || 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano'}
              </div>
              <h1 className="text-xs font-black uppercase text-slate-950 tracking-tight leading-tight">
                {schedule.serviceConfig?.hospitalName || 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"'}
              </h1>
              <div className="text-[10px] font-black text-emerald-800 leading-tight">
                {schedule.serviceConfig?.serviceName || 'Servicio de Guardia Médica y Emergencias'}
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block text-[11px] font-black bg-slate-950 text-white px-2 py-0.5 rounded">
                PLANILLA: {monthName.toUpperCase()} {schedule.year}
              </div>
              <div className="text-[8.5px] text-slate-600 font-bold mt-0.5">
                Hoja Única: {isLegal ? 'Oficio / Legal (35.6 cm)' : 'Carta / Letter (27.9 cm)'} • {schedule.agents.length} agentes
              </div>
            </div>
          </div>
        )}

        {/* Referencias Compactas en 1 sola línea */}
        {(printSettings.includeLegend ?? true) && (
          <div className="mb-1 py-0.5 px-1.5 bg-slate-100 border border-slate-300 rounded flex flex-wrap gap-x-2 text-[7px] font-bold text-slate-800">
            <span className="text-slate-500 uppercase font-black">Códigos:</span>
            <span><b>JM/JT/JN:</b> Jornal (06-13, 13-20, 20-07)</span>
            <span><b>EM/ET:</b> Extra Hábil (7h)</span>
            <span><b>24A/24P:</b> G. 24h Act/Pas</span>
            <span><b>12A/12P:</b> G. 12h Act/Pas</span>
            <span><b>IAM/IAT:</b> Inhábil Activa 7h</span>
            <span><b>IPM/IPT:</b> Inhábil Pasiva 7h</span>
          </div>
        )}

        {/* Tabla Mes Completo en 1 Sola Hoja */}
        <table 
          className="w-full text-left border-collapse border border-slate-700"
          style={{ 
            tableLayout: 'fixed',
            fontSize: isArial12 ? '11pt' : '9.5pt'
          }}
        >
          <thead className="bg-slate-900 text-white">
            {/* Fila 1: Días de semana y grupo totales */}
            <tr className="border-b border-slate-700 text-center">
              <th 
                rowSpan={2}
                className="p-1 font-bold text-[9.5px] uppercase tracking-wider bg-slate-950 border-r border-slate-600 text-left align-middle"
                style={{ width: isLegal ? '12%' : '10%' }}
              >
                Personal / Agente
              </th>

              {days.map((day) => {
                const isSun = day.dayOfWeek === 0;
                const isSat = day.dayOfWeek === 6;
                const isHol = day.isHoliday;
                let bgClass = 'bg-slate-800 text-slate-200';
                if (isHol) bgClass = 'bg-amber-900 text-white font-black';
                else if (isSun) bgClass = 'bg-red-900 text-white font-black';
                else if (isSat) bgClass = 'bg-slate-700 text-slate-100';

                return (
                  <th 
                    key={`wday-${day.day}`}
                    className={`p-0.5 border-r border-slate-600 text-[8px] font-bold ${bgClass}`}
                  >
                    {day.dayName.slice(0, 2).toUpperCase()}
                  </th>
                );
              })}

              {/* Encabezado Grupo Totales */}
              {!isNoTotals && (
                isCompactTotals ? (
                  <>
                    <th className="p-0.5 text-[8px] font-bold bg-blue-950 text-blue-100 border-r border-slate-700" style={{ width: '4.5%' }}>JORN</th>
                    <th className="p-0.5 text-[8px] font-bold bg-purple-950 text-purple-100 border-r border-slate-700" style={{ width: '4.5%' }}>EXT</th>
                    <th className="p-0.5 text-[8px] font-black bg-emerald-950 text-emerald-100 border-r border-slate-700" style={{ width: '5%' }}>TOTAL</th>
                  </>
                ) : (
                  <>
                    <th className="p-0.5 text-[7px] font-bold bg-blue-950 text-blue-100 border-r border-slate-700">D.J</th>
                    <th className="p-0.5 text-[7px] font-bold bg-blue-950 text-blue-100 border-r border-slate-700">H.J</th>
                    <th className="p-0.5 text-[7px] font-bold bg-emerald-950 text-emerald-100 border-r border-slate-700">D.EH</th>
                    <th className="p-0.5 text-[7px] font-bold bg-emerald-950 text-emerald-100 border-r border-slate-700">H.EH</th>
                    <th className="p-0.5 text-[7px] font-bold bg-purple-950 text-purple-100 border-r border-slate-700">H.IA</th>
                    <th className="p-0.5 text-[7px] font-bold bg-amber-950 text-amber-100 border-r border-slate-700">H.IP</th>
                    <th className="p-0.5 text-[7px] font-black bg-purple-950 text-purple-100 border-r border-slate-700">T.EXT</th>
                    <th className="p-0.5 text-[7px] font-black bg-emerald-950 text-emerald-100 border-r border-slate-700">T.MES</th>
                  </>
                )
              )}
            </tr>

            {/* Fila 2: Números de Día */}
            <tr className="border-b border-slate-700 text-center">
              {days.map((day) => {
                const isSun = day.dayOfWeek === 0;
                const isSat = day.dayOfWeek === 6;
                const isHol = day.isHoliday;
                let bgClass = 'bg-slate-900 text-white';
                if (isHol) bgClass = 'bg-amber-950 text-amber-200 font-black';
                else if (isSun) bgClass = 'bg-red-950 text-red-200 font-black';
                else if (isSat) bgClass = 'bg-slate-800 text-slate-200';

                return (
                  <th 
                    key={`num-${day.day}`}
                    className={`p-0.5 border-r border-slate-600 text-[9px] font-black ${bgClass}`}
                  >
                    {day.day}
                  </th>
                );
              })}

              {!isNoTotals && (
                isCompactTotals ? (
                  <>
                    <th className="p-0.5 text-[7.5px] font-bold bg-blue-900 text-white border-r border-slate-700">Hs</th>
                    <th className="p-0.5 text-[7.5px] font-bold bg-purple-900 text-white border-r border-slate-700">Hs</th>
                    <th className="p-0.5 text-[7.5px] font-black bg-emerald-900 text-white border-r border-slate-700">Hs</th>
                  </>
                ) : (
                  <>
                    <th className="p-0.5 text-[6.5px] font-bold bg-blue-900 text-white border-r border-slate-700">Cant</th>
                    <th className="p-0.5 text-[6.5px] font-bold bg-blue-900 text-white border-r border-slate-700">Hs</th>
                    <th className="p-0.5 text-[6.5px] font-bold bg-emerald-900 text-white border-r border-slate-700">Cant</th>
                    <th className="p-0.5 text-[6.5px] font-bold bg-emerald-900 text-white border-r border-slate-700">Hs</th>
                    <th className="p-0.5 text-[6.5px] font-bold bg-purple-900 text-white border-r border-slate-700">Hs</th>
                    <th className="p-0.5 text-[6.5px] font-bold bg-amber-900 text-white border-r border-slate-700">Hs</th>
                    <th className="p-0.5 text-[6.5px] font-black bg-purple-900 text-white border-r border-slate-700">Hs</th>
                    <th className="p-0.5 text-[6.5px] font-black bg-emerald-900 text-white border-r border-slate-700">Hs</th>
                  </>
                )
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-300 text-slate-900">
            {schedule.agents.map((agent: Agent, agentIdx: number) => {
              const stats = calculateAgentStats(agent, schedule, days);
              const modality = getAgentWorkModality(agent);
              const jTurno = getAgentJornalShift(agent);
              const cTurno = getContraturnoShiftForAgent(agent);

              return (
                <React.Fragment key={agent.id}>
                  {/* Fila 1: Turnos Jornal */}
                  <tr className={agentIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    {/* Celda de Personal con dos filas de altura */}
                    <td 
                      rowSpan={2}
                      className="p-1 border-r border-slate-400 bg-white font-bold align-middle border-b border-slate-400"
                    >
                      <div className="font-bold text-slate-950 text-[10px] leading-tight truncate">
                        {agent.name}
                      </div>
                      <div className="flex items-center gap-1 text-[8px] text-slate-600 mt-0.5">
                        <span>Leg: <b>{agent.legajo || 'S/L'}</b></span>
                        <span className="text-[7px] text-slate-400">•</span>
                        <span className="text-[7.5px] text-indigo-700 uppercase font-bold">
                          {modality === 'solo_guardias' ? 'Ext' : jTurno === 'rotativo' ? 'Rot' : jTurno === 'tarde' ? 'Tar' : jTurno === 'noche' ? 'Noc' : 'Mañ'}
                        </span>
                      </div>
                    </td>

                    {/* Días 1 a 31 (Jornal) */}
                    {days.map((day) => {
                      const key = `${agent.id}_${day.dateStr}`;
                      const assign = schedule.assignments[key];
                      const hasJornal = assign?.jornal;
                      const isWeekend = day.isWeekend;
                      const isHoliday = day.isHoliday;
                      const isWeekendBg = (isWeekend || isHoliday) ? 'bg-amber-50/40' : '';

                      const jPrefix = assign?.jornalTurno === 'tarde' 
                        ? 'JT' 
                        : assign?.jornalTurno === 'noche' 
                        ? 'JN' 
                        : (jTurno === 'tarde' ? 'JT' : jTurno === 'noche' ? 'JN' : 'JM');
                      const jHours = assign?.jornalTurno === 'tarde' 
                        ? '13-20' 
                        : assign?.jornalTurno === 'noche' 
                        ? '20-07' 
                        : (jTurno === 'tarde' ? '13-20' : jTurno === 'noche' ? '20-07' : '06-13');

                      return (
                        <td 
                          key={`j-${day.day}`}
                          className={`p-0 text-center align-middle border-r border-slate-300 ${isWeekendBg}`}
                        >
                          {modality === 'solo_guardias' ? (
                            <span className="text-[8.5px] font-bold text-teal-800">[Ext]</span>
                          ) : hasJornal ? (
                            renderCellCode(jPrefix, jHours)
                          ) : (
                            <span className="text-slate-300 text-[8px]">-</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Totales Fila Jornal */}
                    {!isNoTotals && (
                      isCompactTotals ? (
                        <>
                          <td className="p-0.5 text-center font-bold text-blue-900 bg-blue-50/40 border-r border-slate-300 text-[10px]">
                            {stats.horasJornal}
                          </td>
                          <td className="p-0.5 text-center font-bold text-purple-900 bg-purple-50/40 border-r border-slate-300 text-[10px]">
                            {stats.totalHorasExtras}
                          </td>
                          <td rowSpan={2} className="p-0.5 text-center font-black text-emerald-950 bg-emerald-100/60 border-r border-slate-400 text-[11px] align-middle border-b">
                            {stats.totalHorasMes}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-0.5 text-center font-semibold text-blue-900 bg-blue-50/30 border-r border-slate-300 text-[9px]">
                            {stats.diasJornal}
                          </td>
                          <td className="p-0.5 text-center font-bold text-blue-950 bg-blue-50/50 border-r border-slate-300 text-[9px]">
                            {stats.horasJornal}
                          </td>
                          <td className="p-0.5 text-center text-emerald-900 bg-emerald-50/30 border-r border-slate-300 text-[9px]">
                            {stats.diasExtraHabil}
                          </td>
                          <td className="p-0.5 text-center font-bold text-emerald-950 bg-emerald-50/50 border-r border-slate-300 text-[9px]">
                            {stats.horasExtraHabil}
                          </td>
                          <td className="p-0.5 text-center font-semibold text-purple-950 bg-purple-50/40 border-r border-slate-300 text-[9px]">
                            {stats.horasInhabilActiva}
                          </td>
                          <td className="p-0.5 text-center font-semibold text-amber-950 bg-amber-50/40 border-r border-slate-300 text-[9px]">
                            {stats.horasInhabilPasiva}
                          </td>
                          <td className="p-0.5 text-center font-black text-purple-950 bg-purple-100/60 border-r border-slate-300 text-[9.5px]">
                            {stats.totalHorasExtras}
                          </td>
                          <td rowSpan={2} className="p-0.5 text-center font-black text-emerald-950 bg-emerald-100/70 border-r border-slate-400 text-[11px] align-middle border-b">
                            {stats.totalHorasMes}
                          </td>
                        </>
                      )
                    )}
                  </tr>

                  {/* Fila 2: Turnos Extras / Guardias */}
                  <tr className={`border-b border-slate-400 ${agentIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}>
                    {/* Días 1 a 31 (Extras) */}
                    {days.map((day) => {
                      const key = `${agent.id}_${day.dateStr}`;
                      const assign = schedule.assignments[key];
                      const hasExtraHabil = assign?.extraHabil;
                      const hasInhabil24h = assign?.extraInhabil24h;
                      const hasInhabil12h = assign?.extraInhabil12h;
                      const hasInhabilM = assign?.extraInhabilManana;
                      const hasInhabilT = assign?.extraInhabilTarde;

                      const isWeekend = day.isWeekend;
                      const isHoliday = day.isHoliday;
                      const isWeekendBg = (isWeekend || isHoliday) ? 'bg-amber-50/40' : '';

                      const ePrefix = assign?.extraHabilTurno === 'manana'
                        ? 'EM'
                        : assign?.extraHabilTurno === 'noche'
                        ? 'EN'
                        : (cTurno === 'manana' ? 'EM' : 'ET');
                      const eHours = assign?.extraHabilTurno === 'manana'
                        ? '6-13'
                        : assign?.extraHabilTurno === 'noche'
                        ? '20-07'
                        : (cTurno === 'manana' ? '6-13' : '13-20');

                      let shiftNode: React.ReactNode = null;
                      if (hasExtraHabil) {
                        shiftNode = renderCellCode(ePrefix, eHours, true);
                      } else if (hasInhabil24h) {
                        shiftNode = renderCellCode(assign?.extraInhabil24hTipo === 'activa' ? '24A' : '24P', '24h', true);
                      } else if (hasInhabil12h) {
                        shiftNode = renderCellCode(assign?.extraInhabil12hTipo === 'activa' ? '12A' : '12P', '12h', true);
                      } else if (hasInhabilM) {
                        shiftNode = renderCellCode(assign?.extraInhabilMananaTipo === 'activa' ? 'IAM' : 'IPM', '7h', true);
                      } else if (hasInhabilT) {
                        shiftNode = renderCellCode(assign?.extraInhabilTardeTipo === 'activa' ? 'IAT' : 'IPT', '7h', true);
                      }

                      return (
                        <td 
                          key={`ext-${day.day}`}
                          className={`p-0 text-center align-middle border-r border-slate-300 ${isWeekendBg}`}
                        >
                          {shiftNode || <span className="text-slate-300 text-[8px]">-</span>}
                        </td>
                      );
                    })}

                    {/* Celdas de totales correspondientes a Fila 2 */}
                    {!isNoTotals && (
                      isCompactTotals ? (
                        <>
                          <td className="p-0 text-center text-[7.5px] text-slate-500 bg-blue-50/20 border-r border-slate-300">
                            jornal
                          </td>
                          <td className="p-0 text-center text-[7.5px] text-purple-700 font-bold bg-purple-50/20 border-r border-slate-300">
                            extras
                          </td>
                        </>
                      ) : (
                        <>
                          <td colSpan={7} className="p-0 text-right pr-1 text-[7px] text-slate-500 bg-slate-50 border-r border-slate-300">
                            Totales de Horas y Guardias
                          </td>
                        </>
                      )
                    )}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>

          {/* Pie de Tabla con Totales del Servicio */}
          <tfoot className="bg-slate-900 text-white font-black text-center border-t-2 border-slate-900">
            <tr>
              <td className="p-1 text-left text-[9px] uppercase tracking-wider bg-slate-950 border-r border-slate-700">
                {isNoTotals ? 'PERSONAL EN TURNO' : 'TOTALES SERVICIO'}
              </td>

              {/* Totales por día */}
              {days.map((day) => {
                let dailyCount = 0;
                schedule.agents.forEach(a => {
                  const k = `${a.id}_${day.dateStr}`;
                  const assign = schedule.assignments[k];
                  if (assign?.jornal) dailyCount++;
                  if (assign?.extraHabil || assign?.extraInhabil24h || assign?.extraInhabil12h || assign?.extraInhabilManana || assign?.extraInhabilTarde) dailyCount++;
                });

                return (
                  <td 
                    key={`foot-${day.day}`}
                    className="p-0.5 border-r border-slate-700 text-[9px] font-black text-emerald-300 bg-slate-800"
                  >
                    {dailyCount || '-'}
                  </td>
                );
              })}

              {/* Totales finales del mes */}
              {!isNoTotals && (
                isCompactTotals ? (
                  <>
                    <td className="p-0.5 text-blue-200 bg-blue-950 border-r border-slate-700 text-[9.5px]">
                      {fullTotals.horasJornal}
                    </td>
                    <td className="p-0.5 text-purple-200 bg-purple-950 border-r border-slate-700 text-[9.5px]">
                      {fullTotals.totalHorasExtras}
                    </td>
                    <td className="p-0.5 text-emerald-300 bg-emerald-950 text-[11px] font-black">
                      {fullTotals.totalHorasMes}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-0.5 text-[8px] bg-blue-950 text-blue-200 border-r border-slate-700">{fullTotals.diasJornal}</td>
                    <td className="p-0.5 text-[8px] bg-blue-950 text-blue-200 border-r border-slate-700">{fullTotals.horasJornal}</td>
                    <td className="p-0.5 text-[8px] bg-emerald-950 text-emerald-200 border-r border-slate-700">{fullTotals.diasExtraHabil}</td>
                    <td className="p-0.5 text-[8px] bg-emerald-950 text-emerald-200 border-r border-slate-700">{fullTotals.horasExtraHabil}</td>
                    <td className="p-0.5 text-[8px] bg-purple-950 text-purple-200 border-r border-slate-700">{fullTotals.horasInhabilActiva}</td>
                    <td className="p-0.5 text-[8px] bg-amber-950 text-amber-200 border-r border-slate-700">{fullTotals.horasInhabilPasiva}</td>
                    <td className="p-0.5 text-[8.5px] bg-purple-950 text-purple-200 border-r border-slate-700">{fullTotals.totalHorasExtras}</td>
                    <td className="p-0.5 text-[10px] bg-emerald-950 text-emerald-300 font-black">{fullTotals.totalHorasMes}</td>
                  </>
                )
              )}
            </tr>
          </tfoot>
        </table>

        {/* Firmas Institucionales al pie de la Hoja Única */}
        {(printSettings.includeSignatures ?? true) && (
          <div className="mt-3 pt-2 border-t border-slate-500 flex justify-between items-end text-center text-[8.5px] print:break-inside-avoid">
            <div className="w-[30%] border-t border-slate-900 pt-1">
              <div className="font-bold text-slate-900">{schedule.serviceConfig?.jefeName || 'Cantero, Miguel Angel'}</div>
              <div className="text-[7.5px] text-slate-600">Jefe de Servicio</div>
            </div>
            <div className="w-[30%] border-t border-slate-900 pt-1">
              <div className="font-bold text-slate-900">Dirección Asociada / Médica</div>
              <div className="text-[7.5px] text-slate-600">Firma y Sello</div>
            </div>
            <div className="w-[30%] border-t border-slate-900 pt-1">
              <div className="font-bold text-slate-900">Departamento de Personal / RRHH</div>
              <div className="text-[7.5px] text-slate-600">Ministerio de Desarrollo Humano</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
