import React from 'react';
import { Agent, DayInfo, MonthSchedule, PrintSettings } from '../types';
import { 
  MONTH_NAMES, 
  calculateAgentStats, 
  getAgentWorkModality, 
  getAgentJornalShift, 
  getContraturnoShiftForAgent 
} from '../utils/calendar';

interface PrintSplitViewProps {
  schedule: MonthSchedule;
  days: DayInfo[];
  printSettings: PrintSettings;
  isPreviewMode: boolean;
}

export const PrintSplitView: React.FC<PrintSplitViewProps> = ({
  schedule,
  days,
  printSettings,
  isPreviewMode,
}) => {
  const monthName = MONTH_NAMES[schedule.month - 1];
  const daysQ1 = days.slice(0, 15);
  const daysQ2 = days.slice(15);
  const isArial12 = printSettings.fontSizeScale === 'arial12';

  const shouldRenderQ1 = printSettings.pageSplit === 'two_pages' || printSettings.pageSplit === 'quincena_1';
  const shouldRenderQ2 = printSettings.pageSplit === 'two_pages' || printSettings.pageSplit === 'quincena_2';

  // Calculate totals for Q1
  const q1Totals = {
    diasJornal: schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, daysQ1).diasJornal, 0),
    horasJornal: schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, daysQ1).horasJornal, 0),
    horasExtras: schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, daysQ1).totalHorasExtras, 0),
    totalHoras: schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, daysQ1).totalHorasMes, 0),
  };

  // Calculate full month totals for Q2 footer
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

  // Renders a shift badge with large, high-legibility typography (Arial 12 standard)
  const renderShiftContent = (
    code: string, 
    hours: string, 
    textColor: string, 
    bgColor: string, 
    borderColor: string
  ) => {
    if (printSettings.badgeDetail === 'codes_only') {
      return (
        <span className={`inline-block font-black ${isArial12 ? 'text-[12px]' : 'text-[12px] sm:text-[13px]'} ${textColor} leading-none tracking-tight shift-code`}>
          {code}
        </span>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center leading-none py-0.5">
        <span className={`font-black ${isArial12 ? 'text-[12px]' : 'text-[11px]'} ${textColor} tracking-tight leading-tight shift-code`}>
          {code}
        </span>
        <span className="text-[9px] font-bold text-slate-700 tracking-tighter mt-0.5 leading-none">
          {hours}
        </span>
      </div>
    );
  };

  // Institutional Signatures Footer
  const renderSignatures = () => {
    if (!printSettings.includeSignatures) return null;
    return (
      <div className="flex justify-between items-end mt-4 pt-3 border-t-2 border-slate-700 text-center text-[9px] print-break-inside-avoid">
        <div className="w-[31%] border-t border-slate-800 pt-1">
          <div className="font-bold text-slate-900 text-[10px]">{schedule.serviceConfig?.jefeName || 'Cantero, Miguel Angel'}</div>
          <div className="text-slate-600 text-[8.5px]">{schedule.serviceConfig?.jefeCargo || 'Jefe del Servicio de Informática'}</div>
        </div>
        <div className="w-[31%] border-t border-slate-800 pt-1">
          <div className="font-bold text-slate-900 text-[10px]">Dirección Médica / Ejecutiva</div>
          <div className="text-slate-600 text-[8.5px]">{schedule.serviceConfig?.hospitalName || 'Hospital Central de Emergencias'}</div>
        </div>
        <div className="w-[31%] border-t border-slate-800 pt-1">
          <div className="font-bold text-slate-900 text-[10px]">Recepción Recursos Humanos</div>
          <div className="text-slate-600 text-[8.5px]">Ministerio de Desarrollo Humano</div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`print-split-container ${isPreviewMode ? 'block my-4 space-y-8' : 'hidden print:block'}`}
      style={{ fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif' }}
    >
      {/* ------------------------------------------------------------- */}
      {/* HOJA 1: 1ª QUINCENA (DÍAS 1 AL 15) - ¡LETRA GRANDE Y ESPACIOSA! */}
      {/* ------------------------------------------------------------- */}
      {shouldRenderQ1 && (
        <div className="print-page-1 bg-white p-2 sm:p-4 rounded-lg shadow-sm print:p-0 print:shadow-none print:m-0">
          {/* Header Hoja 1 */}
          {printSettings.includeHeader && (
            <div className="p-2.5 border-b-2 border-slate-900 mb-2 flex justify-between items-start">
              <div>
                <div className="text-[9.5px] font-bold text-slate-600 uppercase tracking-wider">
                  {schedule.serviceConfig?.hospitalSubtitle || 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano'}
                </div>
                <h1 className="text-sm sm:text-base font-black uppercase text-slate-950 tracking-wide mt-0.5">
                  {schedule.serviceConfig?.hospitalName || 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"'}
                </h1>
                <div className="text-xs sm:text-sm font-black text-emerald-800 mt-0.5">
                  {schedule.serviceConfig?.serviceName || 'Servicio de Guardia Médica e Informática'}
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block text-xs font-black bg-slate-900 text-white px-3 py-1 rounded shadow-2xs">
                  1ª QUINCENA (DÍAS 1 AL 15) • {monthName.toUpperCase()} {schedule.year}
                </div>
                <div className="text-[9px] text-emerald-800 font-bold mt-1">
                  ✓ Formato Ampliado: Máxima Legibilidad
                </div>
              </div>
            </div>
          )}

          {/* Tabla Hoja 1: 15 Días + Subtotales Quincena */}
          <table className={`w-full ${isArial12 ? 'text-[12px]' : 'text-xs'} text-left border-collapse border border-slate-700`}>
            <thead className="bg-slate-900 text-white">
              {/* Fila 1 Cabecera */}
              <tr className="border-b border-slate-600">
                <th 
                  rowSpan={2}
                  className="p-2 font-bold text-xs uppercase bg-slate-900 border-r border-slate-700 w-[140px] text-left"
                >
                  Personal del Servicio
                </th>
                {daysQ1.map((d) => {
                  let bg = 'bg-slate-800 text-slate-200';
                  if (d.isHoliday) bg = 'bg-rose-900 text-rose-100 font-bold';
                  else if (d.isWeekend) bg = 'bg-amber-900 text-amber-100 font-bold';
                  return (
                    <th
                      key={`q1-th-${d.dateStr}`}
                      className={`p-1 text-center border-r border-slate-700 ${bg}`}
                    >
                      <div className="text-[9.5px] uppercase">{d.dayNameShort.slice(0, 2)}</div>
                      <div className="text-xs sm:text-sm font-black mt-0.5">{d.dayNumber}</div>
                    </th>
                  );
                })}
                {/* Subtotales Quincena 1 */}
                <th colSpan={3} className="p-1 text-center font-bold bg-blue-950 text-blue-100 border-r border-slate-700 text-[10px]">
                  Subtotales 1ª Quincena
                </th>
                <th className="p-1 text-center font-black bg-slate-950 text-white text-[10px]">
                  Total Q1
                </th>
              </tr>

              {/* Fila 2 Subcabecera Totales */}
              <tr className="border-b border-slate-600 text-[9.5px] text-slate-300">
                <th className="p-1 text-center bg-blue-900 font-semibold border-r border-slate-700">Días J</th>
                <th className="p-1 text-center bg-blue-950 font-semibold border-r border-slate-700">Hs J</th>
                <th className="p-1 text-center bg-emerald-950 font-semibold border-r border-slate-700">Hs Ext</th>
                <th className="p-1 text-center bg-slate-900 font-bold">Total Hs</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-300">
              {schedule.agents.map((agent, index) => {
                const statsQ1 = calculateAgentStats(agent, schedule, daysQ1);
                const isEven = index % 2 === 0;
                const modality = getAgentWorkModality(agent);
                const jTurno = getAgentJornalShift(agent);
                const cTurno = getContraturnoShiftForAgent(agent);

                return (
                  <React.Fragment key={`q1-${agent.id}`}>
                    {/* Fila 1: Jornal */}
                    <tr className={`border-t-2 border-slate-300 ${isEven ? 'bg-white' : 'bg-slate-50'}`}>
                      <td rowSpan={2} className="p-2 bg-white border-r-2 border-slate-400 align-top">
                        <div className="font-bold text-slate-900 text-xs leading-tight">{agent.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{agent.legajo || 'S/L'}</div>
                        <div className="text-[9px] text-slate-600 truncate mt-0.5">{agent.role || 'Agente'}</div>
                      </td>

                      {/* Celdas Jornal Q1 */}
                      {daysQ1.map((day) => {
                        const key = `${agent.id}_${day.dateStr}`;
                        const assign = schedule.assignments[key];
                        const hasJornal = assign?.jornal;
                        const isWeekend = day.isWeekend;
                        const isHoliday = day.isHoliday;

                        let bg = 'bg-white';
                        if (isHoliday) bg = 'bg-rose-50/60';
                        else if (isWeekend) bg = 'bg-amber-50/40';

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
                            key={`q1-cell-jornal-${key}`} 
                            className={`p-1 text-center border-r border-slate-300 ${bg}`}
                          >
                            {modality === 'solo_guardias' ? (
                              <span className="text-[9.5px] font-bold text-teal-800">[Ext]</span>
                            ) : hasJornal ? (
                              renderShiftContent(jPrefix, jHours, 'text-blue-950 font-bold', 'bg-blue-100', 'border-blue-400')
                            ) : (
                              <span className="text-slate-300 font-mono text-[11px]">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Subtotales Fila 1 */}
                      <td className="p-1 text-center font-bold text-blue-900 bg-blue-50 border-r border-slate-300 text-xs">
                        {statsQ1.diasJornal}
                      </td>
                      <td className="p-1 text-center font-black text-blue-950 bg-blue-100 border-r border-slate-300 text-xs">
                        {statsQ1.horasJornal}h
                      </td>
                      <td className="p-1 text-center font-bold text-emerald-900 bg-emerald-50 border-r border-slate-300 text-xs">
                        {statsQ1.totalHorasExtras}h
                      </td>
                      <td className="p-1 text-center font-black text-slate-950 bg-slate-200 text-xs">
                        {statsQ1.totalHorasMes}h
                      </td>
                    </tr>

                    {/* Fila 2: Extras */}
                    <tr className={`border-b-2 border-slate-300 ${isEven ? 'bg-slate-50/60' : 'bg-slate-100/60'}`}>
                      {daysQ1.map((day) => {
                        const key = `${agent.id}_${day.dateStr}`;
                        const assign = schedule.assignments[key];
                        const hasExtraHabil = assign?.extraHabil;
                        const hasInhabil24h = assign?.extraInhabil24h;
                        const hasInhabil12h = assign?.extraInhabil12h;
                        const hasInhabilM = assign?.extraInhabilManana;
                        const hasInhabilT = assign?.extraInhabilTarde;

                        let bg = 'bg-slate-50/50';
                        if (day.isHoliday) bg = 'bg-rose-50/70';
                        else if (day.isWeekend) bg = 'bg-amber-50/50';

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

                        return (
                          <td 
                            key={`q1-cell-extra-${key}`} 
                            className={`p-1 text-center border-r border-slate-300 ${bg}`}
                          >
                            {hasExtraHabil && renderShiftContent(ePrefix, eHours, 'text-emerald-950 font-bold', 'bg-emerald-100', 'border-emerald-400')}
                            {hasInhabil24h && renderShiftContent(
                              assign?.extraInhabil24hTipo === 'activa' ? '24A' : '24P',
                              '24h',
                              assign?.extraInhabil24hTipo === 'activa' ? 'text-purple-950 font-black' : 'text-amber-950 font-black',
                              'bg-purple-100',
                              'border-purple-400'
                            )}
                            {hasInhabil12h && renderShiftContent(
                              assign?.extraInhabil12hTipo === 'activa' ? '12A' : '12P',
                              '12h',
                              'text-indigo-950 font-black',
                              'bg-indigo-100',
                              'border-indigo-400'
                            )}
                            {hasInhabilM && renderShiftContent(
                              assign?.extraInhabilMananaTipo === 'activa' ? 'IAM' : 'IPM',
                              '7h',
                              'text-purple-950 font-bold',
                              'bg-purple-50',
                              'border-purple-300'
                            )}
                            {hasInhabilT && renderShiftContent(
                              assign?.extraInhabilTardeTipo === 'activa' ? 'IAT' : 'IPT',
                              '7h',
                              'text-amber-950 font-bold',
                              'bg-amber-50',
                              'border-amber-300'
                            )}
                            {!hasExtraHabil && !hasInhabil24h && !hasInhabil12h && !hasInhabilM && !hasInhabilT && (
                              <span className="text-slate-300 font-mono text-[11px]">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Repetición visual de subtotales Fila 2 */}
                      <td colSpan={4} className="p-1 text-center text-slate-400 bg-slate-100 text-[10px] font-medium border-l border-slate-300">
                        (Totales 1ª Quincena arriba)
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Footer Totales Q1 */}
            <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-slate-400">
              <tr>
                <td className="p-2 text-left font-black text-xs uppercase bg-slate-800">
                  TOTAL SERVICIO Q1
                </td>
                {daysQ1.map((day) => {
                  let activeCount = 0;
                  schedule.agents.forEach(a => {
                    const assign = schedule.assignments[`${a.id}_${day.dateStr}`];
                    if (assign?.jornal || assign?.extraHabil || assign?.extraInhabil24h || assign?.extraInhabil12h || assign?.extraInhabilManana || assign?.extraInhabilTarde) {
                      activeCount++;
                    }
                  });
                  return (
                    <td key={`q1-foot-${day.dateStr}`} className="p-1 text-center text-[10px] text-slate-200 border-r border-slate-700">
                      {activeCount > 0 ? activeCount : '-'}
                    </td>
                  );
                })}
                <td className="p-1 text-center font-bold text-xs bg-blue-900 border-r border-slate-700">
                  {q1Totals.diasJornal}
                </td>
                <td className="p-1 text-center font-black text-xs bg-blue-800 border-r border-slate-700">
                  {q1Totals.horasJornal}h
                </td>
                <td className="p-1 text-center font-black text-xs bg-emerald-800 border-r border-slate-700">
                  {q1Totals.horasExtras}h
                </td>
                <td className="p-1 text-center font-black text-sm bg-slate-950 text-emerald-400">
                  {q1Totals.totalHoras}h
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Firmas si solo se imprime la 1ª Quincena */}
          {printSettings.pageSplit === 'quincena_1' && renderSignatures()}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HOJA 2: 2ª QUINCENA Y CIERRE MENSUAL (DÍAS 16 AL FIN) CON TOTALES */}
      {/* ------------------------------------------------------------- */}
      {shouldRenderQ2 && (
        <div className="print-page-2 bg-white p-2 sm:p-4 rounded-lg shadow-sm print:p-0 print:shadow-none print:m-0">
          {/* Header Hoja 2 */}
          {printSettings.includeHeader && (
            <div className="p-2.5 border-b-2 border-slate-900 mb-2 flex justify-between items-start">
              <div>
                <div className="text-[9.5px] font-bold text-slate-600 uppercase tracking-wider">
                  {schedule.serviceConfig?.hospitalSubtitle || 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano'}
                </div>
                <h1 className="text-sm sm:text-base font-black uppercase text-slate-950 tracking-wide mt-0.5">
                  {schedule.serviceConfig?.hospitalName || 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"'}
                </h1>
                <div className="text-xs sm:text-sm font-black text-emerald-800 mt-0.5">
                  {schedule.serviceConfig?.serviceName || 'Servicio de Guardia Médica e Informática'}
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block text-xs font-black bg-slate-900 text-white px-3 py-1 rounded shadow-2xs">
                  2ª QUINCENA Y CIERRE MENSUAL (16 AL {days.length}) • {monthName.toUpperCase()} {schedule.year}
                </div>
                <div className="text-[9px] text-slate-600 font-bold mt-1">
                  Totales Definitivos Acumulados del Mes
                </div>
              </div>
            </div>
          )}

          {/* Tabla Hoja 2: Días 16 al fin + Totales del Mes */}
          <table className={`w-full ${isArial12 ? 'text-[12px]' : 'text-xs'} text-left border-collapse border border-slate-700`}>
            <thead className="bg-slate-900 text-white">
              <tr className="border-b border-slate-600">
                <th 
                  rowSpan={2}
                  className="p-2 font-bold text-xs uppercase bg-slate-900 border-r border-slate-700 w-[140px] text-left"
                >
                  Personal del Servicio
                </th>
                {daysQ2.map((d) => {
                  let bg = 'bg-slate-800 text-slate-200';
                  if (d.isHoliday) bg = 'bg-rose-900 text-rose-100 font-bold';
                  else if (d.isWeekend) bg = 'bg-amber-900 text-amber-100 font-bold';
                  return (
                    <th
                      key={`q2-th-${d.dateStr}`}
                      className={`p-1 text-center border-r border-slate-700 ${bg}`}
                    >
                      <div className="text-[9.5px] uppercase">{d.dayNameShort.slice(0, 2)}</div>
                      <div className="text-xs sm:text-sm font-black mt-0.5">{d.dayNumber}</div>
                    </th>
                  );
                })}

                {/* Columnas de Totales Acumulados del Mes */}
                {printSettings.totalsMode === 'compact' ? (
                  <>
                    <th className="p-1 text-center font-bold bg-blue-950 text-blue-100 border-r border-slate-700 text-[10px]">
                      Hs Jornal
                    </th>
                    <th className="p-1 text-center font-bold bg-emerald-950 text-emerald-100 border-r border-slate-700 text-[10px]">
                      Hs Extras
                    </th>
                    <th className="p-1 text-center font-black bg-slate-950 text-white text-[10.5px]">
                      TOTAL MES
                    </th>
                  </>
                ) : (
                  <>
                    <th colSpan={2} className="p-1 text-center font-bold bg-blue-950 text-blue-100 border-r border-slate-700 text-[9.5px]">
                      Jornal
                    </th>
                    <th colSpan={2} className="p-1 text-center font-bold bg-emerald-950 text-emerald-100 border-r border-slate-700 text-[9.5px]">
                      Ext. Hábil
                    </th>
                    <th colSpan={2} className="p-1 text-center font-bold bg-purple-950 text-purple-100 border-r border-slate-700 text-[9.5px]">
                      Inhábiles
                    </th>
                    <th className="p-1 text-center font-bold bg-emerald-900 text-white border-r border-slate-700 text-[9.5px]">
                      Extras
                    </th>
                    <th className="p-1 text-center font-black bg-slate-950 text-white text-[10px]">
                      TOTAL
                    </th>
                  </>
                )}
              </tr>

              {printSettings.totalsMode !== 'compact' && (
                <tr className="border-b border-slate-600 text-[9px] text-slate-300">
                  <th className="p-0.5 text-center bg-blue-900 border-r border-slate-700">Días</th>
                  <th className="p-0.5 text-center bg-blue-950 border-r border-slate-700">Hs</th>
                  <th className="p-0.5 text-center bg-emerald-900 border-r border-slate-700">Días</th>
                  <th className="p-0.5 text-center bg-emerald-950 border-r border-slate-700">Hs</th>
                  <th className="p-0.5 text-center bg-purple-900 border-r border-slate-700">Act.</th>
                  <th className="p-0.5 text-center bg-amber-900 border-r border-slate-700">Pas.</th>
                  <th className="p-0.5 text-center bg-emerald-800 border-r border-slate-700">Total</th>
                  <th className="p-0.5 text-center bg-slate-900 font-bold">Mes</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-slate-300">
              {schedule.agents.map((agent, index) => {
                const statsFull = calculateAgentStats(agent, schedule, days);
                const isEven = index % 2 === 0;
                const modality = getAgentWorkModality(agent);
                const jTurno = getAgentJornalShift(agent);
                const cTurno = getContraturnoShiftForAgent(agent);

                return (
                  <React.Fragment key={`q2-${agent.id}`}>
                    {/* Fila 1: Jornal */}
                    <tr className={`border-t-2 border-slate-300 ${isEven ? 'bg-white' : 'bg-slate-50'}`}>
                      <td rowSpan={2} className="p-2 bg-white border-r-2 border-slate-400 align-top">
                        <div className="font-bold text-slate-900 text-xs leading-tight">{agent.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{agent.legajo || 'S/L'}</div>
                        <div className="text-[9px] text-slate-600 truncate mt-0.5">{agent.role || 'Agente'}</div>
                      </td>

                      {/* Celdas Jornal Q2 */}
                      {daysQ2.map((day) => {
                        const key = `${agent.id}_${day.dateStr}`;
                        const assign = schedule.assignments[key];
                        const hasJornal = assign?.jornal;
                        const isWeekend = day.isWeekend;
                        const isHoliday = day.isHoliday;

                        let bg = 'bg-white';
                        if (isHoliday) bg = 'bg-rose-50/60';
                        else if (isWeekend) bg = 'bg-amber-50/40';

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
                            key={`q2-cell-jornal-${key}`} 
                            className={`p-1 text-center border-r border-slate-300 ${bg}`}
                          >
                            {modality === 'solo_guardias' ? (
                              <span className="text-[9.5px] font-bold text-teal-800">[Ext]</span>
                            ) : hasJornal ? (
                              renderShiftContent(jPrefix, jHours, 'text-blue-950 font-bold', 'bg-blue-100', 'border-blue-400')
                            ) : (
                              <span className="text-slate-300 font-mono text-[11px]">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Totales Acumulados del Mes */}
                      {printSettings.totalsMode === 'compact' ? (
                        <>
                          <td className="p-1 text-center font-black text-blue-950 bg-blue-100 border-r border-slate-300 text-xs">
                            {statsFull.horasJornal}h
                          </td>
                          <td className="p-1 text-center font-black text-emerald-950 bg-emerald-100 border-r border-slate-300 text-xs">
                            {statsFull.totalHorasExtras}h
                          </td>
                          <td className="p-1 text-center font-black text-slate-950 bg-slate-200 text-sm">
                            {statsFull.totalHorasMes}h
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-1 text-center font-bold text-blue-900 bg-blue-50 border-r border-slate-300 text-xs">
                            {statsFull.diasJornal}
                          </td>
                          <td className="p-1 text-center font-black text-blue-950 bg-blue-100 border-r border-slate-300 text-xs">
                            {statsFull.horasJornal}h
                          </td>
                          <td className="p-1 text-center font-bold text-emerald-900 bg-emerald-50 border-r border-slate-300 text-xs">
                            {statsFull.diasExtraHabil}
                          </td>
                          <td className="p-1 text-center font-black text-emerald-950 bg-emerald-100 border-r border-slate-300 text-xs">
                            {statsFull.horasExtraHabil}h
                          </td>
                          <td className="p-1 text-center font-bold text-purple-900 bg-purple-50 border-r border-slate-300 text-xs">
                            {statsFull.horasInhabilActiva}h
                          </td>
                          <td className="p-1 text-center font-bold text-amber-900 bg-amber-50 border-r border-slate-300 text-xs">
                            {statsFull.horasInhabilPasiva}h
                          </td>
                          <td className="p-1 text-center font-black text-emerald-950 bg-emerald-200 border-r border-slate-300 text-xs">
                            {statsFull.totalHorasExtras}h
                          </td>
                          <td className="p-1 text-center font-black text-slate-950 bg-slate-300 text-sm">
                            {statsFull.totalHorasMes}h
                          </td>
                        </>
                      )}
                    </tr>

                    {/* Fila 2: Extras */}
                    <tr className={`border-b-2 border-slate-300 ${isEven ? 'bg-slate-50/60' : 'bg-slate-100/60'}`}>
                      {daysQ2.map((day) => {
                        const key = `${agent.id}_${day.dateStr}`;
                        const assign = schedule.assignments[key];
                        const hasExtraHabil = assign?.extraHabil;
                        const hasInhabil24h = assign?.extraInhabil24h;
                        const hasInhabil12h = assign?.extraInhabil12h;
                        const hasInhabilM = assign?.extraInhabilManana;
                        const hasInhabilT = assign?.extraInhabilTarde;

                        let bg = 'bg-slate-50/50';
                        if (day.isHoliday) bg = 'bg-rose-50/70';
                        else if (day.isWeekend) bg = 'bg-amber-50/50';

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

                        return (
                          <td 
                            key={`q2-cell-extra-${key}`} 
                            className={`p-1 text-center border-r border-slate-300 ${bg}`}
                          >
                            {hasExtraHabil && renderShiftContent(ePrefix, eHours, 'text-emerald-950 font-bold', 'bg-emerald-100', 'border-emerald-400')}
                            {hasInhabil24h && renderShiftContent(
                              assign?.extraInhabil24hTipo === 'activa' ? '24A' : '24P',
                              '24h',
                              assign?.extraInhabil24hTipo === 'activa' ? 'text-purple-950 font-black' : 'text-amber-950 font-black',
                              'bg-purple-100',
                              'border-purple-400'
                            )}
                            {hasInhabil12h && renderShiftContent(
                              assign?.extraInhabil12hTipo === 'activa' ? '12A' : '12P',
                              '12h',
                              'text-indigo-950 font-black',
                              'bg-indigo-100',
                              'border-indigo-400'
                            )}
                            {hasInhabilM && renderShiftContent(
                              assign?.extraInhabilMananaTipo === 'activa' ? 'IAM' : 'IPM',
                              '7h',
                              'text-purple-950 font-bold',
                              'bg-purple-50',
                              'border-purple-300'
                            )}
                            {hasInhabilT && renderShiftContent(
                              assign?.extraInhabilTardeTipo === 'activa' ? 'IAT' : 'IPT',
                              '7h',
                              'text-amber-950 font-bold',
                              'bg-amber-50',
                              'border-amber-300'
                            )}
                            {!hasExtraHabil && !hasInhabil24h && !hasInhabil12h && !hasInhabilM && !hasInhabilT && (
                              <span className="text-slate-300 font-mono text-[11px]">-</span>
                            )}
                          </td>
                        );
                      })}

                      <td 
                        colSpan={printSettings.totalsMode === 'compact' ? 3 : 8} 
                        className="p-1 text-center text-slate-400 bg-slate-100 text-[10px] font-medium border-l border-slate-300"
                      >
                        (Cierre mensual consolidado arriba)
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Footer Totales Generales */}
            <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-slate-400">
              <tr>
                <td className="p-2 text-left font-black text-xs uppercase bg-slate-800">
                  TOTAL SERVICIO MES
                </td>
                {daysQ2.map((day) => {
                  let activeCount = 0;
                  schedule.agents.forEach(a => {
                    const assign = schedule.assignments[`${a.id}_${day.dateStr}`];
                    if (assign?.jornal || assign?.extraHabil || assign?.extraInhabil24h || assign?.extraInhabil12h || assign?.extraInhabilManana || assign?.extraInhabilTarde) {
                      activeCount++;
                    }
                  });
                  return (
                    <td key={`q2-foot-${day.dateStr}`} className="p-1 text-center text-[10px] text-slate-200 border-r border-slate-700">
                      {activeCount > 0 ? activeCount : '-'}
                    </td>
                  );
                })}

                {printSettings.totalsMode === 'compact' ? (
                  <>
                    <td className="p-1 text-center font-black text-xs bg-blue-800 border-r border-slate-700">
                      {fullTotals.horasJornal}h
                    </td>
                    <td className="p-1 text-center font-black text-xs bg-emerald-800 border-r border-slate-700">
                      {fullTotals.totalHorasExtras}h
                    </td>
                    <td className="p-1 text-center font-black text-sm bg-slate-950 text-emerald-400">
                      {fullTotals.totalHorasMes}h
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-1 text-center font-bold text-xs bg-blue-900 border-r border-slate-700">{fullTotals.diasJornal}</td>
                    <td className="p-1 text-center font-black text-xs bg-blue-800 border-r border-slate-700">{fullTotals.horasJornal}h</td>
                    <td className="p-1 text-center font-bold text-xs bg-emerald-900 border-r border-slate-700">{fullTotals.diasExtraHabil}</td>
                    <td className="p-1 text-center font-black text-xs bg-emerald-800 border-r border-slate-700">{fullTotals.horasExtraHabil}h</td>
                    <td className="p-1 text-center font-bold text-xs bg-purple-900 border-r border-slate-700">{fullTotals.horasInhabilActiva}h</td>
                    <td className="p-1 text-center font-bold text-xs bg-amber-900 border-r border-slate-700">{fullTotals.horasInhabilPasiva}h</td>
                    <td className="p-1 text-center font-black text-xs bg-emerald-800 border-r border-slate-700">{fullTotals.totalHorasExtras}h</td>
                    <td className="p-1 text-center font-black text-sm bg-slate-950 text-emerald-400">{fullTotals.totalHorasMes}h</td>
                  </>
                )}
              </tr>
            </tfoot>
          </table>

          {/* Firmas Oficiales Institucionales */}
          {renderSignatures()}
        </div>
      )}
    </div>
  );
};
