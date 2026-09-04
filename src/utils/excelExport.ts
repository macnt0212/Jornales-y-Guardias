import * as XLSX from 'xlsx';
import { MonthSchedule, DayInfo, AgentMonthStats } from '../types';
import { MONTH_NAMES, calculateAgentStats, HOURS_PER_SHIFT } from './calendar';

function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_');
}

/**
 * Exporta la planilla actual del servicio activo a Excel (.xlsx)
 */
export function exportScheduleToExcel(
  schedule: MonthSchedule,
  days: DayInfo[]
) {
  const monthName = MONTH_NAMES[schedule.month - 1];
  const hospitalSubtitle = schedule.serviceConfig?.hospitalSubtitle || 'GOBIERNO DE LA PROVINCIA DE FORMOSA - MINISTERIO DE DESARROLLO HUMANO';
  const hospitalName = schedule.serviceConfig?.hospitalName || 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"';
  const serviceName = schedule.serviceConfig?.serviceName || 'SERVICIO HOSPITALARIO';
  const title = `${hospitalName.toUpperCase()} - ${serviceName.toUpperCase()}`;
  const subTitle = `PLANILLA DE CONTROL DE JORNAL Y HORAS EXTRAS - ${monthName.toUpperCase()} ${schedule.year}`;

  const wb = XLSX.utils.book_new();

  // ----------------------------------------------------
  // HOJA 1: PLANILLA MATRIZ MENSUAL
  // ----------------------------------------------------
  const matrixData: (string | number)[][] = [];

  // Encabezados institucionales
  matrixData.push([hospitalSubtitle.toUpperCase()]);
  matrixData.push([title]);
  matrixData.push([subTitle]);
  matrixData.push([`Régimen: Jornal (${schedule.serviceConfig?.jornalHorarioLabel || '06:00 a 13:00 hs'}) | Horas Extras (${schedule.serviceConfig?.extraHabilHorarioLabel || '13:00 a 20:00 hs'} / Inhábiles)`]);
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

  if (!schedule.agents || schedule.agents.length === 0) {
    matrixData.push(['(No hay personal registrado en este servicio aún. Agregue agentes desde Configurar Personal)', '', '', '']);
  } else {
    // 2 Filas por Agente: Fila 1 Jornal (6-13) + Fila 2 Horas Extras (13-20 / Inhábiles)
    schedule.agents.forEach(agent => {
      const stats = calculateAgentStats(agent, schedule, days);

      // FILA 1: JORNAL ORDINARIO
      const rowJornal: (string | number)[] = [
        agent.name,
        agent.legajo,
        agent.roleLabel,
        `JORNAL (${schedule.serviceConfig?.jornalHorarioLabel || '06:00 a 13:00'})`,
      ];

      // FILA 2: HORAS EXTRAS (HÁBILES / INHÁBILES)
      const rowExtras: (string | number)[] = [
        agent.name,
        agent.legajo,
        agent.roleLabel,
        `HORAS EXTRAS (${schedule.serviceConfig?.extraHabilHorarioLabel || '13-20'} / Inhábiles)`,
      ];

      days.forEach(day => {
        const key = `${agent.id}_${day.dateStr}`;
        const assign = schedule.assignments[key];

        // Fila 1: Jornal
        if (assign?.jornal) {
          rowJornal.push('J');
        } else {
          rowJornal.push('-');
        }

        // Fila 2: Extras
        const extraCodes: string[] = [];
        if (assign?.extraHabil) extraCodes.push('E');
        if (assign?.extraInhabil24h) {
          extraCodes.push(assign.extraInhabil24hTipo === 'activa' ? 'G24A' : 'G24P');
        }
        if (assign?.extraInhabil12h) {
          extraCodes.push(assign.extraInhabil12hTipo === 'activa' ? 'G12A' : 'G12P');
        }
        if (assign?.extraInhabilManana) {
          extraCodes.push(assign.extraInhabilMananaTipo === 'activa' ? 'IA (M)' : 'IP (M)');
        }
        if (assign?.extraInhabilTarde) {
          extraCodes.push(assign.extraInhabilTardeTipo === 'activa' ? 'IA (T)' : 'IP (T)');
        }

        if (extraCodes.length === 0) {
          rowExtras.push('-');
        } else {
          rowExtras.push(extraCodes.join('+'));
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
  }

  matrixData.push([]);
  matrixData.push(['REFERENCIAS Y CÓDIGOS OFICIALES:']);
  matrixData.push([`Fila 1: J = Jornal Ordinario Días Hábiles (${schedule.serviceConfig?.jornalHorarioLabel || '06:00 a 13:00 hs'} - 7 hs)`]);
  matrixData.push([`Fila 2: E = Horas Extras Días Hábiles (${schedule.serviceConfig?.extraHabilHorarioLabel || '13:00 a 20:00 hs'} - 7 hs)`]);
  matrixData.push(['Fila 2: G24A / G24P = Guardia 24 Horas Inhábil ACTIVA / PASIVA (24 hs)']);
  matrixData.push(['Fila 2: G12A / G12P = Guardia 12 Horas Inhábil ACTIVA / PASIVA (12 hs)']);
  matrixData.push(['Fila 2: IA (M) / IA (T) = Horas Extras Inhábiles ACTIVAS Mañana / Tarde (7 hs c/u)']);
  matrixData.push(['Fila 2: IP (M) / IP (T) = Horas Extras Inhábiles PASIVAS Mañana / Tarde (7 hs c/u)']);

  const wsMatrix = XLSX.utils.aoa_to_sheet(matrixData);
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Planilla Matriz');

  // ----------------------------------------------------
  // HOJA 2: GUARDIAS INHÁBILES (ACTIVAS / PASIVAS)
  // ----------------------------------------------------
  const inhabilesData: (string | number)[][] = [
    [title],
    [`DETALLE DE GUARDIAS E INHÁBILES (SÁBADOS, DOMINGOS Y FERIADOS) - ${monthName.toUpperCase()} ${schedule.year}`],
    [],
    ['Fecha', 'Día', 'Tipo Día', 'Esquema / Turno', 'Agente Asignado', 'Modalidad (Activa / Pasiva)', 'Hs Inhábiles'],
  ];

  const weekendAndHolidays = days.filter(d => d.isWeekend || d.isHoliday);

  weekendAndHolidays.forEach(day => {
    let hasAnyAssign = false;

    schedule.agents.forEach(agent => {
      const key = `${agent.id}_${day.dateStr}`;
      const assign = schedule.assignments[key];
      if (!assign) return;

      if (assign.extraInhabil24h) {
        hasAnyAssign = true;
        inhabilesData.push([
          day.dateStr,
          day.dayNameLong,
          day.isHoliday ? `FERIADO (${day.holidayName || 'Feriado'})` : 'FIN DE SEMANA',
          'Guardia 24 Horas (08:00 a 08:00)',
          agent.name,
          (assign.extraInhabil24hTipo || 'activa').toUpperCase(),
          24
        ]);
      }
      if (assign.extraInhabil12h) {
        hasAnyAssign = true;
        inhabilesData.push([
          day.dateStr,
          day.dayNameLong,
          day.isHoliday ? `FERIADO (${day.holidayName || 'Feriado'})` : 'FIN DE SEMANA',
          'Guardia 12 Horas (08:00 a 20:00)',
          agent.name,
          (assign.extraInhabil12hTipo || 'activa').toUpperCase(),
          12
        ]);
      }
      if (assign.extraInhabilManana) {
        hasAnyAssign = true;
        inhabilesData.push([
          day.dateStr,
          day.dayNameLong,
          day.isHoliday ? `FERIADO (${day.holidayName || 'Feriado'})` : 'FIN DE SEMANA',
          `Turno Mañana (${schedule.serviceConfig?.inhabilMananaHorarioLabel || '06:00 a 13:00'})`,
          agent.name,
          (assign.extraInhabilMananaTipo || 'activa').toUpperCase(),
          7
        ]);
      }
      if (assign.extraInhabilTarde) {
        hasAnyAssign = true;
        inhabilesData.push([
          day.dateStr,
          day.dayNameLong,
          day.isHoliday ? `FERIADO (${day.holidayName || 'Feriado'})` : 'FIN DE SEMANA',
          `Turno Tarde (${schedule.serviceConfig?.inhabilTardeHorarioLabel || '13:00 a 20:00'})`,
          agent.name,
          (assign.extraInhabilTardeTipo || 'activa').toUpperCase(),
          7
        ]);
      }
    });

    if (!hasAnyAssign) {
      inhabilesData.push([
        day.dateStr,
        day.dayNameLong,
        day.isHoliday ? `FERIADO (${day.holidayName || 'Feriado'})` : 'FIN DE SEMANA',
        'Sin guardia asignada',
        '-',
        '-',
        0
      ]);
    }
  });

  const wsInhabiles = XLSX.utils.aoa_to_sheet(inhabilesData);
  XLSX.utils.book_append_sheet(wb, wsInhabiles, 'Guardias Inhábiles');

  // ----------------------------------------------------
  // HOJA 3: RESUMEN DE LIQUIDACIÓN PARA DIRECCIÓN / RRHH
  // ----------------------------------------------------
  const summaryData: (string | number)[][] = [
    [hospitalSubtitle.toUpperCase()],
    [title],
    [`RESUMEN GENERAL MENSUAL PARA LIQUIDACIÓN - ${monthName.toUpperCase()} ${schedule.year}`],
    [],
    [
      'N°',
      'Agente (Apellido y Nombre)',
      'Legajo / M.P.',
      'Función / Cargo',
      'Categoría',
      'Días Jornal',
      'Hs Jornal',
      'Días Ext. Hábil',
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
    `TOTALES ${serviceName.toUpperCase()}`,
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
  summaryData.push([
    `_____________________________\n${schedule.serviceConfig?.jefeName || 'Firma Jefe de Servicio'}\n${schedule.serviceConfig?.jefeCargo || 'Jefe de Servicio'} - ${schedule.serviceConfig?.jefeLegajo || ''}`,
    '',
    '_____________________________\nFirma Responsable RRHH',
    '',
    '_____________________________\nFirma Dirección Hospital Central'
  ]);

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Liquidación');

  // Descargar archivo Excel con nombre sanitizado
  const sName = sanitizeFileName(serviceName);
  const fileName = `Planilla_${sName}_${schedule.year}_${String(schedule.month).padStart(2, '0')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Genera una plantilla de Excel completamente en blanco lista para que el Jefe de Servicio complete manualmente o imprima
 */
export function exportBlankExcelTemplate(
  schedule: MonthSchedule,
  days: DayInfo[]
) {
  const monthName = MONTH_NAMES[schedule.month - 1];
  const hospitalSubtitle = schedule.serviceConfig?.hospitalSubtitle || 'GOBIERNO DE LA PROVINCIA DE FORMOSA - MINISTERIO DE DESARROLLO HUMANO';
  const hospitalName = schedule.serviceConfig?.hospitalName || 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"';
  const serviceName = schedule.serviceConfig?.serviceName || 'NUEVO SERVICIO HOSPITALARIO';
  const title = `${hospitalName.toUpperCase()} - ${serviceName.toUpperCase()}`;
  const subTitle = `PLANTILLA EN BLANCO PARA CARGA DE TURNOS Y HORAS EXTRAS - ${monthName.toUpperCase()} ${schedule.year}`;

  const wb = XLSX.utils.book_new();

  // ----------------------------------------------------
  // HOJA 1: MATRIZ EN BLANCO
  // ----------------------------------------------------
  const matrixData: (string | number)[][] = [];

  matrixData.push([hospitalSubtitle.toUpperCase()]);
  matrixData.push([title]);
  matrixData.push([subTitle]);
  matrixData.push([`Régimen: Jornal (${schedule.serviceConfig?.jornalHorarioLabel || '06:00 a 13:00 hs'}) | Horas Extras (${schedule.serviceConfig?.extraHabilHorarioLabel || '13:00 a 20:00 hs'} / Inhábiles)`]);
  matrixData.push([]);

  // Fila de Días
  const headerDaysRow1: (string | number)[] = ['Apellido y Nombre', 'Legajo / M.P.', 'Función / Cargo', 'Concepto'];
  days.forEach(d => {
    headerDaysRow1.push(`${d.dayNameShort}`);
  });
  headerDaysRow1.push('Días Jornal', 'Hs Jornal', 'Días Ext Hábil', 'Hs Ext Hábil', 'Hs Inháb Activa', 'Hs Inháb Pasiva', 'Total Hs Extras', 'TOTAL HORAS MES');
  matrixData.push(headerDaysRow1);

  const headerDaysRow2: (string | number)[] = ['', '', '', ''];
  days.forEach(d => {
    headerDaysRow2.push(d.dayNumber);
  });
  headerDaysRow2.push('', '', '', '', '', '', '', '');
  matrixData.push(headerDaysRow2);

  // Filas para agentes existentes si los hay
  if (schedule.agents && schedule.agents.length > 0) {
    schedule.agents.forEach(agent => {
      const rowJ: (string | number)[] = [agent.name, agent.legajo, agent.roleLabel, 'Jornal'];
      const rowE: (string | number)[] = [agent.name, agent.legajo, agent.roleLabel, 'Horas Extras'];
      days.forEach(() => {
        rowJ.push('');
        rowE.push('');
      });
      rowJ.push('', '', '', '', '', '', '', '');
      rowE.push('', '', '', '', '', '', '', '');
      matrixData.push(rowJ);
      matrixData.push(rowE);
    });
  }

  // Agregar 6 filas en blanco adicionales para que el jefe pueda escribir a mano o en Excel
  for (let i = 1; i <= 6; i++) {
    const rowJ: (string | number)[] = [`[Agente ${i}]`, '', '', 'Jornal'];
    const rowE: (string | number)[] = [`[Agente ${i}]`, '', '', 'Horas Extras'];
    days.forEach(() => {
      rowJ.push('');
      rowE.push('');
    });
    rowJ.push('', '', '', '', '', '', '', '');
    rowE.push('', '', '', '', '', '', '', '');
    matrixData.push(rowJ);
    matrixData.push(rowE);
  }

  matrixData.push([]);
  matrixData.push(['INSTRUCCIONES DE CARGA PARA EL JEFE DE SERVICIO:']);
  matrixData.push(['1. En la fila "Jornal", colocar "J" en los días que el agente cumpla su jornada ordinaria.']);
  matrixData.push(['2. En la fila "Horas Extras", colocar "E" para extra hábil, "IA" para guardia inhábil activa presencial, o "IP" para guardia inhábil pasiva.']);
  matrixData.push(['3. Dejar en blanco o colocar "-" en los días de franco o descanso.']);

  const wsMatrix = XLSX.utils.aoa_to_sheet(matrixData);
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Plantilla Matriz en Blanco');

  // ----------------------------------------------------
  // HOJA 2: INHÁBILES EN BLANCO
  // ----------------------------------------------------
  const inhabilesData: (string | number)[][] = [
    [title],
    [`PLANILLA EN BLANCO - GUARDIAS INHÁBILES (SÁBADOS, DOMINGOS Y FERIADOS) - ${monthName.toUpperCase()} ${schedule.year}`],
    [],
    ['Fecha', 'Día', 'Tipo Día', `Turno Mañana (${schedule.serviceConfig?.inhabilMananaHorarioLabel || '06:00 a 13:00'})`, 'Modalidad (Activa / Pasiva)', `Turno Tarde (${schedule.serviceConfig?.inhabilTardeHorarioLabel || '13:00 a 20:00'})`, 'Modalidad (Activa / Pasiva)', 'Hs Totales'],
  ];

  const weekendAndHolidays = days.filter(d => d.isWeekend || d.isHoliday);
  weekendAndHolidays.forEach(day => {
    inhabilesData.push([
      day.dateStr,
      day.dayNameLong,
      day.isHoliday ? `FERIADO (${day.holidayName || 'Feriado'})` : 'FIN DE SEMANA',
      '', // Para que el jefe complete
      '',
      '', // Para que el jefe complete
      '',
      '',
    ]);
  });

  const wsInhabiles = XLSX.utils.aoa_to_sheet(inhabilesData);
  XLSX.utils.book_append_sheet(wb, wsInhabiles, 'Guardias Inhábiles en Blanco');

  const sName = sanitizeFileName(serviceName);
  const fileName = `Plantilla_En_Blanco_${sName}_${schedule.year}_${String(schedule.month).padStart(2, '0')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

