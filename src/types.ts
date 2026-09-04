export type InhabileMode = 'activa' | 'pasiva';

export type RecargoCategory = 'habil' | 'inhabil_activa' | 'inhabil_pasiva';

export interface RecargoRange {
  id: string;
  name: string; // ej: "Guardia Tarde", "Recargo Nocturno Hábiles", "Guardia Activa 12hs", etc.
  category: RecargoCategory; // 'habil' | 'inhabil_activa' | 'inhabil_pasiva'
  startTime: string; // "13:00"
  endTime: string; // "20:00"
  hours: number; // 7
  label: string; // "13:00 a 20:00 hs"
  description?: string;
  isSystemDefault?: boolean;
}

// Modalidad de prestación del agente en el servicio
export type WorkModality = 'jornal_y_guardias' | 'solo_guardias' | 'solo_jornal';

// Turno en el que cumple su Jornal ordinario
export type JornalShiftType = 'manana' | 'tarde' | 'noche' | 'rotativo';

// Turno en el que cumple Horas Extras Hábiles en contraturno
export type ExtraHabilShiftType = 'manana' | 'tarde' | 'noche';

// Modalidad o duración predominante de guardias inhábiles configurada para el servicio
export type ServiceInhabileScheme = 'fraccionado_7h' | 'guardia_24h' | 'guardia_12h' | 'flexible';

export interface HospitalServiceConfig {
  hospitalName: string; // ej: "HOSPITAL CENTRAL DE EMERGENCIAS DE FORMOSA"
  hospitalSubtitle?: string; // ej: "Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano"
  serviceName: string; // ej: "Servicio de Guardia Médica y Emergencias", "Servicio de Enfermería", "Servicio de Informática y SIGHO", etc.
  jefeName: string; // ej: "Dr. Pérez, Juan Carlos" o "Cantero, Miguel Angel"
  jefeCargo: string; // ej: "Jefe de Servicio" o "Responsable de Área"
  jefeLegajo: string; // ej: "LEG-4820" o "M.P. 3421"
  jornalHorarioLabel?: string; // ej: "06:00 a 13:00 hs"
  extraHabilHorarioLabel?: string; // ej: "13:00 a 20:00 hs"
  inhabilMananaHorarioLabel?: string; // ej: "06:00 a 13:00 hs"
  inhabilTardeHorarioLabel?: string; // ej: "13:00 a 20:00 hs"
  inhabilScheme?: ServiceInhabileScheme; // 'fraccionado_7h' | 'guardia_24h' | 'guardia_12h' | 'flexible'
  inhabil24hHorarioLabel?: string; // ej: "08:00 a 08:00 hs (24 hs)" o "06:00 a 06:00 hs (24 hs)"
  inhabil12hHorarioLabel?: string; // ej: "08:00 a 20:00 hs (12 hs)"
  recargoRanges?: RecargoRange[]; // Rangos de horarios de recargos (hábiles, inhábiles activas y pasivas)
}

export interface Agent {
  id: string;
  name: string;
  role?: string;
  roleLabel: string;
  category: string; // ej: "Médico de Guardia", "Lic. en Enfermería", "Soporte Técnico", "Bioquímico", etc.
  legajo: string;
  isJefe?: boolean;
  
  // Modalidad de trabajo
  workModality?: WorkModality; // 'jornal_y_guardias' | 'solo_guardias' | 'solo_jornal'
  jornalShift?: JornalShiftType; // 'manana' (06-13) | 'tarde' (13-20) | 'noche' (20-07) | 'rotativo'
  externalInstitution?: string; // ej: "Hospital de la Madre y el Niño", "Ministerio de Desarrollo Humano", etc. (si es solo_guardias)

  hasJornal?: boolean; // retrocompatibilidad: true si cumple jornal ordinario en este hospital, false si es solo guardias
  allowedInhabileMode?: InhabileMode; // 'activa' | 'pasiva'
  isOnlyPasiva?: boolean; // si solo realiza pasivas
}

export interface DayShiftAssignment {
  // Jornal ordinario cumplido en este hospital (ej. Mañana 06-13, Tarde 13-20 o Noche 20-07)
  jornal: boolean;
  jornalTurno?: JornalShiftType; // 'manana' | 'tarde' | 'noche'
  
  // Extra hábil en contraturno
  extraHabil: boolean;
  extraHabilTurno?: ExtraHabilShiftType; // 'manana' | 'tarde' | 'noche'
  
  // Extra inhábil mañana (06:00 a 13:00 fines de semana y feriados)
  extraInhabilManana: boolean;
  extraInhabilMananaTipo?: InhabileMode; // 'activa' | 'pasiva'
  
  // Extra inhábil tarde (13:00 a 20:00 fines de semana y feriados)
  extraInhabilTarde: boolean;
  extraInhabilTardeTipo?: InhabileMode; // 'activa' | 'pasiva'

  // Guardia Inhábil Completa de 24 Horas (08:00 a 08:00 hs o 06:00 a 06:00 hs)
  extraInhabil24h?: boolean;
  extraInhabil24hTipo?: InhabileMode; // 'activa' | 'pasiva'

  // Guardia Inhábil de 12 Horas (08:00 a 20:00 hs)
  extraInhabil12h?: boolean;
  extraInhabil12hTipo?: InhabileMode; // 'activa' | 'pasiva'
  
  // Notas o justificaciones (e.g., 'Licencia', 'Franco compensatorio')
  observaciones?: string;
  isFranco?: boolean;
  isLicencia?: boolean;
}

export interface DayInfo {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number; // 1..31
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  dayNameShort: string; // 'Dom', 'Lun', 'Mar', ...
  dayNameLong: string; // 'Domingo', 'Lunes', ...
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
}

export interface HospitalServiceItem {
  id: string; // unique identifier, e.g. 'serv_informatica', 'serv_guardia_medica', 'serv_custom_1'
  name: string; // display name, e.g. 'Servicio de Informática y Estadística'
  config: HospitalServiceConfig;
  agents: Agent[];
  createdAt?: string;
}

export interface MonthSchedule {
  serviceId?: string;
  year: number;
  month: number; // 1..12
  agents: Agent[];
  // Key format: `${agentId}_${dateStr}`
  assignments: Record<string, DayShiftAssignment>;
  holidays: Record<string, string>; // dateStr -> holiday description
  serviceConfig?: HospitalServiceConfig;
}

export interface AgentMonthStats {
  agentId: string;
  agentName: string;
  roleLabel: string;
  legajo: string;
  workModality?: WorkModality;
  jornalShift?: JornalShiftType;
  externalInstitution?: string;
  diasJornal: number;
  horasJornal: number; // 7h por día hábil cumplido en este hospital (0 si es solo_guardias)
  diasJornalManana?: number;
  diasJornalTarde?: number;
  diasJornalNoche?: number;
  diasExtraHabil: number;
  horasExtraHabil: number; // 7h por día
  horasExtraHabilManana?: number;
  horasExtraHabilTarde?: number;
  horasExtraHabilNoche?: number;
  turnosInhabilActiva: number;
  horasInhabilActiva: number; // computa horas totales activas (7h, 12h o 24h)
  turnosInhabilPasiva: number;
  horasInhabilPasiva: number; // computa horas totales pasivas (7h, 12h o 24h)
  guardias24hActiva?: number;
  guardias24hPasiva?: number;
  guardias12hActiva?: number;
  guardias12hPasiva?: number;
  totalHorasExtras: number; // ExtraHabil + InhabilActiva + InhabilPasiva
  totalHorasMes: number; // Jornal + Extras
}

export type UserRole = 'rrhh' | 'jefe_servicio';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  roleTitle: string; // ej: "Jefe de Recursos Humanos", "Jefe de Servicio de Guardia", etc.
  serviceId?: string | null; // null si es 'rrhh' (acceso a todos), o id específico si es jefe de servicio
  serviceName?: string;
  legajo?: string;
  avatarIcon?: string;
}

export interface HospitalAuthSession {
  user: UserAccount;
  loginTime: string;
}

