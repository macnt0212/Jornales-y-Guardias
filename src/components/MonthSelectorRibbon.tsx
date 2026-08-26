import React from 'react';
import { MonthSchedule, DayInfo } from '../types';
import { MONTH_NAMES } from '../utils/calendar';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, CalendarDays, Check } from 'lucide-react';

interface MonthSelectorRibbonProps {
  schedule: MonthSchedule;
  days: DayInfo[];
  onMonthChange: (year: number, month: number) => void;
  onGenerateBalanced: () => void;
}

const SHORT_MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export const MonthSelectorRibbon: React.FC<MonthSelectorRibbonProps> = ({
  schedule,
  days,
  onMonthChange,
  onGenerateBalanced,
}) => {
  const currentRealDate = new Date();
  const currentRealMonth = currentRealDate.getMonth() + 1;
  const currentRealYear = currentRealDate.getFullYear();

  const businessDaysCount = days.filter(d => !d.isWeekend && !d.isHoliday).length;
  const nonBusinessDaysCount = days.filter(d => d.isWeekend || d.isHoliday).length;

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
  };

  const availableYears = [2025, 2026, 2027, 2028];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-3.5 sm:p-4 mb-5 no-print">
      {/* Top row: Title, Year switcher, and Month info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-sm shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Selección de Mes y Período
              </span>
              {schedule.year === currentRealYear && schedule.month === currentRealMonth && (
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Mes en curso
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 mt-0.5">
              <span>{MONTH_NAMES[schedule.month - 1]} {schedule.year}</span>
              <span className="text-xs font-normal text-slate-500">
                ({days.length} días • {businessDaysCount} hábiles • {nonBusinessDaysCount} inhábiles/feriados)
              </span>
            </h2>
          </div>
        </div>

        {/* Year Selector & Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Year selector buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 px-2 uppercase">Año:</span>
            {availableYears.map(year => (
              <button
                key={year}
                type="button"
                id={`btn-year-${year}`}
                onClick={() => onMonthChange(year, schedule.month)}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                  schedule.year === year
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Quick jump to current month */}
          <button
            type="button"
            id="btn-today-month"
            onClick={handleSelectCurrentMonth}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Ir al mes y año actual"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* 12 Months Ribbon Buttons */}
      <div className="mt-3">
        <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            id="btn-ribbon-prev-month"
            onClick={handlePrevMonth}
            aria-label="Mes anterior"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-colors shrink-0 cursor-pointer"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 flex-1 min-w-[320px]">
            {MONTH_NAMES.map((name, idx) => {
              const monthNum = idx + 1;
              const isSelected = schedule.month === monthNum;
              const isCurrentRealMonth = currentRealYear === schedule.year && currentRealMonth === monthNum;

              // Calculate days in that month for the selected year
              const daysInThisMonth = new Date(schedule.year, monthNum, 0).getDate();

              return (
                <button
                  key={name}
                  type="button"
                  id={`btn-select-month-${monthNum}`}
                  onClick={() => onMonthChange(schedule.year, monthNum)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-center transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border-slate-200/80 hover:border-emerald-300'
                  }`}
                >
                  {isCurrentRealMonth && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-white" title="Mes actual" />
                  )}
                  
                  <span className="text-xs sm:text-sm font-bold tracking-tight">
                    {SHORT_MONTHS[idx]}
                  </span>
                  
                  <span className={`text-[10px] font-medium leading-none mt-0.5 ${
                    isSelected ? 'text-emerald-100' : 'text-slate-400 group-hover:text-emerald-700'
                  }`}>
                    {daysInThisMonth}d
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            id="btn-ribbon-next-month"
            onClick={handleNextMonth}
            aria-label="Mes siguiente"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-colors shrink-0 cursor-pointer"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Help tooltip and automatic update status */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Al hacer clic en cualquier mes, <strong>las fechas (1 al {days.length}) y días (Lun a Dom) se actualizan automáticamente</strong> con sus guardias y feriados.
          </span>
        </div>

        <button
          type="button"
          onClick={onGenerateBalanced}
          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline hover:no-underline"
        >
          <Sparkles className="w-3 h-3" />
          Regenerar rotación automática para {MONTH_NAMES[schedule.month - 1]}
        </button>
      </div>
    </div>
  );
};
