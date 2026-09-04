import React, { useState } from 'react';
import { MonthSchedule, DayInfo, Agent, DayShiftAssignment } from '../types';
import { 
  calculateAgentStats, 
  HOURS_PER_SHIFT, 
  MONTH_NAMES, 
  isAgentOnlyInhabilePasiva,
  getAgentWorkModality,
  getAgentJornalShift,
  getContraturnoShiftForAgent
} from '../utils/calendar';
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
  ChevronDown,
  Users,
  Plus,
  Building2,
  Briefcase,
  Sun,
  Moon
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
  const [showHelpBanner, setShowHelpBanner] = useState<boolean>(false);

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

  return (
    <div className="flex flex-col gap-3">
      {/* Compact Informative Bar with Optional Expandable Guidelines */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-lg px-3.5 py-2 flex items-center justify-between gap-3 text-slate-800 text-xs shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-bold text-emerald-950 truncate">
            {schedule.serviceConfig?.serviceName || 'Servicio Hospitalario'}
          </span>
          <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 shrink-0">
            {schedule.agents.length} agentes registrados
          </span>
          <span className="hidden md:inline text-slate-500">• Haz clic en cualquier celda para cargar o editar turnos</span>
        </div>

        <button
          type="button"
          onClick={() => setShowHelpBanner(!showHelpBanner)}
          className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline hover:no-underline shrink-0"
        >
          {showHelpBanner ? 'Ocultar info' : 'Ver modalidades'}
        </button>
      </div>

      {showHelpBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-950 animate-in fade-in duration-150">
          <p className="leading-relaxed">
            <strong>Jornales y Turnos Flexibles:</strong> Soporta personal con Jornal Ordinario (06-13, 13-20 o 20-07) con guardias en contraturno; personal de solo guardias (que cumple su jornada en otra institución); y personal de solo jornal sin guardias. Las guardias en días inhábiles soportan esquemas de 24hs, 12hs y 7hs en modalidad Activa o Pasiva.
          </p>
        </div>
      )}

      {/* Main Excel-like Matrix Table */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        {/* Table Header Controls (Clean & focused) */}
        <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Matriz Mensual: {MONTH_NAMES[schedule.month - 1]} {schedule.year}</span>
              <span className="text-slate-400 font-normal">({days.length} días)</span>
            </div>

            {/* Layout Mode Switcher */}
            <div className="flex items-center bg-slate-200 p-0.5 rounded-md border border-slate-300">
              <button
                type="button"
                onClick={() => setViewMode('double')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                  viewMode === 'double'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title="Vista detallada: 2 filas por agente (Fila 1: Jornal, Fila 2: Extras)"
              >
                2 Filas (Jornal + Extras)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                  viewMode === 'compact'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title="Vista compacta: 1 fila por agente"
              >
                1 Fila Compacta
              </button>
            </div>
          </div>

          {/* Table Specific Actions */}
          <div className="flex items-center gap-2">
            {/* Direct Quick Excel Download */}
            {onExportExcelVisual && (
              <button
                type="button"
                onClick={onExportExcelVisual}
                className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-2xs cursor-pointer transition-all"
                title="Descargar Planilla con Formato Visual 100% compatible con Microsoft Excel (.xls)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Descargar Excel</span>
              </button>
            )}

            {/* Menu Borrar / Vaciar Celdas */}
            <div className="relative">
              <button
                type="button"
                id="btn-clear-cells-menu"
                onClick={() => setShowClearMenu(!showClearMenu)}
                className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold px-2.5 py-1 rounded cursor-pointer transition-all"
                title="Opciones para vaciar o borrar celdas del mes"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Borrar Celdas</span>
                <ChevronDown className="w-3 h-3 text-rose-600" />
              </button>

              {showClearMenu && (
                <div 
                  className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowClearMenu(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
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
                      <div className="text-[10px] text-slate-500">Conserva los jornales de cada turno</div>
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Color References Legend */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-500 text-[10px] uppercase">Referencias:</span>
            <span className="flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-medium" title="Jornal Ordinario">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> JM / JT / JN: Jornal (06-13 / 13-20 / 20-07)
            </span>
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium" title="Horas Extras Hábiles en contraturno">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> EM / ET / EN: Extra Contraturno (7h)
            </span>
            <span className="flex items-center gap-1 bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded font-bold shadow-2xs" title="Guardia Inhábil 24 Horas Activa">
              <span className="w-2 h-2 rounded-full bg-purple-700"></span> G24A: Guardia 24h Activa
            </span>
            <span className="flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-bold shadow-2xs" title="Guardia Inhábil 24 Horas Pasiva">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span> G24P: Guardia 24h Pasiva
            </span>
            <span className="flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-medium" title="Inhábil Activa Presencial 7h">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> IA: Inhábil Activa 7h
            </span>
            <span className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium" title="Inhábil Pasiva Disponibilidad 7h">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> IP: Inhábil Pasiva 7h
            </span>
            <span className="flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-medium" title="Jornal en otra institución">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span> [Ext]: Jornal en otra inst.
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
                  rowSpan={2}
                  className="p-2.5 font-bold text-xs uppercase tracking-wider bg-slate-900 border-r border-slate-700 min-w-[210px] w-[210px] sticky left-0 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.15)]"
                >
                  Personal del Servicio
                </th>

                {days.map((day) => {
                  const isWeekend = day.isWeekend;
                  const isHoliday = day.isHoliday;
                  let bgClass = 'bg-slate-800 text-slate-200';
                  if (isHoliday) bgClass = 'bg-rose-900 text-rose-100 font-bold';
                  else if (isWeekend) bgClass = 'bg-amber-900/90 text-amber-100 font-bold';

                  return (
                    <th
                      key={`day-${day.dateStr}`}
                      className={`p-1 text-center font-medium text-[11px] border-r border-slate-700 min-w-[34px] ${bgClass}`}
                      title={`${day.dayNameLong} ${day.dayNumber} ${isHoliday ? `(Feriado: ${day.holidayName})` : ''}`}
                    >
                      <div>{day.dayNameShort}</div>
                      <div className="font-bold text-xs">{day.dayNumber}</div>
                    </th>
                  );
                })}

                {/* Header Groups for Totals */}
                <th colSpan={2} className="p-1 text-center font-bold bg-blue-950 text-blue-100 border-r border-slate-700">
                  Jornal
                </th>
                <th colSpan={2} className="p-1 text-center font-bold bg-emerald-950 text-emerald-100 border-r border-slate-700">
                  Ext. Hábil
                </th>
                <th colSpan={2} className="p-1 text-center font-bold bg-purple-950 text-purple-100 border-r border-slate-700">
                  Inhábiles
                </th>
                <th className="p-1 text-center font-bold bg-emerald-900 text-white border-r border-slate-700">
                  Total
                </th>
                <th className="p-1 text-center font-black bg-slate-950 text-white">
                  TOTAL
                </th>
              </tr>

              {/* Row 2: Subheaders for Totals */}
              <tr className="border-b border-slate-600 text-[10px] text-slate-300">
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
              {schedule.agents.length === 0 && (
                <tr>
                  <td colSpan={days.length + 9} className="py-16 text-center bg-slate-50">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-3 text-slate-500">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <Users className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800">Planilla en Blanco - Sin Personal Cargado</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Este servicio aún no tiene agentes cargados. Puedes agregar el personal a cargo y definir cómo manejan sus guardias haciendo clic en el botón siguiente:
                      </p>
                      <button
                        type="button"
                        onClick={onOpenSettings}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm cursor-pointer transition-all mt-1"
                      >
                        <Plus className="w-4 h-4" />
                        Configurar Servicio y Agregar Personal
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {schedule.agents.map((agent, index) => {
                const stats = calculateAgentStats(agent, schedule, days);
                const isEven = index % 2 === 0;
                const modality = getAgentWorkModality(agent);
                const jTurno = getAgentJornalShift(agent);
                const cTurno = getContraturnoShiftForAgent(agent);

                if (viewMode === 'double') {
                  // VISTA 2 FILAS POR AGENTE: 1 Fila Jornal + 1 Fila Horas Extras (Hábiles / Inhábiles)
                  return (
                    <React.Fragment key={agent.id}>
                      {/* FILA 1: JORNAL ORDINARIO */}
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

                              {/* Work Modality & Shift Badge */}
                              <div className="mt-1 flex items-center gap-1 flex-wrap">
                                {modality === 'solo_guardias' ? (
                                  <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-900 border border-teal-300" title={`Jornal en otra institución: ${agent.externalInstitution || 'Externa'}`}>
                                    🏥 Solo Guardias {agent.externalInstitution ? `(${agent.externalInstitution})` : ''}
                                  </span>
                                ) : modality === 'solo_jornal' ? (
                                  <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300" title="Solo Jornal (Sin horas extras ni guardias)">
                                    ⏱️ Solo Jornal ({jTurno === 'tarde' ? 'Tarde 13-20h' : jTurno === 'noche' ? 'Noche 20-07h' : 'Mañana 06-13h'})
                                  </span>
                                ) : (
                                  <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 border border-blue-300" title="Jornal Ordinario + Guardias en Contraturno">
                                    {jTurno === 'tarde' ? '🌇 Jornal Tarde (13-20)' : jTurno === 'noche' ? '🌙 Jornal Noche (20-07)' : '☀️ Jornal Mañana (06-13)'}
                                  </span>
                                )}

                                {isAgentOnlyInhabilePasiva(agent) && (
                                  <span className="text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded shrink-0" title="Régimen Exclusivo: Únicamente Inhábiles Pasivas">
                                    Solo Inh. Pasivas
                                  </span>
                                )}
                              </div>

                              {/* Row Identification Notes */}
                              <div className="mt-2 pt-1.5 border-t border-slate-200 flex flex-col gap-0.5 text-[9.5px]">
                                <div className="flex items-center gap-1 font-bold text-blue-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                  <span>
                                    {modality === 'solo_guardias' 
                                      ? 'Fila 1: [Jornal Externo]' 
                                      : `Fila 1: Jornal ${jTurno === 'tarde' ? '(13-20)' : jTurno === 'noche' ? '(20-07)' : '(06-13)'}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 font-bold text-emerald-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                  <span>
                                    {modality === 'solo_jornal'
                                      ? 'Fila 2: (Sin Guardias)'
                                      : `Fila 2: Extras ${cTurno === 'manana' ? '(06-13)' : '(13-20)'} / Inháb.`}
                                  </span>
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

                          const shiftCode = assign?.jornalTurno === 'tarde' 
                            ? 'JT (13-20)' 
                            : assign?.jornalTurno === 'noche' 
                            ? 'JN (20-07)' 
                            : (jTurno === 'tarde' ? 'JT (13-20)' : jTurno === 'noche' ? 'JN (20-07)' : 'JM (6-13)');

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
                              title={
                                modality === 'solo_guardias'
                                  ? `Jornal en otra institución (${agent.externalInstitution || 'Externa'})\nNo computa horas de jornal en este hospital.`
                                  : `Jornal Ordinario:\n${agent.name} - ${day.dayNameLong} ${day.dayNumber}\n${hasJornal ? `✓ ${shiftCode} (7 hs)` : 'Descanso / Sin Jornal'}`
                              }
                            >
                              <div className="flex items-center justify-center min-h-[26px]">
                                {modality === 'solo_guardias' ? (
                                  <span className="text-[9px] font-semibold text-teal-800 bg-teal-50 px-1 py-0.2 rounded border border-teal-200" title="Jornal cumplido en otra institución">
                                    [Ext]
                                  </span>
                                ) : hasJornal ? (
                                  <span className="w-full py-0.5 text-[9.5px] font-bold bg-blue-100 text-blue-900 border border-blue-300 rounded leading-tight shadow-2xs">
                                    {shiftCode}
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
                        {/* Celdas Fila 2: Extras (Hábiles en Contraturno o Inhábiles) */}
                        {days.map((day) => {
                          const key = `${agent.id}_${day.dateStr}`;
                          const assign = schedule.assignments[key];
                          const hasExtraHabil = assign?.extraHabil;
                          const hasInhabil24h = assign?.extraInhabil24h;
                          const hasInhabil12h = assign?.extraInhabil12h;
                          const hasInhabilM = assign?.extraInhabilManana;
                          const hasInhabilT = assign?.extraInhabilTarde;
                          const hasAnyExtra = hasExtraHabil || hasInhabil24h || hasInhabil12h || hasInhabilM || hasInhabilT;

                          const isWeekend = day.isWeekend;
                          const isHoliday = day.isHoliday;
                          const isHovered = hoveredCell?.agentId === agent.id && hoveredCell?.dateStr === day.dateStr && hoveredCell?.type === 'extra';

                          let bg = 'bg-slate-50/60';
                          if (isHoliday) bg = 'bg-rose-50/70';
                          else if (isWeekend) bg = 'bg-amber-50/50';

                          const extraCode = assign?.extraHabilTurno === 'manana'
                            ? 'EM (6-13)'
                            : assign?.extraHabilTurno === 'noche'
                            ? 'EN (20-07)'
                            : (cTurno === 'manana' ? 'EM (6-13)' : 'ET (13-20)');

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
                                hasExtraHabil ? `• ${extraCode} (7h)\n` : ''
                              }${hasInhabil24h ? `• Guardia 24hs (${assign?.extraInhabil24hTipo || 'activa'})\n` : ''}${
                                hasInhabil12h ? `• Guardia 12hs (${assign?.extraInhabil12hTipo || 'activa'})\n` : ''
                              }${hasInhabilM ? `• Inhábil Mañana (${assign?.extraInhabilMananaTipo || 'activa'})\n` : ''}${
                                hasInhabilT ? `• Inhábil Tarde (${assign?.extraInhabilTardeTipo || 'activa'})\n` : ''
                              }${!hasAnyExtra ? 'Sin horas extras' : ''}`}
                            >
                              <div className="flex flex-col items-center justify-center gap-0.5 min-h-[30px]">
                                {/* Badge Extra Hábil en Contraturno */}
                                {hasExtraHabil && (
                                  <span className="w-full py-0.5 text-[8.5px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 rounded leading-tight shadow-2xs">
                                    {extraCode}
                                  </span>
                                )}

                                {/* Badge Guardia 24 Horas */}
                                {hasInhabil24h && (
                                  <span 
                                    className={`w-full py-0.5 text-[8.5px] font-black border rounded px-0.5 leading-tight shadow-2xs ${
                                      assign?.extraInhabil24hTipo === 'activa'
                                        ? 'bg-purple-700 text-white border-purple-900'
                                        : 'bg-amber-600 text-white border-amber-800'
                                    }`}
                                  >
                                    {assign?.extraInhabil24hTipo === 'activa' ? 'G24A (24h)' : 'G24P (24h)'}
                                  </span>
                                )}

                                {/* Badge Guardia 12 Horas */}
                                {hasInhabil12h && (
                                  <span 
                                    className={`w-full py-0.5 text-[8.5px] font-bold border rounded px-0.5 leading-tight shadow-2xs ${
                                      assign?.extraInhabil12hTipo === 'activa'
                                        ? 'bg-indigo-100 text-indigo-950 border-indigo-300'
                                        : 'bg-amber-100 text-amber-950 border-amber-300'
                                    }`}
                                  >
                                    {assign?.extraInhabil12hTipo === 'activa' ? 'G12A (12h)' : 'G12P (12h)'}
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
                        <td className="p-1.5 text-center font-black text-emerald-950 bg-emerald-200/90 border-r border-slate-200">
                          {stats.totalHorasExtras}h
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                } else {
                  // VISTA COMPACTA 1 FILA POR AGENTE
                  return (
                    <tr 
                      key={agent.id} 
                      className={`border-b border-slate-200 ${isEven ? 'bg-white' : 'bg-slate-50/80'} hover:bg-emerald-50/30 transition-colors`}
                    >
                      <td 
                        id={`agent-compact-${agent.id}`}
                        className="p-2 sticky left-0 z-10 bg-white border-r border-slate-300 shadow-[2px_0_5px_rgba(0,0,0,0.06)]"
                      >
                        <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                          <span className="truncate">{agent.name}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-normal">{agent.legajo}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate flex items-center justify-between mt-0.5">
                          <span>{agent.roleLabel}</span>
                          <span className="text-[9px] font-semibold text-blue-700">
                            {modality === 'solo_guardias' ? 'Solo Guardias' : modality === 'solo_jornal' ? 'Solo Jornal' : `${jTurno === 'tarde' ? 'J. Tarde' : 'J. Mañana'}`}
                          </span>
                        </div>
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

                        const hasJornal = assign?.jornal && modality !== 'solo_guardias';
                        const hasExtraHabil = assign?.extraHabil && modality !== 'solo_jornal';
                        const hasInhabil24h = assign?.extraInhabil24h && modality !== 'solo_jornal';
                        const hasInhabil12h = assign?.extraInhabil12h && modality !== 'solo_jornal';
                        const hasInhabilM = assign?.extraInhabilManana && modality !== 'solo_jornal';
                        const hasInhabilT = assign?.extraInhabilTarde && modality !== 'solo_jornal';
                        const hasAny = hasJornal || hasExtraHabil || hasInhabil24h || hasInhabil12h || hasInhabilM || hasInhabilT;

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
                          >
                            <div className="flex flex-col items-center justify-center gap-0.5 min-h-[36px]">
                              {hasJornal && (
                                <span className="w-full py-0.2 text-[8px] font-bold bg-blue-100 text-blue-900 border border-blue-200 rounded">
                                  {jTurno === 'tarde' ? 'JT' : 'JM'}
                                </span>
                              )}
                              {hasExtraHabil && (
                                <span className="w-full py-0.2 text-[8px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 rounded">
                                  {cTurno === 'manana' ? 'EM' : 'ET'}
                                </span>
                              )}
                              {hasInhabil24h && (
                                <span className={`w-full py-0.2 text-[8px] font-black rounded ${
                                  assign?.extraInhabil24hTipo === 'activa'
                                    ? 'bg-purple-700 text-white border border-purple-900'
                                    : 'bg-amber-600 text-white border border-amber-800'
                                }`}>
                                  {assign?.extraInhabil24hTipo === 'activa' ? '24h ACT' : '24h PAS'}
                                </span>
                              )}
                              {hasInhabil12h && (
                                <span className={`w-full py-0.2 text-[8px] font-bold rounded ${
                                  assign?.extraInhabil12hTipo === 'activa'
                                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                                }`}>
                                  {assign?.extraInhabil12hTipo === 'activa' ? '12h ACT' : '12h PAS'}
                                </span>
                              )}
                              {hasInhabilM && (
                                <span className={`w-full py-0.2 text-[8px] font-bold rounded ${
                                  assign?.extraInhabilMananaTipo === 'activa' 
                                    ? 'bg-purple-100 text-purple-900 border border-purple-200' 
                                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                                }`}>
                                  {assign?.extraInhabilMananaTipo === 'activa' ? 'IAM' : 'IPM'}
                                </span>
                              )}
                              {hasInhabilT && (
                                <span className={`w-full py-0.2 text-[8px] font-bold rounded ${
                                  assign?.extraInhabilTardeTipo === 'activa' 
                                    ? 'bg-purple-100 text-purple-900 border border-purple-200' 
                                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                                }`}>
                                  {assign?.extraInhabilTardeTipo === 'activa' ? 'IAT' : 'IPT'}
                                </span>
                              )}
                              {!hasAny && (
                                <span className="text-slate-300 font-mono text-[10px]">-</span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Totales Compactos */}
                      <td className="p-1 text-center font-bold text-blue-900 bg-blue-50 border-r border-slate-200">{stats.diasJornal}</td>
                      <td className="p-1 text-center font-black text-blue-950 bg-blue-100 border-r border-slate-200">{stats.horasJornal}h</td>
                      <td className="p-1 text-center font-bold text-emerald-900 bg-emerald-50 border-r border-slate-200">{stats.diasExtraHabil}</td>
                      <td className="p-1 text-center font-black text-emerald-950 bg-emerald-100 border-r border-slate-200">{stats.horasExtraHabil}h</td>
                      <td className="p-1 text-center font-bold text-purple-900 bg-purple-100/60 border-r border-slate-200">{stats.horasInhabilActiva}h</td>
                      <td className="p-1 text-center font-bold text-amber-900 bg-amber-100/60 border-r border-slate-200">{stats.horasInhabilPasiva}h</td>
                      <td className="p-1 text-center font-black text-emerald-950 bg-emerald-200 border-r border-slate-200">{stats.totalHorasExtras}h</td>
                      <td className="p-1 text-center font-black text-slate-900 bg-slate-200">{stats.totalHorasMes}h</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
