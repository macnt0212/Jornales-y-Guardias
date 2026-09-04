import React from 'react';
import { MonthSchedule, DayInfo } from '../types';
import { MONTH_NAMES } from '../utils/calendar';
import { Calendar, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

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
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-3 mb-4 no-print select-none">
      {/* Top row: Current Month title, navigation arrows, Year switcher, and Period details */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        
        {/* Left: Quick Month Navigation (< Month Year >) + Stats */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Mes anterior"
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-0.5 text-sm font-extrabold text-slate-800 min-w-[130px] text-center">
              {MONTH_NAMES[schedule.month - 1]} {schedule.year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Mes siguiente"
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick period summary tags */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <span className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
              {days.length} días
            </span>
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200/60 font-medium">
              {businessDaysCount} hábiles
            </span>
            <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200/60 font-medium">
              {nonBusinessDaysCount} inhábiles / feriados
            </span>
          </div>
        </div>

        {/* Right: Year selector & "Hoy" button */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {availableYears.map(year => (
              <button
                key={year}
                type="button"
                id={`btn-year-${year}`}
                onClick={() => onMonthChange(year, schedule.month)}
                className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  schedule.year === year
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          <button
            type="button"
            id="btn-today-month"
            onClick={handleSelectCurrentMonth}
            className={`px-2 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              schedule.year === currentRealYear && schedule.month === currentRealMonth
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Ir al mes actual"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Bottom row: Compact 12 Months Pill Strip */}
      <div className="pt-2">
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
          {MONTH_NAMES.map((name, idx) => {
            const monthNum = idx + 1;
            const isSelected = schedule.month === monthNum;
            const isCurrentRealMonth = currentRealYear === schedule.year && currentRealMonth === monthNum;

            return (
              <button
                key={name}
                type="button"
                id={`btn-select-month-${monthNum}`}
                onClick={() => onMonthChange(schedule.year, monthNum)}
                className={`flex items-center justify-center py-1.5 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/70'
                }`}
              >
                <span>{SHORT_MONTHS[idx]}</span>
                {isCurrentRealMonth && (
                  <span 
                    className={`w-1.5 h-1.5 rounded-full ml-1 ${isSelected ? 'bg-amber-300' : 'bg-blue-500'}`} 
                    title="Mes actual"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
