import { Agent, DayInfo, DayShiftAssignment, MonthSchedule, AgentMonthStats, InhabileMode } from '../types';

export const HOURS_PER_SHIFT = 7; // 6 a 13 = 7hs, 13 a 20 = 7hs

export const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'agent_jefe',
    name: 'Escobar, Eduardo Martin',
    role: 'soporte_jefe',
    roleLabel: 'Jefe de Servicio (Soporte Técnico)',
    category: 'Soporte Técnico',
    legajo: 'LEG-4820',
    isJefe: true,
    allowedInhabileMode: 'pasiva',
  },
  {
    id: 'agent_soporte_1',
    name: 'Cantero, Miguel Angel',
    role: 'soporte_tecnico',
    roleLabel: 'Agente Soporte Técnico',
    category: 'Soporte Técnico',
    legajo: 'LEG-5192',
    allowedInhabileMode: 'activa',
  },
  {
    id: 'agent_sigho_1',
    name: 'Galeano, Cristian Alejandro',
    role: 'sigho',
    roleLabel: 'Agente Soporte Informático SIGHO 1',
    category: 'Soporte Informático SIGHO',
    legajo: 'LEG-5431',
    allowedInhabileMode: 'pasiva',
  },
  {
    id: 'agent_sigho_2',
    name: 'Amarilla, Nestor Ivan',
    role: 'sigho',
    roleLabel: 'Agente Soporte Informático SIGHO 2',
    category: 'Soporte Informático SIGHO',
    legajo: 'LEG-5804',
    allowedInhabileMode: 'pasiva',
  },
];

/**
 * Regla de Inhábiles del Servicio:
 * El único habilitado para Inhábiles Activas (presenciales) es Cantero, Miguel Angel.
 * El resto de los agentes tienen habilitadas Inhábiles Pasivas (disponibilidad).
 */
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

/**
 * Regla de horas extras para Amarilla, Nestor Ivan:
 * El agente Amarilla, Nestor Ivan realiza ÚNICAMENTE horas extras Inhábiles Pasivas
 * (no realiza extras hábiles de 13 a 20 hs en días laborables de lunes a viernes).
 */
export function isAgentOnlyInhabilePasiva(
  agent: Agent | { name?: string; id?: string } | null | undefined
): boolean {
  if (!agent) return false;
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
 * Genera la rotación automática cumpliendo todas las reglas del Hospital Central:
 * - Días hábiles (Lunes a Viernes no feriados):
 *   * Todos los 4 agentes cumplen Jornal de 6 a 13 hs.
 *   * 2 agentes se quedan de 13 a 20 hs (1 de Soporte Técnico y 1 de Soporte Informático SIGHO).
 *   * Se alternan de modo que en una semana a uno le tocan 3 días y al otro 2 días, y viceversa la siguiente semana.
 * - Días inhábiles (Fines de semana y feriados):
 *   * Turnos de 6-13 y 13-20 hs (con modalidad configurable activa/pasiva).
 */
export function generateBalancedSchedule(
  year: number,
  month: number,
  agents: Agent[] = DEFAULT_AGENTS,
  customHolidays: Record<string, string> = {},
  defaultInhabileMode: InhabileMode = 'activa'
): MonthSchedule {
  const days = getDaysInMonth(year, month, customHolidays);
  const assignments: Record<string, DayShiftAssignment> = {};

  // Identificar agentes clave para las duplas del servicio
  const cantero = agents.find(a => isAgentInhabileActiva(a) || a.name.toLowerCase().includes('cantero')) 
    || agents.find(a => a.id === 'agent_soporte_1') 
    || agents[1] 
    || agents[0];

  const escobar = agents.find(a => a.name.toLowerCase().includes('escobar')) 
    || agents.find(a => a.isJefe || a.id === 'agent_jefe') 
    || agents[0];

  const galeano = agents.find(a => a.name.toLowerCase().includes('galeano')) 
    || agents.find(a => a.id === 'agent_sigho_1') 
    || agents[2] 
    || agents[0];

  const amarilla = agents.find(a => a.name.toLowerCase().includes('amarilla')) 
    || agents.find(a => a.id === 'agent_sigho_2') 
    || agents[3] 
    || agents[1] 
    || agents[0];

  // Agrupar fines de semana del mes (Sábado y Domingo consecutivos)
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

  days.forEach((day) => {
    // Inicializar asignaciones para los 4 agentes
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
      // 1. Todos cumplen jornal 06:00 a 13:00 hs
      agents.forEach(agent => {
        const key = `${agent.id}_${day.dateStr}`;
        assignments[key].jornal = true;
      });

      // 2. Extra Hábil 13:00 a 20:00 hs
      // Semana alterna: calculamos según el número de día de la semana (1: Lun, 2: Mar, 3: Mié, 4: Jue, 5: Vie)
      // y la semana del mes.
      const weekNumber = Math.floor((day.dayNumber - 1) / 7);
      const isWeekEven = weekNumber % 2 === 0;

      // En días impares (Lun=1, Mié=3, Vie=5) le toca a uno; en pares (Mar=2, Jue=4) al otro.
      const isDayOdd = day.dayOfWeek % 2 !== 0; // Lun(1), Mié(3), Vie(5) son impares
      
      const assignedSoporte = (isWeekEven ? isDayOdd : !isDayOdd) ? escobar : cantero;
      // En SIGHO: Galeano, Cristian Alejandro realiza las horas extras hábiles (13 a 20 hs),
      // ya que el agente Amarilla, Nestor Ivan realiza ÚNICAMENTE horas extras Inhábiles Pasivas.
      const assignedSigho = isAgentOnlyInhabilePasiva(amarilla) 
        ? galeano 
        : ((isWeekEven ? isDayOdd : !isDayOdd) ? galeano : amarilla);

      if (assignedSoporte) {
        assignments[`${assignedSoporte.id}_${day.dateStr}`].extraHabil = true;
      }
      if (assignedSigho) {
        assignments[`${assignedSigho.id}_${day.dateStr}`].extraHabil = true;
      }
    } else {
      // Días Inhábiles (Fines de semana y Feriados)
      if (day.isWeekend) {
        const wIndex = weekendIndexMap.get(day.dateStr) ?? 0;
        const isPair1Weekend = wIndex % 2 === 0;

        if (isPair1Weekend) {
          // Pareja 1: Cantero, Miguel Angel (ACTIVA) & Escobar, Eduardo Martin (PASIVA)
          // Fines de semana de por medio juntos
          if (day.dayOfWeek === 6) {
            // Sábado: Cantero Mañana (Activa), Escobar Tarde (Pasiva)
            const kCantero = `${cantero.id}_${day.dateStr}`;
            assignments[kCantero].extraInhabilManana = true;
            assignments[kCantero].extraInhabilMananaTipo = 'activa';

            const kEscobar = `${escobar.id}_${day.dateStr}`;
            assignments[kEscobar].extraInhabilTarde = true;
            assignments[kEscobar].extraInhabilTardeTipo = 'pasiva';
          } else {
            // Domingo: Escobar Mañana (Pasiva), Cantero Tarde (Activa)
            const kEscobar = `${escobar.id}_${day.dateStr}`;
            assignments[kEscobar].extraInhabilManana = true;
            assignments[kEscobar].extraInhabilMananaTipo = 'pasiva';

            const kCantero = `${cantero.id}_${day.dateStr}`;
            assignments[kCantero].extraInhabilTarde = true;
            assignments[kCantero].extraInhabilTardeTipo = 'activa';
          }
        } else {
          // Pareja 2: Galeano, Cristian Alejandro (PASIVA) & Amarilla, Nestor Ivan (PASIVA)
          // Fines de semana alternados
          if (day.dayOfWeek === 6) {
            // Sábado: Galeano Mañana (Pasiva), Amarilla Tarde (Pasiva)
            const kGaleano = `${galeano.id}_${day.dateStr}`;
            assignments[kGaleano].extraInhabilManana = true;
            assignments[kGaleano].extraInhabilMananaTipo = 'pasiva';

            const kAmarilla = `${amarilla.id}_${day.dateStr}`;
            assignments[kAmarilla].extraInhabilTarde = true;
            assignments[kAmarilla].extraInhabilTardeTipo = 'pasiva';
          } else {
            // Domingo: Amarilla Mañana (Pasiva), Galeano Tarde (Pasiva)
            const kAmarilla = `${amarilla.id}_${day.dateStr}`;
            assignments[kAmarilla].extraInhabilManana = true;
            assignments[kAmarilla].extraInhabilMananaTipo = 'pasiva';

            const kGaleano = `${galeano.id}_${day.dateStr}`;
            assignments[kGaleano].extraInhabilTarde = true;
            assignments[kGaleano].extraInhabilTardeTipo = 'pasiva';
          }
        }
      } else {
        // Feriados en días de semana (Lunes a Viernes)
        // Alternan entre Pareja 1 y Pareja 2
        if (holidayWeekdayCounter % 2 === 0) {
          // Pareja 1
          const kCantero = `${cantero.id}_${day.dateStr}`;
          assignments[kCantero].extraInhabilManana = true;
          assignments[kCantero].extraInhabilMananaTipo = 'activa';

          const kEscobar = `${escobar.id}_${day.dateStr}`;
          assignments[kEscobar].extraInhabilTarde = true;
          assignments[kEscobar].extraInhabilTardeTipo = 'pasiva';
        } else {
          // Pareja 2
          const kGaleano = `${galeano.id}_${day.dateStr}`;
          assignments[kGaleano].extraInhabilManana = true;
          assignments[kGaleano].extraInhabilMananaTipo = 'pasiva';

          const kAmarilla = `${amarilla.id}_${day.dateStr}`;
          assignments[kAmarilla].extraInhabilTarde = true;
          assignments[kAmarilla].extraInhabilTardeTipo = 'pasiva';
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
