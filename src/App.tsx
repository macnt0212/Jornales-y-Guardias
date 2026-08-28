import React, { useState, useEffect, useMemo } from 'react';
import { 
  MonthSchedule, 
  DayInfo, 
  Agent, 
  DayShiftAssignment, 
  InhabileMode,
  HospitalServiceConfig,
  HospitalServiceItem,
  HospitalAuthSession,
  UserAccount
} from './types';
import { 
  DEFAULT_AGENTS, 
  DEFAULT_SERVICE_CONFIG,
  INITIAL_SERVICES,
  getDaysInMonth, 
  generateBalancedSchedule, 
  generateBlankSchedule,
  calculateAgentStats, 
  HOURS_PER_SHIFT,
  MONTH_NAMES,
  isAgentInhabileActiva,
  getAgentInhabileMode,
  isAgentOnlyInhabilePasiva,
  loadAllServices,
  saveAllServices,
  getActiveServiceId,
  setActiveServiceId,
  getScheduleStorageKey
} from './utils/calendar';
import { 
  getCurrentSession, 
  setCurrentSession, 
  canAccessService 
} from './utils/auth';
import { exportScheduleToExcel, exportBlankExcelTemplate } from './utils/excelExport';
import { exportVisualHtml, exportToWord, exportToExcelVisual } from './utils/visualExport';
import { MonthSelectorRibbon } from './components/MonthSelectorRibbon';
import { Header } from './components/Header';
import { SpreadsheetView } from './components/SpreadsheetView';
import { InhabileShiftsTab } from './components/InhabileShiftsTab';
import { AgentDetailTab } from './components/AgentDetailTab';
import { LiquidationSummaryTab } from './components/LiquidationSummaryTab';
import { ConsolidatedRRHHTab } from './components/ConsolidatedRRHHTab';
import { ShiftEditorModal } from './components/ShiftEditorModal';
import { SettingsModal } from './components/SettingsModal';
import { ServiceManagerModal } from './components/ServiceManagerModal';
import { UserManagerModal } from './components/UserManagerModal';
import { OperationsManualModal } from './components/OperationsManualModal';
import { LoginScreen } from './components/LoginScreen';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function App() {
  // Authentication & Session State
  const [session, setSessionState] = useState<HospitalAuthSession | null>(() => {
    return getCurrentSession();
  });

  const currentDate = new Date();
  // Default to current year & month (or 2026 / Septiembre)
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return currentDate.getFullYear() || 2026;
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return currentDate.getMonth() + 1 || 9;
  });

  const [activeTab, setActiveTab] = useState<'matriz' | 'inhabiles' | 'detalle' | 'liquidacion' | 'consolidado_rrhh'>('matriz');

  // Multi-service state list
  const [services, setServices] = useState<HospitalServiceItem[]>(() => {
    return loadAllServices();
  });

  // Currently selected service ID
  const [activeServiceId, setActiveServiceIdState] = useState<string>(() => {
    const currentSess = getCurrentSession();
    if (currentSess && currentSess.user.role === 'jefe_servicio' && currentSess.user.serviceId) {
      return currentSess.user.serviceId;
    }
    return getActiveServiceId();
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isServiceManagerOpen, setIsServiceManagerOpen] = useState<boolean>(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState<boolean>(false);
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);
  const [userManagerTab, setUserManagerTab] = useState<'list' | 'create'>('list');
  const [isShiftEditorOpen, setIsShiftEditorOpen] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<{ agent: Agent; day: DayInfo } | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Retrieve active service object
  const activeService = useMemo(() => {
    return services.find(s => s.id === activeServiceId) || services[0] || INITIAL_SERVICES[0];
  }, [services, activeServiceId]);

  // Filtered services according to authenticated user permissions
  const authorizedServices = useMemo(() => {
    if (!session) return [];
    if (session.user.role === 'rrhh') return services;
    return services.filter(s => canAccessService(session.user, s.id));
  }, [services, session]);

  // Agents list for the active service
  const [agents, setAgents] = useState<Agent[]>(() => {
    const currentServ = loadAllServices().find(s => s.id === getActiveServiceId()) || INITIAL_SERVICES[0];
    return currentServ.agents || [];
  });

  // Current Schedule state (scoped strictly to activeServiceId)
  const [schedule, setSchedule] = useState<MonthSchedule>(() => {
    const servId = getActiveServiceId();
    const allServs = loadAllServices();
    const currentServ = allServs.find(s => s.id === servId) || INITIAL_SERVICES[0];
    const initialConfig = currentServ.config || DEFAULT_SERVICE_CONFIG;
    const initialAgents = currentServ.agents || [];

    const storageKey = getScheduleStorageKey(servId, selectedYear, selectedMonth);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const loaded: MonthSchedule = JSON.parse(saved);
        let healedConfig = loaded.serviceConfig || initialConfig;
        let healedAgents = loaded.agents || initialAgents;

        if (servId === 'serv_informatica' || (healedConfig?.serviceName && healedConfig.serviceName.toLowerCase().includes('informática'))) {
          healedConfig = {
            ...healedConfig,
            jefeName: 'Cantero, Miguel Angel',
            jefeCargo: 'Jefe del Servicio de Informática',
            jefeLegajo: healedConfig.jefeLegajo === 'LEG-4820' ? 'LEG-5192' : (healedConfig.jefeLegajo || 'LEG-5192'),
          };
          healedAgents = healedAgents.map(a => {
            if (a.name.toLowerCase().includes('cantero')) {
              return {
                ...a,
                isJefe: true,
                roleLabel: 'Jefe del Servicio de Informática',
                category: 'Soporte Técnico',
                allowedInhabileMode: 'activa' as InhabileMode,
              };
            }
            if (a.name.toLowerCase().includes('escobar')) {
              return {
                ...a,
                isJefe: false,
                roleLabel: 'Soporte Informático SIGHO',
                category: 'Soporte Informático SIGHO',
                allowedInhabileMode: 'pasiva' as InhabileMode,
              };
            }
            return a;
          });
        }

        return {
          ...loaded,
          serviceId: servId,
          serviceConfig: healedConfig,
          agents: healedAgents,
        };
      } catch (e) {
        console.error(e);
      }
    }
    
    // If no saved schedule, if service has 0 agents or is a new blank service, return a clean blank schedule
    if (initialAgents.length === 0) {
      return generateBlankSchedule(selectedYear, selectedMonth, [], undefined, initialConfig);
    }
    return generateBalancedSchedule(selectedYear, selectedMonth, initialAgents, undefined, initialConfig);
  });

  // Handle Login
  const handleLoginSuccess = (newSession: HospitalAuthSession) => {
    setSessionState(newSession);
    setCurrentSession(newSession);

    // Refresh services to ensure newly registered services are present
    const freshServices = loadAllServices();
    setServices(freshServices);

    if (newSession.user.role === 'jefe_servicio' && newSession.user.serviceId) {
      handleSelectService(newSession.user.serviceId, newSession.user);
      setActiveTab('matriz');
    } else {
      setActiveTab('matriz');
    }
    showToast(`✓ Acceso autorizado: ${newSession.user.fullName} (${newSession.user.serviceName || newSession.user.roleTitle})`);
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentSession(null);
    setSessionState(null);
    setActiveTab('matriz');
    setIsServiceManagerOpen(false);
    setIsUserManagerOpen(false);
  };

  // Enforce session security constraints
  useEffect(() => {
    if (session) {
      if (session.user.role === 'jefe_servicio' && session.user.serviceId) {
        if (activeServiceId !== session.user.serviceId) {
          handleSelectService(session.user.serviceId, session.user);
        }
        if (activeTab === 'consolidado_rrhh') {
          setActiveTab('matriz');
        }
        setIsServiceManagerOpen(false);
        setIsUserManagerOpen(false);
      }
    }
  }, [session, activeServiceId, activeTab]);


  // Synchronize days list whenever year/month/holidays change
  const days: DayInfo[] = useMemo(() => {
    return getDaysInMonth(schedule.year, schedule.month, schedule.holidays);
  }, [schedule.year, schedule.month, schedule.holidays]);

  // Save to localStorage when schedule updates (isolated by serviceId, year and month)
  useEffect(() => {
    const currentServId = schedule.serviceId || activeServiceId;
    const storageKey = getScheduleStorageKey(currentServId, schedule.year, schedule.month);
    localStorage.setItem(storageKey, JSON.stringify(schedule));
  }, [schedule, activeServiceId]);

  // Switch active service (enforces RBAC)
  const handleSelectService = (newServiceId: string, userOverride?: UserAccount) => {
    const activeUser = userOverride || session?.user;
    if (activeUser && !canAccessService(activeUser, newServiceId)) {
      alert('Acceso restringido: Usted no cuenta con permisos para ver o modificar la planilla de este servicio hospitalario.');
      return;
    }

    const currentServices = loadAllServices();
    const targetService = currentServices.find(s => s.id === newServiceId) || services.find(s => s.id === newServiceId);
    if (!targetService) return;

    setActiveServiceIdState(newServiceId);
    setActiveServiceId(newServiceId);

    const targetAgents = targetService.agents || [];
    setAgents(targetAgents);

    // Load or create schedule for target service
    const storageKey = getScheduleStorageKey(newServiceId, schedule.year, schedule.month);
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const loaded: MonthSchedule = JSON.parse(saved);
        setSchedule({
          ...loaded,
          serviceId: newServiceId,
          agents: loaded.agents && loaded.agents.length > 0 ? loaded.agents : targetAgents,
          serviceConfig: targetService.config,
        });
      } catch (e) {
        console.error(e);
        const newSched = targetAgents.length > 0 
          ? generateBalancedSchedule(schedule.year, schedule.month, targetAgents, undefined, targetService.config)
          : generateBlankSchedule(schedule.year, schedule.month, [], undefined, targetService.config);
        newSched.serviceId = newServiceId;
        setSchedule(newSched);
      }
    } else {
      const newSched = targetAgents.length > 0 
        ? generateBalancedSchedule(schedule.year, schedule.month, targetAgents, undefined, targetService.config)
        : generateBlankSchedule(schedule.year, schedule.month, [], undefined, targetService.config);
      newSched.serviceId = newServiceId;
      setSchedule(newSched);
    }

    showToast(`✓ Cambiado a: ${targetService.config.serviceName || targetService.name}`);
  };

  // Create a brand new service (with blank template)
  const handleCreateNewService = (newService: HospitalServiceItem, startBlankSchedule: boolean) => {
    const updatedServices = [...services, newService];
    setServices(updatedServices);
    saveAllServices(updatedServices);

    setActiveServiceIdState(newService.id);
    setActiveServiceId(newService.id);
    setAgents(newService.agents || []);

    const newBlankSchedule = generateBlankSchedule(
      schedule.year, 
      schedule.month, 
      newService.agents || [], 
      undefined, 
      newService.config
    );
    newBlankSchedule.serviceId = newService.id;
    setSchedule(newBlankSchedule);

    const storageKey = getScheduleStorageKey(newService.id, schedule.year, schedule.month);
    localStorage.setItem(storageKey, JSON.stringify(newBlankSchedule));

    showToast(`✓ Servicio "${newService.name}" creado con planilla en blanco`);
  };

  // Update existing service
  const handleUpdateService = (updatedService: HospitalServiceItem) => {
    const updatedServices = services.map(s => s.id === updatedService.id ? updatedService : s);
    setServices(updatedServices);
    saveAllServices(updatedServices);

    if (updatedService.id === activeServiceId) {
      setAgents(updatedService.agents || []);
      setSchedule(prev => ({
        ...prev,
        agents: updatedService.agents || [],
        serviceConfig: updatedService.config,
      }));
    }
    showToast(`✓ Datos del servicio "${updatedService.name}" guardados`);
  };

  // Delete service
  const handleDeleteService = (serviceIdToDelete: string) => {
    if (services.length <= 1) {
      alert('Debe quedar al menos un servicio registrado.');
      return;
    }
    const updatedServices = services.filter(s => s.id !== serviceIdToDelete);
    setServices(updatedServices);
    saveAllServices(updatedServices);

    if (activeServiceId === serviceIdToDelete) {
      const nextActive = updatedServices[0];
      handleSelectService(nextActive.id);
    }
    showToast('✓ Servicio eliminado exitosamente');
  };

  // Export blank excel template for the active service
  const handleExportBlankExcel = () => {
    exportBlankExcelTemplate(schedule, days);
    showToast('✓ Descargando Plantilla Excel en Blanco (.xlsx)...');
  };


  // Save agents list when modified
  useEffect(() => {
    localStorage.setItem('hcef_agents', JSON.stringify(agents));
  }, [agents]);

  // Handle Month/Year Change
  const handleMonthChange = (newYear: number, newMonth: number) => {
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);

    const currentServId = schedule.serviceId || activeServiceId;
    const storageKey = getScheduleStorageKey(currentServId, newYear, newMonth);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const loadedSchedule: MonthSchedule = JSON.parse(saved);
        setSchedule(loadedSchedule);
        const newDays = getDaysInMonth(newYear, newMonth, loadedSchedule.holidays);
        showToast(`Cargada planilla de ${MONTH_NAMES[newMonth - 1]} ${newYear} (${newDays.length} días actualizados)`);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // Si no existía, generar la rotación o planilla en blanco
    const newSchedule = agents.length > 0
      ? generateBalancedSchedule(newYear, newMonth, agents, schedule.holidays, schedule.serviceConfig)
      : generateBlankSchedule(newYear, newMonth, [], schedule.holidays, schedule.serviceConfig);
    newSchedule.serviceId = currentServId;
    setSchedule(newSchedule);
    const newDays = getDaysInMonth(newYear, newMonth, newSchedule.holidays);
    showToast(`✓ Cargada planilla de ${MONTH_NAMES[newMonth - 1]} ${newYear} (${newDays.length} días)`);
  };

  // Generate Balanced Schedule
  const handleGenerateBalanced = () => {
    const newSchedule = generateBalancedSchedule(schedule.year, schedule.month, agents, schedule.holidays, schedule.serviceConfig);
    setSchedule(newSchedule);
    showToast(`✓ Rotación equilibrada generada con éxito para ${MONTH_NAMES[schedule.month - 1]} ${schedule.year}`);
  };

  // Export Visual HTML (100% formatted & inalterable)
  const handleExportVisualHtml = () => {
    exportVisualHtml(schedule, days);
    showToast(`✓ Planilla visual descargada (abre con formato exacto o guarda en PDF)`);
  };

  // Export to Word (.doc)
  const handleExportWord = () => {
    exportToWord(schedule, days);
    showToast(`✓ Planilla Word (.doc) descargada (editable en Microsoft Word)`);
  };

  // Export to Excel with Visual Formatting (.xls)
  const handleExportExcelVisual = () => {
    exportToExcelVisual(schedule, days);
    showToast(`✓ Planilla Excel (.xls) con formato visual y colores descargada con éxito`);
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    exportScheduleToExcel(schedule, days);
    showToast(`✓ Planilla Excel básica (.xlsx) descargada correctamente`);
  };

  // Print Window
  const handlePrint = () => {
    window.print();
  };

  // Reset Schedule
  const handleReset = () => {
    if (window.confirm(`¿Deseas reiniciar todas las asignaciones del mes de ${MONTH_NAMES[schedule.month - 1]} ${schedule.year}?`)) {
      const blankAssignments: Record<string, DayShiftAssignment> = {};
      days.forEach(d => {
        schedule.agents.forEach(a => {
          blankAssignments[`${a.id}_${d.dateStr}`] = {
            jornal: false,
            extraHabil: false,
            extraInhabilManana: false,
            extraInhabilMananaTipo: 'activa',
            extraInhabilTarde: false,
            extraInhabilTardeTipo: 'activa',
          };
        });
      });

      setSchedule(prev => ({
        ...prev,
        assignments: blankAssignments,
      }));
      showToast('Asignaciones del mes reiniciadas');
    }
  };

  // Cell Click -> Open Shift Editor Modal
  const handleCellClick = (agent: Agent, day: DayInfo) => {
    setSelectedCell({ agent, day });
    setIsShiftEditorOpen(true);
  };

  // Save Shift from Modal
  const handleSaveShift = (agentId: string, dateStr: string, updatedAssignment: DayShiftAssignment) => {
    const key = `${agentId}_${dateStr}`;
    setSchedule(prev => ({
      ...prev,
      assignments: {
        ...prev.assignments,
        [key]: updatedAssignment,
      },
    }));
    showToast('Turno actualizado');
  };

  // Quick Toggles
  const handleQuickToggleJornal = (agentId: string, dateStr: string) => {
    const key = `${agentId}_${dateStr}`;
    const current = schedule.assignments[key] || {
      jornal: false,
      extraHabil: false,
      extraInhabilManana: false,
      extraInhabilTarde: false,
    };
    setSchedule(prev => ({
      ...prev,
      assignments: {
        ...prev.assignments,
        [key]: {
          ...current,
          jornal: !current.jornal,
        },
      },
    }));
  };

  const handleQuickToggleExtraHabil = (agentId: string, dateStr: string) => {
    const key = `${agentId}_${dateStr}`;
    const current = schedule.assignments[key] || {
      jornal: false,
      extraHabil: false,
      extraInhabilManana: false,
      extraInhabilTarde: false,
    };
    setSchedule(prev => ({
      ...prev,
      assignments: {
        ...prev.assignments,
        [key]: {
          ...current,
          extraHabil: !current.extraHabil,
        },
      },
    }));
  };

  // Update Inhabil shift from Inhabil Tab
  const handleUpdateInhabilShift = (
    dateStr: string,
    shift: 'manana' | 'tarde',
    assignedAgentId: string | null,
    mode: InhabileMode
  ) => {
    setSchedule(prev => {
      const newAssignments = { ...prev.assignments };

      // Remover asignación previa para este turno en esta fecha
      prev.agents.forEach(a => {
        const k = `${a.id}_${dateStr}`;
        if (newAssignments[k]) {
          if (shift === 'manana') {
            newAssignments[k] = {
              ...newAssignments[k],
              extraInhabilManana: false,
            };
          } else {
            newAssignments[k] = {
              ...newAssignments[k],
              extraInhabilTarde: false,
            };
          }
        }
      });

      // Si se asignó un nuevo agente, activarlo
      if (assignedAgentId) {
        const targetAgent = prev.agents.find(a => a.id === assignedAgentId);
        const resolvedMode = mode || getAgentInhabileMode(targetAgent);
        const k = `${assignedAgentId}_${dateStr}`;
        const existing = newAssignments[k] || {
          jornal: false,
          extraHabil: false,
          extraInhabilManana: false,
          extraInhabilMananaTipo: resolvedMode,
          extraInhabilTarde: false,
          extraInhabilTardeTipo: resolvedMode,
        };

        if (shift === 'manana') {
          newAssignments[k] = {
            ...existing,
            extraInhabilManana: true,
            extraInhabilMananaTipo: resolvedMode,
          };
        } else {
          newAssignments[k] = {
            ...existing,
            extraInhabilTarde: true,
            extraInhabilTardeTipo: resolvedMode,
          };
        }
      }

      return {
        ...prev,
        assignments: newAssignments,
      };
    });
  };

  // Set All Inhábiles to 'activa' or 'pasiva'
  const handleSetAllInhabileMode = (mode: InhabileMode) => {
    setSchedule(prev => {
      const newAssignments = { ...prev.assignments };
      days.filter(d => d.isWeekend || d.isHoliday).forEach(day => {
        prev.agents.forEach(agent => {
          const k = `${agent.id}_${day.dateStr}`;
          if (newAssignments[k]) {
            newAssignments[k] = {
              ...newAssignments[k],
              extraInhabilMananaTipo: mode,
              extraInhabilTardeTipo: mode,
            };
          }
        });
      });

      return {
        ...prev,
        assignments: newAssignments,
      };
    });
    showToast(`Todas las guardias inhábiles configuradas como ${mode.toUpperCase()}S`);
  };

  // Clear single cell completely
  const handleClearCell = (agentId: string, dateStr: string) => {
    setSchedule(prev => {
      const k = `${agentId}_${dateStr}`;
      const agent = prev.agents.find(a => a.id === agentId);
      const defaultMode = getAgentInhabileMode(agent);
      return {
        ...prev,
        assignments: {
          ...prev.assignments,
          [k]: {
            jornal: false,
            extraHabil: false,
            extraInhabilManana: false,
            extraInhabilMananaTipo: defaultMode,
            extraInhabilTarde: false,
            extraInhabilTardeTipo: defaultMode,
            observaciones: '',
          },
        },
      };
    });
    showToast('🗑️ Celda borrada / vaciada');
  };

  // Clear only extras from a cell (keep jornal)
  const handleClearCellOnlyExtras = (agentId: string, dateStr: string) => {
    setSchedule(prev => {
      const k = `${agentId}_${dateStr}`;
      const existing = prev.assignments[k] || { jornal: false };
      return {
        ...prev,
        assignments: {
          ...prev.assignments,
          [k]: {
            ...existing,
            extraHabil: false,
            extraInhabilManana: false,
            extraInhabilTarde: false,
          },
        },
      };
    });
    showToast('Horas extras borradas de la celda');
  };

  // Clear only jornal from a cell (keep extras)
  const handleClearCellOnlyJornal = (agentId: string, dateStr: string) => {
    setSchedule(prev => {
      const k = `${agentId}_${dateStr}`;
      const existing = prev.assignments[k] || {};
      return {
        ...prev,
        assignments: {
          ...prev.assignments,
          [k]: {
            ...existing,
            jornal: false,
          },
        },
      };
    });
    showToast('Jornal borrado de la celda');
  };

  // Clear single day inhábiles (both morning and afternoon for all agents)
  const handleClearDayInhabiles = (dateStr: string) => {
    setSchedule(prev => {
      const newAssignments = { ...prev.assignments };
      prev.agents.forEach(a => {
        const k = `${a.id}_${dateStr}`;
        if (newAssignments[k]) {
          newAssignments[k] = {
            ...newAssignments[k],
            extraInhabilManana: false,
            extraInhabilTarde: false,
          };
        }
      });
      return {
        ...prev,
        assignments: newAssignments,
      };
    });
    showToast(`Guardias inhábiles del día borradas`);
  };

  // Bulk clear: All cells of the month
  const handleClearAllMonth = () => {
    setSchedule(prev => {
      const emptyAssignments: Record<string, DayShiftAssignment> = {};
      days.forEach(day => {
        prev.agents.forEach(agent => {
          const k = `${agent.id}_${day.dateStr}`;
          const defaultMode = getAgentInhabileMode(agent);
          emptyAssignments[k] = {
            jornal: false,
            extraHabil: false,
            extraInhabilManana: false,
            extraInhabilMananaTipo: defaultMode,
            extraInhabilTarde: false,
            extraInhabilTardeTipo: defaultMode,
          };
        });
      });
      return {
        ...prev,
        assignments: emptyAssignments,
      };
    });
    showToast('✓ Todas las celdas del mes han sido vaciadas');
  };

  // Bulk clear: All extras of the month (keeps jornales)
  const handleClearAllExtrasMonth = () => {
    setSchedule(prev => {
      const newAssignments = { ...prev.assignments };
      days.forEach(day => {
        prev.agents.forEach(agent => {
          const k = `${agent.id}_${day.dateStr}`;
          if (newAssignments[k]) {
            newAssignments[k] = {
              ...newAssignments[k],
              extraHabil: false,
              extraInhabilManana: false,
              extraInhabilTarde: false,
            };
          }
        });
      });
      return {
        ...prev,
        assignments: newAssignments,
      };
    });
    showToast('✓ Todas las horas extras del mes han sido borradas (jornales conservados)');
  };

  // Bulk clear: All jornales of the month (keeps extras)
  const handleClearAllJornalesMonth = () => {
    setSchedule(prev => {
      const newAssignments = { ...prev.assignments };
      days.forEach(day => {
        prev.agents.forEach(agent => {
          const k = `${agent.id}_${day.dateStr}`;
          if (newAssignments[k]) {
            newAssignments[k] = {
              ...newAssignments[k],
              jornal: false,
            };
          }
        });
      });
      return {
        ...prev,
        assignments: newAssignments,
      };
    });
    showToast('✓ Todos los jornales del mes han sido borrados');
  };

  // Bulk clear: All inhábiles of the month
  const handleClearAllInhabilesMonth = () => {
    setSchedule(prev => {
      const newAssignments = { ...prev.assignments };
      days.filter(d => d.isWeekend || d.isHoliday).forEach(day => {
        prev.agents.forEach(agent => {
          const k = `${agent.id}_${day.dateStr}`;
          if (newAssignments[k]) {
            newAssignments[k] = {
              ...newAssignments[k],
              extraInhabilManana: false,
              extraInhabilTarde: false,
            };
          }
        });
      });
      return {
        ...prev,
        assignments: newAssignments,
      };
    });
    showToast('✓ Todas las guardias inhábiles del mes han sido borradas');
  };

  // Bulk clear: Specific agent's whole month
  const handleClearAgentMonth = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    const agentName = agent?.name || 'Agente';
    setSchedule(prev => {
      const newAssignments = { ...prev.assignments };
      const defaultMode = getAgentInhabileMode(agent);
      days.forEach(day => {
        const k = `${agentId}_${day.dateStr}`;
        newAssignments[k] = {
          jornal: false,
          extraHabil: false,
          extraInhabilManana: false,
          extraInhabilMananaTipo: defaultMode,
          extraInhabilTarde: false,
          extraInhabilTardeTipo: defaultMode,
        };
      });
      return {
        ...prev,
        assignments: newAssignments,
      };
    });
    showToast(`✓ Celdas de ${agentName} borradas para todo el mes`);
  };

  // Apply Official Inhabile Rule: Cantero = Activas (presencial), Resto = Pasivas (disponibilidad), Amarilla = Únicamente Inhábiles Pasivas
  const handleApplyOfficialInhabilePolicy = () => {
    setSchedule(prev => {
      const newAssignments = { ...prev.assignments };
      const galeano = prev.agents.find(a => a.name.toLowerCase().includes('galeano')) || prev.agents[2];

      days.forEach(day => {
        const isBusinessDay = !day.isWeekend && !day.isHoliday;
        prev.agents.forEach(agent => {
          const k = `${agent.id}_${day.dateStr}`;
          if (newAssignments[k]) {
            const properMode = getAgentInhabileMode(agent);
            newAssignments[k] = {
              ...newAssignments[k],
              extraInhabilMananaTipo: properMode,
              extraInhabilTardeTipo: properMode,
            };

            // Amarilla solo realiza inhábiles pasivas (sin extra hábil)
            if (isAgentOnlyInhabilePasiva(agent) && newAssignments[k].extraHabil) {
              newAssignments[k].extraHabil = false;
              if (galeano && isBusinessDay) {
                const kGaleano = `${galeano.id}_${day.dateStr}`;
                if (newAssignments[kGaleano]) {
                  newAssignments[kGaleano].extraHabil = true;
                }
              }
            }
          }
        });
      });

      return {
        ...prev,
        assignments: newAssignments,
      };
    });
    showToast(`✓ Regla oficial aplicada: Cantero (Activas), Escobar y Galeano (Pasivas), y Amarilla (Únicamente Inhábiles Pasivas).`);
  };

  // Auto Assign Inhabiles only with weekend pair rotation
  const handleAutoAssignInhabiles = () => {
    setSchedule(prev => {
      const newAssignments = { ...prev.assignments };

      // Identificar agentes
      const cantero = prev.agents.find(a => isAgentInhabileActiva(a) || a.name.toLowerCase().includes('cantero')) 
        || prev.agents.find(a => a.id === 'agent_soporte_1') 
        || prev.agents[1] 
        || prev.agents[0];

      const escobar = prev.agents.find(a => a.name.toLowerCase().includes('escobar')) 
        || prev.agents.find(a => a.isJefe || a.id === 'agent_jefe') 
        || prev.agents[0];

      const galeano = prev.agents.find(a => a.name.toLowerCase().includes('galeano')) 
        || prev.agents.find(a => a.id === 'agent_sigho_1') 
        || prev.agents[2] 
        || prev.agents[0];

      const amarilla = prev.agents.find(a => a.name.toLowerCase().includes('amarilla')) 
        || prev.agents.find(a => a.id === 'agent_sigho_2') 
        || prev.agents[3] 
        || prev.agents[1] 
        || prev.agents[0];

      // Agrupar fines de semana
      let weekendCounter = -1;
      let prevWasWeekend = false;
      const weekendIndexMap = new Map<string, number>();

      days.forEach((d) => {
        if (d.isWeekend) {
          if (!prevWasWeekend) {
            weekendCounter++;
          }
          weekendIndexMap.set(d.dateStr, weekendCounter);
          prevWasWeekend = true;
        } else {
          prevWasWeekend = false;
        }
      });

      let holidayWeekdayCounter = 0;

      days.filter(d => d.isWeekend || d.isHoliday).forEach(day => {
        // Limpiar asignaciones previas de inhábiles
        prev.agents.forEach(agent => {
          const k = `${agent.id}_${day.dateStr}`;
          if (newAssignments[k]) {
            newAssignments[k] = {
              ...newAssignments[k],
              extraInhabilManana: false,
              extraInhabilTarde: false,
            };
          }
        });

        if (day.isWeekend) {
          const wIndex = weekendIndexMap.get(day.dateStr) ?? 0;
          const isPair1Weekend = wIndex % 2 === 0;

          if (isPair1Weekend) {
            // Pareja 1: Cantero (ACTIVA) y Escobar (PASIVA) juntos
            if (day.dayOfWeek === 6) {
              // Sábado
              const kCantero = `${cantero.id}_${day.dateStr}`;
              newAssignments[kCantero] = {
                ...(newAssignments[kCantero] || {}),
                jornal: false,
                extraHabil: false,
                extraInhabilManana: true,
                extraInhabilMananaTipo: 'activa',
              };

              const kEscobar = `${escobar.id}_${day.dateStr}`;
              newAssignments[kEscobar] = {
                ...(newAssignments[kEscobar] || {}),
                jornal: false,
                extraHabil: false,
                extraInhabilTarde: true,
                extraInhabilTardeTipo: 'pasiva',
              };
            } else {
              // Domingo
              const kEscobar = `${escobar.id}_${day.dateStr}`;
              newAssignments[kEscobar] = {
                ...(newAssignments[kEscobar] || {}),
                jornal: false,
                extraHabil: false,
                extraInhabilManana: true,
                extraInhabilMananaTipo: 'pasiva',
              };

              const kCantero = `${cantero.id}_${day.dateStr}`;
              newAssignments[kCantero] = {
                ...(newAssignments[kCantero] || {}),
                jornal: false,
                extraHabil: false,
                extraInhabilTarde: true,
                extraInhabilTardeTipo: 'activa',
              };
            }
          } else {
            // Pareja 2: Galeano (PASIVA) y Amarilla (PASIVA) juntos
            if (day.dayOfWeek === 6) {
              // Sábado
              const kGaleano = `${galeano.id}_${day.dateStr}`;
              newAssignments[kGaleano] = {
                ...(newAssignments[kGaleano] || {}),
                jornal: false,
                extraHabil: false,
                extraInhabilManana: true,
                extraInhabilMananaTipo: 'pasiva',
              };

              const kAmarilla = `${amarilla.id}_${day.dateStr}`;
              newAssignments[kAmarilla] = {
                ...(newAssignments[kAmarilla] || {}),
                jornal: false,
                extraHabil: false,
                extraInhabilTarde: true,
                extraInhabilTardeTipo: 'pasiva',
              };
            } else {
              // Domingo
              const kAmarilla = `${amarilla.id}_${day.dateStr}`;
              newAssignments[kAmarilla] = {
                ...(newAssignments[kAmarilla] || {}),
                jornal: false,
                extraHabil: false,
                extraInhabilManana: true,
                extraInhabilMananaTipo: 'pasiva',
              };

              const kGaleano = `${galeano.id}_${day.dateStr}`;
              newAssignments[kGaleano] = {
                ...(newAssignments[kGaleano] || {}),
                jornal: false,
                extraHabil: false,
                extraInhabilTarde: true,
                extraInhabilTardeTipo: 'pasiva',
              };
            }
          }
        } else {
          // Feriados en días de semana
          if (holidayWeekdayCounter % 2 === 0) {
            // Pareja 1
            const kCantero = `${cantero.id}_${day.dateStr}`;
            newAssignments[kCantero] = {
              ...(newAssignments[kCantero] || {}),
              jornal: false,
              extraHabil: false,
              extraInhabilManana: true,
              extraInhabilMananaTipo: 'activa',
            };

            const kEscobar = `${escobar.id}_${day.dateStr}`;
            newAssignments[kEscobar] = {
              ...(newAssignments[kEscobar] || {}),
              jornal: false,
              extraHabil: false,
              extraInhabilTarde: true,
              extraInhabilTardeTipo: 'pasiva',
            };
          } else {
            // Pareja 2
            const kGaleano = `${galeano.id}_${day.dateStr}`;
            newAssignments[kGaleano] = {
              ...(newAssignments[kGaleano] || {}),
              jornal: false,
              extraHabil: false,
              extraInhabilManana: true,
              extraInhabilMananaTipo: 'pasiva',
            };

            const kAmarilla = `${amarilla.id}_${day.dateStr}`;
            newAssignments[kAmarilla] = {
              ...(newAssignments[kAmarilla] || {}),
              jornal: false,
              extraHabil: false,
              extraInhabilTarde: true,
              extraInhabilTardeTipo: 'pasiva',
            };
          }
          holidayWeekdayCounter++;
        }
      });

      return {
        ...prev,
        assignments: newAssignments,
      };
    });
    showToast('✓ Fines de semana asignados por duplas: Cantero (Activa) & Escobar (Pasiva) de por medio, Galeano & Amarilla (Pasivas)');
  };

  // Direct agent info update from spreadsheet
  const handleUpdateAgentName = (agentId: string, newName: string, newLegajo?: string) => {
    const updated = agents.map(a => {
      if (a.id === agentId) {
        return {
          ...a,
          name: newName,
          legajo: newLegajo !== undefined && newLegajo !== '' ? newLegajo : a.legajo,
        };
      }
      return a;
    });
    setAgents(updated);
    setSchedule(prev => ({
      ...prev,
      agents: updated,
    }));
    showToast(`Nombre actualizado: ${newName}`);
  };

  // Save Settings from Modal
  const handleSaveSettings = (
    updatedAgents: Agent[], 
    updatedHolidays: Record<string, string>,
    updatedServiceConfig?: HospitalServiceConfig
  ) => {
    const configToUse = updatedServiceConfig || schedule.serviceConfig || DEFAULT_SERVICE_CONFIG;
    setAgents(updatedAgents);
    setSchedule(prev => ({
      ...prev,
      agents: updatedAgents,
      holidays: updatedHolidays,
      serviceConfig: configToUse,
    }));

    // Update active service in services list
    const updatedServices = services.map(s => {
      if (s.id === activeServiceId) {
        return {
          ...s,
          name: configToUse.serviceName || s.name,
          config: configToUse,
          agents: updatedAgents,
        };
      }
      return s;
    });
    setServices(updatedServices);
    saveAllServices(updatedServices);

    showToast('✓ Configuración del servicio, personal y feriados guardada exitosamente');
  };

  // Overall statistics
  const statsOverview = useMemo(() => {
    let totalJornalHours = 0;
    let totalExtHabilHours = 0;
    let totalInhabActivaHours = 0;
    let totalInhabPasivaHours = 0;

    schedule.agents.forEach(agent => {
      const stats = calculateAgentStats(agent, schedule, days);
      totalJornalHours += stats.horasJornal;
      totalExtHabilHours += stats.horasExtraHabil;
      totalInhabActivaHours += stats.horasInhabilActiva;
      totalInhabPasivaHours += stats.horasInhabilPasiva;
    });

    return {
      totalJornalHours,
      totalExtHabilHours,
      totalInhabActivaHours,
      totalInhabPasivaHours,
    };
  }, [schedule, days]);

  if (!session) {
    return (
      <>
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess} 
          onOpenManual={() => setIsManualOpen(true)}
        />
        <OperationsManualModal
          isOpen={isManualOpen}
          onClose={() => setIsManualOpen(false)}
          serviceName={schedule.serviceConfig?.serviceName}
          isRRHH={false}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white border border-emerald-500/50 shadow-2xl rounded-lg px-4 py-3 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Institutional Header */}
      <Header
        schedule={schedule}
        days={days}
        totalJornalHours={statsOverview.totalJornalHours}
        totalExtHabilHours={statsOverview.totalExtHabilHours}
        totalInhabActivaHours={statsOverview.totalInhabActivaHours}
        totalInhabPasivaHours={statsOverview.totalInhabPasivaHours}
        services={authorizedServices}
        activeServiceId={activeServiceId}
        currentUser={session.user}
        onLogout={handleLogout}
        onOpenUserManager={() => {
          setUserManagerTab('list');
          setIsUserManagerOpen(true);
        }}
        onOpenCreateUser={() => {
          setUserManagerTab('create');
          setIsUserManagerOpen(true);
        }}
        onSelectService={handleSelectService}
        onOpenServiceManager={() => setIsServiceManagerOpen(true)}
        onOpenManual={() => setIsManualOpen(true)}
        onExportBlankExcel={handleExportBlankExcel}
        onMonthChange={handleMonthChange}
        onGenerateBalanced={handleGenerateBalanced}
        onExportExcel={handleExportExcel}
        onExportExcelVisual={handleExportExcelVisual}
        onExportVisualHtml={handleExportVisualHtml}
        onExportWord={handleExportWord}
        onPrint={handlePrint}
        onReset={handleReset}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body Content according to Active Tab */}
      <main className="max-w-7xl w-full mx-auto px-4 py-5 sm:px-6 lg:px-8 flex-1">
        {/* Interactive Month & Year Quick Selector Ribbon */}
        <MonthSelectorRibbon
          schedule={schedule}
          days={days}
          onMonthChange={handleMonthChange}
          onGenerateBalanced={handleGenerateBalanced}
        />

        {activeTab === 'matriz' && (
          <SpreadsheetView
            schedule={schedule}
            days={days}
            onCellClick={handleCellClick}
            onQuickToggleJornal={handleQuickToggleJornal}
            onQuickToggleExtraHabil={handleQuickToggleExtraHabil}
            onClearCell={handleClearCell}
            onClearAllMonth={handleClearAllMonth}
            onClearAllExtrasMonth={handleClearAllExtrasMonth}
            onClearAllJornalesMonth={handleClearAllJornalesMonth}
            onClearAgentMonth={handleClearAgentMonth}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onUpdateAgentName={handleUpdateAgentName}
            onExportExcelVisual={handleExportExcelVisual}
            onExportVisualHtml={handleExportVisualHtml}
            onExportWord={handleExportWord}
            onExportExcel={handleExportExcel}
            onPrint={handlePrint}
          />
        )}

        {activeTab === 'inhabiles' && (
          <InhabileShiftsTab
            schedule={schedule}
            days={days}
            onUpdateInhabilShift={handleUpdateInhabilShift}
            onSetAllInhabileMode={handleSetAllInhabileMode}
            onAutoAssignInhabiles={handleAutoAssignInhabiles}
            onApplyOfficialPolicy={handleApplyOfficialInhabilePolicy}
          />
        )}

        {activeTab === 'detalle' && (
          <AgentDetailTab
            schedule={schedule}
            days={days}
            onPrint={handlePrint}
          />
        )}

        {activeTab === 'liquidacion' && (
          <LiquidationSummaryTab
            schedule={schedule}
            days={days}
            onExportExcel={handleExportExcel}
            onPrint={handlePrint}
          />
        )}

        {activeTab === 'consolidado_rrhh' && session?.user.role === 'rrhh' && (
          <ConsolidatedRRHHTab
            services={services}
            year={schedule.year}
            month={schedule.month}
            days={days}
            onSelectService={(servId) => {
              handleSelectService(servId);
              setActiveTab('matriz');
            }}
            onPrint={handlePrint}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-[11px] py-4 border-t border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>{schedule.serviceConfig?.hospitalName || 'Hospital Central de Emergencias'}</strong> • {schedule.serviceConfig?.serviceName || 'Servicio de Guardia'}
          </div>
          <div>
            Control de Jornal ({schedule.serviceConfig?.jornalHorarioLabel || '06:00-13:00'}) y Horas Extras Hábiles ({schedule.serviceConfig?.extraHabilHorarioLabel || '13:00-20:00'}) e Inhábiles (Activas/Pasivas)
          </div>
        </div>
      </footer>

      {/* Shift Editor Modal */}
      {selectedCell && (
        <ShiftEditorModal
          isOpen={isShiftEditorOpen}
          agent={selectedCell.agent}
          day={selectedCell.day}
          assignment={schedule.assignments[`${selectedCell.agent.id}_${selectedCell.day.dateStr}`]}
          onClose={() => {
            setIsShiftEditorOpen(false);
            setSelectedCell(null);
          }}
          onSave={handleSaveShift}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        schedule={schedule}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSettings={handleSaveSettings}
      />

      {/* Service Manager Modal */}
      <ServiceManagerModal
        isOpen={isServiceManagerOpen}
        onClose={() => setIsServiceManagerOpen(false)}
        services={services}
        activeServiceId={activeServiceId}
        currentUser={session.user}
        onSelectService={handleSelectService}
        onCreateNewService={handleCreateNewService}
        onUpdateService={handleUpdateService}
        onDeleteService={handleDeleteService}
        currentSchedule={schedule}
        days={days}
      />

      {/* User Manager Modal (Only for RRHH) */}
      {session.user.role === 'rrhh' && (
        <UserManagerModal
          isOpen={isUserManagerOpen}
          onClose={() => setIsUserManagerOpen(false)}
          services={services}
          currentUser={session.user}
          initialTab={userManagerTab}
        />
      )}

      {/* Operations Manual Modal (PDF / Guide) */}
      <OperationsManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        serviceName={schedule.serviceConfig?.serviceName}
        isRRHH={session.user.role === 'rrhh'}
      />
    </div>
  );
}
