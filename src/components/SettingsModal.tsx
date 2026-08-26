import React, { useState, useEffect } from 'react';
import { Agent, MonthSchedule } from '../types';
import { DEFAULT_HOLIDAYS_BY_MONTH_DAY, MONTH_NAMES } from '../utils/calendar';
import { X, Save, Users, Calendar, Plus, Trash2, RotateCcw, UserCheck, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  schedule: MonthSchedule;
  onClose: () => void;
  onSaveSettings: (updatedAgents: Agent[], updatedHolidays: Record<string, string>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  schedule,
  onClose,
  onSaveSettings,
}) => {
  const [agents, setAgents] = useState<Agent[]>(schedule.agents);
  const [holidays, setHolidays] = useState<Record<string, string>>(schedule.holidays || {});

  const [newHolidayDay, setNewHolidayDay] = useState<number>(1);
  const [newHolidayName, setNewHolidayName] = useState<string>('');

  // Re-synchronize when modal opens
  useEffect(() => {
    if (isOpen) {
      setAgents(schedule.agents);
      setHolidays(schedule.holidays || {});
    }
  }, [isOpen, schedule.agents, schedule.holidays]);

  if (!isOpen) return null;

  const handleAgentChange = (index: number, field: keyof Agent, value: any) => {
    const updated = [...agents];
    updated[index] = { ...updated[index], [field]: value };
    setAgents(updated);
  };

  const handleAddHoliday = () => {
    if (!newHolidayName.trim()) return;
    const mm = String(schedule.month).padStart(2, '0');
    const dd = String(newHolidayDay).padStart(2, '0');
    const dateStr = `${schedule.year}-${mm}-${dd}`;

    setHolidays({
      ...holidays,
      [dateStr]: newHolidayName.trim(),
    });
    setNewHolidayName('');
  };

  const handleRemoveHoliday = (dateStr: string) => {
    const copy = { ...holidays };
    delete copy[dateStr];
    setHolidays(copy);
  };

  const handleSave = () => {
    onSaveSettings(agents, holidays);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Configuración del Servicio y Feriados
              </h3>
              <p className="text-xs text-slate-300">
                Hospital Central de Emergencias • Servicio de Informática
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5 text-xs text-slate-800 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Staff / Agents */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2.5">
              <Users className="w-4 h-4 text-emerald-600" />
              Nómina de los 4 Agentes del Servicio de Informática
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Puedes actualizar los nombres completos, legajos y categorías de los 4 agentes del servicio.
            </p>

            <div className="flex flex-col gap-3">
              {agents.map((agent, index) => (
                <div 
                  key={agent.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center gap-2.5"
                >
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">
                      {agent.isJefe ? 'Jefe de Servicio (Soporte)' : `Agente ${index + 1}`}
                    </label>
                    <input
                      type="text"
                      value={agent.name}
                      onChange={(e) => handleAgentChange(index, 'name', e.target.value)}
                      placeholder="Apellido y Nombre"
                      className="w-full bg-white text-slate-900 text-xs font-bold py-1 px-2 rounded border border-slate-300 mt-0.5 focus:border-emerald-500"
                    />
                  </div>

                  <div className="w-28">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">
                      Legajo
                    </label>
                    <input
                      type="text"
                      value={agent.legajo}
                      onChange={(e) => handleAgentChange(index, 'legajo', e.target.value)}
                      placeholder="LEG-XXXX"
                      className="w-full bg-white text-slate-900 text-xs font-mono py-1 px-2 rounded border border-slate-300 mt-0.5 focus:border-emerald-500"
                    />
                  </div>

                  <div className="w-44">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">
                      Categoría
                    </label>
                    <select
                      value={agent.category}
                      onChange={(e) => handleAgentChange(index, 'category', e.target.value as any)}
                      className="w-full bg-white text-slate-900 text-xs font-semibold py-1 px-2 rounded border border-slate-300 mt-0.5 focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Soporte Técnico">Soporte Técnico</option>
                      <option value="Soporte Informático SIGHO">Soporte Informático SIGHO</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 2: Holidays for the Month */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2.5">
              <Calendar className="w-4 h-4 text-rose-600" />
              Feriados y Días No Laborables ({MONTH_NAMES[schedule.month - 1]} {schedule.year})
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Los feriados se consideran inhábiles y habilitan guardias de 06:00 a 13:00 y 13:00 a 20:00 hs.
            </p>

            {/* List of custom holidays */}
            <div className="flex flex-col gap-2 mb-3">
              {Object.entries(holidays).length === 0 ? (
                <div className="p-3 text-center bg-slate-50 border border-slate-200 rounded text-slate-500 italic">
                  No hay feriados específicos registrados para este mes.
                </div>
              ) : (
                Object.entries(holidays).map(([dateStr, name]) => (
                  <div 
                    key={dateStr}
                    className="flex items-center justify-between p-2 rounded bg-rose-50 border border-rose-200 text-rose-900"
                  >
                    <div>
                      <span className="font-bold font-mono mr-2">{dateStr}</span>
                      <span className="font-semibold">{name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveHoliday(dateStr)}
                      className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-100 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Holiday Form */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="w-20">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Día</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={newHolidayDay}
                  onChange={(e) => setNewHolidayDay(Number(e.target.value))}
                  className="w-full bg-white text-slate-900 text-xs font-bold py-1 px-2 rounded border border-slate-300"
                />
              </div>

              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Motivo / Nombre del Feriado</label>
                <input
                  type="text"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  placeholder="Ej: Día de la Provincialización de Formosa"
                  className="w-full bg-white text-slate-900 text-xs py-1 px-2 rounded border border-slate-300"
                />
              </div>

              <button
                type="button"
                onClick={handleAddHoliday}
                className="flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded self-end cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
