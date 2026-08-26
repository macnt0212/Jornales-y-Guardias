import * as XLSX from 'xlsx';
import { MonthSchedule, DayInfo, AgentMonthStats } from '../types';
import { MONTH_NAMES, calculateAgentStats, HOURS_PER_SHIFT } from './calendar';

export function exportScheduleToExcel(
  schedule: MonthSchedule,
  days: DayInfo[]
) {
  const monthName = MONTH_NAMES[schedule.month - 1];
  const title = `HOSPITAL CENTRAL DE EMERGENCIAS DE FORMOSA - SERVICIO DE INFORMÁTICA`;
  const subTitle = `PLANILLA DE CONTROL DE JORNAL Y HORAS EXTRAS - ${monthName.toUpperCase()} ${schedule.year}`;

  const wb = XLSX.utils.book_new();

  // ----------------------------------------------------
  // HOJA 1: PLANILLA MATRIZ MENSUAL
  // ----------------------------------------------------
  const matrixData: (string | number)[][] = [];

  // Encabezados institucionales
  matrixData.push(['GOBIERNO DE LA PROVINCIA DE FORMOSA - MINISTERIO DE DESARROLLO HUMANO']);
  matrixData.push([title]);
  matrixData.push([subTitle]);
  matrixData.push([`Régimen: Jornal Ordinario (06:00 a 13:00 hs) | Horas Extras Hábiles (13:00 a 20:00 hs) | Inhábiles (06:00 a 13:00 / 13:00 a 20:00 hs)`]);
  matrixData.push([]); // Espacio

  // Fila de Nombres de Días (Lun, Mar, Mié...)
  const headerDaysRow1: (string | number)[] = ['Agente', 'Legajo', 'Función', 'Concepto / Turno'];
  days.forEach(d => {
    headerDaysRow1.push(`${d.dayNameShort}`);
  });
  headerDaysRow1.push('Días Jornal', 'Hs Jornal', 'Días Ext Hábil', 'Hs Ext Hábil', 'Hs Inháb Activa', 'Hs Inháb Pasiva', 'Total Hs Extras', 'TOTAL HORAS MES');
  matrixData.push(headerDaysRow1);

  // Fila de Números de Días (1, 2, 3...)
  const headerDaysRow2: (string | number)[] = ['', '', '', ''];
  days.forEach(d => {
    headerDaysRow2.push(d.dayNumber);
  });
  headerDaysRow2.push('', '', '', '', '', '', '', '');
  matrixData.push(headerDaysRow2);

  // 2 Filas por Agente: Fila 1 Jornal (6-13) + Fila 2 Horas Extras (13-20 / Inhábiles)
  schedule.agents.forEach(agent => {
    const stats = calculateAgentStats(agent, schedule, days);

    // FILA 1: JORNAL ORDINARIO
    const rowJornal: (string | number)[] = [
      agent.name,
      agent.legajo,
      agent.roleLabel,
      'JORNAL (06:00 a 13:00)',
    ];

    // FILA 2: HORAS EXTRAS (HÁBILES / INHÁBILES)
    const rowExtras: (string | number)[] = [
      agent.name,
      agent.legajo,
      agent.roleLabel,
      'HORAS EXTRAS (13-20 / Inhábiles)',
    ];

    days.forEach(day => {
      const key = `${agent.id}_${day.dateStr}`;
      const assign = schedule.assignments[key];

      // Fila 1: Jornal
      if (assign?.jornal) {
        rowJornal.push('J (6-13)');
      } else {
        rowJornal.push('-');
      }

      // Fila 2: Extras
      const extraCodes: string[] = [];
      if (assign?.extraHabil) extraCodes.push('E (13-20)');
      if (assign?.extraInhabilManana) {
        extraCodes.push(assign.extraInhabilMananaTipo === 'activa' ? 'IA (6-13)' : 'IP (6-13)');
      }
      if (assign?.extraInhabilTarde) {
        extraCodes.push(assign.extraInhabilTardeTipo === 'activa' ? 'IA (13-20)' : 'IP (13-20)');
      }

      if (extraCodes.length === 0) {
        rowExtras.push('-');
      } else {
        rowExtras.push(extraCodes.join(' + '));
      }
    });

    // Totales Fila 1 (Jornal)
    rowJornal.push(
      stats.diasJornal,
      stats.horasJornal,
      '-',
      '-',
      '-',
      '-',
      '-',
      stats.totalHorasMes
    );

    // Totales Fila 2 (Extras)
    rowExtras.push(
      '-',
      '-',
      stats.diasExtraHabil,
      stats.horasExtraHabil,
      stats.horasInhabilActiva,
      stats.horasInhabilPasiva,
      stats.totalHorasExtras,
      stats.totalHorasMes
    );

    matrixData.push(rowJornal);
    matrixData.push(rowExtras);
  });

  matrixData.push([]);
  matrixData.push(['REFERENCIAS Y CÓDIGOS:']);
  matrixData.push(['Fila 1: J (6-13) = Jornal Ordinario Lunes a Viernes (06:00 a 13:00 hs - 7 hs)']);
  matrixData.push(['Fila 2: E (13-20) = Horas Extras Días Hábiles Lunes a Viernes (13:00 a 20:00 hs - 7 hs)']);
  matrixData.push(['Fila 2: IA (6-13) / IA (13-20) = Horas Extras Inhábiles ACTIVAS (7 hs c/u)']);
  matrixData.push(['Fila 2: IP (6-13) / IP (13-20) = Horas Extras Inhábiles PASIVAS (7 hs c/u)']);

  const wsMatrix = XLSX.utils.aoa_to_sheet(matrixData);
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Planilla Matriz Mensual');

  // ----------------------------------------------------
  // HOJA 2: GUARDIAS INHÁBILES (ACTIVAS / PASIVAS)
  // ----------------------------------------------------
  const inhabilesData: (string | number)[][] = [
    ['HOSPITAL CENTRAL DE EMERGENCIAS DE FORMOSA - SERVICIO DE INFORMÁTICA'],
    [`DETALLE DE GUARDIAS E INHÁBILES (SÁBADOS, DOMINGOS Y FERIADOS) - ${monthName.toUpperCase()} ${schedule.year}`],
    [],
    ['Fecha', 'Día', 'Tipo Día', 'Turno Mañana (06:00 a 13:00 hs)', 'Modalidad Mañana', 'Turno Tarde (13:00 a 20:00 hs)', 'Modalidad Tarde', 'Total Hs Inhábiles'],
  ];

  const weekendAndHolidays = days.filter(d => d.isWeekend || d.isHoliday);

  weekendAndHolidays.forEach(day => {
    let morningAgentName = '-';
    let morningMode = '-';
    let afternoonAgentName = '-';
    let afternoonMode = '-';
    let hours = 0;

    schedule.agents.forEach(agent => {
      const key = `${agent.id}_${day.dateStr}`;
      const assign = schedule.assignments[key];
      if (assign?.extraInhabilManana) {
        morningAgentName = agent.name;
        morningMode = (assign.extraInhabilMananaTipo || 'activa').toUpperCase();
        hours += HOURS_PER_SHIFT;
      }
      if (assign?.extraInhabilTarde) {
        afternoonAgentName = agent.name;
        afternoonMode = (assign.extraInhabilTardeTipo || 'activa').toUpperCase();
        hours += HOURS_PER_SHIFT;
      }
    });

    inhabilesData.push([
      day.dateStr,
      day.dayNameLong,
      day.isHoliday ? `FERIADO (${day.holidayName || 'Feriado'})` : 'FIN DE SEMANA',
      morningAgentName,
      morningMode,
      afternoonAgentName,
      afternoonMode,
      hours,
    ]);
  });

  const wsInhabiles = XLSX.utils.aoa_to_sheet(inhabilesData);
  XLSX.utils.book_append_sheet(wb, wsInhabiles, 'Guardias Inhábiles');

  // ----------------------------------------------------
  // HOJA 3: RESUMEN DE LIQUIDACIÓN PARA DIRECCIÓN / RRHH
  // ----------------------------------------------------
  const summaryData: (string | number)[][] = [
    ['GOBIERNO DE LA PROVINCIA DE FORMOSA - MINISTERIO DE DESARROLLO HUMANO'],
    ['HOSPITAL CENTRAL DE EMERGENCIAS DE FORMOSA - SERVICIO DE INFORMÁTICA'],
    [`RESUMEN GENERAL MENSUAL PARA LIQUIDACIÓN - ${monthName.toUpperCase()} ${schedule.year}`],
    [],
    [
      'N°',
      'Agente (Apellido y Nombre)',
      'Legajo',
      'Función / Cargo',
      'Categoría',
      'Días Jornal (6-13)',
      'Hs Jornal',
      'Días Ext. Hábil (13-20)',
      'Hs Ext. Hábil',
      'Turnos Inháb. Activa',
      'Hs Inháb. Activa',
      'Turnos Inháb. Pasiva',
      'Hs Inháb. Pasiva',
      'TOTAL HS EXTRAS',
      'TOTAL HORAS MES',
    ],
  ];

  let totalJornalAll = 0;
  let totalExtHabilAll = 0;
  let totalInhabActivaAll = 0;
  let totalInhabPasivaAll = 0;
  let totalExtrasAll = 0;
  let totalGeneralAll = 0;

  schedule.agents.forEach((agent, idx) => {
    const stats = calculateAgentStats(agent, schedule, days);
    totalJornalAll += stats.horasJornal;
    totalExtHabilAll += stats.horasExtraHabil;
    totalInhabActivaAll += stats.horasInhabilActiva;
    totalInhabPasivaAll += stats.horasInhabilPasiva;
    totalExtrasAll += stats.totalHorasExtras;
    totalGeneralAll += stats.totalHorasMes;

    summaryData.push([
      idx + 1,
      agent.name,
      agent.legajo,
      agent.roleLabel,
      agent.category,
      stats.diasJornal,
      stats.horasJornal,
      stats.diasExtraHabil,
      stats.horasExtraHabil,
      stats.turnosInhabilActiva,
      stats.horasInhabilActiva,
      stats.turnosInhabilPasiva,
      stats.horasInhabilPasiva,
      stats.totalHorasExtras,
      stats.totalHorasMes,
    ]);
  });

  // Fila de Totales Generales
  summaryData.push([
    '',
    'TOTALES SERVICIO INFORMÁTICA',
    '',
    '',
    '',
    '',
    totalJornalAll,
    '',
    totalExtHabilAll,
    '',
    totalInhabActivaAll,
    '',
    totalInhabPasivaAll,
    totalExtrasAll,
    totalGeneralAll,
  ]);

  summaryData.push([]);
  summaryData.push([]);
  summaryData.push(['_____________________________', '', '_____________________________', '', '_____________________________']);
  summaryData.push(['Firma Jefe de Servicio', '', 'Firma Responsable RRHH', '', 'Firma Dirección Hospital Central']);

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Liquidación');

  // Descargar archivo Excel
  const fileName = `Planilla_Control_Jornal_HorasExtras_${schedule.year}_${String(schedule.month).padStart(2, '0')}_Informatica_HCEF.xlsx`;
  XLSX.writeFile(wb, fileName);
}
