import React, { useState } from 'react';
import { HospitalServiceItem, Agent, HospitalServiceConfig, MonthSchedule, DayInfo, UserAccount } from '../types';
import { 
  X, 
  Plus, 
  Trash2, 
  Check, 
  Building2, 
  Users, 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  FileText, 
  UserPlus, 
  Shield, 
  Clock, 
  Edit3, 
  CheckCircle2,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { exportBlankExcelTemplate } from '../utils/excelExport';
import { registerUserForNewService } from '../utils/auth';

interface ServiceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: HospitalServiceItem[];
  activeServiceId: string;
  currentUser?: UserAccount | null;
  onSelectService: (serviceId: string) => void;
  onCreateNewService: (newService: HospitalServiceItem, startBlankSchedule: boolean) => void;
  onUpdateService: (updatedService: HospitalServiceItem) => void;
  onDeleteService: (serviceId: string) => void;
  currentSchedule: MonthSchedule;
  days: DayInfo[];
}

export const ServiceManagerModal: React.FC<ServiceManagerModalProps> = ({
  isOpen,
  onClose,
  services,
  activeServiceId,
  currentUser,
  onSelectService,
  onCreateNewService,
  onUpdateService,
  onDeleteService,
  currentSchedule,
  days,
}) => {
  const isRRHH = currentUser?.role === 'rrhh' || !currentUser;
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit_active'>('list');
  const [createdUserNotice, setCreatedUserNotice] = useState<{ username: string; pass: string } | null>(null);

  // Form state for creating a new service
  const [newServiceName, setNewServiceName] = useState('');
  const [newJefeName, setNewJefeName] = useState('');
  const [newJefeCargo, setNewJefeCargo] = useState('Jefe de Servicio');
  const [newJefeLegajo, setNewJefeLegajo] = useState('');
  const [newJornalHorario, setNewJornalHorario] = useState('06:00 a 13:00 hs');
  const [newExtraHabilHorario, setNewExtraHabilHorario] = useState('13:00 a 20:00 hs');
  const [newInhabilMananaHorario, setNewInhabilMananaHorario] = useState('06:00 a 13:00 hs');
  const [newInhabilTardeHorario, setNewInhabilTardeHorario] = useState('13:00 a 20:00 hs');
  const [startWithBlankAgents, setStartWithBlankAgents] = useState(true);

  // Active service editing state
  const activeService = services.find(s => s.id === activeServiceId) || services[0];
  const [editingConfig, setEditingConfig] = useState<HospitalServiceConfig>(activeService ? activeService.config : {
    hospitalName: 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"',
    serviceName: '',
    jefeName: '',
    jefeCargo: 'Jefe de Servicio',
    jefeLegajo: '',
  });
  const [editingAgents, setEditingAgents] = useState<Agent[]>(activeService ? activeService.agents : []);

  // Update edit state when activeService changes
  React.useEffect(() => {
    if (activeService) {
      setEditingConfig(activeService.config);
      setEditingAgents(activeService.agents || []);
    }
  }, [activeServiceId, services]);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) {
      alert('Por favor ingrese el nombre del servicio hospitalario.');
      return;
    }

    const newId = `serv_${Date.now()}`;
    const initialAgents: Agent[] = [];

    // If chief is provided, add as first agent
    if (newJefeName.trim()) {
      initialAgents.push({
        id: `agent_jefe_${Date.now()}`,
        name: newJefeName.trim(),
        roleLabel: newJefeCargo.trim() || 'Jefe de Servicio',
        category: 'Jefe de Servicio',
        legajo: newJefeLegajo.trim() || 'LEG-001',
        isJefe: true,
        hasJornal: true,
        allowedInhabileMode: 'pasiva',
      });
    }

    const newService: HospitalServiceItem = {
      id: newId,
      name: newServiceName.trim(),
      config: {
        hospitalName: 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"',
        hospitalSubtitle: 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano',
        serviceName: newServiceName.trim(),
        jefeName: newJefeName.trim(),
        jefeCargo: newJefeCargo.trim() || 'Jefe de Servicio',
        jefeLegajo: newJefeLegajo.trim(),
        jornalHorarioLabel: newJornalHorario.trim() || '06:00 a 13:00 hs',
        extraHabilHorarioLabel: newExtraHabilHorario.trim() || '13:00 a 20:00 hs',
        inhabilMananaHorarioLabel: newInhabilMananaHorario.trim() || '06:00 a 13:00 hs',
        inhabilTardeHorarioLabel: newInhabilTardeHorario.trim() || '13:00 a 20:00 hs',
      },
      agents: initialAgents,
      createdAt: new Date().toISOString(),
    };

    // Auto register a user account for the new service chief
    const createdAccount = registerUserForNewService(
      newService,
      newJefeName.trim() || undefined,
      newJefeLegajo.trim() || undefined
    );

    onCreateNewService(newService, true);

    setCreatedUserNotice({
      username: createdAccount.username,
      pass: createdAccount.password,
    });

    // Reset form
    setNewServiceName('');
    setNewJefeName('');
    setNewJefeLegajo('');
    setActiveTab('list');
  };

  const handleAddAgentToEditing = () => {
    const newAgent: Agent = {
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: 'Nuevo Agente',
      roleLabel: 'Agente de Guardia',
      category: editingConfig.serviceName.toLowerCase().includes('médic') ? 'Médico de Guardia' : 'Personal de Servicio',
      legajo: 'LEG-' + Math.floor(1000 + Math.random() * 9000),
      hasJornal: true,
      allowedInhabileMode: 'activa',
      isJefe: editingAgents.length === 0,
    };
    setEditingAgents([...editingAgents, newAgent]);
  };

  const handleSaveActiveServiceEdits = () => {
    if (!activeService) return;
    const updated: HospitalServiceItem = {
      ...activeService,
      name: editingConfig.serviceName || activeService.name,
      config: editingConfig,
      agents: editingAgents,
    };
    onUpdateService(updated);
    setActiveTab('list');
  };

  const handleDownloadBlankExcel = () => {
    exportBlankExcelTemplate(currentSchedule, days);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Gestión Multi-Servicio Hospitalario
                <span className="text-xs bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/60">
                  {services.length} Servicios Activos
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Cambie de servicio, agregue personal específico o cree una nueva planilla en blanco con datos aislados
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

        {/* Tab Selection */}
        <div className="bg-slate-100 px-5 pt-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer border-t border-x ${
                activeTab === 'list'
                  ? 'bg-white text-emerald-700 border-slate-300 border-b-white -mb-px'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/70'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              1. Seleccionar Servicio ({services.length})
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer border-t border-x ${
                activeTab === 'create'
                  ? 'bg-white text-emerald-700 border-slate-300 border-b-white -mb-px'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/70'
              }`}
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              2. Crear Nuevo Servicio (En Blanco)
            </button>

            <button
              onClick={() => setActiveTab('edit_active')}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer border-t border-x ${
                activeTab === 'edit_active'
                  ? 'bg-white text-emerald-700 border-slate-300 border-b-white -mb-px'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/70'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              3. Personal del Servicio Activo ({editingAgents.length})
            </button>
          </div>

          <button
            onClick={handleDownloadBlankExcel}
            title="Descargar una planilla de Excel 100% en blanco para que el jefe cargue a mano"
            className="flex items-center gap-1.5 text-xs bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-2.5 py-1 rounded shadow-xs mb-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar Plantilla Excel en Blanco (.xlsx)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-50">
          
          {/* New User Account Created Notice */}
          {createdUserNotice && (
            <div className="mb-4 bg-emerald-950 border border-emerald-700 text-emerald-100 rounded-xl p-4 shadow-md flex items-start justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-800 rounded-lg text-emerald-200 mt-0.5">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    ✓ ¡Servicio creado y cuenta de acceso habilitada!
                  </h4>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    El jefe de este nuevo servicio puede iniciar sesión con estas credenciales para cargar únicamente su planilla:
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-emerald-800">
                    <span>Usuario: <strong className="text-emerald-400">{createdUserNotice.username}</strong></span>
                    <span>•</span>
                    <span>Contraseña: <strong className="text-emerald-300">{createdUserNotice.pass}</strong></span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCreatedUserNotice(null)}
                className="text-emerald-400 hover:text-white p-1 rounded hover:bg-emerald-900 cursor-pointer text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: LIST OF SERVICES */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Aislamiento de Datos por Servicio:</strong> Cada servicio tiene su propia nómina de personal, jefe a cargo y planilla mensual. Al cambiar de servicio, no se mezclarán ni verán los datos de otros servicios.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map((serv) => {
                  const isCurrent = serv.id === activeServiceId;
                  return (
                    <div
                      key={serv.id}
                      className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                              <Building2 className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm leading-tight">
                              {serv.config.serviceName || serv.name}
                            </h4>
                          </div>

                          {isCurrent ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> Activo
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                onSelectService(serv.id);
                                onClose();
                              }}
                              className="text-xs bg-slate-800 hover:bg-emerald-600 text-white font-medium px-2.5 py-1 rounded transition-colors cursor-pointer"
                            >
                              Cambiar a este
                            </button>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 space-y-1 my-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div>
                            <span className="text-slate-500">Jefe/a de Servicio:</span>{' '}
                            <strong className="text-slate-800">{serv.config.jefeName || '(Sin asignar)'}</strong>
                            {serv.config.jefeLegajo && ` (${serv.config.jefeLegajo})`}
                          </div>
                          <div>
                            <span className="text-slate-500">Personal Registrado:</span>{' '}
                            <strong className="text-blue-700 font-semibold">{serv.agents?.length || 0} agentes</strong>
                          </div>
                          <div>
                            <span className="text-slate-500">Régimen Horario:</span>{' '}
                            <span>Jornal {serv.config.jornalHorarioLabel || '06-13'} | Extra {serv.config.extraHabilHorarioLabel || '13-20'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            onSelectService(serv.id);
                            setActiveTab('edit_active');
                          }}
                          className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Modificar Personal y Horarios
                        </button>

                        {services.length > 1 && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de eliminar el servicio "${serv.config.serviceName || serv.name}"? Se borrará su configuración y personal asociado.`)) {
                                onDeleteService(serv.id);
                              }
                            }}
                            className="text-xs text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Eliminar este servicio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('create')}
                  className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + Crear Nuevo Servicio Hospitalario en Blanco
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE NEW SERVICE */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                <strong>Nuevo Servicio Hospitalario:</strong> Al crearlo, la planilla comenzará 100% en blanco para este servicio. Luego podrá agregar el personal a cargo y cargar los turnos de guardia sin afectar a otros servicios.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Oficial del Servicio / Área Hospitalaria *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Servicio de Traumatología y Ortopedia, Servicio de Cirugía, etc."
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Apellido y Nombre del Jefe/a de Servicio
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Dr. Gómez, Roberto / Lic. Martínez, Ana"
                    value={newJefeName}
                    onChange={(e) => setNewJefeName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Legajo / Matrícula Profesional del Jefe
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: LEG-4820 o M.P. 3140"
                    value={newJefeLegajo}
                    onChange={(e) => setNewJefeLegajo(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cargo / Título
                  </label>
                  <input
                    type="text"
                    value={newJefeCargo}
                    onChange={(e) => setNewJefeCargo(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Horario de Jornal Ordinario (Días Hábiles)
                  </label>
                  <input
                    type="text"
                    value={newJornalHorario}
                    onChange={(e) => setNewJornalHorario(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Horario de Extra Hábil (Días Hábiles)
                  </label>
                  <input
                    type="text"
                    value={newExtraHabilHorario}
                    onChange={(e) => setNewExtraHabilHorario(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Horario Inhábiles Mañana (Sábados, Domingos, Feriados)
                  </label>
                  <input
                    type="text"
                    value={newInhabilMananaHorario}
                    onChange={(e) => setNewInhabilMananaHorario(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Horario Inhábiles Tarde (Sábados, Domingos, Feriados)
                  </label>
                  <input
                    type="text"
                    value={newInhabilTardeHorario}
                    onChange={(e) => setNewInhabilTardeHorario(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Crear e Iniciar Planilla en Blanco
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: EDIT ACTIVE SERVICE PERSONNEL & SETTINGS */}
          {activeTab === 'edit_active' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Datos del Servicio: <span className="text-slate-900 font-bold">{editingConfig.serviceName || activeService.name}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Nombre del Servicio
                    </label>
                    <input
                      type="text"
                      value={editingConfig.serviceName}
                      onChange={(e) => setEditingConfig({ ...editingConfig, serviceName: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Jefe/a de Servicio
                    </label>
                    <input
                      type="text"
                      value={editingConfig.jefeName}
                      onChange={(e) => setEditingConfig({ ...editingConfig, jefeName: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Legajo / Matrícula Jefe
                    </label>
                    <input
                      type="text"
                      value={editingConfig.jefeLegajo}
                      onChange={(e) => setEditingConfig({ ...editingConfig, jefeLegajo: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Personnel List for This Service */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    Nómina de Personal del Servicio ({editingAgents.length})
                  </h4>

                  <button
                    onClick={handleAddAgentToEditing}
                    className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Agregar Personal
                  </button>
                </div>

                {editingAgents.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center text-xs text-amber-800">
                    <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <p className="font-bold text-sm text-slate-900 mb-1">No hay personal cargado en este servicio aún.</p>
                    <p className="text-slate-600 mb-3">Haga clic en "+ Agregar Personal" para incorporar los agentes a cargo de este servicio.</p>
                    <button
                      onClick={handleAddAgentToEditing}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs cursor-pointer shadow-xs"
                    >
                      <UserPlus className="w-4 h-4" />
                      Agregar Primer Agente
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {editingAgents.map((agent, index) => (
                      <div
                        key={agent.id}
                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {index + 1}
                          </span>
                          <div className="space-y-1 flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-semibold">Apellido y Nombre</label>
                                <input
                                  type="text"
                                  value={agent.name}
                                  onChange={(e) => {
                                    const updated = [...editingAgents];
                                    updated[index] = { ...updated[index], name: e.target.value };
                                    setEditingAgents(updated);
                                  }}
                                  className="w-full px-2 py-1 border border-slate-300 rounded font-semibold text-slate-900"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-500 font-semibold">Legajo / M.P.</label>
                                <input
                                  type="text"
                                  value={agent.legajo}
                                  onChange={(e) => {
                                    const updated = [...editingAgents];
                                    updated[index] = { ...updated[index], legajo: e.target.value };
                                    setEditingAgents(updated);
                                  }}
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-slate-800"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-500 font-semibold">Función / Puesto</label>
                                <input
                                  type="text"
                                  value={agent.roleLabel}
                                  onChange={(e) => {
                                    const updated = [...editingAgents];
                                    updated[index] = { ...updated[index], roleLabel: e.target.value };
                                    setEditingAgents(updated);
                                  }}
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-slate-800"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-500 font-semibold">Modalidad Inhábil</label>
                                <select
                                  value={agent.allowedInhabileMode || 'activa'}
                                  onChange={(e) => {
                                    const updated = [...editingAgents];
                                    updated[index] = { ...updated[index], allowedInhabileMode: e.target.value as 'activa' | 'pasiva' };
                                    setEditingAgents(updated);
                                  }}
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-slate-800 font-medium"
                                >
                                  <option value="activa">Activa (Presencial)</option>
                                  <option value="pasiva">Pasiva (Disponibilidad)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 shrink-0 pt-1 md:pt-0">
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none">
                            <input
                              type="checkbox"
                              checked={agent.hasJornal !== false}
                              onChange={(e) => {
                                const updated = [...editingAgents];
                                updated[index] = { ...updated[index], hasJornal: e.target.checked };
                                setEditingAgents(updated);
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Jornal Ordinario</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Eliminar a ${agent.name} de este servicio?`)) {
                                setEditingAgents(editingAgents.filter((_, i) => i !== index));
                              }
                            }}
                            className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Eliminar agente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleSaveActiveServiceEdits}
                  className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Guardar Cambios de este Servicio
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Servicio Actual: <strong className="text-slate-800">{activeService?.config.serviceName || activeService?.name}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
