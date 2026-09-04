import React, { useState, useEffect } from 'react';
import { Agent, DayInfo, DayShiftAssignment, InhabileMode, JornalShiftType, ExtraHabilShiftType, RecargoRange } from '../types';
import { X, Check, Clock, ShieldCheck, Trash2, Eraser, Briefcase, Building2, Sun, Moon, Sunrise, AlertCircle, Zap, Timer } from 'lucide-react';
import { 
  isAgentInhabileActiva, 
  getAgentInhabileMode, 
  isAgentOnlyInhabilePasiva,
  getAgentWorkModality,
  getAgentJornalShift,
  getContraturnoShiftForAgent,
  HOURS_PER_SHIFT,
  HOURS_PER_GUARDIA_24H,
  HOURS_PER_GUARDIA_12H,
  getServiceRecargoRanges
} from '../utils/calendar';

interface ShiftEditorModalProps {
  isOpen: boolean;
  agent: Agent | null;
  day: DayInfo | null;
  assignment: DayShiftAssignment | undefined;
  recargoRanges?: RecargoRange[];
  onOpenRecargoRanges?: () => void;
  onClose: () => void;
  onSave: (agentId: string, dateStr: string, updatedAssignment: DayShiftAssignment) => void;
}

export const ShiftEditorModal: React.FC<ShiftEditorModalProps> = ({
  isOpen,
  agent,
  day,
  assignment,
  recargoRanges,
  onOpenRecargoRanges,
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

  const [extraInhabil24h, setExtraInhabil24h] = useState<boolean>(false);
  const [extraInhabil24hTipo, setExtraInhabil24hTipo] = useState<InhabileMode>(defaultMode);

  const [extraInhabil12h, setExtraInhabil12h] = useState<boolean>(false);
  const [extraInhabil12hTipo, setExtraInhabil12hTipo] = useState<InhabileMode>(defaultMode);

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
      setExtraInhabil24h(Boolean(assignment.extraInhabil24h));
      setExtraInhabil24hTipo(assignment.extraInhabil24hTipo || modeForAgent);
      setExtraInhabil12h(Boolean(assignment.extraInhabil12h));
      setExtraInhabil12hTipo(assignment.extraInhabil12hTipo || modeForAgent);
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
      setExtraInhabil24h(false);
      setExtraInhabil24hTipo(modeForAgent);
      setExtraInhabil12h(false);
      setExtraInhabil12hTipo(modeForAgent);
      setExtraInhabilManana(false);
      setExtraInhabilMananaTipo(modeForAgent);
      setExtraInhabilTarde(false);
      setExtraInhabilTardeTipo(modeForAgent);
      setObservaciones('');
    }
  }, [assignment, isOpen, agent]);

  if (!isOpen || !agent || !day) return null;

  const isBusinessDay = !day.isWeekend && !day.isHoliday;

  // Cálculo de horas para previsualización inmediata en el modal
  let computedJornalHours = 0;
  if (jornal && agentModality !== 'solo_guardias') {
    computedJornalHours = HOURS_PER_SHIFT;
  }

  let computedExtraHours = 0;
  if (extraHabil && agentModality !== 'solo_jornal') {
    computedExtraHours += HOURS_PER_SHIFT;
  }
  if (agentModality !== 'solo_jornal') {
    if (extraInhabil24h) {
      computedExtraHours += HOURS_PER_GUARDIA_24H;
    }
    if (extraInhabil12h) {
      computedExtraHours += HOURS_PER_GUARDIA_12H;
    }
    if (extraInhabilManana) {
      computedExtraHours += HOURS_PER_SHIFT;
    }
    if (extraInhabilTarde) {
      computedExtraHours += HOURS_PER_SHIFT;
    }
  }

  const computedTotalDayHours = computedJornalHours + computedExtraHours;

  const handleSave = () => {
    onSave(agent.id, day.dateStr, {
      jornal,
      jornalTurno,
      extraHabil,
      extraHabilTurno,
      extraInhabil24h,
      extraInhabil24hTipo,
      extraInhabil12h,
      extraInhabil12hTipo,
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
      extraInhabil24h: false,
      extraInhabil24hTipo: defaultMode,
      extraInhabil12h: false,
      extraInhabil12hTipo: defaultMode,
      extraInhabilManana: false,
      extraInhabilMananaTipo: defaultMode,
      extraInhabilTarde: false,
      extraInhabilTardeTipo: defaultMode,
      observaciones: '',
    });
    onClose();
  };

  // Presets rápidos según perfil del agente y tipo de guardia requerida
  const applyPreset = (type: string) => {
    if (type === 'jornal_solo') {
      setJornal(true);
      setJornalTurno(defaultJornalTurno);
      setExtraHabil(false);
      setExtraInhabil24h(false);
      setExtraInhabil12h(false);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(false);
    } else if (type === 'jornal_plus_contraturno') {
      setJornal(true);
      setJornalTurno(defaultJornalTurno);
      setExtraHabil(true);
      setExtraHabilTurno(defaultContraturno);
      setExtraInhabil24h(false);
      setExtraInhabil12h(false);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(false);
    } else if (type === 'extra_solo_manana') {
      setJornal(false);
      setExtraHabil(true);
      setExtraHabilTurno('manana');
      setExtraInhabil24h(false);
      setExtraInhabil12h(false);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(false);
    } else if (type === 'extra_solo_tarde') {
      setJornal(false);
      setExtraHabil(true);
      setExtraHabilTurno('tarde');
      setExtraInhabil24h(false);
      setExtraInhabil12h(false);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(false);
    } else if (type === 'guardia_24h_activa') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabil24h(true);
      setExtraInhabil24hTipo('activa');
      setExtraInhabil12h(false);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(false);
    } else if (type === 'guardia_24h_pasiva') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabil24h(true);
      setExtraInhabil24hTipo('pasiva');
      setExtraInhabil12h(false);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(false);
    } else if (type === 'guardia_12h_activa') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabil24h(false);
      setExtraInhabil12h(true);
      setExtraInhabil12hTipo('activa');
      setExtraInhabilManana(false);
      setExtraInhabilTarde(false);
    } else if (type === 'guardia_12h_pasiva') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabil24h(false);
      setExtraInhabil12h(true);
      setExtraInhabil12hTipo('pasiva');
      setExtraInhabilManana(false);
      setExtraInhabilTarde(false);
    } else if (type === 'inhabil_activa_manana') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabil24h(false);
      setExtraInhabil12h(false);
      setExtraInhabilManana(true);
      setExtraInhabilMananaTipo('activa');
      setExtraInhabilTarde(false);
    } else if (type === 'inhabil_pasiva_manana') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabil24h(false);
      setExtraInhabil12h(false);
      setExtraInhabilManana(true);
      setExtraInhabilMananaTipo('pasiva');
      setExtraInhabilTarde(false);
    } else if (type === 'inhabil_activa_tarde') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabil24h(false);
      setExtraInhabil12h(false);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(true);
      setExtraInhabilTardeTipo('activa');
    } else if (type === 'inhabil_pasiva_tarde') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabil24h(false);
      setExtraInhabil12h(false);
      setExtraInhabilManana(false);
      setExtraInhabilTarde(true);
      setExtraInhabilTardeTipo('pasiva');
    } else if (type === 'franco') {
      setJornal(false);
      setExtraHabil(false);
      setExtraInhabil24h(false);
      setExtraInhabil12h(false);
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
                Asignación de Turno y Guardias
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
                    En este hospital <strong>no se le computan horas de jornal</strong>, únicamente cobra horas extras y guardias cumplidas.
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
                Guardias Inhábiles Habituales: {isCantero ? 'Autorizado a Inhábiles ACTIVAS (Presencial)' : 'Guardias Inhábiles PASIVAS (Disponibilidad)'}
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
                      {/* Presets Guardias de 24 Horas para Inhábiles */}
                      <button
                        type="button"
                        onClick={() => applyPreset('guardia_24h_activa')}
                        className="p-2 text-left rounded bg-purple-700 hover:bg-purple-800 border border-purple-900 font-bold text-white transition-colors cursor-pointer shadow-xs flex items-center justify-between"
                      >
                        <span>🔴 Guardia ACTIVA 24 hs</span>
                        <span className="text-[10px] bg-purple-900 text-purple-100 px-1.5 py-0.5 rounded font-black">24h</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('guardia_24h_pasiva')}
                        className="p-2 text-left rounded bg-amber-600 hover:bg-amber-700 border border-amber-800 font-bold text-white transition-colors cursor-pointer shadow-xs flex items-center justify-between"
                      >
                        <span>🟠 Guardia PASIVA 24 hs</span>
                        <span className="text-[10px] bg-amber-800 text-amber-100 px-1.5 py-0.5 rounded font-black">24h</span>
                      </button>

                      {/* Presets Fraccionados 7h */}
                      <button
                        type="button"
                        onClick={() => applyPreset('inhabil_activa_manana')}
                        className="p-2 text-left rounded bg-purple-100 hover:bg-purple-200 border border-purple-300 font-bold text-purple-950 transition-colors cursor-pointer"
                      >
                        🟣 Inhábil ACTIVA Mañana (7h)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('inhabil_pasiva_tarde')}
                        className="p-2 text-left rounded bg-amber-100 hover:bg-amber-200 border border-amber-300 font-bold text-amber-950 transition-colors cursor-pointer"
                      >
                        🟠 Inhábil PASIVA Tarde (7h)
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

          {/* SECCIÓN NUEVA: RANGOS DE RECARGOS HORARIOS CONFIGURADOS */}
          <div className="p-3 bg-purple-50/40 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-purple-950 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-purple-700" />
                <span>Rangos de Recargos para este día</span>
              </span>
              {onOpenRecargoRanges && (
                <button
                  type="button"
                  onClick={onOpenRecargoRanges}
                  className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 hover:underline cursor-pointer"
                  title="Configurar o agregar nuevos rangos de horarios de recargos"
                >
                  <span>+ Configurar Rangos</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(recargoRanges && recargoRanges.length > 0 ? recargoRanges : getServiceRecargoRanges())
                .filter(r => isBusinessDay ? r.category === 'habil' : (r.category === 'inhabil_activa' || r.category === 'inhabil_pasiva'))
                .map(range => {
                  const isHabil = range.category === 'habil';
                  const isActiva = range.category === 'inhabil_activa';

                  return (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => {
                        if (isHabil) {
                          setExtraHabil(true);
                          if (range.startTime.startsWith('20')) {
                            setExtraHabilTurno('noche');
                          } else if (range.startTime.startsWith('06') || range.startTime.startsWith('07')) {
                            setExtraHabilTurno('manana');
                          } else {
                            setExtraHabilTurno('tarde');
                          }
                        } else if (isActiva) {
                          if (range.hours >= 24) {
                            setExtraInhabil24h(true);
                            setExtraInhabil24hTipo('activa');
                            setExtraInhabil12h(false);
                            setExtraInhabilManana(false);
                            setExtraInhabilTarde(false);
                          } else if (range.hours >= 12) {
                            setExtraInhabil12h(true);
                            setExtraInhabil12hTipo('activa');
                            setExtraInhabil24h(false);
                            setExtraInhabilManana(false);
                            setExtraInhabilTarde(false);
                          } else if (range.startTime.startsWith('06') || range.startTime.startsWith('07') || range.startTime.startsWith('08')) {
                            setExtraInhabilManana(true);
                            setExtraInhabilMananaTipo('activa');
                          } else {
                            setExtraInhabilTarde(true);
                            setExtraInhabilTardeTipo('activa');
                          }
                        } else {
                          // Pasiva
                          if (range.hours >= 24) {
                            setExtraInhabil24h(true);
                            setExtraInhabil24hTipo('pasiva');
                            setExtraInhabil12h(false);
                            setExtraInhabilManana(false);
                            setExtraInhabilTarde(false);
                          } else if (range.hours >= 12) {
                            setExtraInhabil12h(true);
                            setExtraInhabil12hTipo('pasiva');
                            setExtraInhabil24h(false);
                            setExtraInhabilManana(false);
                            setExtraInhabilTarde(false);
                          } else {
                            setExtraInhabilTarde(true);
                            setExtraInhabilTardeTipo('pasiva');
                          }
                        }
                      }}
                      className={`text-xs py-1 px-2.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                        isHabil
                          ? 'bg-white border-emerald-300 text-emerald-900 hover:bg-emerald-50'
                          : isActiva
                          ? 'bg-white border-purple-300 text-purple-900 hover:bg-purple-50'
                          : 'bg-white border-amber-300 text-amber-900 hover:bg-amber-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isHabil ? 'bg-emerald-500' : isActiva ? 'bg-purple-500' : 'bg-amber-500'}`}></span>
                      <span>{range.name}</span>
                      <span className="font-mono text-[10px] font-bold text-slate-500">({range.hours}h)</span>
                    </button>
                  );
                })}
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

          {/* SECCIÓN 3: GUARDIAS INHÁBILES (24 HORAS, 12 HORAS Y TURNOS FRACCIONADOS) */}
          {agentModality !== 'solo_jornal' && (
            <div className="flex flex-col gap-3 p-3 bg-purple-50/40 border border-purple-200 rounded-lg">
              <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider flex items-center justify-between">
                <span>Guardias Inhábiles (Fines de Semana y Feriados)</span>
                <span className="text-[10px] text-purple-800 font-bold bg-purple-100 px-2 py-0.5 rounded">24 hs / 12 hs / 7 hs</span>
              </span>

              {/* OPCIÓN 1: GUARDIA DE 24 HORAS COMPLETA */}
              <div className={`p-3 rounded-lg border transition-all ${
                extraInhabil24h 
                  ? 'border-purple-600 bg-purple-50/80 shadow-xs' 
                  : 'border-slate-200 bg-white hover:border-purple-300'
              }`}>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extraInhabil24h}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setExtraInhabil24h(checked);
                      if (checked) {
                        // Al marcar 24h, desmarcar 12h y turnos de 7h para evitar superposición indeseada
                        setExtraInhabil12h(false);
                        setExtraInhabilManana(false);
                        setExtraInhabilTarde(false);
                      }
                    }}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-700" />
                      Guardia Completa de 24 Horas
                    </span>
                    <span className="block text-[11px] text-slate-600">
                      Cobertura integral continua 24 hs (08:00 a 08:00 hs o 06:00 a 06:00 hs)
                    </span>
                  </div>
                  <span className="text-xs font-black bg-purple-700 text-white px-2.5 py-0.5 rounded shadow-xs">
                    24 hs
                  </span>
                </label>

                {extraInhabil24h && (
                  <div className="flex items-center gap-3 pl-6 pt-2 mt-2 border-t border-purple-200">
                    <span className="font-bold text-slate-800 text-[11px]">Tipo de Guardia 24h:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="modalidad_24h"
                        value="activa"
                        checked={extraInhabil24hTipo === 'activa'}
                        onChange={() => setExtraInhabil24hTipo('activa')}
                        className="text-purple-600 cursor-pointer"
                      />
                      <span className="font-bold text-purple-900">Activa (Presencial 24h)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="modalidad_24h"
                        value="pasiva"
                        checked={extraInhabil24hTipo === 'pasiva'}
                        onChange={() => setExtraInhabil24hTipo('pasiva')}
                        className="text-amber-600 cursor-pointer"
                      />
                      <span className="font-bold text-amber-900">Pasiva (Disponibilidad 24h)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* OPCIÓN 2: GUARDIA DE 12 HORAS */}
              <div className={`p-2.5 rounded-lg border transition-all ${
                extraInhabil12h 
                  ? 'border-indigo-500 bg-indigo-50/70 shadow-xs' 
                  : 'border-slate-200 bg-white hover:border-indigo-200'
              }`}>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extraInhabil12h}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setExtraInhabil12h(checked);
                      if (checked) {
                        setExtraInhabil24h(false);
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900">Guardia de 12 Horas</span>
                    <span className="block text-[11px] text-slate-500">
                      Turno extendido (08:00 a 20:00 hs o 20:00 a 08:00 hs)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                    12 hs
                  </span>
                </label>

                {extraInhabil12h && (
                  <div className="flex items-center gap-3 pl-6 pt-1.5 mt-1.5 border-t border-indigo-200">
                    <span className="font-bold text-slate-800 text-[11px]">Tipo de Guardia 12h:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="modalidad_12h"
                        value="activa"
                        checked={extraInhabil12hTipo === 'activa'}
                        onChange={() => setExtraInhabil12hTipo('activa')}
                        className="text-indigo-600 cursor-pointer"
                      />
                      <span className="font-bold text-indigo-900">Activa (12h)</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="modalidad_12h"
                        value="pasiva"
                        checked={extraInhabil12hTipo === 'pasiva'}
                        onChange={() => setExtraInhabil12hTipo('pasiva')}
                        className="text-amber-600 cursor-pointer"
                      />
                      <span className="font-bold text-amber-900">Pasiva (12h)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* OPCIÓN 3: TURNOS FRACCIONADOS DE 7 HORAS */}
              <div className="space-y-2 pt-1 border-t border-purple-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-600 block">
                  Turnos Fraccionados (7 horas cada uno):
                </span>

                {/* Inhábil Mañana 6 a 13 */}
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex flex-col gap-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={extraInhabilManana}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setExtraInhabilManana(checked);
                        if (checked) setExtraInhabil24h(false);
                      }}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-900">Inhábil Turno Mañana (06:00 a 13:00 hs)</span>
                      <span className="block text-[11px] text-slate-500">Guardia matutina no laborable</span>
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
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setExtraInhabilTarde(checked);
                        if (checked) setExtraInhabil24h(false);
                      }}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-900">Inhábil Turno Tarde (13:00 a 20:00 hs)</span>
                      <span className="block text-[11px] text-slate-500">Guardia vespertina no laborable</span>
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
          )}

        </div>

        {/* Modal Footer with Live Hours Calculator */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearCell}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-300 px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
              title="Borrar todos los turnos asignados en este día para este agente"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Borrar
            </button>

            <div className="bg-white px-2.5 py-1 rounded border border-slate-300 flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Total Día:</span>
              <span className="font-black text-slate-900 text-sm">{computedTotalDayHours} hs</span>
              {computedTotalDayHours >= 24 && (
                <span className="text-[10px] font-extrabold bg-purple-700 text-white px-1.5 rounded">24h</span>
              )}
            </div>
          </div>

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
