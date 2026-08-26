import React, { useState, useEffect } from 'react';
import { Agent, DayInfo, DayShiftAssignment, InhabileMode } from '../types';
import { X, Check, Clock, Calendar, AlertCircle, ShieldCheck, Sun, Moon, Trash2, Eraser } from 'lucide-react';
import { isAgentInhabileActiva, getAgentInhabileMode, isAgentOnlyInhabilePasiva } from '../utils/calendar';

interface ShiftEditorModalProps {
  isOpen: boolean;
  agent: Agent | null;
  day: DayInfo | null;
  assignment: DayShiftAssignment | undefined;
  onClose: () => void;
  onSave: (agentId: string, dateStr: string, updatedAssignment: DayShiftAssignment) => void;
}

export const ShiftEditorModal: React.FC<ShiftEditorModalProps> = ({
  isOpen,
  agent,
  day,
  assignment,
  onClose,
  onSave,
}) => {
  const defaultMode = getAgentInhabileMode(agent);
  const isCantero = isAgentInhabileActiva(agent);
  const isAmarilla = isAgentOnlyInhabilePasiva(agent);

  const [jornal, setJornal] = useState<boolean>(false);
  const [extraHabil, setExtraHabil] = useState<boolean>(false);
  const [extraInhabilManana, setExtraInhabilManana] = useState<boolean>(false);
  const [extraInhabilMananaTipo, setExtraInhabilMananaTipo] = useState<InhabileMode>(defaultMode);
  const [extraInhabilTarde, setExtraInhabilTarde] = useState<boolean>(false);
  const [extraInhabilTardeTipo, setExtraInhabilTardeTipo] = useState<InhabileMode>(defaultMode);
  const [observaciones, setObservaciones] = useState<string>('');

  useEffect(() => {
    const modeForAgent = getAgentInhabileMode(agent);
    if (assignment) {
      setJornal(Boolean(assignment.jornal));
      setExtraHabil(Boolean(assignment.extraHabil));
      setExtraInhabilManana(Boolean(assignment.extraInhabilManana));
      setExtraInhabilMananaTipo(assignment.extraInhabilMananaTipo || modeForAgent);
      setExtraInhabilTarde(Boolean(assignment.extraInhabilTarde));
      setExtraInhabilTardeTipo(assignment.extraInhabilTardeTipo || modeForAgent);
      setObservaciones(assignment.observaciones || '');
    } else {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabilManana(false);
      setExtraInhabilMananaTipo(modeForAgent);
      setExtraInhabilTarde(false);
      setExtraInhabilTardeTipo(modeForAgent);
      setObservaciones('');
    }
  }, [assignment, isOpen, agent]);

  if (!isOpen || !agent || !day) return null;

  const handleSave = () => {
    onSave(agent.id, day.dateStr, {
      jornal,
      extraHabil,
      extraInhabilManana,
      extraInhabilMananaTipo,
      extraInhabilTarde,
      extraInhabilTardeTipo,
      observaciones,
    });
    onClose();
  };

  const handleClearCell = () => {
    onSave(agent.id, day.dateStr, {
      jornal: false,
      extraHabil: false,
      extraInhabilManana: false,
      extraInhabilMananaTipo: defaultMode,
      extraInhabilTarde: false,
      extraInhabilTardeTipo: defaultMode,
      observaciones: '',
    });
    onClose();
  };

  // Quick Preset Handlers
  const applyPreset = (type: string) => {
    if (type === 'jornal_solo') {
      setJornal(true);
      setExtraHabil(false);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(false);
    } else if (type === 'jornal_plus_extra') {
      setJornal(true);
      setExtraHabil(true);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(false);
    } else if (type === 'inhabil_manana_auto') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabilManana(true);
      setExtraInhabilMananaTipo(defaultMode);
      setExtraInhabilTarde(false);
    } else if (type === 'inhabil_tarde_auto') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(true);
      setExtraInhabilTardeTipo(defaultMode);
    } else if (type === 'inhabil_activa_manana') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabilManana(true);
      setExtraInhabilMananaTipo('activa');
      setExtraInhabilTarde(false);
    } else if (type === 'inhabil_pasiva_manana') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabilManana(true);
      setExtraInhabilMananaTipo('pasiva');
      setExtraInhabilTarde(false);
    } else if (type === 'inhabil_activa_tarde') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(true);
      setExtraInhabilTardeTipo('activa');
    } else if (type === 'inhabil_pasiva_tarde') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(true);
      setExtraInhabilTardeTipo('pasiva');
    } else if (type === 'franco') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(false);
    }
  };

  const isBusinessDay = !day.isWeekend && !day.isHoliday;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-md">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Asignación de Turno
              </h3>
              <p className="text-xs text-slate-300">
                {agent.name} • <span className="font-semibold text-emerald-400">{day.dayNameLong} {day.dayNumber} ({day.dateStr})</span>
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

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 text-xs text-slate-800 max-h-[75vh] overflow-y-auto">
          {/* Agent Inhábiles Authorization Status */}
          <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
            isCantero 
              ? 'bg-purple-50 border-purple-200 text-purple-900'
              : isAmarilla
              ? 'bg-amber-100/70 border-amber-300 text-amber-950'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <ShieldCheck className={`w-4 h-4 mt-0.5 shrink-0 ${isCantero ? 'text-purple-700' : 'text-amber-700'}`} />
            <div>
              <div className="font-bold text-xs">
                {isCantero 
                  ? '🟣 Habilitado para Inhábiles ACTIVAS (Presencial)'
                  : isAmarilla
                  ? '🟠 Habilitado ÚNICAMENTE para Inhábiles PASIVAS'
                  : '🟠 Habilitado para Inhábiles PASIVAS (Disponibilidad)'
                }
              </div>
              <p className="text-[11px] mt-0.5 opacity-90 leading-tight">
                {isCantero 
                  ? 'Este agente (Cantero, Miguel Angel) es el único autorizado para cumplir horas inhábiles activas presenciales.'
                  : isAmarilla
                  ? 'El agente Amarilla, Nestor Ivan realiza ÚNICAMENTE horas extras Inhábiles Pasivas (en fines de semana y feriados) y su jornal ordinario de lunes a viernes de 06:00 a 13:00 hs (no realiza extras hábiles de 13 a 20 hs).'
                  : 'Por régimen oficial, este agente cumple guardias inhábiles pasivas (disponibilidad).'
                }
              </p>
            </div>
          </div>

          {/* Day Type Badge */}
          <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-700">Tipo de día:</span>
            {day.isHoliday ? (
              <span className="bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 rounded font-bold">
                Feriado: {day.holidayName || 'Feriado Oficial'}
              </span>
            ) : day.isWeekend ? (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-bold">
                Fin de Semana ({day.dayNameLong})
              </span>
            ) : (
              <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded font-bold">
                Día Hábil Laborable
              </span>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 uppercase tracking-wider text-[10px]">
              Opciones Rápidas:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {isBusinessDay ? (
                <>
                  <button
                    type="button"
                    onClick={() => applyPreset('jornal_solo')}
                    className="p-2 text-left rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 font-medium text-blue-900 transition-colors cursor-pointer"
                  >
                    🔵 Solo Jornal (06 a 13 hs)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('jornal_plus_extra')}
                    className="p-2 text-left rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-medium text-emerald-900 transition-colors cursor-pointer"
                  >
                    🟢 Jornal + Ext. Hábil (06 a 20 hs)
                  </button>
                </>
              ) : (
                <>
                  {isCantero ? (
                    <>
                      <button
                        type="button"
                        onClick={() => applyPreset('inhabil_activa_manana')}
                        className="p-2 text-left rounded bg-purple-100 hover:bg-purple-200 border border-purple-300 font-bold text-purple-950 transition-colors cursor-pointer"
                      >
                        🟣 Inhábil ACTIVA Mañana (06-13h)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('inhabil_activa_tarde')}
                        className="p-2 text-left rounded bg-purple-100 hover:bg-purple-200 border border-purple-300 font-bold text-purple-950 transition-colors cursor-pointer"
                      >
                        🟣 Inhábil ACTIVA Tarde (13-20h)
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => applyPreset('inhabil_pasiva_manana')}
                        className="p-2 text-left rounded bg-amber-100 hover:bg-amber-200 border border-amber-300 font-bold text-amber-950 transition-colors cursor-pointer"
                      >
                        🟠 Inhábil PASIVA Mañana (06-13h)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('inhabil_pasiva_tarde')}
                        className="p-2 text-left rounded bg-amber-100 hover:bg-amber-200 border border-amber-300 font-bold text-amber-950 transition-colors cursor-pointer"
                      >
                        🟠 Inhábil PASIVA Tarde (13-20h)
                      </button>
                    </>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={() => applyPreset('franco')}
                className="p-2 text-left rounded bg-rose-50/70 hover:bg-rose-100/90 border border-rose-200 font-bold text-rose-800 transition-colors cursor-pointer col-span-2 flex items-center justify-between"
                title="Quitar todos los turnos marcados en esta celda"
              >
                <span className="flex items-center gap-1.5">
                  <Eraser className="w-3.5 h-3.5 text-rose-600" />
                  Vaciar Celda (Sin Turno / Franco)
                </span>
                <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-bold">0 hs</span>
              </button>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Turnos Hábiles */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Turnos Ordinarios y Hábiles (Lunes a Viernes)
            </span>

            {/* Checkbox Jornal 6 a 13 */}
            <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={jornal}
                onChange={(e) => setJornal(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              <div className="flex-1">
                <span className="font-bold text-slate-900">Jornal Ordinario (06:00 a 13:00 hs)</span>
                <span className="block text-[11px] text-slate-500">7 horas de jornada habitual</span>
              </div>
              <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">7 hs</span>
            </label>

            {/* Checkbox Extra Hábil 13 a 20 */}
            <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={extraHabil}
                onChange={(e) => setExtraHabil(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1">
                <span className="font-bold text-slate-900">Horas Extras Días Hábiles (13:00 a 20:00 hs)</span>
                <span className="block text-[11px] text-slate-500">7 horas extras de guardia hábil</span>
              </div>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">7 hs Ext</span>
            </label>
          </div>

          <hr className="border-slate-200" />

          {/* Turnos Inhábiles (Fines de semana y feriados) */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Turnos Inhábiles (Fines de Semana y Feriados)
            </span>

            {/* Inhábil Mañana 6 a 13 */}
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col gap-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={extraInhabilManana}
                  onChange={(e) => setExtraInhabilManana(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-bold text-slate-900">Inhábil Turno Mañana (06:00 a 13:00 hs)</span>
                  <span className="block text-[11px] text-slate-500">7 horas en día no laborable</span>
                </div>
                <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">7 hs</span>
              </label>

              {extraInhabilManana && (
                <div className="flex items-center gap-3 pl-6 pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-700 text-[11px]">Modalidad:</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="modalidad_manana"
                      value="activa"
                      checked={extraInhabilMananaTipo === 'activa'}
                      onChange={() => setExtraInhabilMananaTipo('activa')}
                      className="text-purple-600 cursor-pointer"
                    />
                    <span className="font-bold text-purple-800">Activa (Presencial)</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="modalidad_manana"
                      value="pasiva"
                      checked={extraInhabilMananaTipo === 'pasiva'}
                      onChange={() => setExtraInhabilMananaTipo('pasiva')}
                      className="text-amber-600 cursor-pointer"
                    />
                    <span className="font-bold text-amber-800">Pasiva (Disponibilidad)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Inhábil Tarde 13 a 20 */}
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col gap-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={extraInhabilTarde}
                  onChange={(e) => setExtraInhabilTarde(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-bold text-slate-900">Inhábil Turno Tarde (13:00 a 20:00 hs)</span>
                  <span className="block text-[11px] text-slate-500">7 horas en día no laborable</span>
                </div>
                <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">7 hs</span>
              </label>

              {extraInhabilTarde && (
                <div className="flex items-center gap-3 pl-6 pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-700 text-[11px]">Modalidad:</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="modalidad_tarde"
                      value="activa"
                      checked={extraInhabilTardeTipo === 'activa'}
                      onChange={() => setExtraInhabilTardeTipo('activa')}
                      className="text-purple-600 cursor-pointer"
                    />
                    <span className="font-bold text-purple-800">Activa (Presencial)</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="modalidad_tarde"
                      value="pasiva"
                      checked={extraInhabilTardeTipo === 'pasiva'}
                      onChange={() => setExtraInhabilTardeTipo('pasiva')}
                      className="text-amber-600 cursor-pointer"
                    />
                    <span className="font-bold text-amber-800">Pasiva (Disponibilidad)</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClearCell}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-300 px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
            title="Borrar todos los turnos asignados en este día para este agente (deja la celda vacía)"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            Borrar Celda
          </button>

          <div className="flex items-center gap-2">
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
              <Check className="w-4 h-4" />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
