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
  FileText,
  Building2,
  Plus,
  Layers,
  ShieldCheck,
  User,
  LogOut,
  Lock,
  BarChart3,
  UserCheck,
  UserPlus,
  Crown,
  BookOpen
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
  onExportExcel: () => void;
  onExportExcelVisual?: () => void;
  onExportVisualHtml?: () => void;
  onExportWord?: () => void;
  onPrint: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  activeTab: 'matriz' | 'inhabiles' | 'detalle' | 'liquidacion' | 'consolidado_rrhh';
  setActiveTab: (tab: 'matriz' | 'inhabiles' | 'detalle' | 'liquidacion' | 'consolidado_rrhh') => void;
}

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
  const isRRHH = currentUser?.role === 'rrhh';

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
      {/* Top Institutional Banner with User Info & Access Control */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Hospital Brand */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shrink-0 ring-1 ring-emerald-400/30">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                  {schedule.serviceConfig?.hospitalSubtitle || 'Gobierno de Formosa • MDH'}
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[320px]">
                  {schedule.serviceConfig?.hospitalName || 'Hospital Central de Emergencias "Dr. Ramón Carrillo"'}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                {schedule.serviceConfig?.serviceName || 'Servicio Hospitalario'}
              </h1>
              <p className="text-xs text-slate-300">
                Planilla de Control de Jornal ({schedule.serviceConfig?.jornalHorarioLabel || '06-13 hs'}) y Horas Extras ({schedule.serviceConfig?.extraHabilHorarioLabel || '13-20 hs'} / Inhábiles)
              </p>
            </div>
          </div>

          {/* Right Area: User Badge, Service Switcher & Month Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* User Session Profile Badge */}
            {currentUser && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-inner ${
                isRRHH ? 'bg-amber-950/40 border-amber-600/50 ring-1 ring-amber-500/20' : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className={`p-1 rounded-lg ${isRRHH ? 'bg-amber-600/20 text-amber-400' : 'bg-blue-600/20 text-blue-400'}`}>
                  {isRRHH ? <Crown className="w-4 h-4 text-amber-400" /> : <User className="w-4 h-4" />}
                </div>
                <div className="min-w-0 max-w-[160px] sm:max-w-[200px]">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                    <span>{currentUser.fullName}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold truncate flex items-center gap-1">
                    {isRRHH ? (
                      <span className="bg-amber-950 px-1.5 py-0.2 rounded border border-amber-700/60 text-amber-300 font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        Admin General RRHH
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5 text-amber-400" />
                        Planilla Aislada
                      </span>
                    )}
                  </div>
                </div>

                {isRRHH && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={onOpenCreateUser || onOpenUserManager}
                      title="Dar de alta nuevo usuario para cargar guardias"
                      className="p-1 bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 hover:text-white rounded border border-emerald-700/60 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                    {onOpenUserManager && (
                      <button
                        onClick={onOpenUserManager}
                        title="Administrar cuentas y contraseñas de jefes"
                        className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    )}
                  </div>
                )}

                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Cerrar sesión"
                    className="p-1 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 rounded transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Service Switcher / Locked Status */}
            {services.length > 0 && (
              <div className={`flex items-center gap-1.5 p-1 rounded-lg border shadow-xs ${
                isRRHH ? 'bg-slate-800/90 border-emerald-500/40' : 'bg-slate-950/90 border-slate-700'
              }`}>
                <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider pl-1.5 pr-0.5 text-slate-300">
                  {isRRHH ? (
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="hidden xl:inline">{isRRHH ? 'Servicio:' : 'Mi Servicio:'}</span>
                </div>

                {isRRHH && onSelectService ? (
                  <>
                    <select
                      id="select-service-header"
                      value={activeServiceId}
                      onChange={(e) => onSelectService(e.target.value)}
                      title="Cambiar de servicio hospitalario activo (Supervisión RRHH)"
                      className="bg-slate-900 text-emerald-300 text-xs sm:text-sm font-bold py-1 px-2.5 rounded border border-emerald-600/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.config.serviceName || s.name}
                        </option>
                      ))}
                    </select>

                    {onOpenServiceManager && (
                      <button
                        onClick={onOpenServiceManager}
                        title="Administrar todos los servicios o crear uno nuevo en blanco"
                        className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                      >
                        <Layers className="w-4 h-4 text-emerald-400" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="px-2 py-1 text-xs font-bold text-amber-300 bg-slate-900 rounded border border-slate-800 truncate max-w-[180px] sm:max-w-[220px]">
                    {schedule.serviceConfig?.serviceName || 'Servicio Protegido'}
                  </div>
                )}
              </div>
            )}

            {/* Month and Year Quick Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/95 p-1 rounded-lg border border-slate-700 shadow-inner">
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 pr-0.5">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Mes:</span>
              </div>

              <button
                onClick={handlePrevMonth}
                id="btn-prev-month"
                aria-label="Mes anterior"
                title="Mes anterior"
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                <select
                  id="select-month"
                  value={schedule.month}
                  onChange={(e) => onMonthChange(schedule.year, Number(e.target.value))}
                  title="Selecciona el mes"
                  className="bg-slate-900 text-white text-xs sm:text-sm font-bold py-1 px-2 rounded border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
                  className="bg-slate-900 text-white text-xs sm:text-sm font-bold py-1 px-2 rounded border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
                title="Mes siguiente"
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

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
              Guardias Inhábiles
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
              Fichas Individuales
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
              Liquidación del Servicio
            </button>

            {isRRHH && (
              <button
                id="tab-consolidado-rrhh"
                onClick={() => setActiveTab('consolidado_rrhh')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'consolidado_rrhh'
                    ? 'bg-amber-700 text-white shadow-sm ring-1 ring-amber-400'
                    : 'text-amber-300 hover:text-white hover:bg-amber-950 border border-amber-700/50'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-400" />
                Consolidado Hospitalario (RRHH)
              </button>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Direct button: Create/Manage Users (Only for RRHH) */}
            {isRRHH && (
              <button
                id="btn-create-user-header"
                onClick={onOpenCreateUser || onOpenUserManager}
                title="Dar de alta un nuevo usuario o jefe de servicio para cargar guardias"
                className="flex items-center gap-1.5 bg-amber-800 hover:bg-amber-700 text-amber-100 text-xs font-bold px-3 py-1.5 rounded border border-amber-600/70 shadow-xs transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                Dar de Alta Usuario
              </button>
            )}

            {/* Direct button: Create/Manage Services (Only for RRHH) */}
            {isRRHH && onOpenServiceManager && (
              <button
                id="btn-services-manager"
                onClick={onOpenServiceManager}
                title="Administrar servicios hospitalarios o crear nuevos en blanco"
                className="flex items-center gap-1.5 bg-teal-800 hover:bg-teal-700 text-emerald-200 text-xs font-bold px-3 py-1.5 rounded border border-teal-600/60 shadow-xs transition-all cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Gestión Servicios
              </button>
            )}

            <button
              id="btn-generate-rotation"
              onClick={onGenerateBalanced}
              title="Genera automáticamente la rotación equitativa para el personal registrado en este servicio"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded shadow transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Rotación Automática
            </button>

            {/* Excel Formato Visual */}
            <button
              id="btn-export-excel-visual"
              onClick={onExportExcelVisual || onExportExcel}
              title="Descargar Planilla con Formato Visual 100% compatible con Microsoft Excel (.xls)"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded shadow transition-all cursor-pointer ring-1 ring-emerald-400/40"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel Visual (.xls)
            </button>

            {/* Blank Excel Template Download */}
            {onExportBlankExcel && (
              <button
                id="btn-export-blank-excel"
                onClick={onExportBlankExcel}
                title="Descargar una Plantilla de Excel 100% en blanco para que el Jefe de Servicio complete manualmente"
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold px-2.5 py-1.5 rounded border border-emerald-600/50 shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Excel en Blanco (.xlsx)
              </button>
            )}

            <button
              id="btn-export-word"
              onClick={onExportWord}
              title="Descarga la planilla editable en Microsoft Word (.doc)"
              className="flex items-center gap-1.5 bg-sky-800 hover:bg-sky-700 text-white text-xs font-semibold px-2 py-1.5 rounded shadow transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Word (.doc)
            </button>

            <button
              id="btn-export-visual-html"
              onClick={onExportVisualHtml}
              title="Descarga la planilla con el formato visual 100% exacto para abrir en navegador o guardar en PDF"
              className="flex items-center gap-1.5 bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold px-2 py-1.5 rounded shadow transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Web / PDF (.html)
            </button>

            <button
              id="btn-print-report"
              onClick={onPrint}
              title="Imprimir o Guardar directamente en PDF"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-2 py-1.5 rounded border border-slate-700 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              Imprimir
            </button>

            {onOpenManual && (
              <button
                id="btn-open-manual"
                onClick={onOpenManual}
                title="Abrir Manual de Operaciones con Diagramas de Flujo (Descargar / Imprimir en PDF)"
                className="flex items-center gap-1.5 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 hover:text-white text-xs font-bold px-3 py-1.5 rounded border border-emerald-600/70 shadow-xs transition-all cursor-pointer ring-1 ring-emerald-500/30"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Manual PDF</span>
              </button>
            )}

            <button
              id="btn-settings"
              onClick={onOpenSettings}
              title="Configurar personal a cargo, roles y feriados de este servicio"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded border border-emerald-600/40 hover:border-emerald-500 transition-all cursor-pointer shadow-xs"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
              Personal del Servicio
            </button>

            <button
              id="btn-reset-schedule"
              onClick={onReset}
              title="Limpiar todas las asignaciones del mes (dejar en blanco)"
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
              Resumen Mes ({MONTH_NAMES[currentMonthIndex]} {schedule.year}):
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
