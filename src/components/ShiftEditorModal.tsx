import React, { useState, useEffect } from 'react';
import { Agent, DayInfo, DayShiftAssignment, InhabileMode, JornalShiftType, ExtraHabilShiftType } from '../types';
import { X, Check, Clock, ShieldCheck, Trash2, Eraser, Briefcase, Building2, Sun, Moon, Sunrise, AlertCircle } from 'lucide-react';
import { 
  isAgentInhabileActiva, 
  getAgentInhabileMode, 
  isAgentOnlyInhabilePasiva,
  getAgentWorkModality,
  getAgentJornalShift,
  getContraturnoShiftForAgent
} from '../utils/calendar';

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
  const agentModality = getAgentWorkModality(agent);
  const defaultJornalTurno = getAgentJornalShift(agent);
  const defaultContraturno = getContraturnoShiftForAgent(agent);

  const [jornal, setJornal] = useState<boolean>(false);
  const [jornalTurno, setJornalTurno] = useState<JornalShiftType>(defaultJornalTurno);
  
  const [extraHabil, setExtraHabil] = useState<boolean>(false);
  const [extraHabilTurno, setExtraHabilTurno] = useState<ExtraHabilShiftType>(defaultContraturno);

  const [extraInhabilManana, setExtraInhabilManana] = useState<boolean>(false);
  const [extraInhabilMananaTipo, setExtraInhabilMananaTipo] = useState<InhabileMode>(defaultMode);
  const [extraInhabilTarde, setExtraInhabilTarde] = useState<boolean>(false);
  const [extraInhabilTardeTipo, setExtraInhabilTardeTipo] = useState<InhabileMode>(defaultMode);
  const [observaciones, setObservaciones] = useState<string>('');

  useEffect(() => {
    const modeForAgent = getAgentInhabileMode(agent);
    const jTurno = getAgentJornalShift(agent);
    const cTurno = getContraturnoShiftForAgent(agent);

    if (assignment) {
      setJornal(Boolean(assignment.jornal));
      setJornalTurno(assignment.jornalTurno || jTurno);
      setExtraHabil(Boolean(assignment.extraHabil));
      setExtraHabilTurno(assignment.extraHabilTurno || cTurno);
      setExtraInhabilManana(Boolean(assignment.extraInhabilManana));
      setExtraInhabilMananaTipo(assignment.extraInhabilMananaTipo || modeForAgent);
      setExtraInhabilTarde(Boolean(assignment.extraInhabilTarde));
      setExtraInhabilTardeTipo(assignment.extraInhabilTardeTipo || modeForAgent);
      setObservaciones(assignment.observaciones || '');
    } else {
      setJornal(false);
      setJornalTurno(jTurno);
      setExtraHabil(false);
      setExtraHabilTurno(cTurno);
      setExtraInhabilManana(false);
      setExtraInhabilMananaTipo(modeForAgent);
      setExtraInhabilTarde(false);
      setExtraInhabilTardeTipo(modeForAgent);
      setObservaciones('');
    }
  }, [assignment, isOpen, agent]);

  if (!isOpen || !agent || !day) return null;

  const isBusinessDay = !day.isWeekend && !day.isHoliday;

  const handleSave = () => {
    onSave(agent.id, day.dateStr, {
      jornal,
      jornalTurno,
      extraHabil,
      extraHabilTurno,
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
      jornalTurno: defaultJornalTurno,
      extraHabil: false,
      extraHabilTurno: defaultContraturno,
      extraInhabilManana: false,
      extraInhabilMananaTipo: defaultMode,
      extraInhabilTarde: false,
      extraInhabilTardeTipo: defaultMode,
      observaciones: '',
    });
    onClose();
  };

  // Presets rápidos según perfil del agente
  const applyPreset = (type: string) => {
    if (type === 'jornal_solo') {
      setJornal(true);
      setJornalTurno(defaultJornalTurno);
      setExtraHabil(false);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(false);
    } else if (type === 'jornal_plus_contraturno') {
      setJornal(true);
      setJornalTurno(defaultJornalTurno);
      setExtraHabil(true);
      setExtraHabilTurno(defaultContraturno);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(false);
    } else if (type === 'extra_solo_manana') {
      setJornal(false);
      setExtraHabil(true);
      setExtraHabilTurno('manana');
      setExtraInhabilManana(false);
      setExtraInhabilTarde(false);
    } else if (type === 'extra_solo_tarde') {
      setJornal(false);
      setExtraHabil(true);
      setExtraHabilTurno('tarde');
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
          
          {/* Agent Profile & Work Modality Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{agent.name}</span>
                <span className="font-mono text-[11px] text-slate-500">({agent.legajo})</span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
                {agent.roleLabel}
              </span>
            </div>

            {/* Modalidad Badge / Description */}
            {agentModality === 'solo_guardias' ? (
              <div className="bg-teal-50 border border-teal-200 rounded p-2 text-teal-900 text-[11px] flex items-start gap-2">
                <Building2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-teal-950 font-bold">Modalidad: Solo Guardias (Jornal en otra institución)</strong>
                  <span>
                    El agente cumple su jornal ordinario en {agent.externalInstitution || 'otra institución de salud'}. 
                    En este hospital <strong>no se le computan horas de jornal</strong>, únicamente cobra horas extras/guardias cumplidas.
                  </span>
                </div>
              </div>
            ) : agentModality === 'solo_jornal' ? (
              <div className="bg-amber-50 border border-amber-200 rounded p-2 text-amber-900 text-[11px] flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-950 font-bold">Modalidad: Solo Jornal (Sin Guardias)</strong>
                  <span>
                    Cumple exclusivamente su horario de jornal ordinario (Turno {defaultJornalTurno === 'tarde' ? 'Tarde 13-20h' : defaultJornalTurno === 'noche' ? 'Noche 20-07h' : 'Mañana 06-13h'}). No realiza horas extras ni guardias.
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-blue-900 text-[11px] flex items-start gap-2">
                <Sun className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-blue-950 font-bold">
                    Modalidad: Jornal + Guardias en Contraturno
                  </strong>
                  <span>
                    Jornal habitual en Turno <strong>{defaultJornalTurno === 'tarde' ? 'Tarde (13:00 a 20:00 hs)' : defaultJornalTurno === 'noche' ? 'Noche (20:00 a 07:00 hs)' : 'Mañana (06:00 a 13:00 hs)'}</strong>. 
                    Las horas extras se cumplen en contraturno ({defaultContraturno === 'manana' ? 'Mañana 06-13 hs' : defaultContraturno === 'noche' ? 'Noche 20-07 hs' : 'Tarde 13-20 hs'}).
                  </span>
                </div>
              </div>
            )}

            {/* Inhábiles Permission Notice */}
            <div className={`px-2 py-1 rounded text-[11px] flex items-center gap-1.5 ${
              isCantero ? 'text-purple-900 bg-purple-100/60 font-semibold' : 'text-slate-600'
            }`}>
              <ShieldCheck className={`w-3.5 h-3.5 ${isCantero ? 'text-purple-700' : 'text-slate-400'}`} />
              <span>
                Guardias Inhábiles: {isCantero ? 'Autorizado a Inhábiles ACTIVAS (Presencial)' : 'Guardias Inhábiles PASIVAS (Disponibilidad)'}
              </span>
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
                  {agentModality !== 'solo_guardias' && (
                    <button
                      type="button"
                      onClick={() => applyPreset('jornal_solo')}
                      className="p-2 text-left rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 font-medium text-blue-900 transition-colors cursor-pointer"
                    >
                      🔵 Solo Jornal ({defaultJornalTurno === 'tarde' ? 'Tarde 13-20h' : defaultJornalTurno === 'noche' ? 'Noche 20-07h' : 'Mañana 06-13h'})
                    </button>
                  )}

                  {agentModality !== 'solo_jornal' && agentModality !== 'solo_guardias' && (
                    <button
                      type="button"
                      onClick={() => applyPreset('jornal_plus_contraturno')}
                      className="p-2 text-left rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-medium text-emerald-900 transition-colors cursor-pointer"
                    >
                      🟢 Jornal + Extra Contraturno
                    </button>
                  )}

                  {agentModality === 'solo_guardias' && (
                    <>
                      <button
                        type="button"
                        onClick={() => applyPreset('extra_solo_manana')}
                        className="p-2 text-left rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-medium text-emerald-900 transition-colors cursor-pointer"
                      >
                        🟢 Extra Hábil Mañana (06-13h)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('extra_solo_tarde')}
                        className="p-2 text-left rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-medium text-emerald-900 transition-colors cursor-pointer"
                      >
                        🟢 Extra Hábil Tarde (13-20h)
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {agentModality !== 'solo_jornal' && (
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

          {/* SECCIÓN 1: JORNAL ORDINARIO */}
          {agentModality !== 'solo_guardias' ? (
            <div className="flex flex-col gap-2 p-3 bg-blue-50/40 border border-blue-100 rounded-lg">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
                <span>Jornal Ordinario (Días Hábiles)</span>
                <span className="text-[10px] text-blue-700 font-semibold lowercase">7 horas reglamentarias</span>
              </span>

              <label className="flex items-center gap-2.5 p-2 rounded-lg border border-blue-200 bg-white hover:bg-blue-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={jornal}
                  onChange={(e) => setJornal(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-bold text-slate-900">Cumple Jornal en este día</span>
                  <span className="block text-[11px] text-slate-500">Jornada ordinaria en este hospital</span>
                </div>
                <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">7 hs</span>
              </label>

              {jornal && (
                <div className="mt-1 pt-2 border-t border-blue-200 grid grid-cols-3 gap-2">
                  <label className={`p-2 rounded border cursor-pointer text-center transition-all ${
                    jornalTurno === 'manana' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-xs' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="jornalTurnoOption"
                      value="manana"
                      checked={jornalTurno === 'manana'}
                      onChange={() => setJornalTurno('manana')}
                      className="sr-only"
                    />
                    <div className="text-[10px] uppercase font-bold">Turno Mañana</div>
                    <div className="text-[11px]">06:00 a 13:00</div>
                  </label>

                  <label className={`p-2 rounded border cursor-pointer text-center transition-all ${
                    jornalTurno === 'tarde' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-xs' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="jornalTurnoOption"
                      value="tarde"
                      checked={jornalTurno === 'tarde'}
                      onChange={() => setJornalTurno('tarde')}
                      className="sr-only"
                    />
                    <div className="text-[10px] uppercase font-bold">Turno Tarde</div>
                    <div className="text-[11px]">13:00 a 20:00</div>
                  </label>

                  <label className={`p-2 rounded border cursor-pointer text-center transition-all ${
                    jornalTurno === 'noche' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-xs' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="jornalTurnoOption"
                      value="noche"
                      checked={jornalTurno === 'noche'}
                      onChange={() => setJornalTurno('noche')}
                      className="sr-only"
                    />
                    <div className="text-[10px] uppercase font-bold">Turno Noche</div>
                    <div className="text-[11px]">20:00 a 07:00</div>
                  </label>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-[11px] text-teal-900">
              <strong className="block font-bold">Sin Jornal en este Hospital:</strong>
              El agente cumple su jornal ordinario externamente ({agent.externalInstitution || 'otra institución'}). Aquí no se asignan horas de jornal.
            </div>
          )}

          {/* SECCIÓN 2: HORAS EXTRAS HÁBILES EN CONTRATURNO */}
          {agentModality !== 'solo_jornal' ? (
            <div className="flex flex-col gap-2 p-3 bg-emerald-50/40 border border-emerald-100 rounded-lg">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
                <span>Horas Extras Hábiles (Contraturno)</span>
                <span className="text-[10px] text-emerald-700 font-semibold lowercase">7 horas extras</span>
              </span>

              <label className="flex items-center gap-2.5 p-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={extraHabil}
                  onChange={(e) => setExtraHabil(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-bold text-slate-900">Realiza Extra Hábil en Contraturno</span>
                  <span className="block text-[11px] text-slate-500">Guardia adicional en día laborable</span>
                </div>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">7 hs Ext</span>
              </label>

              {extraHabil && (
                <div className="mt-1 pt-2 border-t border-emerald-200 grid grid-cols-3 gap-2">
                  <label className={`p-2 rounded border cursor-pointer text-center transition-all ${
                    extraHabilTurno === 'manana' ? 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-xs' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="extraHabilTurnoOption"
                      value="manana"
                      checked={extraHabilTurno === 'manana'}
                      onChange={() => setExtraHabilTurno('manana')}
                      className="sr-only"
                    />
                    <div className="text-[10px] uppercase font-bold">Mañana (Contraturno)</div>
                    <div className="text-[11px]">06:00 a 13:00</div>
                  </label>

                  <label className={`p-2 rounded border cursor-pointer text-center transition-all ${
                    extraHabilTurno === 'tarde' ? 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-xs' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="extraHabilTurnoOption"
                      value="tarde"
                      checked={extraHabilTurno === 'tarde'}
                      onChange={() => setExtraHabilTurno('tarde')}
                      className="sr-only"
                    />
                    <div className="text-[10px] uppercase font-bold">Tarde (Contraturno)</div>
                    <div className="text-[11px]">13:00 a 20:00</div>
                  </label>

                  <label className={`p-2 rounded border cursor-pointer text-center transition-all ${
                    extraHabilTurno === 'noche' ? 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-xs' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="extraHabilTurnoOption"
                      value="noche"
                      checked={extraHabilTurno === 'noche'}
                      onChange={() => setExtraHabilTurno('noche')}
                      className="sr-only"
                    />
                    <div className="text-[10px] uppercase font-bold">Noche (Contraturno)</div>
                    <div className="text-[11px]">20:00 a 07:00</div>
                  </label>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
              <strong className="block font-bold">Modalidad Solo Jornal:</strong>
              Este agente no realiza horas extras ni guardias de contraturno.
            </div>
          )}

          {/* SECCIÓN 3: TURNOS INHÁBILES (FINES DE SEMANA Y FERIADOS) */}
          {agentModality !== 'solo_jornal' && (
            <div className="flex flex-col gap-3 p-3 bg-purple-50/30 border border-purple-100 rounded-lg">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Turnos Inhábiles (Fines de Semana y Feriados)
              </span>

              {/* Inhábil Mañana 6 a 13 */}
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex flex-col gap-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extraInhabilManana}
                    onChange={(e) => setExtraInhabilManana(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900">Inhábil Turno Mañana (06:00 a 13:00 hs)</span>
                    <span className="block text-[11px] text-slate-500">Guardia en día no laborable</span>
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
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex flex-col gap-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extraInhabilTarde}
                    onChange={(e) => setExtraInhabilTarde(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900">Inhábil Turno Tarde (13:00 a 20:00 hs)</span>
                    <span className="block text-[11px] text-slate-500">Guardia en día no laborable</span>
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
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClearCell}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-300 px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
            title="Borrar todos los turnos asignados en este día para este agente"
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
