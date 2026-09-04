import React, { useState, useRef, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Sparkles, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Hospital,
  Clock,
  CheckCircle2,
  Users,
  Download,
  FileText,
  Building2,
  ShieldCheck,
  LogOut,
  Lock,
  UserCheck,
  UserPlus,
  Crown,
  BookOpen,
  ChevronDown,
  Globe,
  Calendar,
  Trash2,
  Layers,
  Award,
  Timer
} from 'lucide-react';
import { MONTH_NAMES } from '../utils/calendar';
import { MonthSchedule, DayInfo, HospitalServiceItem, UserAccount } from '../types';

interface HeaderProps {
  schedule: MonthSchedule;
  days: DayInfo[];
  totalJornalHours: number;
  totalExtHabilHours: number;
  totalInhabActivaHours: number;
  totalInhabPasivaHours: number;
  services?: HospitalServiceItem[];
  activeServiceId?: string;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onOpenUserManager?: () => void;
  onOpenCreateUser?: () => void;
  onSelectService?: (serviceId: string) => void;
  onOpenServiceManager?: () => void;
  onOpenManual?: () => void;
  onExportBlankExcel?: () => void;
  onMonthChange: (year: number, month: number) => void;
  onGenerateBalanced: () => void;
  onApplyOfficialPolicy?: () => void;
  onClearAllMonth?: () => void;
  onClearAllExtrasMonth?: () => void;
  onClearAllJornalesMonth?: () => void;
  onExportExcel: () => void;
  onExportExcelVisual?: () => void;
  onExportVisualHtml?: () => void;
  onExportWord?: () => void;
  onPrint: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  onOpenRecargoRanges?: () => void;
  activeTab: 'matriz' | 'inhabiles' | 'detalle' | 'liquidacion' | 'consolidado_rrhh';
  setActiveTab: (tab: 'matriz' | 'inhabiles' | 'detalle' | 'liquidacion' | 'consolidado_rrhh') => void;
}

const SHORT_MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export const Header: React.FC<HeaderProps> = ({
  schedule,
  days,
  totalJornalHours,
  totalExtHabilHours,
  totalInhabActivaHours,
  totalInhabPasivaHours,
  services = [],
  activeServiceId = '',
  currentUser,
  onLogout,
  onOpenUserManager,
  onOpenCreateUser,
  onSelectService,
  onOpenServiceManager,
  onOpenManual,
  onExportBlankExcel,
  onMonthChange,
  onGenerateBalanced,
  onApplyOfficialPolicy,
  onClearAllMonth,
  onClearAllExtrasMonth,
  onClearAllJornalesMonth,
  onExportExcel,
  onExportExcelVisual,
  onExportVisualHtml,
  onExportWord,
  onPrint,
  onReset,
  onOpenSettings,
  onOpenRecargoRanges,
  activeTab,
  setActiveTab,
}) => {
  const currentMonthIndex = schedule.month - 1;
  const isRRHH = currentUser?.role === 'rrhh';

  // Dropdown states
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isShiftsMenuOpen, setIsShiftsMenuOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // References to close on outside click
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const shiftsMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (monthPickerRef.current && !monthPickerRef.current.contains(target)) {
        setIsMonthPickerOpen(false);
      }
      if (shiftsMenuRef.current && !shiftsMenuRef.current.contains(target)) {
        setIsShiftsMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(target)) {
        setIsExportOpen(false);
      }
      if (adminMenuRef.current && !adminMenuRef.current.contains(target)) {
        setIsAdminOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calendar calculations
  const currentRealDate = new Date();
  const currentRealMonth = currentRealDate.getMonth() + 1;
  const currentRealYear = currentRealDate.getFullYear();

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

  const handleSelectCurrentMonth = () => {
    onMonthChange(currentRealYear, currentRealMonth);
    setIsMonthPickerOpen(false);
  };

  const availableYears = [2025, 2026, 2027, 2028];

  const businessDaysCount = days.filter(d => !d.isWeekend && !d.isHoliday).length;
  const nonBusinessDaysCount = days.filter(d => d.isWeekend || d.isHoliday).length;
  const totalExtrasHours = totalExtHabilHours + totalInhabActivaHours + totalInhabPasivaHours;
  const totalGeneralHours = totalJornalHours + totalExtrasHours;

  const isInformatica = schedule.serviceId === 'serv_informatica' || 
    (schedule.serviceConfig?.serviceName || '').toLowerCase().includes('informát') || 
    (schedule.serviceConfig?.serviceName || '').toLowerCase().includes('informat');

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md no-print select-none">
      
      {/* ────────────────────────────────────────────────────────────────
          NIVEL 1: BARRA INSTITUCIONAL Y CONTEXTO OPERATIVO
          - Izquierda: Hospital + Servicio Activo
          - Centro: Selector de Período (Mes/Año Integrado con Popover)
          - Derecha: Perfil de Operador + Ayuda + Salir
          ──────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* 1.1 IDENTIDAD Y SERVICIO HOSPITALARIO */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shrink-0 ring-1 ring-emerald-400/40">
              <Hospital className="w-5 h-5" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/50">
                  {schedule.serviceConfig?.hospitalSubtitle || 'MDH • Gobierno de Formosa'}
                </span>
                <span className="text-[11px] text-slate-400 hidden xl:inline">
                  • {schedule.serviceConfig?.hospitalName || 'Hospital Central de Emergencias'}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                {isRRHH && services.length > 0 && onSelectService ? (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <select
                      id="select-service-top"
                      value={activeServiceId}
                      onChange={(e) => onSelectService(e.target.value)}
                      title="Seleccionar Servicio Hospitalario"
                      className="bg-slate-800 text-emerald-300 text-xs font-bold py-0.5 px-2 rounded border border-emerald-600/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-[200px] truncate"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.config.serviceName || s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white truncate">
                    {schedule.serviceConfig?.serviceName || 'Servicio Hospitalario'}
                  </h1>
                )}

                {isRRHH ? (
                  <span className="text-[10px] font-bold bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700/60 hidden sm:inline-flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5 text-amber-400" />
                    Supervisión RRHH
                  </span>
                ) : (
                  <span className="text-[10px] font-medium bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 hidden sm:inline-flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-emerald-400" />
                    Planilla Aislada
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 1.2 SELECTOR CENTRAL DE PERÍODO (MES Y AÑO) - Limpio, directo y sin estorbar */}
          <div className="relative order-3 sm:order-2 mx-auto sm:mx-0" ref={monthPickerRef}>
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 shadow-inner">
              <button
                type="button"
                id="btn-prev-month-nav"
                onClick={handlePrevMonth}
                title="Mes anterior"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="btn-open-month-popover"
                onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-extrabold text-white hover:text-emerald-300 rounded-md transition-colors cursor-pointer"
                title="Haga clic para cambiar de mes o año rápidamente"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{MONTH_NAMES[schedule.month - 1]} {schedule.year}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isMonthPickerOpen ? 'rotate-180' : ''}`} />
              </button>

              <button
                type="button"
                id="btn-next-month-nav"
                onClick={handleNextMonth}
                title="Mes siguiente"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* POPOVER DESPLEGABLE DE MESES Y AÑOS */}
            {isMonthPickerOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-72 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Cambiar Período
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectCurrentMonth}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60"
                  >
                    Ir a Hoy
                  </button>
                </div>

                {/* Selector de Años */}
                <div className="grid grid-cols-4 gap-1 mb-2.5">
                  {availableYears.map(year => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => onMonthChange(year, schedule.month)}
                      className={`py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                        schedule.year === year
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>

                {/* Selector de 12 Meses */}
                <div className="grid grid-cols-3 gap-1">
                  {MONTH_NAMES.map((name, idx) => {
                    const monthNum = idx + 1;
                    const isSelected = schedule.month === monthNum;
                    const isCurrentReal = currentRealYear === schedule.year && currentRealMonth === monthNum;

                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          onMonthChange(schedule.year, monthNum);
                          setIsMonthPickerOpen(false);
                        }}
                        className={`py-1.5 px-2 text-xs font-semibold rounded text-center transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {SHORT_MONTHS[idx]}
                        {isCurrentReal && (
                          <span className={`w-1.5 h-1.5 rounded-full absolute top-1 right-1 ${isSelected ? 'bg-amber-300' : 'bg-emerald-400'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 1.3 PERFIL DE OPERADOR, MANUAL Y SALIDA */}
          <div className="flex items-center gap-2 order-2 sm:order-3 shrink-0">
            {currentUser && (
              <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                  isRRHH ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block text-left leading-tight">
                  <div className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isRRHH ? 'Supervisión' : 'Jefe de Servicio'}
                  </div>
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Cerrar sesión de forma segura"
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700/80 rounded transition-colors cursor-pointer ml-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {onOpenManual && (
              <button
                onClick={onOpenManual}
                title="Manual de Operaciones y Flujo Oficial (PDF)"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline">Manual</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────
          NIVEL 2: BARRA DE NAVEGACIÓN PRINCIPAL (MENÚ DE PESTAÑAS)
          Ocupa todo el ancho de la pantalla sin desborde horizontal ni barras de desplazamiento
          ──────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 flex-wrap" aria-label="Menú Principal del Sistema">
            <button
              id="tab-matriz"
              onClick={() => setActiveTab('matriz')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'matriz'
                  ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Planilla Matriz</span>
            </button>

            <button
              id="tab-inhabiles"
              onClick={() => setActiveTab('inhabiles')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'inhabiles'
                  ? 'bg-amber-600 text-white shadow-md ring-1 ring-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-300" />
              <span>Guardias Inhábiles</span>
            </button>

            <button
              id="tab-liquidacion"
              onClick={() => setActiveTab('liquidacion')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'liquidacion'
                  ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-indigo-300" />
              <span>Resumen Liquidación</span>
            </button>

            <button
              id="tab-detalle"
              onClick={() => setActiveTab('detalle')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'detalle'
                  ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-blue-300" />
              <span>Fichas de Agentes</span>
            </button>

            {isRRHH && (
              <button
                id="tab-consolidado-rrhh"
                onClick={() => setActiveTab('consolidado_rrhh')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'consolidado_rrhh'
                    ? 'bg-amber-700 text-white shadow-md ring-1 ring-amber-400'
                    : 'text-amber-300 hover:text-white hover:bg-amber-950/70 border border-amber-700/50'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Consolidado RRHH</span>
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────
          NIVEL 3: BARRA DE ACCIONES OPERATIVAS (TURNOS, PERSONAL, EXPORTAR, ADMIN)
          Ubicada más abajo, con espacio dedicado y métricas del servicio
          ──────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-950/90 px-4 py-2 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* BOTONES DE OPERACIÓN DIRECTA */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* GRUPO A: MENÚ DE TURNOS Y ROTACIÓN */}
            <div className="relative" ref={shiftsMenuRef}>
              <button
                id="btn-shifts-operations"
                type="button"
                onClick={() => setIsShiftsMenuOpen(!isShiftsMenuOpen)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg border border-slate-700 shadow-xs transition-all cursor-pointer"
                title="Opciones de carga, rotación automática y vaciado de turnos"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Turnos</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isShiftsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isShiftsMenuOpen && (
                <div 
                  className="absolute left-0 mt-1.5 w-64 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsShiftsMenuOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Operaciones de Turnos ({MONTH_NAMES[schedule.month - 1]})
                  </div>

                  {/* Rotación Equitativa */}
                  <button
                    onClick={onGenerateBalanced}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer text-emerald-300"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold">Rotación Automática</div>
                      <div className="text-[10px] text-slate-400">Distribución equitativa según nómina</div>
                    </div>
                  </button>

                  {/* Regla Oficial Duplas (si es Informática) */}
                  {isInformatica && onApplyOfficialPolicy && (
                    <button
                      onClick={onApplyOfficialPolicy}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer text-amber-300 border-t border-slate-800"
                    >
                      <Award className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold">Aplicar Duplas Oficiales</div>
                        <div className="text-[10px] text-slate-400">Cantero (Activa), Escobar/Galeano/Amarilla</div>
                      </div>
                    </button>
                  )}

                  <div className="border-t border-slate-800 my-1" />
                  <div className="px-3 py-1 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                    Vaciar / Borrar Celdas
                  </div>

                  {onClearAllExtrasMonth && (
                    <button
                      onClick={onClearAllExtrasMonth}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 flex items-center gap-2 text-rose-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Borrar solo horas extras</span>
                    </button>
                  )}

                  {onClearAllJornalesMonth && (
                    <button
                      onClick={onClearAllJornalesMonth}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Borrar solo jornales hábiles</span>
                    </button>
                  )}

                  <button
                    onClick={onReset}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-rose-950/60 flex items-center gap-2 text-rose-400 font-bold border-t border-slate-800/80 cursor-pointer mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Vaciar todo el mes (dejar en blanco)</span>
                  </button>
                </div>
              )}
            </div>

            {/* GRUPO B: NÓMINA DE PERSONAL */}
            <button
              id="btn-settings-personal"
              onClick={onOpenSettings}
              title="Configurar personal del servicio, jornales ordinarios y contraturno"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg border border-slate-700 shadow-xs transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>Personal ({schedule.agents.length})</span>
            </button>

            {/* GRUPO C: RANGOS DE HORARIOS DE RECARGOS (Hábiles, Inhábiles Activas y Pasivas) */}
            {onOpenRecargoRanges && (
              <button
                id="btn-recargo-ranges"
                onClick={onOpenRecargoRanges}
                title="Configurar y agregar rangos de horarios de recargos (hábiles, inhábiles activas y pasivas)"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg border border-slate-700 shadow-xs transition-all cursor-pointer"
              >
                <Timer className="w-4 h-4 text-purple-400" />
                <span>Rangos de Recargos</span>
              </button>
            )}

            {/* GRUPO D: EXPORTAR / IMPRIMIR (Menú Unificado) */}
            <div className="relative" ref={exportMenuRef}>
              <button
                id="btn-export-dropdown"
                type="button"
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExportOpen && (
                <div 
                  className="absolute left-0 mt-1.5 w-64 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsExportOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Formatos Oficiales ({MONTH_NAMES[schedule.month - 1]})
                  </div>

                  {/* Excel Formato Visual (.xls) */}
                  <button
                    onClick={onExportExcelVisual || onExportExcel}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer text-emerald-300"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold flex items-center gap-1">
                        Excel Visual (.xls)
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1 rounded border border-emerald-800">Recomendado</span>
                      </div>
                      <div className="text-[10px] text-slate-400">100% idéntico con formato y colores</div>
                    </div>
                  </button>

                  {/* Excel Básico (.xlsx) */}
                  <button
                    onClick={onExportExcel}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer text-slate-200 border-t border-slate-800/80"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <div className="font-bold">Excel Estándar (.xlsx)</div>
                      <div className="text-[10px] text-slate-400">Libro nativo con datos de turnos</div>
                    </div>
                  </button>

                  {/* Word (.doc) */}
                  <button
                    onClick={onExportWord}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer text-sky-300 border-t border-slate-800/80"
                  >
                    <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <div className="font-bold">Word Editable (.doc)</div>
                      <div className="text-[10px] text-slate-400">Tabla editable en Microsoft Word</div>
                    </div>
                  </button>

                  {/* Web / PDF exacto (.html) */}
                  <button
                    onClick={onExportVisualHtml}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer text-blue-300 border-t border-slate-800/80"
                  >
                    <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="font-bold">Página Web / PDF (.html)</div>
                      <div className="text-[10px] text-slate-400">Abre en navegador o guarda como PDF</div>
                    </div>
                  </button>

                  {/* Imprimir */}
                  <button
                    onClick={onPrint}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer text-slate-200 border-t border-slate-800/80"
                  >
                    <Printer className="w-4 h-4 text-slate-300 shrink-0" />
                    <div>
                      <div className="font-bold">Imprimir Planilla</div>
                      <div className="text-[10px] text-slate-400">Diálogo de impresión directa</div>
                    </div>
                  </button>

                  {/* Plantilla en Blanco (.xlsx) */}
                  {onExportBlankExcel && (
                    <button
                      onClick={onExportBlankExcel}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer text-amber-300 border-t border-slate-800"
                    >
                      <Download className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold">Plantilla en Blanco (.xlsx)</div>
                        <div className="text-[10px] text-slate-400">Descargar formato vacío sin turnos</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* GRUPO D: ADMINISTRACIÓN RRHH (Solo si el usuario es RRHH) */}
            {isRRHH && (
              <div className="relative" ref={adminMenuRef}>
                <button
                  id="btn-admin-dropdown"
                  type="button"
                  onClick={() => setIsAdminOpen(!isAdminOpen)}
                  className="flex items-center gap-2 bg-amber-950/80 hover:bg-amber-900 text-amber-300 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg border border-amber-700/60 transition-all cursor-pointer"
                  title="Herramientas de Administración RRHH"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Admin</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAdminOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAdminOpen && (
                  <div 
                    className="absolute left-0 mt-1.5 w-56 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setIsAdminOpen(false)}
                  >
                    <div className="px-3 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800">
                      Gestión RRHH Hospitalaria
                    </div>

                    {onOpenCreateUser && (
                      <button
                        onClick={onOpenCreateUser}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 font-medium cursor-pointer text-slate-200"
                      >
                        <UserPlus className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="font-bold">Dar de Alta Usuario</div>
                          <div className="text-[10px] text-slate-400">Crear cuenta de acceso a jefe</div>
                        </div>
                      </button>
                    )}

                    {onOpenUserManager && (
                      <button
                        onClick={onOpenUserManager}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 font-medium cursor-pointer text-slate-200 border-t border-slate-800/80"
                      >
                        <UserCheck className="w-4 h-4 text-amber-400" />
                        <div>
                          <div className="font-bold">Cuentas de Jefes</div>
                          <div className="text-[10px] text-slate-400">Modificar claves y permisos</div>
                        </div>
                      </button>
                    )}

                    {onOpenServiceManager && (
                      <button
                        onClick={onOpenServiceManager}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 font-medium cursor-pointer text-slate-200 border-t border-slate-800/80"
                      >
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-bold">Servicios del Hospital</div>
                          <div className="text-[10px] text-slate-400">Crear o editar servicios</div>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* MÉTRICAS Y HORAS CLAVE DEL MES */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
            <div className="flex items-center gap-1.5 text-[11px] bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span className="text-slate-400">Jornal:</span>
              <span className="text-white font-bold">{totalJornalHours}h</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400">Ext. Háb:</span>
              <span className="text-white font-bold">{totalExtHabilHours}h</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span className="text-slate-400">Inh. Act:</span>
              <span className="text-white font-bold">{totalInhabActivaHours}h</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-slate-400">Inh. Pas:</span>
              <span className="text-white font-bold">{totalInhabPasivaHours}h</span>
            </div>

            <div className="bg-emerald-950 text-emerald-200 px-2.5 py-1 rounded border border-emerald-800/80 font-bold text-xs">
              Total: <strong className="text-white font-black">{totalGeneralHours}h</strong>
            </div>
          </div>

        </div>
      </div>

    </header>
  );
};
