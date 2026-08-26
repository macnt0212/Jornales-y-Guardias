import React from 'react';
import { 
  Calendar as CalendarIcon, 
  FileSpreadsheet, 
  Printer, 
  Sparkles, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Hospital,
  Clock,
  CheckCircle2,
  Users,
  Download,
  FileText
} from 'lucide-react';
import { MONTH_NAMES } from '../utils/calendar';
import { MonthSchedule, DayInfo } from '../types';

interface HeaderProps {
  schedule: MonthSchedule;
  days: DayInfo[];
  totalJornalHours: number;
  totalExtHabilHours: number;
  totalInhabActivaHours: number;
  totalInhabPasivaHours: number;
  onMonthChange: (year: number, month: number) => void;
  onGenerateBalanced: () => void;
  onExportExcel: () => void;
  onExportExcelVisual?: () => void;
  onExportVisualHtml?: () => void;
  onExportWord?: () => void;
  onPrint: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  activeTab: 'matriz' | 'inhabiles' | 'detalle' | 'liquidacion';
  setActiveTab: (tab: 'matriz' | 'inhabiles' | 'detalle' | 'liquidacion') => void;
}

export const Header: React.FC<HeaderProps> = ({
  schedule,
  days,
  totalJornalHours,
  totalExtHabilHours,
  totalInhabActivaHours,
  totalInhabPasivaHours,
  onMonthChange,
  onGenerateBalanced,
  onExportExcel,
  onExportExcelVisual,
  onExportVisualHtml,
  onExportWord,
  onPrint,
  onReset,
  onOpenSettings,
  activeTab,
  setActiveTab,
}) => {
  const currentMonthIndex = schedule.month - 1;

  const handlePrevMonth = () => {
    if (schedule.month === 1) {
      onMonthChange(schedule.year - 1, 12);
    } else {
      onMonthChange(schedule.year, schedule.month - 1);
    }
  };

  const handleNextMonth = () => {
    if (schedule.month === 12) {
      onMonthChange(schedule.year + 1, 1);
    } else {
      onMonthChange(schedule.year, schedule.month + 1);
    }
  };

  const totalExtrasHours = totalExtHabilHours + totalInhabActivaHours + totalInhabPasivaHours;
  const totalGeneralHours = totalJornalHours + totalExtrasHours;

  const years = [2025, 2026, 2027, 2028];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Institutional Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                  Gobierno de Formosa • MDH
                </span>
                <span className="text-[11px] text-slate-400">
                  Hospital Central de Emergencias
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Servicio de Informática y Estadística
              </h1>
              <p className="text-xs text-slate-300">
                Planilla Oficial de Control de Jornal (06-13 hs) y Horas Extras (13-20 hs / Inhábiles)
              </p>
            </div>
          </div>

          {/* Month and Year Quick Selector */}
          <div className="flex items-center gap-2 bg-slate-800/95 p-1.5 rounded-lg border border-slate-700 shadow-inner">
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wider pl-1.5 pr-0.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Período:</span>
            </div>

            <button
              onClick={handlePrevMonth}
              id="btn-prev-month"
              aria-label="Mes anterior"
              title="Mes anterior (actualiza fechas y rotación)"
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-0.5">
              <select
                id="select-month"
                value={schedule.month}
                onChange={(e) => onMonthChange(schedule.year, Number(e.target.value))}
                title="Selecciona el mes para actualizar automáticamente fechas y días"
                className="bg-slate-900 text-white text-xs sm:text-sm font-bold py-1 px-2.5 rounded border border-emerald-600/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                id="select-year"
                value={schedule.year}
                onChange={(e) => onMonthChange(Number(e.target.value), schedule.month)}
                title="Selecciona el año"
                className="bg-slate-900 text-white text-xs sm:text-sm font-bold py-1 px-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              id="btn-next-month"
              aria-label="Mes siguiente"
              title="Mes siguiente (actualiza fechas y rotación)"
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Action Bar & Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0" aria-label="Tabs">
            <button
              id="tab-matriz"
              onClick={() => setActiveTab('matriz')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'matriz'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Planilla Matriz Excel
            </button>

            <button
              id="tab-inhabiles"
              onClick={() => setActiveTab('inhabiles')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'inhabiles'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              Guardias Inhábiles (Activas / Pasivas)
            </button>

            <button
              id="tab-detalle"
              onClick={() => setActiveTab('detalle')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'detalle'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Fichas Individuales de Agentes
            </button>

            <button
              id="tab-liquidacion"
              onClick={() => setActiveTab('liquidacion')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'liquidacion'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Resumen Liquidación RRHH
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-generate-rotation"
              onClick={onGenerateBalanced}
              title="Genera automáticamente la rotación: 1 Soporte + 1 SIGHO por día hábil (alternando 2 y 3 días semanales) y turnos de fines de semana"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded shadow transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Rotación Equitativa Automática
            </button>

            {/* Excel con Formato Visual (Compatible con Excel, no se desconfigura) */}
            <button
              id="btn-export-excel-visual"
              onClick={onExportExcelVisual || onExportExcel}
              title="Descargar Planilla con Formato Visual 100% compatible con Microsoft Excel (.xls): no se desconfiguran los colores, 2 filas por agente, bordes y totales"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded shadow transition-all cursor-pointer ring-1 ring-emerald-400/40"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel Formato Visual (.xls)
            </button>

            <button
              id="btn-export-word"
              onClick={onExportWord}
              title="Descarga la planilla editable en Microsoft Word (.doc) con tabla, colores, 2 filas por agente y firmas"
              className="flex items-center gap-1.5 bg-sky-700 hover:bg-sky-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded shadow transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Word (.doc)
            </button>

            <button
              id="btn-export-visual-html"
              onClick={onExportVisualHtml}
              title="Descarga la planilla con el formato visual 100% exacto, colores, doble fila y diseño inalterable (abre en navegador o guarda como PDF)"
              className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded shadow transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Web / PDF (.html)
            </button>

            <button
              id="btn-export-excel"
              onClick={onExportExcel}
              title="Descargar libro de cálculo estándar (.xlsx) para procesamiento de fórmulas numéricas"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-2 py-1.5 rounded border border-slate-700 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
              Excel (.xlsx)
            </button>

            <button
              id="btn-print-report"
              onClick={onPrint}
              title="Imprimir o Guardar directamente en PDF sin perder formato"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded border border-slate-700 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              Imprimir / PDF
            </button>

            <button
              id="btn-settings"
              onClick={onOpenSettings}
              title="Modificar nombres de los agentes, legajos, categorías y feriados del mes"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded border border-emerald-600/40 hover:border-emerald-500 transition-all cursor-pointer shadow-xs"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
              Editar Agentes y Feriados
            </button>

            <button
              id="btn-reset-schedule"
              onClick={onReset}
              title="Limpiar todas las asignaciones del mes"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="bg-slate-950/70 border-t border-slate-800 px-4 py-2 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-slate-300">
          <div className="flex items-center gap-4">
            <span className="font-medium text-slate-400">
              Resumen Global Mes ({MONTH_NAMES[currentMonthIndex]} {schedule.year}):
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Jornal Ordinario: <strong className="text-white font-semibold">{totalJornalHours} hs</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Extras Hábiles: <strong className="text-white font-semibold">{totalExtHabilHours} hs</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Inhábiles Activas: <strong className="text-white font-semibold">{totalInhabActivaHours} hs</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Inhábiles Pasivas: <strong className="text-white font-semibold">{totalInhabPasivaHours} hs</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded border border-slate-700">
              Total Extras: <strong className="text-emerald-400 font-bold">{totalExtrasHours} hs</strong>
            </span>
            <span className="bg-emerald-950/80 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-700/60">
              Total Horas Servicio: <strong className="text-white font-bold">{totalGeneralHours} hs</strong>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
