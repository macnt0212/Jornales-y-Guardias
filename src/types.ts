export type AgentRole = 'soporte_jefe' | 'soporte_tecnico' | 'sigho';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  roleLabel: string;
  category: 'Soporte Técnico' | 'Soporte Informático SIGHO';
  legajo: string;
  isJefe?: boolean;
  allowedInhabileMode?: InhabileMode; // 'activa' para Cantero, Miguel Angel | 'pasiva' para el resto
}

export type InhabileMode = 'activa' | 'pasiva';

export interface DayShiftAssignment {
  // Jornal ordinario 06:00 a 13:00 (lunes a viernes hábiles) - true por defecto en días hábiles
  jornal: boolean;
  // Extra hábil 13:00 a 20:00 (lunes a viernes)
  extraHabil: boolean;
  // Extra inhábil mañana 06:00 a 13:00 (fines de semana y feriados)
  extraInhabilManana: boolean;
  extraInhabilMananaTipo?: InhabileMode; // 'activa' | 'pasiva'
  // Extra inhábil tarde 13:00 a 20:00 (fines de semana y feriados)
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

export interface MonthSchedule {
  year: number;
  month: number; // 1..12
  agents: Agent[];
  // Key format: `${agentId}_${dateStr}`
  assignments: Record<string, DayShiftAssignment>;
  holidays: Record<string, string>; // dateStr -> holiday description
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
