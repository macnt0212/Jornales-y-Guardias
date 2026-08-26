import React, { useState, useEffect } from 'react';
import { Agent, MonthSchedule, HospitalServiceConfig, InhabileMode } from '../types';
import { DEFAULT_HOLIDAYS_BY_MONTH_DAY, MONTH_NAMES, SERVICE_PRESETS, DEFAULT_SERVICE_CONFIG } from '../utils/calendar';
import { 
  X, 
  Save, 
  Users, 
  Calendar, 
  Plus, 
  Trash2, 
  RotateCcw, 
  UserCheck, 
  Shield, 
  Hospital, 
  Building2, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Stethoscope,
  Activity,
  HeartHandshake,
  Server,
  UserPlus
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  schedule: MonthSchedule;
  onClose: () => void;
  onSaveSettings: (
    updatedAgents: Agent[], 
    updatedHolidays: Record<string, string>, 
    updatedServiceConfig?: HospitalServiceConfig
  ) => void;
  onLoadBlankService?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  schedule,
  onClose,
  onSaveSettings,
  onLoadBlankService,
}) => {
  const [activeTab, setActiveTab] = useState<'servicio' | 'personal' | 'plantillas' | 'feriados'>('servicio');
  
  const [serviceConfig, setServiceConfig] = useState<HospitalServiceConfig>(() => {
    return schedule.serviceConfig || DEFAULT_SERVICE_CONFIG;
  });

  const [agents, setAgents] = useState<Agent[]>(schedule.agents || []);
  const [holidays, setHolidays] = useState<Record<string, string>>(schedule.holidays || {});

  const [newHolidayDay, setNewHolidayDay] = useState<number>(1);
  const [newHolidayName, setNewHolidayName] = useState<string>('');

  // Re-synchronize when modal opens
  useEffect(() => {
    if (isOpen) {
      setAgents(schedule.agents || []);
      setHolidays(schedule.holidays || {});
      setServiceConfig(schedule.serviceConfig || DEFAULT_SERVICE_CONFIG);
    }
  }, [isOpen, schedule.agents, schedule.holidays, schedule.serviceConfig]);

  if (!isOpen) return null;

  const handleServiceChange = (field: keyof HospitalServiceConfig, value: string) => {
    setServiceConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAgentChange = (index: number, field: keyof Agent, value: any) => {
    const updated = [...agents];
    updated[index] = { ...updated[index], [field]: value };
    setAgents(updated);
  };

  const handleAddAgent = () => {
    const newId = `agent_custom_${Date.now()}`;
    const newAgent: Agent = {
      id: newId,
      name: 'Nuevo Personal',
      legajo: 'LEG-' + Math.floor(1000 + Math.random() * 9000),
      roleLabel: 'Agente de Servicio',
      category: serviceConfig.serviceName.toLowerCase().includes('médic') ? 'Médico de Guardia' : 'Personal de Servicio',
      hasJornal: true,
      allowedInhabileMode: 'activa',
      isJefe: agents.length === 0,
    };
    setAgents([...agents, newAgent]);
    setActiveTab('personal');
  };

  const handleRemoveAgent = (index: number) => {
    const agentToRemove = agents[index];
    if (window.confirm(`¿Estás seguro de eliminar a "${agentToRemove.name}" de la nómina del servicio?`)) {
      const updated = agents.filter((_, i) => i !== index);
      setAgents(updated);
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = SERVICE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    if (preset.id === 'blank') {
      if (window.confirm('¿Deseas iniciar una plantilla en blanco? Podrás cargar el nombre de tu servicio y todo tu personal a cargo.')) {
        setServiceConfig({
          hospitalName: 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"',
          hospitalSubtitle: 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano',
          serviceName: '',
          jefeName: '',
          jefeCargo: 'Jefe de Servicio',
          jefeLegajo: '',
          jornalHorarioLabel: '06:00 a 13:00 hs',
          extraHabilHorarioLabel: '13:00 a 20:00 hs',
          inhabilMananaHorarioLabel: '06:00 a 13:00 hs',
          inhabilTardeHorarioLabel: '13:00 a 20:00 hs',
        });
        setAgents([]);
        setActiveTab('servicio');
      }
      return;
    }

    if (window.confirm(`¿Cargar la plantilla de "${preset.name}"? Se actualizará el nombre del servicio, horarios y nómina sugerida.`)) {
      setServiceConfig(preset.config);
      setAgents(preset.agents);
      setActiveTab('personal');
    }
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
    onSaveSettings(agents, holidays, serviceConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg shadow-sm">
              <Hospital className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Configuración del Servicio y Personal a Cargo
              </h3>
              <p className="text-xs text-slate-300">
                Hospital Central de Emergencias de Formosa • Control de Guardias
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

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-5 pt-2.5 border-b border-slate-200 flex flex-wrap gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('servicio')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer border-t border-x ${
              activeTab === 'servicio'
                ? 'bg-white text-emerald-700 border-slate-300 border-b-white -mb-px'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/70'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            1. Datos del Servicio
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer border-t border-x ${
              activeTab === 'personal'
                ? 'bg-white text-emerald-700 border-slate-300 border-b-white -mb-px'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/70'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            2. Personal a Cargo ({agents.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plantillas')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer border-t border-x ${
              activeTab === 'plantillas'
                ? 'bg-white text-emerald-700 border-slate-300 border-b-white -mb-px'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/70'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            3. Plantillas de Servicio
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feriados')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer border-t border-x ${
              activeTab === 'feriados'
                ? 'bg-white text-emerald-700 border-slate-300 border-b-white -mb-px'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/70'
            }`}
          >
            <Calendar className="w-4 h-4 text-rose-600" />
            4. Feriados ({MONTH_NAMES[schedule.month - 1]})
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 flex-1 overflow-y-auto text-xs text-slate-800">
          {/* TAB 1: DATOS DEL SERVICIO */}
          {activeTab === 'servicio' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-950">
                <h4 className="font-bold text-xs flex items-center gap-1.5 mb-1 text-emerald-900">
                  <Hospital className="w-4 h-4 text-emerald-700" />
                  Identificación Institucional y Cabecera de la Planilla
                </h4>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Configura el nombre exacto del hospital, el servicio a cargo y el jefe de servicio. Estos datos se reflejarán automáticamente en la matriz de pantalla, reportes oficiales de Word, Excel y PDF.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Institución / Hospital:
                  </label>
                  <input
                    type="text"
                    value={serviceConfig.hospitalName}
                    onChange={(e) => handleServiceChange('hospitalName', e.target.value)}
                    placeholder='Ej: HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"'
                    className="w-full bg-white text-slate-900 text-xs font-bold py-1.5 px-2.5 rounded border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Dependencia Ministerial:
                  </label>
                  <input
                    type="text"
                    value={serviceConfig.hospitalSubtitle || ''}
                    onChange={(e) => handleServiceChange('hospitalSubtitle', e.target.value)}
                    placeholder="Ej: Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano"
                    className="w-full bg-white text-slate-900 text-xs py-1.5 px-2.5 rounded border border-slate-300 focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    Nombre del Servicio / Especialidad:
                  </label>
                  <input
                    type="text"
                    list="services-list"
                    value={serviceConfig.serviceName}
                    onChange={(e) => handleServiceChange('serviceName', e.target.value)}
                    placeholder="Ej: Servicio de Guardia Médica y Emergencias / Terapia Intensiva / Enfermería / etc."
                    className="w-full bg-white text-slate-900 text-xs font-bold py-2 px-2.5 rounded border-2 border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <datalist id="services-list">
                    <option value="Servicio de Guardia Médica y Emergencias" />
                    <option value="Servicio de Terapia Intensiva (UTI)" />
                    <option value="Servicio de Enfermería General" />
                    <option value="Servicio de Cirugía y Quirófano" />
                    <option value="Servicio de Diagnóstico por Imágenes" />
                    <option value="Servicio de Laboratorio y Bioquímica" />
                    <option value="Servicio de Informática y SIGHO" />
                    <option value="Servicio de Soporte Técnico y Telecomunicaciones" />
                    <option value="Servicio de Mantenimiento y Servicios Generales" />
                  </datalist>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Jefe / Responsable a Cargo (Nombre Completo):
                  </label>
                  <input
                    type="text"
                    value={serviceConfig.jefeName}
                    onChange={(e) => handleServiceChange('jefeName', e.target.value)}
                    placeholder="Ej: Dr. Benítez, Carlos Alberto"
                    className="w-full bg-white text-slate-900 text-xs font-semibold py-1.5 px-2.5 rounded border border-slate-300 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Cargo / Título Oficial del Jefe:
                  </label>
                  <input
                    type="text"
                    value={serviceConfig.jefeCargo}
                    onChange={(e) => handleServiceChange('jefeCargo', e.target.value)}
                    placeholder="Ej: Jefe de Guardia Médica / Jefe de Servicio"
                    className="w-full bg-white text-slate-900 text-xs py-1.5 px-2.5 rounded border border-slate-300 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Matrícula / Legajo del Jefe:
                  </label>
                  <input
                    type="text"
                    value={serviceConfig.jefeLegajo}
                    onChange={(e) => handleServiceChange('jefeLegajo', e.target.value)}
                    placeholder="Ej: M.P. 3140 o LEG-4820"
                    className="w-full bg-white text-slate-900 text-xs font-mono py-1.5 px-2.5 rounded border border-slate-300 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Horario de Jornal Habitual:
                  </label>
                  <input
                    type="text"
                    value={serviceConfig.jornalHorarioLabel || '06:00 a 13:00 hs'}
                    onChange={(e) => handleServiceChange('jornalHorarioLabel', e.target.value)}
                    placeholder="06:00 a 13:00 hs"
                    className="w-full bg-white text-slate-900 text-xs py-1.5 px-2.5 rounded border border-slate-300 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL A CARGO (AGENTS) */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div>
                  <h4 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-700" />
                    Nómina de Personal del Servicio ({agents.length} agentes)
                  </h4>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Agrega, edita o elimina el personal que tiene a cargo este servicio. Configura si cumplen Jornal (L-V) y su tipo de guardia inhábil.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAgent}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  + Agregar Personal
                </button>
              </div>

              {agents.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                  <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-700">Sin Personal Cargado</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                    Este servicio está en blanco. Puedes agregar el primer agente manualmente o cargar una plantilla sugerida.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddAgent}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-md shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Primer Agente
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('plantillas')}
                      className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white font-medium px-3.5 py-1.5 rounded-md shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Ver Plantillas
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {agents.map((agent, index) => (
                    <div 
                      key={agent.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-50 transition-colors flex flex-col gap-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-bold text-slate-800 text-xs">
                            {agent.name || 'Sin Nombre'}
                          </span>
                          {agent.isJefe && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 font-bold px-1.5 py-0.5 rounded">
                              Jefe de Servicio
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveAgent(index)}
                          className="text-rose-600 hover:text-rose-800 hover:bg-rose-100 p-1 rounded transition-colors cursor-pointer"
                          title="Eliminar agente de la nómina"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">
                            Apellido y Nombre:
                          </label>
                          <input
                            type="text"
                            value={agent.name}
                            onChange={(e) => handleAgentChange(index, 'name', e.target.value)}
                            placeholder="Apellido, Nombre"
                            className="w-full bg-white text-slate-900 text-xs font-bold py-1 px-2 rounded border border-slate-300 mt-0.5 focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">
                            Legajo / Matrícula / DNI:
                          </label>
                          <input
                            type="text"
                            value={agent.legajo}
                            onChange={(e) => handleAgentChange(index, 'legajo', e.target.value)}
                            placeholder="LEG-XXXX o M.P. XXXX"
                            className="w-full bg-white text-slate-900 text-xs font-mono py-1 px-2 rounded border border-slate-300 mt-0.5 focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">
                            Cargo / Función / Especialidad:
                          </label>
                          <input
                            type="text"
                            value={agent.roleLabel || agent.category}
                            onChange={(e) => {
                              handleAgentChange(index, 'roleLabel', e.target.value);
                              handleAgentChange(index, 'category', e.target.value);
                            }}
                            placeholder="Médico de Guardia, Enfermero, etc."
                            className="w-full bg-white text-slate-900 text-xs font-semibold py-1 px-2 rounded border border-slate-300 mt-0.5 focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Guardia options */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 text-[11px]">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={agent.hasJornal !== false}
                              onChange={(e) => handleAgentChange(index, 'hasJornal', e.target.checked)}
                              className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                            />
                            <span className="font-semibold">Cumple Jornal L-V ({serviceConfig.jornalHorarioLabel || '06-13 hs'})</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={Boolean(agent.isJefe)}
                              onChange={(e) => handleAgentChange(index, 'isJefe', e.target.checked)}
                              className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                            />
                            <span className="font-semibold">Es Jefe/a</span>
                          </label>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-bold text-[10px] uppercase">Guardia Inhábil:</span>
                          <select
                            value={agent.allowedInhabileMode || 'activa'}
                            onChange={(e) => handleAgentChange(index, 'allowedInhabileMode', e.target.value as InhabileMode)}
                            className="bg-white text-slate-800 text-xs font-semibold py-0.5 px-2 rounded border border-slate-300 focus:border-emerald-500 cursor-pointer"
                          >
                            <option value="activa">Activa (Presencial en Hospital)</option>
                            <option value="pasiva">Pasiva (Disponibilidad / Llamado)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddAgent}
                    className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-lg text-slate-600 hover:text-emerald-700 font-bold flex items-center justify-center gap-2 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    + Agregar Otro Agente a la Nómina
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PLANTILLAS PREDEFINIDAS */}
          {activeTab === 'plantillas' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-950">
                <h4 className="font-bold text-xs flex items-center gap-1.5 mb-1 text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Plantillas Rápidas para Hospitales y Centros de Salud
                </h4>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Puedes seleccionar una plantilla en blanco para empezar 100% de cero o elegir uno de los servicios más habituales del Hospital Central de Emergencias de Formosa para cargar una estructura base.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICE_PRESETS.map((preset) => {
                  const isCurrent = serviceConfig.serviceName === preset.config.serviceName;
                  return (
                    <div 
                      key={preset.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isCurrent 
                          ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          {preset.id === 'blank' && <FileText className="w-4 h-4 text-slate-600" />}
                          {preset.id === 'guardia_medica' && <Stethoscope className="w-4 h-4 text-emerald-600" />}
                          {preset.id === 'enfermeria' && <HeartHandshake className="w-4 h-4 text-rose-600" />}
                          {preset.id === 'laboratorio_imagenes' && <Activity className="w-4 h-4 text-blue-600" />}
                          {preset.id === 'informatica' && <Server className="w-4 h-4 text-purple-600" />}
                          <h5 className="font-bold text-xs text-slate-900">{preset.name}</h5>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                          {preset.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {preset.agents.length > 0 ? `${preset.agents.length} agentes sugeridos` : '0 agentes (en blanco)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(preset.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1 rounded-md shadow-2xs transition-colors cursor-pointer"
                        >
                          {preset.id === 'blank' ? 'Crear en Blanco' : 'Cargar Plantilla'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: FERIADOS */}
          {activeTab === 'feriados' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-rose-600" />
                  Feriados y Días No Laborables ({MONTH_NAMES[schedule.month - 1]} {schedule.year})
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Los feriados provinciales y nacionales se consideran inhábiles y habilitan guardias de mañana ({serviceConfig.inhabilMananaHorarioLabel || '06-13 hs'}) y tarde ({serviceConfig.inhabilTardeHorarioLabel || '13-20 hs'}).
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
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Servicio activo: <strong className="text-slate-800">{serviceConfig.serviceName || '(Sin nombre)'}</strong> • {agents.length} en nómina
          </div>

          <div className="flex items-center gap-2 ml-auto">
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
              Guardar Configuración del Servicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

