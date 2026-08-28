export type InhabileMode = 'activa' | 'pasiva';

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
}

export interface Agent {
  id: string;
  name: string;
  role?: string;
  roleLabel: string;
  category: string; // ej: "Médico de Guardia", "Lic. en Enfermería", "Soporte Técnico", "Bioquímico", etc.
  legajo: string;
  isJefe?: boolean;
  hasJornal?: boolean; // true = cumple jornal ordinario de Lunes a Viernes hábiles (06-13 hs)
  allowedInhabileMode?: InhabileMode; // 'activa' | 'pasiva'
  isOnlyPasiva?: boolean; // si solo realiza pasivas
}

export interface DayShiftAssignment {
  // Jornal ordinario (ej. 06:00 a 13:00 lunes a viernes hábiles)
  jornal: boolean;
  // Extra hábil (ej. 13:00 a 20:00 lunes a viernes)
  extraHabil: boolean;
  // Extra inhábil mañana (06:00 a 13:00 fines de semana y feriados)
  extraInhabilManana: boolean;
  extraInhabilMananaTipo?: InhabileMode; // 'activa' | 'pasiva'
  // Extra inhábil tarde (13:00 a 20:00 fines de semana y feriados)
  extraInhabilTarde: boolean;
  extraInhabilTardeTipo?: InhabileMode; // 'activa' | 'pasiva'
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
  diasJornal: number;
  horasJornal: number; // 7h por día hábil cumplido
  diasExtraHabil: number;
  horasExtraHabil: number; // 7h por día
  turnosInhabilActiva: number;
  horasInhabilActiva: number; // 7h por turno
  turnosInhabilPasiva: number;
  horasInhabilPasiva: number; // 7h por turno
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

