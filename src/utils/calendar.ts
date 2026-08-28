import { Agent, DayInfo, DayShiftAssignment, MonthSchedule, AgentMonthStats, InhabileMode, HospitalServiceConfig, HospitalServiceItem } from '../types';

export const HOURS_PER_SHIFT = 7; // 6 a 13 = 7hs, 13 a 20 = 7hs

export const DEFAULT_SERVICE_CONFIG: HospitalServiceConfig = {
  hospitalName: 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"',
  hospitalSubtitle: 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano',
  serviceName: 'Servicio de Guardia y Emergencias',
  jefeName: 'Dr. / Lic. Jefe de Servicio',
  jefeCargo: 'Jefe de Servicio',
  jefeLegajo: 'LEG-0001',
  jornalHorarioLabel: '06:00 a 13:00 hs',
  extraHabilHorarioLabel: '13:00 a 20:00 hs',
  inhabilMananaHorarioLabel: '06:00 a 13:00 hs',
  inhabilTardeHorarioLabel: '13:00 a 20:00 hs',
};

export interface ServicePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: HospitalServiceConfig;
  agents: Agent[];
}

export const SERVICE_PRESETS: ServicePreset[] = [
  {
    id: 'blank',
    name: 'Plantilla en Blanco (Nuevo Servicio)',
    description: 'Comienza 100% de cero con una planilla en blanco para cargar el nombre de tu servicio, jefe y todo el personal a cargo.',
    icon: 'FileText',
    config: {
      hospitalName: 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"',
      hospitalSubtitle: 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano',
      serviceName: 'Nuevo Servicio / Área Hospitalaria',
      jefeName: '',
      jefeCargo: 'Jefe de Servicio',
      jefeLegajo: '',
      jornalHorarioLabel: '06:00 a 13:00 hs',
      extraHabilHorarioLabel: '13:00 a 20:00 hs',
      inhabilMananaHorarioLabel: '06:00 a 13:00 hs',
      inhabilTardeHorarioLabel: '13:00 a 20:00 hs',
    },
    agents: [],
  },
  {
    id: 'guardia_medica',
    name: 'Servicio de Guardia Médica y Emergencias',
    description: 'Especial para servicios médicos con guardias activas y pasivas de fin de semana, feriados y refuerzos.',
    icon: 'Stethoscope',
    config: {
      hospitalName: 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"',
      hospitalSubtitle: 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano',
      serviceName: 'Servicio de Guardia Central y Emergencias',
      jefeName: 'Dr. Benítez, Carlos Alberto',
      jefeCargo: 'Jefe de Guardia Médica',
      jefeLegajo: 'M.P. 3140',
      jornalHorarioLabel: '07:00 a 13:00 hs',
      extraHabilHorarioLabel: '13:00 a 20:00 hs',
      inhabilMananaHorarioLabel: '07:00 a 14:00 hs',
      inhabilTardeHorarioLabel: '14:00 a 21:00 hs',
    },
    agents: [
      {
        id: 'agent_med_1',
        name: 'Dr. Benítez, Carlos Alberto',
        roleLabel: 'Jefe de Guardia / Médico de Planta',
        category: 'Médico de Guardia',
        legajo: 'M.P. 3140',
        isJefe: true,
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_med_2',
        name: 'Dra. Giménez, María Elena',
        roleLabel: 'Médica de Guardia Central',
        category: 'Médico de Guardia',
        legajo: 'M.P. 4210',
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_med_3',
        name: 'Dr. Ramírez, Jorge Luis',
        roleLabel: 'Médico Emergentólogo',
        category: 'Médico Emergentólogo',
        legajo: 'M.P. 4890',
        hasJornal: false,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_med_4',
        name: 'Dr. Insfrán, Gustavo Daniel',
        roleLabel: 'Médico Clínico de Guardia',
        category: 'Médico Clínico',
        legajo: 'M.P. 5120',
        hasJornal: true,
        allowedInhabileMode: 'pasiva',
      },
    ],
  },
  {
    id: 'enfermeria',
    name: 'Servicio de Enfermería General y UTI',
    description: 'Para equipos de enfermería con jornales rotativos, guardias de fin de semana y cobertura continua.',
    icon: 'HeartHandshake',
    config: {
      hospitalName: 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"',
      hospitalSubtitle: 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano',
      serviceName: 'Servicio de Enfermería y Cuidados Críticos',
      jefeName: 'Lic. Sosa, Patricia Beatriz',
      jefeCargo: 'Jefa de Enfermería',
      jefeLegajo: 'LEG-3912',
      jornalHorarioLabel: '06:00 a 13:00 hs',
      extraHabilHorarioLabel: '13:00 a 20:00 hs',
      inhabilMananaHorarioLabel: '06:00 a 13:00 hs',
      inhabilTardeHorarioLabel: '13:00 a 20:00 hs',
    },
    agents: [
      {
        id: 'agent_enf_1',
        name: 'Lic. Sosa, Patricia Beatriz',
        roleLabel: 'Jefa de Enfermería',
        category: 'Lic. en Enfermería',
        legajo: 'LEG-3912',
        isJefe: true,
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_enf_2',
        name: 'Enf. Gómez, Walter David',
        roleLabel: 'Enfermero Universitario - Turno Mañana',
        category: 'Enfermero/a',
        legajo: 'LEG-4501',
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_enf_3',
        name: 'Enf. Bogado, Lorena Soledad',
        roleLabel: 'Enfermera de Guardia - Turno Tarde',
        category: 'Enfermero/a',
        legajo: 'LEG-4833',
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_enf_4',
        name: 'Lic. Cabrera, Fernando Gabriel',
        roleLabel: 'Enfermero Especialista UTI',
        category: 'Lic. en Enfermería',
        legajo: 'LEG-5219',
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
    ],
  },
  {
    id: 'laboratorio_imagenes',
    name: 'Servicio de Diagnóstico por Imágenes y Laboratorio',
    description: 'Técnicos radiólogos, bioquímicos y personal de laboratorio con guardias pasivas y activas.',
    icon: 'Activity',
    config: {
      hospitalName: 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"',
      hospitalSubtitle: 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano',
      serviceName: 'Servicio de Diagnóstico por Imágenes y Bioquímica',
      jefeName: 'Bioq. Coronel, Andrea Silvina',
      jefeCargo: 'Jefa de Laboratorio',
      jefeLegajo: 'M.P. 1820',
      jornalHorarioLabel: '06:00 a 13:00 hs',
      extraHabilHorarioLabel: '13:00 a 20:00 hs',
      inhabilMananaHorarioLabel: '06:00 a 13:00 hs',
      inhabilTardeHorarioLabel: '13:00 a 20:00 hs',
    },
    agents: [
      {
        id: 'agent_lab_1',
        name: 'Bioq. Coronel, Andrea Silvina',
        roleLabel: 'Jefa de Laboratorio',
        category: 'Bioquímico/a',
        legajo: 'M.P. 1820',
        isJefe: true,
        hasJornal: true,
        allowedInhabileMode: 'pasiva',
      },
      {
        id: 'agent_lab_2',
        name: 'Téc. Medina, Javier Hernán',
        roleLabel: 'Técnico Radiólogo de Guardia',
        category: 'Técnico Radiólogo',
        legajo: 'LEG-4112',
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_lab_3',
        name: 'Téc. Villalba, Claudia Noemí',
        roleLabel: 'Técnica de Laboratorio',
        category: 'Técnico de Laboratorio',
        legajo: 'LEG-4680',
        hasJornal: true,
        allowedInhabileMode: 'pasiva',
      },
    ],
  },
  {
    id: 'informatica',
    name: 'Servicio de Informática y SIGHO',
    description: 'Esquema de Soporte Técnico y Soporte SIGHO (4 agentes con rotación técnica).',
    icon: 'Server',
    config: {
      hospitalName: 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"',
      hospitalSubtitle: 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano',
      serviceName: 'Servicio de Informática y Estadística',
      jefeName: 'Cantero, Miguel Angel',
      jefeCargo: 'Jefe del Servicio de Informática',
      jefeLegajo: 'LEG-5192',
      jornalHorarioLabel: '06:00 a 13:00 hs',
      extraHabilHorarioLabel: '13:00 a 20:00 hs',
      inhabilMananaHorarioLabel: '06:00 a 13:00 hs',
      inhabilTardeHorarioLabel: '13:00 a 20:00 hs',
    },
    agents: [
      {
        id: 'agent_jefe',
        name: 'Cantero, Miguel Angel',
        roleLabel: 'Jefe del Servicio de Informática',
        category: 'Soporte Técnico',
        legajo: 'LEG-5192',
        isJefe: true,
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_soporte_1',
        name: 'Escobar, Eduardo Martin',
        roleLabel: 'Soporte Informático SIGHO',
        category: 'Soporte Informático SIGHO',
        legajo: 'LEG-4820',
        hasJornal: true,
        allowedInhabileMode: 'pasiva',
      },
      {
        id: 'agent_sigho_1',
        name: 'Galeano, Cristian Alejandro',
        roleLabel: 'Agente Soporte Informático SIGHO 1',
        category: 'Soporte Informático SIGHO',
        legajo: 'LEG-5431',
        hasJornal: true,
        allowedInhabileMode: 'pasiva',
      },
      {
        id: 'agent_sigho_2',
        name: 'Amarilla, Nestor Ivan',
        roleLabel: 'Agente Soporte Informático SIGHO 2',
        category: 'Soporte Informático SIGHO',
        legajo: 'LEG-5804',
        hasJornal: true,
        allowedInhabileMode: 'pasiva',
        isOnlyPasiva: true,
      },
    ],
  },
];

export const INITIAL_SERVICES: HospitalServiceItem[] = [
  {
    id: 'serv_informatica',
    name: 'Servicio de Informática y Estadística',
    config: {
      hospitalName: 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"',
      hospitalSubtitle: 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano',
      serviceName: 'Servicio de Informática y Estadística',
      jefeName: 'Cantero, Miguel Angel',
      jefeCargo: 'Jefe del Servicio de Informática',
      jefeLegajo: 'LEG-5192',
      jornalHorarioLabel: '06:00 a 13:00 hs',
      extraHabilHorarioLabel: '13:00 a 20:00 hs',
      inhabilMananaHorarioLabel: '06:00 a 13:00 hs',
      inhabilTardeHorarioLabel: '13:00 a 20:00 hs',
    },
    agents: [
      {
        id: 'agent_jefe',
        name: 'Cantero, Miguel Angel',
        roleLabel: 'Jefe del Servicio de Informática',
        category: 'Soporte Técnico',
        legajo: 'LEG-5192',
        isJefe: true,
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_soporte_1',
        name: 'Escobar, Eduardo Martin',
        roleLabel: 'Soporte Informático SIGHO',
        category: 'Soporte Informático SIGHO',
        legajo: 'LEG-4820',
        hasJornal: true,
        allowedInhabileMode: 'pasiva',
      },
      {
        id: 'agent_sigho_1',
        name: 'Galeano, Cristian Alejandro',
        roleLabel: 'Agente Soporte Informático SIGHO 1',
        category: 'Soporte Informático SIGHO',
        legajo: 'LEG-5431',
        hasJornal: true,
        allowedInhabileMode: 'pasiva',
      },
      {
        id: 'agent_sigho_2',
        name: 'Amarilla, Nestor Ivan',
        roleLabel: 'Agente Soporte Informático SIGHO 2',
        category: 'Soporte Informático SIGHO',
        legajo: 'LEG-5804',
        hasJornal: true,
        allowedInhabileMode: 'pasiva',
        isOnlyPasiva: true,
      },
    ],
  },
  {
    id: 'serv_guardia_medica',
    name: 'Servicio de Guardia Central y Emergencias',
    config: {
      hospitalName: 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"',
      hospitalSubtitle: 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano',
      serviceName: 'Servicio de Guardia Central y Emergencias',
      jefeName: 'Dr. Benítez, Carlos Alberto',
      jefeCargo: 'Jefe de Guardia Médica',
      jefeLegajo: 'M.P. 3140',
      jornalHorarioLabel: '07:00 a 13:00 hs',
      extraHabilHorarioLabel: '13:00 a 20:00 hs',
      inhabilMananaHorarioLabel: '07:00 a 14:00 hs',
      inhabilTardeHorarioLabel: '14:00 a 21:00 hs',
    },
    agents: [
      {
        id: 'agent_med_1',
        name: 'Dr. Benítez, Carlos Alberto',
        roleLabel: 'Jefe de Guardia / Médico de Planta',
        category: 'Médico de Guardia',
        legajo: 'M.P. 3140',
        isJefe: true,
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_med_2',
        name: 'Dra. Giménez, María Elena',
        roleLabel: 'Médica de Guardia Central',
        category: 'Médico de Guardia',
        legajo: 'M.P. 4210',
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_med_3',
        name: 'Dr. Ramírez, Jorge Luis',
        roleLabel: 'Médico Emergentólogo',
        category: 'Médico Emergentólogo',
        legajo: 'M.P. 4890',
        hasJornal: false,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_med_4',
        name: 'Dr. Insfrán, Gustavo Daniel',
        roleLabel: 'Médico Clínico de Guardia',
        category: 'Médico Clínico',
        legajo: 'M.P. 5120',
        hasJornal: true,
        allowedInhabileMode: 'pasiva',
      },
    ],
  },
  {
    id: 'serv_enfermeria',
    name: 'Servicio de Enfermería y Cuidados Críticos',
    config: {
      hospitalName: 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"',
      hospitalSubtitle: 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano',
      serviceName: 'Servicio de Enfermería y Cuidados Críticos',
      jefeName: 'Lic. Sosa, Patricia Beatriz',
      jefeCargo: 'Jefa de Enfermería',
      jefeLegajo: 'LEG-3912',
      jornalHorarioLabel: '06:00 a 13:00 hs',
      extraHabilHorarioLabel: '13:00 a 20:00 hs',
      inhabilMananaHorarioLabel: '06:00 a 13:00 hs',
      inhabilTardeHorarioLabel: '13:00 a 20:00 hs',
    },
    agents: [
      {
        id: 'agent_enf_1',
        name: 'Lic. Sosa, Patricia Beatriz',
        roleLabel: 'Jefa de Enfermería',
        category: 'Lic. en Enfermería',
        legajo: 'LEG-3912',
        isJefe: true,
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_enf_2',
        name: 'Enf. Gómez, Walter David',
        roleLabel: 'Enfermero Universitario - Turno Mañana',
        category: 'Enfermero/a',
        legajo: 'LEG-4501',
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_enf_3',
        name: 'Enf. Bogado, Lorena Soledad',
        roleLabel: 'Enfermera de Guardia - Turno Tarde',
        category: 'Enfermero/a',
        legajo: 'LEG-4833',
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_enf_4',
        name: 'Lic. Cabrera, Fernando Gabriel',
        roleLabel: 'Enfermero Especialista UTI',
        category: 'Lic. en Enfermería',
        legajo: 'LEG-5219',
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
    ],
  },
  {
    id: 'serv_laboratorio',
    name: 'Servicio de Diagnóstico por Imágenes y Bioquímica',
    config: {
      hospitalName: 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"',
      hospitalSubtitle: 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano',
      serviceName: 'Servicio de Diagnóstico por Imágenes y Bioquímica',
      jefeName: 'Bioq. Coronel, Andrea Silvina',
      jefeCargo: 'Jefa de Laboratorio',
      jefeLegajo: 'M.P. 1820',
      jornalHorarioLabel: '06:00 a 13:00 hs',
      extraHabilHorarioLabel: '13:00 a 20:00 hs',
      inhabilMananaHorarioLabel: '06:00 a 13:00 hs',
      inhabilTardeHorarioLabel: '13:00 a 20:00 hs',
    },
    agents: [
      {
        id: 'agent_lab_1',
        name: 'Bioq. Coronel, Andrea Silvina',
        roleLabel: 'Jefa de Laboratorio',
        category: 'Bioquímico/a',
        legajo: 'M.P. 1820',
        isJefe: true,
        hasJornal: true,
        allowedInhabileMode: 'pasiva',
      },
      {
        id: 'agent_lab_2',
        name: 'Téc. Medina, Javier Hernán',
        roleLabel: 'Técnico Radiólogo de Guardia',
        category: 'Técnico Radiólogo',
        legajo: 'LEG-4112',
        hasJornal: true,
        allowedInhabileMode: 'activa',
      },
      {
        id: 'agent_lab_3',
        name: 'Téc. Villalba, Claudia Noemí',
        roleLabel: 'Técnica de Laboratorio',
        category: 'Técnico de Laboratorio',
        legajo: 'LEG-4680',
        hasJornal: true,
        allowedInhabileMode: 'pasiva',
      },
    ],
  },
];

export const SERVICES_STORAGE_KEY = 'hcef_hospital_services_list';
export const ACTIVE_SERVICE_ID_KEY = 'hcef_active_service_id';

export function loadAllServices(): HospitalServiceItem[] {
  try {
    const saved = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (saved) {
      const parsed: HospitalServiceItem[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Auto-heal / update serv_informatica if jefe was outdated
        const healed = parsed.map(s => {
          if (s.id === 'serv_informatica' || s.name.toLowerCase().includes('informática')) {
            const updatedConfig = {
              ...s.config,
              jefeName: 'Cantero, Miguel Angel',
              jefeCargo: 'Jefe del Servicio de Informática',
              jefeLegajo: s.config?.jefeLegajo === 'LEG-4820' ? 'LEG-5192' : (s.config?.jefeLegajo || 'LEG-5192'),
            };
            const updatedAgents = (s.agents || []).map(a => {
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
            return {
              ...s,
              config: updatedConfig,
              agents: updatedAgents,
            };
          }
          return s;
        });
        return healed;
      }
    }
  } catch (e) {
    console.error('Error loading hospital services:', e);
  }
  return INITIAL_SERVICES;
}

export function saveAllServices(services: HospitalServiceItem[]) {
  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  } catch (e) {
    console.error('Error saving hospital services:', e);
  }
}

export function getActiveServiceId(): string {
  return localStorage.getItem(ACTIVE_SERVICE_ID_KEY) || 'serv_informatica';
}

export function setActiveServiceId(serviceId: string) {
  localStorage.setItem(ACTIVE_SERVICE_ID_KEY, serviceId);
}

export function getScheduleStorageKey(serviceId: string, year: number, month: number): string {
  return `hcef_schedule_${serviceId}_${year}_${month}`;
}

export const DEFAULT_AGENTS: Agent[] = INITIAL_SERVICES[0].agents; // Informática default

export function isAgentInhabileActiva(
  agent: Agent | { name?: string; id?: string; allowedInhabileMode?: InhabileMode } | null | undefined
): boolean {
  if (!agent) return false;
  if (agent.allowedInhabileMode === 'activa') return true;
  if (agent.allowedInhabileMode === 'pasiva') return false;
  const normalizedName = (agent.name || '').toLowerCase();
  return normalizedName.includes('cantero');
}

export function getAgentInhabileMode(
  agent: Agent | { name?: string; id?: string; allowedInhabileMode?: InhabileMode } | null | undefined
): InhabileMode {
  return isAgentInhabileActiva(agent) ? 'activa' : 'pasiva';
}

export function isAgentOnlyInhabilePasiva(
  agent: Agent | { name?: string; id?: string; isOnlyPasiva?: boolean } | null | undefined
): boolean {
  if (!agent) return false;
  if (agent.isOnlyPasiva === true) return true;
  const normalizedName = (agent.name || '').toLowerCase();
  return normalizedName.includes('amarilla') || agent.id === 'agent_sigho_2';
}

// Feriados fijos y tradicionales de Argentina y Provincia de Formosa
export const DEFAULT_HOLIDAYS_BY_MONTH_DAY: Record<string, string> = {
  '01-01': 'Año Nuevo',
  '03-24': 'Día Nacional de la Memoria por la Verdad y la Justicia',
  '04-02': 'Día del Veterano y de los Caídos en la Guerra de Malvinas',
  '04-08': 'Día de la Fundación de Formosa (Feriado Provincial)',
  '05-01': 'Día del Trabajador',
  '05-25': 'Día de la Revolución de Mayo',
  '06-17': 'Paso a la Inmortalidad del Gral. Martín Miguel de Güemes',
  '06-20': 'Paso a la Inmortalidad del Gral. Manuel Belgrano',
  '06-28': 'Día de la Provincialización de Formosa (Feriado Provincial)',
  '07-09': 'Día de la Independencia',
  '08-17': 'Paso a la Inmortalidad del Gral. José de San Martín',
  '09-24': 'Día de la Virgen de la Merced - Patrona de Formosa (Feriado Provincial)',
  '10-12': 'Día del Respeto a la Diversidad Cultural',
  '11-20': 'Día de la Soberanía Nacional',
  '12-08': 'Inmaculada Concepción de María',
  '12-25': 'Navidad',
};

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAY_NAMES_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function getDaysInMonth(year: number, month: number, customHolidays?: Record<string, string>): DayInfo[] {
  const date = new Date(year, month - 1, 1);
  const days: DayInfo[] = [];

  while (date.getMonth() === month - 1) {
    const dayNumber = date.getDate();
    const dayOfWeek = date.getDay(); // 0 = Dom, 6 = Sab
    const mm = String(month).padStart(2, '0');
    const dd = String(dayNumber).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    const monthDay = `${mm}-${dd}`;

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const holidayName = customHolidays?.[dateStr] || DEFAULT_HOLIDAYS_BY_MONTH_DAY[monthDay];
    const isHoliday = Boolean(holidayName);

    days.push({
      dateStr,
      dayNumber,
      dayOfWeek,
      dayNameShort: DAY_NAMES_SHORT[dayOfWeek],
      dayNameLong: DAY_NAMES_LONG[dayOfWeek],
      isWeekend,
      isHoliday,
      holidayName,
    });

    date.setDate(date.getDate() + 1);
  }

  return days;
}

/**
 * Genera una planilla completamente en blanco (0 horas) para el personal indicado
 */
export function generateBlankSchedule(
  year: number,
  month: number,
  agents: Agent[] = [],
  customHolidays: Record<string, string> = {},
  serviceConfig?: HospitalServiceConfig
): MonthSchedule {
  const days = getDaysInMonth(year, month, customHolidays);
  const assignments: Record<string, DayShiftAssignment> = {};

  days.forEach((day) => {
    agents.forEach((agent) => {
      const agentMode = getAgentInhabileMode(agent);
      assignments[`${agent.id}_${day.dateStr}`] = {
        jornal: false,
        extraHabil: false,
        extraInhabilManana: false,
        extraInhabilMananaTipo: agentMode,
        extraInhabilTarde: false,
        extraInhabilTardeTipo: agentMode,
      };
    });
  });

  return {
    year,
    month,
    agents,
    assignments,
    holidays: customHolidays,
    serviceConfig,
  };
}

/**
 * Genera la rotación equilibrada según el personal del servicio:
 * - Para días hábiles: Asigna Jornal (a agentes con hasJornal !== false) y distribuye Extras Hábiles.
 * - Para días inhábiles: Distribuye turnos de mañana y tarde entre el personal disponible.
 */
export function generateBalancedSchedule(
  year: number,
  month: number,
  agents: Agent[] = DEFAULT_AGENTS,
  customHolidays: Record<string, string> = {},
  serviceConfig?: HospitalServiceConfig
): MonthSchedule {
  const days = getDaysInMonth(year, month, customHolidays);
  const assignments: Record<string, DayShiftAssignment> = {};

  if (!agents || agents.length === 0) {
    return generateBlankSchedule(year, month, agents, customHolidays, serviceConfig);
  }

  // Si son los 4 agentes del servicio de informática tradicionales
  const isDefaultInformatica = agents.length === 4 && agents.some(a => a.name.toLowerCase().includes('cantero') || a.id.includes('sigho'));

  if (isDefaultInformatica) {
    const cantero = agents.find(a => isAgentInhabileActiva(a) || a.name.toLowerCase().includes('cantero')) || agents[1] || agents[0];
    const escobar = agents.find(a => a.name.toLowerCase().includes('escobar') || a.isJefe) || agents[0];
    const galeano = agents.find(a => a.name.toLowerCase().includes('galeano') || a.id === 'agent_sigho_1') || agents[2] || agents[0];
    const amarilla = agents.find(a => a.name.toLowerCase().includes('amarilla') || a.id === 'agent_sigho_2') || agents[3] || agents[1] || agents[0];

    let weekendCounter = -1;
    let prevWasWeekend = false;
    const weekendIndexMap = new Map<string, number>();

    days.forEach((d) => {
      if (d.isWeekend) {
        if (!prevWasWeekend) weekendCounter++;
        weekendIndexMap.set(d.dateStr, weekendCounter);
        prevWasWeekend = true;
      } else {
        prevWasWeekend = false;
      }
    });

    let holidayWeekdayCounter = 0;

    days.forEach((day) => {
      agents.forEach(agent => {
        const agentMode = getAgentInhabileMode(agent);
        assignments[`${agent.id}_${day.dateStr}`] = {
          jornal: false,
          extraHabil: false,
          extraInhabilManana: false,
          extraInhabilMananaTipo: agentMode,
          extraInhabilTarde: false,
          extraInhabilTardeTipo: agentMode,
        };
      });

      const isBusinessDay = !day.isWeekend && !day.isHoliday;

      if (isBusinessDay) {
        agents.forEach(agent => {
          if (agent.hasJornal !== false) {
            assignments[`${agent.id}_${day.dateStr}`].jornal = true;
          }
        });

        const weekNumber = Math.floor((day.dayNumber - 1) / 7);
        const isWeekEven = weekNumber % 2 === 0;
        const isDayOdd = day.dayOfWeek % 2 !== 0;

        const assignedSoporte = (isWeekEven ? isDayOdd : !isDayOdd) ? escobar : cantero;
        const assignedSigho = isAgentOnlyInhabilePasiva(amarilla) 
          ? galeano 
          : ((isWeekEven ? isDayOdd : !isDayOdd) ? galeano : amarilla);

        if (assignedSoporte) assignments[`${assignedSoporte.id}_${day.dateStr}`].extraHabil = true;
        if (assignedSigho) assignments[`${assignedSigho.id}_${day.dateStr}`].extraHabil = true;
      } else {
        if (day.isWeekend) {
          const wIndex = weekendIndexMap.get(day.dateStr) ?? 0;
          const isPair1Weekend = wIndex % 2 === 0;

          if (isPair1Weekend) {
            if (day.dayOfWeek === 6) {
              assignments[`${cantero.id}_${day.dateStr}`].extraInhabilManana = true;
              assignments[`${cantero.id}_${day.dateStr}`].extraInhabilMananaTipo = 'activa';
              assignments[`${escobar.id}_${day.dateStr}`].extraInhabilTarde = true;
              assignments[`${escobar.id}_${day.dateStr}`].extraInhabilTardeTipo = 'pasiva';
            } else {
              assignments[`${escobar.id}_${day.dateStr}`].extraInhabilManana = true;
              assignments[`${escobar.id}_${day.dateStr}`].extraInhabilMananaTipo = 'pasiva';
              assignments[`${cantero.id}_${day.dateStr}`].extraInhabilTarde = true;
              assignments[`${cantero.id}_${day.dateStr}`].extraInhabilTardeTipo = 'activa';
            }
          } else {
            if (day.dayOfWeek === 6) {
              assignments[`${galeano.id}_${day.dateStr}`].extraInhabilManana = true;
              assignments[`${galeano.id}_${day.dateStr}`].extraInhabilMananaTipo = 'pasiva';
              assignments[`${amarilla.id}_${day.dateStr}`].extraInhabilTarde = true;
              assignments[`${amarilla.id}_${day.dateStr}`].extraInhabilTardeTipo = 'pasiva';
            } else {
              assignments[`${amarilla.id}_${day.dateStr}`].extraInhabilManana = true;
              assignments[`${amarilla.id}_${day.dateStr}`].extraInhabilMananaTipo = 'pasiva';
              assignments[`${galeano.id}_${day.dateStr}`].extraInhabilTarde = true;
              assignments[`${galeano.id}_${day.dateStr}`].extraInhabilTardeTipo = 'pasiva';
            }
          }
        } else {
          if (holidayWeekdayCounter % 2 === 0) {
            assignments[`${cantero.id}_${day.dateStr}`].extraInhabilManana = true;
            assignments[`${cantero.id}_${day.dateStr}`].extraInhabilMananaTipo = 'activa';
            assignments[`${escobar.id}_${day.dateStr}`].extraInhabilTarde = true;
            assignments[`${escobar.id}_${day.dateStr}`].extraInhabilTardeTipo = 'pasiva';
          } else {
            assignments[`${galeano.id}_${day.dateStr}`].extraInhabilManana = true;
            assignments[`${galeano.id}_${day.dateStr}`].extraInhabilMananaTipo = 'pasiva';
            assignments[`${amarilla.id}_${day.dateStr}`].extraInhabilTarde = true;
            assignments[`${amarilla.id}_${day.dateStr}`].extraInhabilTardeTipo = 'pasiva';
          }
          holidayWeekdayCounter++;
        }
      }
    });

    return {
      year,
      month,
      agents,
      assignments,
      holidays: customHolidays,
      serviceConfig,
    };
  }

  // Rotación genérica adaptable para cualquier servicio y cantidad de agentes
  let shiftIndex = 0;
  let extraHabilIndex = 0;

  days.forEach((day) => {
    agents.forEach(agent => {
      const agentMode = getAgentInhabileMode(agent);
      assignments[`${agent.id}_${day.dateStr}`] = {
        jornal: false,
        extraHabil: false,
        extraInhabilManana: false,
        extraInhabilMananaTipo: agentMode,
        extraInhabilTarde: false,
        extraInhabilTardeTipo: agentMode,
      };
    });

    const isBusinessDay = !day.isWeekend && !day.isHoliday;

    if (isBusinessDay) {
      // Asignar Jornal a quienes lo tienen habilitado
      agents.forEach(agent => {
        if (agent.hasJornal !== false) {
          assignments[`${agent.id}_${day.dateStr}`].jornal = true;
        }
      });

      // Si hay más de 1 agente, asignar 1 o 2 a Horas Extras Hábiles rotativas
      const eligibleForExtra = agents.filter(a => !isAgentOnlyInhabilePasiva(a));
      if (eligibleForExtra.length > 0) {
        const assignedAgent = eligibleForExtra[extraHabilIndex % eligibleForExtra.length];
        assignments[`${assignedAgent.id}_${day.dateStr}`].extraHabil = true;
        extraHabilIndex++;
      }
    } else {
      // Días Inhábiles: asignar Mañana y Tarde
      if (agents.length === 1) {
        const ag = agents[0];
        const mode = getAgentInhabileMode(ag);
        assignments[`${ag.id}_${day.dateStr}`].extraInhabilManana = true;
        assignments[`${ag.id}_${day.dateStr}`].extraInhabilMananaTipo = mode;
      } else if (agents.length >= 2) {
        const ag1 = agents[shiftIndex % agents.length];
        const ag2 = agents[(shiftIndex + 1) % agents.length];
        shiftIndex += 2;

        assignments[`${ag1.id}_${day.dateStr}`].extraInhabilManana = true;
        assignments[`${ag1.id}_${day.dateStr}`].extraInhabilMananaTipo = getAgentInhabileMode(ag1);

        assignments[`${ag2.id}_${day.dateStr}`].extraInhabilTarde = true;
        assignments[`${ag2.id}_${day.dateStr}`].extraInhabilTardeTipo = getAgentInhabileMode(ag2);
      }
    }
  });

  return {
    year,
    month,
    agents,
    assignments,
    holidays: customHolidays,
    serviceConfig,
  };
}

export function calculateAgentStats(
  agent: Agent,
  schedule: MonthSchedule,
  days: DayInfo[]
): AgentMonthStats {
  let diasJornal = 0;
  let diasExtraHabil = 0;
  let turnosInhabilActiva = 0;
  let turnosInhabilPasiva = 0;

  days.forEach(day => {
    const key = `${agent.id}_${day.dateStr}`;
    const assign = schedule.assignments[key];
    if (!assign) return;

    if (assign.jornal) {
      diasJornal++;
    }

    if (assign.extraHabil) {
      diasExtraHabil++;
    }

    if (assign.extraInhabilManana) {
      if (assign.extraInhabilMananaTipo === 'activa') {
        turnosInhabilActiva++;
      } else {
        turnosInhabilPasiva++;
      }
    }

    if (assign.extraInhabilTarde) {
      if (assign.extraInhabilTardeTipo === 'activa') {
        turnosInhabilActiva++;
      } else {
        turnosInhabilPasiva++;
      }
    }
  });

  const horasJornal = diasJornal * HOURS_PER_SHIFT;
  const horasExtraHabil = diasExtraHabil * HOURS_PER_SHIFT;
  const horasInhabilActiva = turnosInhabilActiva * HOURS_PER_SHIFT;
  const horasInhabilPasiva = turnosInhabilPasiva * HOURS_PER_SHIFT;
  const totalHorasExtras = horasExtraHabil + horasInhabilActiva + horasInhabilPasiva;
  const totalHorasMes = horasJornal + totalHorasExtras;

  return {
    agentId: agent.id,
    agentName: agent.name,
    roleLabel: agent.roleLabel,
    legajo: agent.legajo,
    diasJornal,
    horasJornal,
    diasExtraHabil,
    horasExtraHabil,
    turnosInhabilActiva,
    horasInhabilActiva,
    turnosInhabilPasiva,
    horasInhabilPasiva,
    totalHorasExtras,
    totalHorasMes,
  };
}

