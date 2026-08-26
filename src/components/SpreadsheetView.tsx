import React, { useState } from 'react';
import { MonthSchedule, DayInfo, Agent, DayShiftAssignment } from '../types';
import { calculateAgentStats, HOURS_PER_SHIFT, MONTH_NAMES, isAgentOnlyInhabilePasiva } from '../utils/calendar';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Calendar, 
  Info,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Pencil,
  Check,
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Trash2,
  Eraser,
  ChevronDown
} from 'lucide-react';

interface SpreadsheetViewProps {
  schedule: MonthSchedule;
  days: DayInfo[];
  onCellClick: (agent: Agent, day: DayInfo) => void;
  onQuickToggleJornal: (agentId: string, dateStr: string) => void;
  onQuickToggleExtraHabil: (agentId: string, dateStr: string) => void;
  onClearCell?: (agentId: string, dateStr: string) => void;
  onClearAllMonth?: () => void;
  onClearAllExtrasMonth?: () => void;
  onClearAllJornalesMonth?: () => void;
  onClearAgentMonth?: (agentId: string) => void;
  onOpenSettings?: () => void;
  onUpdateAgentName?: (agentId: string, newName: string, newLegajo?: string) => void;
  onExportExcelVisual?: () => void;
  onExportVisualHtml?: () => void;
  onExportWord?: () => void;
  onExportExcel?: () => void;
  onPrint?: () => void;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  schedule,
  days,
  onCellClick,
  onQuickToggleJornal,
  onQuickToggleExtraHabil,
  onClearCell,
  onClearAllMonth,
  onClearAllExtrasMonth,
  onClearAllJornalesMonth,
  onClearAgentMonth,
  onOpenSettings,
  onUpdateAgentName,
  onExportExcelVisual,
  onExportVisualHtml,
  onExportWord,
  onExportExcel,
  onPrint,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ agentId: string; dateStr: string; type?: 'jornal' | 'extra' } | null>(null);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string>('');
  const [tempLegajo, setTempLegajo] = useState<string>('');
  const [viewMode, setViewMode] = useState<'double' | 'compact'>('double');
  const [showClearMenu, setShowClearMenu] = useState<boolean>(false);

  const startEditAgent = (agent: Agent) => {
    setEditingAgentId(agent.id);
    setTempName(agent.name);
    setTempLegajo(agent.legajo);
  };

  const saveEditAgent = (agentId: string) => {
    if (onUpdateAgentName && tempName.trim()) {
      onUpdateAgentName(agentId, tempName.trim(), tempLegajo.trim());
    }
    setEditingAgentId(null);
  };

  const cancelEditAgent = () => {
    setEditingAgentId(null);
  };

  // Verificación de cobertura diaria
  const getDailyCoverage = (day: DayInfo) => {
    let soporteExtraCount = 0;
    let sighoExtraCount = 0;
    let totalExtraHabil = 0;
    let morningInhabilAgent: string | null = null;
    let afternoonInhabilAgent: string | null = null;

    schedule.agents.forEach(agent => {
      const key = `${agent.id}_${day.dateStr}`;
      const assign = schedule.assignments[key];
      if (!assign) return;

      if (assign.extraHabil) {
        totalExtraHabil++;
        if (agent.category === 'Soporte Técnico') {
          soporteExtraCount++;
        } else {
          sighoExtraCount++;
        }
      }

      if (assign.extraInhabilManana) {
        morningInhabilAgent = agent.name.split(',')[0];
      }
      if (assign.extraInhabilTarde) {
        afternoonInhabilAgent = agent.name.split(',')[0];
      }
    });

    const isBusinessDay = !day.isWeekend && !day.isHoliday;
    const isCompliant = isBusinessDay ? (soporteExtraCount === 1 && sighoExtraCount === 1) : (Boolean(morningInhabilAgent) && Boolean(afternoonInhabilAgent));

    return {
      isBusinessDay,
      soporteExtraCount,
      sighoExtraCount,
      totalExtraHabil,
      morningInhabilAgent,
      afternoonInhabilAgent,
      isCompliant,
    };
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Informative Banner / Guidelines */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-800 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-md shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              Reglas Operativas del Servicio de Informática (HCEF)
            </h3>
            <p className="text-xs text-emerald-900/90 mt-0.5 leading-relaxed">
              <strong>Jornal Ordinario:</strong> Lunes a Viernes 06:00 a 13:00 hs (4 agentes). • 
              <strong> Horas Extras Hábiles:</strong> Lunes a Viernes 13:00 a 20:00 hs (2 agentes por día: 1 Soporte Técnico + 1 SIGHO). • 
              <strong> Inhábiles:</strong> Sábados, Domingos y Feriados (06-13 y 13-20 hs, en modalidad Activa o Pasiva).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <span className="text-[11px] font-medium bg-white px-2.5 py-1 rounded border border-emerald-200 text-emerald-800 shadow-2xs">
            💡 Haz clic en cualquier celda para editar sus turnos
          </span>
        </div>
      </div>

      {/* Main Excel-like Matrix Table */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Matriz Mensual: {MONTH_NAMES[schedule.month - 1]} {schedule.year}</span>
              <span className="text-slate-400 font-normal">| {days.length} días</span>
            </div>

            {/* Layout Mode Switcher */}
            <div className="flex items-center bg-slate-200/90 p-0.5 rounded-lg border border-slate-300">
              <button
                type="button"
                onClick={() => setViewMode('double')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  viewMode === 'double'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title="Vista detallada: Fila de Jornal (06-13) y Fila de Horas Extras (13-20 / Inhábiles) por cada agente"
              >
                2 Filas por Agente (Jornal + Extras)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  viewMode === 'compact'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title="Vista unificada en 1 fila por agente"
              >
                1 Fila Compacta
              </button>
            </div>
          </div>

          {/* Action Export Buttons & Color References */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Menu Borrar / Vaciar Celdas */}
            <div className="relative">
              <button
                type="button"
                id="btn-clear-cells-menu"
                onClick={() => setShowClearMenu(!showClearMenu)}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold px-2.5 py-1.5 rounded shadow-xs cursor-pointer transition-all"
                title="Opciones para vaciar o borrar celdas del mes"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Borrar Celdas</span>
                <ChevronDown className="w-3 h-3 text-rose-600" />
              </button>

              {showClearMenu && (
                <div 
                  className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setShowClearMenu(false)}
                >
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Opciones de Borrado ({MONTH_NAMES[schedule.month - 1]})
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`¿Confirmas que deseas vaciar y dejar en blanco TODAS las celdas de ${MONTH_NAMES[schedule.month - 1]}?`)) {
                        onClearAllMonth?.();
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <div className="font-bold">Vaciar todo el mes</div>
                      <div className="text-[10px] text-slate-500">Deja todas las celdas en blanco (0 hs)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`¿Borrar todas las horas extras de ${MONTH_NAMES[schedule.month - 1]} manteniendo los jornales?`)) {
                        onClearAllExtrasMonth?.();
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer transition-colors border-t border-slate-100"
                  >
                    <Eraser className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">Borrar solo Horas Extras</div>
                      <div className="text-[10px] text-slate-500">Conserva los jornales (06-13 hs)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`¿Borrar todos los jornales de ${MONTH_NAMES[schedule.month - 1]} manteniendo las extras?`)) {
                        onClearAllJornalesMonth?.();
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer transition-colors border-t border-slate-100"
                  >
                    <Eraser className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="font-bold">Borrar solo Jornales</div>
                      <div className="text-[10px] text-slate-500">Conserva las horas extras asignadas</div>
                    </div>
                  </button>

                  <div className="px-3 py-1.5 text-[10px] text-slate-400 bg-slate-50 border-t border-slate-100 italic">
                    💡 Para borrar una celda individual, haz clic sobre ella y presiona "Borrar Celda".
                  </div>
                </div>
              )}
            </div>

            {onExportExcelVisual && (
              <button
                type="button"
                onClick={onExportExcelVisual}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded shadow-xs cursor-pointer transition-all ring-1 ring-emerald-400/40"
                title="Descargar Planilla con Formato Visual 100% compatible con Microsoft Excel (.xls): no se desconfiguran los colores, 2 filas por agente, bordes y totales"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Excel Formato Visual (.xls)
              </button>
            )}

            {onExportWord && (
              <button
                type="button"
                onClick={onExportWord}
                className="flex items-center gap-1.5 bg-sky-700 hover:bg-sky-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded shadow-xs cursor-pointer transition-all"
                title="Descargar planilla editable en Microsoft Word (.doc) con tabla formateada, 2 filas por agente y firmas"
              >
                <FileText className="w-3.5 h-3.5" />
                Word (.doc)
              </button>
            )}

            {onExportVisualHtml && (
              <button
                type="button"
                onClick={onExportVisualHtml}
                className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded shadow-xs cursor-pointer transition-all"
                title="Descargar archivo visual con 100% de los colores, tipografía, bordes y diseño idéntico (no se desconfigura nunca)"
              >
                <Download className="w-3.5 h-3.5" />
                Web / PDF (.html)
              </button>
            )}

            {onExportExcel && (
              <button
                type="button"
                onClick={onExportExcel}
                className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium px-2 py-1.5 rounded border border-slate-600 cursor-pointer transition-all"
                title="Descargar libro de Excel (.xlsx) con fórmulas y matrices"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                Excel (.xlsx)
              </button>
            )}

            {onPrint && (
              <button
                type="button"
                onClick={onPrint}
                className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-medium px-2.5 py-1.5 rounded shadow-xs cursor-pointer transition-all"
                title="Imprimir o Guardar como PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                Imprimir / PDF
              </button>
            )}
          </div>
        </div>

        {/* Color References Legend */}
        <div className="bg-slate-50 px-4 py-1.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-500 text-[10px] uppercase">Referencias:</span>
            <span className="flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> J: Jornal (06:00 a 13:00)
            </span>
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> E: Ext. Hábil (13:00 a 20:00)
            </span>
            <span className="flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> IA: Inhábil Activa (06-13 / 13-20)
            </span>
            <span className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> IP: Inhábil Pasiva (06-13 / 13-20)
            </span>
            <span className="flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
              F: Franco / Descanso
            </span>
          </div>

          <div className="text-[10px] text-slate-500 italic flex items-center gap-1">
            <Info className="w-3 h-3 text-blue-500" />
            <span>Al guardar como PDF, selecciona orientación Horizontal (Landscape)</span>
          </div>
        </div>

        {/* Scrollable Spreadsheet Table */}
        <div className="overflow-x-auto max-h-[700px]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-800 text-white sticky top-0 z-20 shadow-xs">
              {/* Row 1: Weekday Names & Group Totals */}
              <tr className="border-b border-slate-700">
                <th 
                  scope="col" 
                  className="p-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-200 sticky left-0 z-30 bg-slate-900 border-r border-slate-700 min-w-[260px] shadow-[2px_0_5px_rgba(0,0,0,0.15)]"
                  rowSpan={2}
                >
                  Agente / Tipo de Turno (HCEF)
                </th>

                {days.map((day) => {
                  const isSun = day.dayOfWeek === 0;
                  const isSat = day.dayOfWeek === 6;
                  const isHol = day.isHoliday;
                  
                  let bgHead = 'bg-slate-800';
                  if (isHol) bgHead = 'bg-rose-900 text-rose-100';
                  else if (isSun) bgHead = 'bg-amber-900/80 text-amber-100';
                  else if (isSat) bgHead = 'bg-slate-700 text-slate-200';

                  return (
                    <th
                      key={`h1-${day.dateStr}`}
                      scope="col"
                      className={`p-1.5 text-center font-bold text-[11px] border-r border-slate-700 min-w-[54px] max-w-[62px] ${bgHead}`}
                      title={day.holidayName ? `${day.dayNameLong} - FERIADO: ${day.holidayName}` : day.dayNameLong}
                    >
                      <div className="text-[10px] uppercase font-semibold tracking-wide">
                        {day.dayNameShort}
                      </div>
                      <div className="text-xs font-bold mt-0.5">
                        {day.dayNumber}
                      </div>
                      {isHol && (
                        <div className="text-[9px] bg-rose-700 text-white rounded px-0.5 mt-0.5 truncate font-normal" title={day.holidayName}>
                          FER
                        </div>
                      )}
                    </th>
                  );
                })}

                {/* Column Headers for Totals */}
                <th colSpan={2} className="p-2 text-center font-bold bg-blue-900 text-blue-100 border-r border-slate-700 min-w-[90px]">
                  Jornal (6-13)
                </th>
                <th colSpan={2} className="p-2 text-center font-bold bg-emerald-900 text-emerald-100 border-r border-slate-700 min-w-[90px]">
                  Ext. Hábil (13-20)
                </th>
                <th colSpan={2} className="p-2 text-center font-bold bg-purple-900 text-purple-100 border-r border-slate-700 min-w-[100px]">
                  Inhábiles (6-13 / 13-20)
                </th>
                <th className="p-2 text-center font-bold bg-emerald-950 text-emerald-200 border-r border-slate-700 min-w-[80px]">
                  Total Extras
                </th>
                <th className="p-2 text-center font-bold bg-slate-950 text-white min-w-[85px]">
                  TOTAL MES
                </th>
              </tr>

              {/* Subheaders for Totals */}
              <tr className="border-b border-slate-600 text-[10px] text-slate-300">
                {/* (Empty th for agent is handled by rowSpan={2} above) */}
                {days.map(d => (
                  <th key={`h2-${d.dateStr}`} className="hidden"></th>
                ))}
                <th className="p-1 text-center bg-blue-950/70 border-r border-slate-700 font-semibold">Días</th>
                <th className="p-1 text-center bg-blue-950/90 border-r border-slate-700 font-semibold">Hs</th>
                <th className="p-1 text-center bg-emerald-950/70 border-r border-slate-700 font-semibold">Días</th>
                <th className="p-1 text-center bg-emerald-950/90 border-r border-slate-700 font-semibold">Hs</th>
                <th className="p-1 text-center bg-purple-950/70 border-r border-slate-700 font-semibold">Activas</th>
                <th className="p-1 text-center bg-amber-950/70 border-r border-slate-700 font-semibold">Pasivas</th>
                <th className="p-1 text-center bg-emerald-900 font-bold border-r border-slate-700">Hs Ext</th>
                <th className="p-1 text-center bg-slate-900 font-bold">Total Hs</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-300 text-slate-800">
              {schedule.agents.map((agent, index) => {
                const stats = calculateAgentStats(agent, schedule, days);
                const isEven = index % 2 === 0;

                if (viewMode === 'double') {
                  // VISTA 2 FILAS POR AGENTE: 1 Fila Jornal + 1 Fila Horas Extras (Hábiles / Inhábiles)
                  return (
                    <React.Fragment key={agent.id}>
                      {/* FILA 1: JORNAL ORDINARIO (06:00 a 13:00 hs) */}
                      <tr className={`border-t-2 border-slate-300 ${isEven ? 'bg-white' : 'bg-slate-50/80'} hover:bg-blue-50/30 transition-colors`}>
                        {/* Agente header with rowSpan 2 */}
                        <td 
                          id={`agent-row-${agent.id}`}
                          rowSpan={2}
                          className="p-2.5 sticky left-0 z-10 bg-white border-r border-b-2 border-slate-300 shadow-[2px_0_5px_rgba(0,0,0,0.06)] align-top"
                        >
                          {editingAgentId === agent.id ? (
                            <div className="flex flex-col gap-1.5 p-1 bg-white border border-emerald-400 rounded-md shadow-xs">
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 uppercase block">Nombre:</label>
                                <input
                                  type="text"
                                  value={tempName}
                                  onChange={(e) => setTempName(e.target.value)}
                                  className="w-full text-xs font-bold text-slate-900 border border-slate-300 rounded px-1.5 py-0.5 focus:border-emerald-600 focus:outline-none"
                                  autoFocus
                                  placeholder="Apellido y Nombre"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditAgent(agent.id);
                                    if (e.key === 'Escape') cancelEditAgent();
                                  }}
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 uppercase block">Legajo:</label>
                                <input
                                  type="text"
                                  value={tempLegajo}
                                  onChange={(e) => setTempLegajo(e.target.value)}
                                  className="w-full text-[11px] font-mono text-slate-800 border border-slate-300 rounded px-1.5 py-0.5 focus:border-emerald-600 focus:outline-none"
                                  placeholder="LEG-XXXX"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditAgent(agent.id);
                                    if (e.key === 'Escape') cancelEditAgent();
                                  }}
                                />
                              </div>
                              <div className="flex items-center justify-end gap-1 mt-0.5">
                                <button
                                  type="button"
                                  onClick={cancelEditAgent}
                                  className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => saveEditAgent(agent.id)}
                                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer"
                                  title="Guardar nombre"
                                >
                                  <Check className="w-3 h-3" />
                                  Listo
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="group relative">
                              <div className="font-bold text-slate-900 text-xs flex items-center justify-between gap-1.5">
                                <span className="truncate" title={agent.name}>{agent.name}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                  {agent.isJefe && (
                                    <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 px-1.5 py-0.2 rounded shrink-0">
                                      Jefe
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => startEditAgent(agent)}
                                    className="opacity-70 group-hover:opacity-100 p-1 hover:bg-slate-200 text-slate-500 hover:text-emerald-700 rounded transition-opacity cursor-pointer"
                                    title="Editar nombre y legajo de este agente"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-[11px] text-slate-600 flex items-center justify-between gap-2 mt-0.5">
                                <span className="truncate">{agent.roleLabel}</span>
                                <span className="font-mono text-[10px] text-slate-400 shrink-0 font-medium">{agent.legajo}</span>
                              </div>
                              <div className="mt-1 flex items-center justify-between gap-1 flex-wrap">
                                <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                                  agent.category === 'Soporte Técnico' 
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                    : 'bg-teal-100 text-teal-800 border border-teal-200'
                                }`}>
                                  {agent.category}
                                </span>
                                {isAgentOnlyInhabilePasiva(agent) && (
                                  <span className="text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded shrink-0" title="Régimen Exclusivo: Únicamente Inhábiles Pasivas">
                                    Solo Inh. Pasivas
                                  </span>
                                )}
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-col gap-1 text-[10px]">
                                <div className="flex items-center gap-1 font-bold text-blue-700">
                                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                  <span>Fila 1: Jornal (06-13)</span>
                                </div>
                                <div className="flex items-center gap-1 font-bold text-emerald-700">
                                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                  <span>Fila 2: Horas Extras</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Celdas Fila 1: Jornal por cada día */}
                        {days.map((day) => {
                          const key = `${agent.id}_${day.dateStr}`;
                          const assign = schedule.assignments[key];
                          const hasJornal = assign?.jornal;
                          const isWeekend = day.isWeekend;
                          const isHoliday = day.isHoliday;
                          const isHovered = hoveredCell?.agentId === agent.id && hoveredCell?.dateStr === day.dateStr && hoveredCell?.type === 'jornal';

                          let bg = 'bg-white';
                          if (isHoliday) bg = 'bg-rose-50/50';
                          else if (isWeekend) bg = 'bg-amber-50/30';

                          return (
                            <td
                              key={`jornal-${key}`}
                              id={`cell-jornal-${agent.id}-${day.dayNumber}`}
                              onClick={() => onCellClick(agent, day)}
                              onMouseEnter={() => setHoveredCell({ agentId: agent.id, dateStr: day.dateStr, type: 'jornal' })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`p-1 text-center border-r border-slate-200 cursor-pointer transition-all ${bg} ${
                                isHovered ? 'ring-2 ring-blue-500 ring-inset bg-blue-100/60' : ''
                              }`}
                              title={`Jornal 06:00 a 13:00:\n${agent.name} - ${day.dayNameLong} ${day.dayNumber}\n${hasJornal ? '✓ Jornal Asignado (7 hs)' : 'Descanso / Sin Jornal'}`}
                            >
                              <div className="flex items-center justify-center min-h-[26px]">
                                {hasJornal ? (
                                  <span className="w-full py-0.5 text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 rounded leading-tight shadow-2xs">
                                    J (6-13)
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-300 font-mono">-</span>
                                )}
                              </div>
                            </td>
                          );
                        })}

                        {/* Totales Jornal Fila 1 */}
                        <td className="p-1.5 text-center font-bold text-blue-900 bg-blue-50/80 border-r border-slate-200">
                          {stats.diasJornal}
                        </td>
                        <td className="p-1.5 text-center font-black text-blue-950 bg-blue-100/80 border-r border-slate-200">
                          {stats.horasJornal}h
                        </td>

                        {/* Totales Fila 1 (Vacíos para Extras que van en Fila 2) */}
                        <td colSpan={2} className="p-1 text-center text-slate-400 bg-slate-50 border-r border-slate-200 text-[10px]">
                          (Ver fila extras)
                        </td>
                        <td colSpan={2} className="p-1 text-center text-slate-400 bg-slate-50 border-r border-slate-200 text-[10px]">
                          (Ver fila extras)
                        </td>
                        <td className="p-1 text-center text-slate-400 bg-slate-50 border-r border-slate-200 text-[10px]">
                          -
                        </td>
                        <td rowSpan={2} className="p-1.5 text-center font-black text-slate-900 bg-slate-200/90 text-sm align-middle border-b-2 border-slate-300">
                          {stats.totalHorasMes}h
                        </td>
                      </tr>

                      {/* FILA 2: HORAS EXTRAS HÁBILES E INHÁBILES */}
                      <tr className={`border-b-2 border-slate-300 ${isEven ? 'bg-slate-50/50' : 'bg-slate-100/50'} hover:bg-emerald-50/30 transition-colors`}>
                        {/* Celdas Fila 2: Extras (Hábiles 13-20 o Inhábiles 6-13 / 13-20) */}
                        {days.map((day) => {
                          const key = `${agent.id}_${day.dateStr}`;
                          const assign = schedule.assignments[key];
                          const hasExtraHabil = assign?.extraHabil;
                          const hasInhabilM = assign?.extraInhabilManana;
                          const hasInhabilT = assign?.extraInhabilTarde;
                          const hasAnyExtra = hasExtraHabil || hasInhabilM || hasInhabilT;

                          const isWeekend = day.isWeekend;
                          const isHoliday = day.isHoliday;
                          const isHovered = hoveredCell?.agentId === agent.id && hoveredCell?.dateStr === day.dateStr && hoveredCell?.type === 'extra';

                          let bg = 'bg-slate-50/60';
                          if (isHoliday) bg = 'bg-rose-50/70';
                          else if (isWeekend) bg = 'bg-amber-50/50';

                          return (
                            <td
                              key={`extra-${key}`}
                              id={`cell-extra-${agent.id}-${day.dayNumber}`}
                              onClick={() => onCellClick(agent, day)}
                              onMouseEnter={() => setHoveredCell({ agentId: agent.id, dateStr: day.dateStr, type: 'extra' })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`p-1 text-center border-r border-slate-200 cursor-pointer transition-all ${bg} ${
                                isHovered ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-100/60' : ''
                              }`}
                              title={`Horas Extras:\n${agent.name} - ${day.dayNameLong} ${day.dayNumber}\n${
                                hasExtraHabil ? '• Extra Hábil 13:00 a 20:00 (7h)\n' : ''
                              }${hasInhabilM ? `• Inhábil Mañana (${assign?.extraInhabilMananaTipo || 'activa'})\n` : ''}${
                                hasInhabilT ? `• Inhábil Tarde (${assign?.extraInhabilTardeTipo || 'activa'})\n` : ''
                              }${!hasAnyExtra ? 'Sin horas extras' : ''}`}
                            >
                              <div className="flex flex-col items-center justify-center gap-0.5 min-h-[30px]">
                                {/* Badge Extra Hábil (13-20) */}
                                {hasExtraHabil && (
                                  <span className="w-full py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 rounded leading-tight shadow-2xs">
                                    E (13-20)
                                  </span>
                                )}

                                {/* Badge Inhábil Mañana (06:00 a 13:00) */}
                                {hasInhabilM && (
                                  <span 
                                    className={`w-full py-0.5 text-[8.5px] font-bold border rounded px-0.5 leading-tight shadow-2xs ${
                                      assign?.extraInhabilMananaTipo === 'activa'
                                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                                        : 'bg-amber-100 text-amber-900 border-amber-300'
                                    }`}
                                  >
                                    {assign?.extraInhabilMananaTipo === 'activa' ? 'IA (6-13)' : 'IP (6-13)'}
                                  </span>
                                )}

                                {/* Badge Inhábil Tarde (13:00 a 20:00) */}
                                {hasInhabilT && (
                                  <span 
                                    className={`w-full py-0.5 text-[8.5px] font-bold border rounded px-0.5 leading-tight shadow-2xs ${
                                      assign?.extraInhabilTardeTipo === 'activa'
                                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                                        : 'bg-amber-100 text-amber-900 border-amber-300'
                                    }`}
                                  >
                                    {assign?.extraInhabilTardeTipo === 'activa' ? 'IA (13-20)' : 'IP (13-20)'}
                                  </span>
                                )}

                                {!hasAnyExtra && (
                                  <span className="text-[11px] text-slate-300 font-mono">-</span>
                                )}
                              </div>
                            </td>
                          );
                        })}

                        {/* Totales Fila 2 (Jornal ya mostrado en Fila 1) */}
                        <td colSpan={2} className="p-1 text-center text-slate-400 bg-slate-50 border-r border-slate-200 text-[10px]">
                          (Jornal arriba)
                        </td>

                        {/* Totales Extras Hábiles */}
                        <td className="p-1.5 text-center font-bold text-emerald-900 bg-emerald-50/80 border-r border-slate-200">
                          {stats.diasExtraHabil}
                        </td>
                        <td className="p-1.5 text-center font-black text-emerald-950 bg-emerald-100/80 border-r border-slate-200">
                          {stats.horasExtraHabil}h
                        </td>

                        {/* Totales Inhábiles */}
                        <td className="p-1.5 text-center font-bold text-purple-900 bg-purple-100/60 border-r border-slate-200">
                          {stats.horasInhabilActiva}h
                        </td>
                        <td className="p-1.5 text-center font-bold text-amber-900 bg-amber-100/60 border-r border-slate-200">
                          {stats.horasInhabilPasiva}h
                        </td>

                        {/* Total Extras */}
                        <td className="p-1.5 text-center font-black text-emerald-900 bg-emerald-200/70 border-r border-slate-200 text-xs">
                          {stats.totalHorasExtras}h
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                }

                // VISTA COMPACTA: 1 Fila por Agente
                return (
                  <tr 
                    key={agent.id}
                    className={`transition-colors hover:bg-emerald-50/40 ${isEven ? 'bg-white' : 'bg-slate-50/70'}`}
                  >
                    {/* Sticky Agent info cell */}
                    <td 
                      id={`agent-row-${agent.id}`}
                      className="p-2.5 sticky left-0 z-10 bg-inherit border-r border-slate-300 shadow-[2px_0_5px_rgba(0,0,0,0.06)]"
                    >
                      {editingAgentId === agent.id ? (
                        <div className="flex flex-col gap-1.5 p-1 bg-white border border-emerald-400 rounded-md shadow-xs">
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase block">Nombre:</label>
                            <input
                              type="text"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              className="w-full text-xs font-bold text-slate-900 border border-slate-300 rounded px-1.5 py-0.5 focus:border-emerald-600 focus:outline-none"
                              autoFocus
                              placeholder="Apellido y Nombre"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditAgent(agent.id);
                                if (e.key === 'Escape') cancelEditAgent();
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase block">Legajo:</label>
                            <input
                              type="text"
                              value={tempLegajo}
                              onChange={(e) => setTempLegajo(e.target.value)}
                              className="w-full text-[11px] font-mono text-slate-800 border border-slate-300 rounded px-1.5 py-0.5 focus:border-emerald-600 focus:outline-none"
                              placeholder="LEG-XXXX"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditAgent(agent.id);
                                if (e.key === 'Escape') cancelEditAgent();
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <button
                              type="button"
                              onClick={cancelEditAgent}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => saveEditAgent(agent.id)}
                              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer"
                              title="Guardar nombre"
                            >
                              <Check className="w-3 h-3" />
                              Listo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="group relative">
                          <div className="font-bold text-slate-900 text-xs flex items-center justify-between gap-1.5">
                            <span className="truncate" title={agent.name}>{agent.name}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {agent.isJefe && (
                                <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 px-1.5 py-0.2 rounded shrink-0">
                                  Jefe
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => startEditAgent(agent)}
                                className="opacity-70 group-hover:opacity-100 p-1 hover:bg-slate-200 text-slate-500 hover:text-emerald-700 rounded transition-opacity cursor-pointer"
                                title="Editar nombre y legajo de este agente"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-600 flex items-center justify-between gap-2 mt-0.5">
                            <span className="truncate">{agent.roleLabel}</span>
                            <span className="font-mono text-[10px] text-slate-400 shrink-0 font-medium">{agent.legajo}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-1 flex-wrap">
                            <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                              agent.category === 'Soporte Técnico' 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : 'bg-teal-100 text-teal-800 border border-teal-200'
                            }`}>
                              {agent.category}
                            </span>
                            {isAgentOnlyInhabilePasiva(agent) && (
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded shrink-0" title="Régimen Exclusivo: Únicamente Inhábiles Pasivas">
                                Solo Inh. Pasivas
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Day assignment cells */}
                    {days.map((day) => {
                      const key = `${agent.id}_${day.dateStr}`;
                      const assign = schedule.assignments[key];
                      const isHovered = hoveredCell?.agentId === agent.id && hoveredCell?.dateStr === day.dateStr;

                      const isWeekend = day.isWeekend;
                      const isHoliday = day.isHoliday;

                      let cellBg = isEven ? 'bg-white' : 'bg-slate-50/70';
                      if (isHoliday) cellBg = 'bg-rose-50/60';
                      else if (isWeekend) cellBg = 'bg-amber-50/40';

                      const hasJornal = assign?.jornal;
                      const hasExtraHabil = assign?.extraHabil;
                      const hasInhabilM = assign?.extraInhabilManana;
                      const hasInhabilT = assign?.extraInhabilTarde;
                      const hasAny = hasJornal || hasExtraHabil || hasInhabilM || hasInhabilT;

                      return (
                        <td
                          key={key}
                          id={`cell-${agent.id}-${day.dayNumber}`}
                          onClick={() => onCellClick(agent, day)}
                          onMouseEnter={() => setHoveredCell({ agentId: agent.id, dateStr: day.dateStr })}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`p-1 text-center border-r border-slate-200 cursor-pointer transition-all ${cellBg} ${
                            isHovered ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-100/50' : ''
                          }`}
                          title={`Clic para editar:\n${agent.name} - ${day.dayNameLong} ${day.dayNumber}\n${
                            hasJornal ? '• Jornal 06:00 a 13:00 (7h)\n' : ''
                          }${hasExtraHabil ? '• Extra Hábil 13:00 a 20:00 (7h)\n' : ''}${
                            hasInhabilM ? `• Inhábil Mañana (${assign?.extraInhabilMananaTipo || 'activa'})\n` : ''
                          }${hasInhabilT ? `• Inhábil Tarde (${assign?.extraInhabilTardeTipo || 'activa'})\n` : ''}${
                            !hasAny ? '• Franco / Descanso' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center gap-0.5 min-h-[46px]">
                            {/* Badge Jornal (6-13) */}
                            {hasJornal && (
                              <span className="w-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 rounded px-1 py-0.2 leading-tight">
                                J
                              </span>
                            )}

                            {/* Badge Extra Hábil (13-20) */}
                            {hasExtraHabil && (
                              <span className="w-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 rounded px-1 py-0.2 leading-tight">
                                E
                              </span>
                            )}

                            {/* Badge Inhábil Mañana (06:00 a 13:00) */}
                            {hasInhabilM && (
                              <span 
                                title={`Inhábil Mañana 06:00 a 13:00 (${assign?.extraInhabilMananaTipo === 'activa' ? 'Activa' : 'Pasiva'})`}
                                className={`w-full text-[9px] font-bold border rounded px-0.5 py-0.2 leading-tight ${
                                  assign?.extraInhabilMananaTipo === 'activa'
                                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}
                              >
                                {assign?.extraInhabilMananaTipo === 'activa' ? 'IA (6-13)' : 'IP (6-13)'}
                              </span>
                            )}

                            {/* Badge Inhábil Tarde (13:00 a 20:00) */}
                            {hasInhabilT && (
                              <span 
                                title={`Inhábil Tarde 13:00 a 20:00 (${assign?.extraInhabilTardeTipo === 'activa' ? 'Activa' : 'Pasiva'})`}
                                className={`w-full text-[9px] font-bold border rounded px-0.5 py-0.2 leading-tight ${
                                  assign?.extraInhabilTardeTipo === 'activa'
                                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}
                              >
                                {assign?.extraInhabilTardeTipo === 'activa' ? 'IA (13-20)' : 'IP (13-20)'}
                              </span>
                            )}

                            {/* Franco / Sin asignación */}
                            {!hasAny && (
                              <span className="text-[10px] text-slate-300 font-medium">
                                -
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Dynamic Totals Columns per Agent */}
                    <td className="p-1.5 text-center font-medium bg-blue-50/60 border-r border-slate-200">
                      {stats.diasJornal}
                    </td>
                    <td className="p-1.5 text-center font-bold text-blue-900 bg-blue-100/60 border-r border-slate-200">
                      {stats.horasJornal}
                    </td>

                    <td className="p-1.5 text-center font-medium bg-emerald-50/60 border-r border-slate-200">
                      {stats.diasExtraHabil}
                    </td>
                    <td className="p-1.5 text-center font-bold text-emerald-900 bg-emerald-100/60 border-r border-slate-200">
                      {stats.horasExtraHabil}
                    </td>

                    <td className="p-1.5 text-center font-bold text-purple-900 bg-purple-100/50 border-r border-slate-200" title={`${stats.turnosInhabilActiva} turnos de 7hs`}>
                      {stats.horasInhabilActiva}h
                    </td>
                    <td className="p-1.5 text-center font-bold text-amber-900 bg-amber-100/50 border-r border-slate-200" title={`${stats.turnosInhabilPasiva} turnos de 7hs`}>
                      {stats.horasInhabilPasiva}h
                    </td>

                    <td className="p-1.5 text-center font-extrabold text-emerald-800 bg-emerald-200/50 border-r border-slate-200 text-sm">
                      {stats.totalHorasExtras}h
                    </td>
                    <td className="p-1.5 text-center font-black text-slate-900 bg-slate-200/70 text-sm">
                      {stats.totalHorasMes}h
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Daily Operational Compliance Row */}
            <tfoot className="bg-slate-100 text-slate-700 border-t-2 border-slate-300 text-[11px] font-semibold">
              <tr>
                <td className="p-2.5 sticky left-0 z-10 bg-slate-200 border-r border-slate-300 font-bold text-slate-900 shadow-[2px_0_5px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Control Cobertura Diaria</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    (1 Soporte + 1 SIGHO en Hábiles)
                  </div>
                </td>

                {days.map((day) => {
                  const cov = getDailyCoverage(day);

                  return (
                    <td 
                      key={`foot-${day.dateStr}`}
                      className={`p-1 text-center border-r border-slate-300 ${
                        cov.isCompliant ? 'bg-emerald-50/70' : 'bg-amber-100/80 text-amber-900'
                      }`}
                      title={
                        cov.isBusinessDay
                          ? `Cobertura Hábil:\n• Soporte: ${cov.soporteExtraCount}/1\n• SIGHO: ${cov.sighoExtraCount}/1`
                          : `Inhábil:\n• Mañana: ${cov.morningInhabilAgent || 'Sin asignar'}\n• Tarde: ${cov.afternoonInhabilAgent || 'Sin asignar'}`
                      }
                    >
                      {cov.isBusinessDay ? (
                        <div className="flex flex-col items-center justify-center">
                          <span className={`text-[10px] font-bold ${cov.isCompliant ? 'text-emerald-700' : 'text-amber-800 font-black'}`}>
                            {cov.totalExtraHabil} Ext
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium">
                            {cov.soporteExtraCount}S+{cov.sighoExtraCount}G
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[9px]">
                          <span className="font-bold text-indigo-900">Inh</span>
                          <span className="text-slate-600 text-[8px] truncate max-w-[50px]">
                            {cov.morningInhabilAgent ? '2 Turnos' : 'Pend.'}
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}

                {/* Footers for Totals columns */}
                <td colSpan={2} className="p-1.5 text-center font-bold text-blue-900 bg-blue-100/50 border-r border-slate-300">
                  Total Jornal
                </td>
                <td colSpan={2} className="p-1.5 text-center font-bold text-emerald-900 bg-emerald-100/50 border-r border-slate-300">
                  Total Ext Hábil
                </td>
                <td className="p-1.5 text-center font-bold text-purple-900 bg-purple-100/50 border-r border-slate-300">
                  Total Activas
                </td>
                <td className="p-1.5 text-center font-bold text-amber-900 bg-amber-100/50 border-r border-slate-300">
                  Total Pasivas
                </td>
                <td className="p-1.5 text-center font-black text-emerald-950 bg-emerald-200 border-r border-slate-300">
                  Extras
                </td>
                <td className="p-1.5 text-center font-black text-slate-950 bg-slate-300">
                  TOTAL
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
