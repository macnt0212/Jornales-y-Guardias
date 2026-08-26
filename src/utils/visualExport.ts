import { Agent, DayInfo, MonthSchedule } from '../types';
import { MONTH_NAMES, calculateAgentStats } from './calendar';

function buildVisualTableHtml(schedule: MonthSchedule, days: DayInfo[]) {
  const monthName = MONTH_NAMES[schedule.month - 1];
  const year = schedule.year;

  const serviceConfig = schedule.serviceConfig || {
    hospitalName: 'HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"',
    hospitalSubtitle: 'Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano',
    serviceName: 'Servicio de Guardia y Emergencias',
    jefeName: '',
    jefeCargo: 'Jefe de Servicio',
    jefeLegajo: '',
    jornalHorarioLabel: '06:00 a 13:00 hs',
    extraHabilHorarioLabel: '13:00 a 20:00 hs',
    inhabilMananaHorarioLabel: '06:00 a 13:00 hs',
    inhabilTardeHorarioLabel: '13:00 a 20:00 hs',
  };

  const totalJornalHoras = schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, days).horasJornal, 0);
  const totalExtraHabilHoras = schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, days).horasExtraHabil, 0);
  const totalInhabActivaHoras = schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, days).horasInhabilActiva, 0);
  const totalInhabPasivaHoras = schedule.agents.reduce((acc, a) => acc + calculateAgentStats(a, schedule, days).horasInhabilPasiva, 0);
  const totalGeneral = totalJornalHoras + totalExtraHabilHoras + totalInhabActivaHoras + totalInhabPasivaHoras;

  let daysHeaderRow1 = '';
  let daysHeaderRow2 = '';

  days.forEach(d => {
    const isW = d.isWeekend;
    const isH = d.isHoliday;
    let bgCol = '#1e293b';
    let textCol = '#ffffff';
    let subBg = '#334155';

    if (isH) {
      bgCol = '#be123c';
      textCol = '#ffe4e6';
      subBg = '#e11d48';
    } else if (isW) {
      bgCol = '#b45309';
      textCol = '#fef3c7';
      subBg = '#d97706';
    }

    daysHeaderRow1 += `<th style="background-color: ${bgCol}; color: ${textCol}; border: 1px solid #475569; padding: 4px 2px; text-align: center; font-size: 10px; width: 2.2%;">${d.dayNameShort}</th>`;
    daysHeaderRow2 += `<th style="background-color: ${subBg}; color: #ffffff; border: 1px solid #475569; padding: 4px 2px; text-align: center; font-size: 10px; font-weight: bold;">${d.dayNumber}</th>`;
  });

  let agentsRowsHtml = '';

  schedule.agents.forEach((agent, idx) => {
    const stats = calculateAgentStats(agent, schedule, days);
    const isEven = idx % 2 === 0;
    const baseBg = isEven ? '#ffffff' : '#f8fafc';

    // FILA 1: JORNAL
    let jornalCells = '';
    // FILA 2: EXTRAS
    let extrasCells = '';

    days.forEach(day => {
      const key = `${agent.id}_${day.dateStr}`;
      const assign = schedule.assignments[key];
      const isW = day.isWeekend;
      const isH = day.isHoliday;

      let cellBg = baseBg;
      if (isH) cellBg = '#fff1f2';
      else if (isW) cellBg = '#fffbeb';

      // Jornal
      if (assign?.jornal) {
        jornalCells += `
          <td style="background-color: ${cellBg}; border: 1px solid #cbd5e1; padding: 3px 1px; text-align: center;">
            <span style="display: inline-block; background-color: #dbeafe; color: #1e3a8a; border: 1px solid #93c5fd; font-size: 9px; font-weight: bold; border-radius: 3px; padding: 2px 4px;">J (6-13)</span>
          </td>
        `;
      } else {
        jornalCells += `
          <td style="background-color: ${cellBg}; border: 1px solid #cbd5e1; padding: 3px 1px; text-align: center; color: #cbd5e1; font-size: 10px;">-</td>
        `;
      }

      // Extras
      const badges: string[] = [];
      if (assign?.extraHabil) {
        badges.push(`<span style="display: block; background-color: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; font-size: 8.5px; font-weight: bold; border-radius: 3px; padding: 1px 3px; margin-bottom: 2px;">E (13-20)</span>`);
      }
      if (assign?.extraInhabilManana) {
        const isActiva = assign.extraInhabilMananaTipo === 'activa';
        const bg = isActiva ? '#f3e8ff' : '#fef3c7';
        const color = isActiva ? '#581c87' : '#78350f';
        const border = isActiva ? '#d8b4fe' : '#fde68a';
        const label = isActiva ? 'IA (6-13)' : 'IP (6-13)';
        badges.push(`<span style="display: block; background-color: ${bg}; color: ${color}; border: 1px solid ${border}; font-size: 8.5px; font-weight: bold; border-radius: 3px; padding: 1px 3px; margin-bottom: 2px;">${label}</span>`);
      }
      if (assign?.extraInhabilTarde) {
        const isActiva = assign.extraInhabilTardeTipo === 'activa';
        const bg = isActiva ? '#f3e8ff' : '#fef3c7';
        const color = isActiva ? '#581c87' : '#78350f';
        const border = isActiva ? '#d8b4fe' : '#fde68a';
        const label = isActiva ? 'IA (13-20)' : 'IP (13-20)';
        badges.push(`<span style="display: block; background-color: ${bg}; color: ${color}; border: 1px solid ${border}; font-size: 8.5px; font-weight: bold; border-radius: 3px; padding: 1px 3px;">${label}</span>`);
      }

      if (badges.length > 0) {
        extrasCells += `
          <td style="background-color: ${cellBg}; border: 1px solid #cbd5e1; padding: 2px 1px; text-align: center;">
            ${badges.join('')}
          </td>
        `;
      } else {
        extrasCells += `
          <td style="background-color: ${cellBg}; border: 1px solid #cbd5e1; padding: 2px 1px; text-align: center; color: #cbd5e1; font-size: 10px;">-</td>
        `;
      }
    });

    agentsRowsHtml += `
      <!-- FILA 1: JORNAL -->
      <tr style="background-color: ${baseBg};">
        <td rowspan="2" style="background-color: #ffffff; border: 1px solid #94a3b8; border-bottom: 2px solid #475569; padding: 6px; text-align: left; vertical-align: top; width: 150px;">
          <div style="font-weight: bold; font-size: 11px; color: #0f172a;">${agent.name}</div>
          <div style="font-size: 10px; color: #475569; margin-top: 2px;">${agent.roleLabel} - <span style="font-family: monospace; color: #64748b;">${agent.legajo}</span></div>
          <div style="margin-top: 4px;">
            <span style="display: inline-block; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 3px; background-color: ${agent.category === 'Soporte Técnico' ? '#dbeafe' : '#ccfbf1'}; color: ${agent.category === 'Soporte Técnico' ? '#1e40af' : '#115e59'}; border: 1px solid ${agent.category === 'Soporte Técnico' ? '#bfdbfe' : '#99f6e4'};">
              ${agent.category}
            </span>
          </div>
          <div style="margin-top: 6px; font-size: 9px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
            <div style="color: #1d4ed8; font-weight: bold;">• Fila 1: Jornal (06-13)</div>
            <div style="color: #047857; font-weight: bold;">• Fila 2: Horas Extras</div>
          </div>
        </td>
        ${jornalCells}
        <!-- Totales Jornal -->
        <td style="background-color: #eff6ff; color: #1e3a8a; font-weight: bold; text-align: center; border: 1px solid #cbd5e1; font-size: 10px;">${stats.diasJornal}</td>
        <td style="background-color: #dbeafe; color: #172554; font-weight: bold; text-align: center; border: 1px solid #cbd5e1; font-size: 10px;">${stats.horasJornal}h</td>
        <td colspan="2" style="background-color: #f8fafc; color: #94a3b8; text-align: center; border: 1px solid #cbd5e1; font-size: 9px;">(Ver abajo)</td>
        <td colspan="2" style="background-color: #f8fafc; color: #94a3b8; text-align: center; border: 1px solid #cbd5e1; font-size: 9px;">(Ver abajo)</td>
        <td style="background-color: #f8fafc; color: #94a3b8; text-align: center; border: 1px solid #cbd5e1; font-size: 9px;">-</td>
        <td rowspan="2" style="background-color: #e2e8f0; color: #0f172a; font-weight: 900; text-align: center; vertical-align: middle; border: 1px solid #94a3b8; border-bottom: 2px solid #475569; font-size: 13px;">${stats.totalHorasMes}h</td>
      </tr>

      <!-- FILA 2: EXTRAS -->
      <tr style="background-color: ${isEven ? '#f8fafc' : '#f1f5f9'}; border-bottom: 2px solid #64748b;">
        ${extrasCells}
        <!-- Totales Extras -->
        <td colspan="2" style="background-color: #f8fafc; color: #94a3b8; text-align: center; border: 1px solid #cbd5e1; font-size: 9px;">(Jornal arriba)</td>
        <td style="background-color: #ecfdf5; color: #065f46; font-weight: bold; text-align: center; border: 1px solid #cbd5e1; font-size: 10px;">${stats.diasExtraHabil}</td>
        <td style="background-color: #d1fae5; color: #022c22; font-weight: bold; text-align: center; border: 1px solid #cbd5e1; font-size: 10px;">${stats.horasExtraHabil}h</td>
        <td style="background-color: #f3e8ff; color: #581c87; font-weight: bold; text-align: center; border: 1px solid #cbd5e1; font-size: 10px;">${stats.horasInhabilActiva}h</td>
        <td style="background-color: #fef3c7; color: #78350f; font-weight: bold; text-align: center; border: 1px solid #cbd5e1; font-size: 10px;">${stats.horasInhabilPasiva}h</td>
        <td style="background-color: #a7f3d0; color: #064e3b; font-weight: 900; text-align: center; border: 1px solid #cbd5e1; font-size: 11px;">${stats.totalHorasExtras}h</td>
      </tr>
    `;
  });

  return {
    monthName,
    year,
    totalJornalHoras,
    totalExtraHabilHoras,
    totalInhabActivaHoras,
    totalInhabPasivaHoras,
    totalGeneral,
    daysHeaderRow1,
    daysHeaderRow2,
    agentsRowsHtml,
    serviceConfig
  };
}

export function exportVisualHtml(schedule: MonthSchedule, days: DayInfo[]) {
  const data = buildVisualTableHtml(schedule, days);

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planilla Oficial Guardia e Informática - ${data.monthName} ${data.year}</title>
  <style>
    @page {
      size: A3 landscape;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      margin: 0;
      padding: 16px;
      font-size: 11px;
    }
    .container {
      max-width: 100%;
      margin: 0 auto;
      background: #ffffff;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .header-title h1 {
      margin: 0;
      font-size: 18px;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header-title p {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #475569;
      font-weight: 500;
    }
    .badge-month {
      background-color: #047857;
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 14px;
      text-align: right;
    }
    .legend-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 12px;
      align-items: center;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    th, td {
      word-wrap: break-word;
    }
    .summary-card {
      margin-top: 16px;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 12px;
      border-radius: 6px;
    }
    .summary-box {
      background: #ffffff;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      text-align: center;
    }
    .summary-box .label {
      font-size: 10px;
      color: #64748b;
      font-weight: bold;
      text-transform: uppercase;
    }
    .summary-box .val {
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
      margin-top: 2px;
    }
    .signature-section {
      margin-top: 35px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .signature-box {
      width: 28%;
      border-top: 1px solid #000000;
      padding-top: 6px;
      text-align: center;
      font-size: 11px;
      font-weight: bold;
      color: #334155;
    }
    .print-controls {
      margin-bottom: 16px;
      display: flex;
      gap: 10px;
    }
    .btn {
      background-color: #047857;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 12px;
    }
    .btn:hover {
      background-color: #065f46;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .container {
        box-shadow: none;
        padding: 0;
      }
      .print-controls {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="print-controls">
      <button class="btn" onclick="window.print()">🖨️ Imprimir / Guardar en PDF con Formato Exacto</button>
    </div>

    <div class="header">
      <div class="header-title">
        <div style="font-size: 10px; font-weight: bold; color: #047857; text-transform: uppercase; margin-bottom: 2px;">
          ${data.serviceConfig.hospitalSubtitle || 'Gobierno de la Provincia de Formosa • MDH'}
        </div>
        <h1>${data.serviceConfig.hospitalName || 'Hospital Central de Emergencias'}</h1>
        <h2 style="margin: 3px 0 0 0; font-size: 13px; color: #0f172a; font-weight: bold;">
          ${data.serviceConfig.serviceName || 'Servicio de Guardia y Emergencias'}
        </h2>
        <p>Planilla Mensual de Turnos Ordinarios, Guardias y Horas Extras (Hábiles e Inhábiles)</p>
      </div>
      <div class="badge-month">
        PERÍODO: ${data.monthName.toUpperCase()} ${data.year}
      </div>
    </div>

    <div class="legend-bar">
      <span style="font-size: 10px; font-weight: bold; color: #475569; margin-right: 6px;">REFERENCIAS:</span>
      <span class="legend-item" style="background-color: #dbeafe; color: #1e3a8a; border: 1px solid #93c5fd;">J: Jornal Ordinario (${data.serviceConfig.jornalHorarioLabel || '06-13 hs'})</span>
      <span class="legend-item" style="background-color: #d1fae5; color: #065f46; border: 1px solid #6ee7b7;">E: Extra Hábil Lun a Vie (${data.serviceConfig.extraHabilHorarioLabel || '13-20 hs'})</span>
      <span class="legend-item" style="background-color: #f3e8ff; color: #581c87; border: 1px solid #d8b4fe;">IA: Inhábil ACTIVA (Fines de Sem / Feriados)</span>
      <span class="legend-item" style="background-color: #fef3c7; color: #78350f; border: 1px solid #fde68a;">IP: Inhábil PASIVA (Fines de Sem / Feriados)</span>
      <span class="legend-item" style="background-color: #e2e8f0; color: #334155; border: 1px solid #cbd5e1;">-: Franco / Descanso</span>
    </div>

    <table>
      <thead>
        <tr style="background-color: #0f172a; color: #ffffff;">
          <th rowspan="2" style="width: 150px; border: 1px solid #334155; padding: 6px; text-align: left; font-size: 10px; text-transform: uppercase;">Agente / Turno</th>
          ${data.daysHeaderRow1}
          <th colspan="2" style="background-color: #1e3a8a; color: #ffffff; border: 1px solid #334155; padding: 4px; text-align: center; font-size: 9.5px;">JORNAL (06-13)</th>
          <th colspan="2" style="background-color: #065f46; color: #ffffff; border: 1px solid #334155; padding: 4px; text-align: center; font-size: 9.5px;">EXT. HÁBIL (13-20)</th>
          <th colspan="2" style="background-color: #581c87; color: #ffffff; border: 1px solid #334155; padding: 4px; text-align: center; font-size: 9.5px;">INHÁBILES</th>
          <th style="background-color: #047857; color: #ffffff; border: 1px solid #334155; padding: 4px; text-align: center; font-size: 9.5px;">TOT. EXT</th>
          <th rowspan="2" style="width: 50px; background-color: #022c22; color: #ffffff; border: 1px solid #334155; padding: 4px; text-align: center; font-size: 11px;">TOTAL MES</th>
        </tr>
        <tr>
          ${data.daysHeaderRow2}
          <th style="background-color: #172554; color: #bfdbfe; border: 1px solid #334155; padding: 3px; font-size: 9px; text-align: center;">Días</th>
          <th style="background-color: #172554; color: #bfdbfe; border: 1px solid #334155; padding: 3px; font-size: 9px; text-align: center;">Hs</th>
          <th style="background-color: #022c22; color: #a7f3d0; border: 1px solid #334155; padding: 3px; font-size: 9px; text-align: center;">Días</th>
          <th style="background-color: #022c22; color: #a7f3d0; border: 1px solid #334155; padding: 3px; font-size: 9px; text-align: center;">Hs</th>
          <th style="background-color: #3b0764; color: #e9d5ff; border: 1px solid #334155; padding: 3px; font-size: 9px; text-align: center;">Activa</th>
          <th style="background-color: #451a03; color: #fde68a; border: 1px solid #334155; padding: 3px; font-size: 9px; text-align: center;">Pasiva</th>
          <th style="background-color: #064e3b; color: #6ee7b7; border: 1px solid #334155; padding: 3px; font-size: 9px; text-align: center;">Hs Extra</th>
        </tr>
      </thead>
      <tbody>
        ${data.agentsRowsHtml}
      </tbody>
    </table>

    <div class="summary-card">
      <div class="summary-box">
        <div class="label">Total Horas Jornal</div>
        <div class="val" style="color: #1d4ed8;">${data.totalJornalHoras} hs</div>
      </div>
      <div class="summary-box">
        <div class="label">Total Horas Extra Hábil</div>
        <div class="val" style="color: #059669;">${data.totalExtraHabilHoras} hs</div>
      </div>
      <div class="summary-box">
        <div class="label">Total Inhábiles Activas</div>
        <div class="val" style="color: #7c3aed;">${data.totalInhabActivaHoras} hs</div>
      </div>
      <div class="summary-box">
        <div class="label">Total Inhábiles Pasivas</div>
        <div class="val" style="color: #d97706;">${data.totalInhabPasivaHoras} hs</div>
      </div>
      <div class="summary-box">
        <div class="label">Total General Horas Mes</div>
        <div class="val" style="color: #047857;">${data.totalGeneral} hs</div>
      </div>
    </div>

    <div class="signature-section">
      <div class="signature-box">
        Firma y Sello Jefe de Servicio
      </div>
      <div class="signature-box">
        Firma y Sello Dirección Médica / Administrativa
      </div>
      <div class="signature-box">
        Recepción y Control Recursos Humanos
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Planilla_Visual_Informatica_${data.monthName}_${data.year}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export to editable Microsoft Word (.doc) with full styles and landscape orientation
export function exportToWord(schedule: MonthSchedule, days: DayInfo[]) {
  const data = buildVisualTableHtml(schedule, days);

  const wordHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Planilla Mensual Guardia e Informática - ${data.monthName} ${data.year}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>90</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 16.54in 11.69in; /* A3 Landscape */
      mso-page-orientation: landscape;
      margin: 0.4in 0.4in 0.4in 0.4in;
      mso-header-margin: 0.2in;
      mso-footer-margin: 0.2in;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9.5pt;
      color: #0f172a;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      width: 100%;
    }
    th, td {
      border: 0.5pt solid #94a3b8;
      padding: 3pt 2pt;
    }
  </style>
</head>
<body>
  <div class="Section1">
    <div style="border-bottom: 2pt solid #0f172a; padding-bottom: 6pt; margin-bottom: 8pt;">
      <table style="width: 100%; border: none;">
        <tr style="border: none;">
          <td style="border: none; vertical-align: middle;">
            <div style="font-size: 9pt; font-weight: bold; color: #047857; text-transform: uppercase;">
              ${data.serviceConfig.hospitalSubtitle || 'Gobierno de Formosa • MDH'}
            </div>
            <h2 style="margin: 2pt 0 0 0; color: #0f172a; font-size: 13pt; text-transform: uppercase;">
              ${data.serviceConfig.hospitalName || 'Hospital Central de Emergencias'}
            </h2>
            <p style="margin: 2pt 0 0 0; color: #047857; font-size: 11pt; font-weight: bold;">
              ${data.serviceConfig.serviceName || 'Servicio de Guardia y Emergencias'}
            </p>
          </td>
          <td style="border: none; text-align: right; vertical-align: middle; width: 220pt;">
            <div style="background-color: #047857; color: #ffffff; padding: 6pt 10pt; font-weight: bold; font-size: 11pt; border-radius: 4pt; text-align: center;">
              PERÍODO: ${data.monthName.toUpperCase()} ${data.year}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f8fafc; border: 1pt solid #cbd5e1; padding: 4pt 8pt; margin-bottom: 8pt; font-size: 8.5pt;">
      <strong>REFERENCIAS:</strong> 
      <span style="color: #1e3a8a; font-weight: bold; background-color: #dbeafe; padding: 1pt 4pt; border: 0.5pt solid #93c5fd;">J: Jornal (${data.serviceConfig.jornalHorarioLabel || '06-13 hs'})</span> &nbsp;|&nbsp;
      <span style="color: #065f46; font-weight: bold; background-color: #d1fae5; padding: 1pt 4pt; border: 0.5pt solid #6ee7b7;">E: Extra Hábil (${data.serviceConfig.extraHabilHorarioLabel || '13-20 hs'})</span> &nbsp;|&nbsp;
      <span style="color: #581c87; font-weight: bold; background-color: #f3e8ff; padding: 1pt 4pt; border: 0.5pt solid #d8b4fe;">IA: Inhábil Activa</span> &nbsp;|&nbsp;
      <span style="color: #78350f; font-weight: bold; background-color: #fef3c7; padding: 1pt 4pt; border: 0.5pt solid #fde68a;">IP: Inhábil Pasiva</span>
    </div>

    <table>
      <thead>
        <tr style="background-color: #0f172a; color: #ffffff;">
          <th rowspan="2" style="width: 130pt; background-color: #0f172a; color: #ffffff; text-align: left; font-size: 8.5pt;">Agente / Turno</th>
          ${data.daysHeaderRow1}
          <th colspan="2" style="background-color: #1e3a8a; color: #ffffff; text-align: center; font-size: 8pt;">JORNAL (06-13)</th>
          <th colspan="2" style="background-color: #065f46; color: #ffffff; text-align: center; font-size: 8pt;">EXT. HÁBIL (13-20)</th>
          <th colspan="2" style="background-color: #581c87; color: #ffffff; text-align: center; font-size: 8pt;">INHÁBILES</th>
          <th style="background-color: #047857; color: #ffffff; text-align: center; font-size: 8pt;">TOT. EXT</th>
          <th rowspan="2" style="width: 45pt; background-color: #022c22; color: #ffffff; text-align: center; font-size: 9.5pt;">TOTAL MES</th>
        </tr>
        <tr>
          ${data.daysHeaderRow2}
          <th style="background-color: #172554; color: #bfdbfe; font-size: 7.5pt; text-align: center;">Días</th>
          <th style="background-color: #172554; color: #bfdbfe; font-size: 7.5pt; text-align: center;">Hs</th>
          <th style="background-color: #022c22; color: #a7f3d0; font-size: 7.5pt; text-align: center;">Días</th>
          <th style="background-color: #022c22; color: #a7f3d0; font-size: 7.5pt; text-align: center;">Hs</th>
          <th style="background-color: #3b0764; color: #e9d5ff; font-size: 7.5pt; text-align: center;">Activa</th>
          <th style="background-color: #451a03; color: #fde68a; font-size: 7.5pt; text-align: center;">Pasiva</th>
          <th style="background-color: #064e3b; color: #6ee7b7; font-size: 7.5pt; text-align: center;">Hs Extra</th>
        </tr>
      </thead>
      <tbody>
        ${data.agentsRowsHtml}
      </tbody>
    </table>

    <br/>

    <!-- Summary boxes in Word -->
    <table style="width: 100%; border: 1pt solid #cbd5e1; background-color: #f8fafc;">
      <tr>
        <td style="text-align: center; padding: 6pt; border-right: 1pt solid #cbd5e1;">
          <div style="font-size: 8pt; color: #64748b; font-weight: bold;">TOTAL HORAS JORNAL</div>
          <div style="font-size: 13pt; font-weight: bold; color: #1d4ed8; margin-top: 2pt;">${data.totalJornalHoras} hs</div>
        </td>
        <td style="text-align: center; padding: 6pt; border-right: 1pt solid #cbd5e1;">
          <div style="font-size: 8pt; color: #64748b; font-weight: bold;">TOTAL HORAS EXTRA HÁBIL</div>
          <div style="font-size: 13pt; font-weight: bold; color: #059669; margin-top: 2pt;">${data.totalExtraHabilHoras} hs</div>
        </td>
        <td style="text-align: center; padding: 6pt; border-right: 1pt solid #cbd5e1;">
          <div style="font-size: 8pt; color: #64748b; font-weight: bold;">TOTAL INHÁBILES ACTIVAS</div>
          <div style="font-size: 13pt; font-weight: bold; color: #7c3aed; margin-top: 2pt;">${data.totalInhabActivaHoras} hs</div>
        </td>
        <td style="text-align: center; padding: 6pt; border-right: 1pt solid #cbd5e1;">
          <div style="font-size: 8pt; color: #64748b; font-weight: bold;">TOTAL INHÁBILES PASIVAS</div>
          <div style="font-size: 13pt; font-weight: bold; color: #d97706; margin-top: 2pt;">${data.totalInhabPasivaHoras} hs</div>
        </td>
        <td style="text-align: center; padding: 6pt;">
          <div style="font-size: 8pt; color: #64748b; font-weight: bold;">TOTAL GENERAL DEL MES</div>
          <div style="font-size: 14pt; font-weight: bold; color: #047857; margin-top: 2pt;">${data.totalGeneral} hs</div>
        </td>
      </tr>
    </table>

    <br/><br/>

    <!-- Signatures -->
    <table style="width: 100%; border: none; margin-top: 20pt;">
      <tr style="border: none;">
        <td style="width: 30%; border: none; border-top: 1pt solid #000000; text-align: center; padding-top: 4pt; font-size: 9pt; font-weight: bold;">
          Firma y Sello Jefe de Servicio
        </td>
        <td style="width: 5%; border: none;"></td>
        <td style="width: 30%; border: none; border-top: 1pt solid #000000; text-align: center; padding-top: 4pt; font-size: 9pt; font-weight: bold;">
          Firma y Sello Dirección Médica / Administrativa
        </td>
        <td style="width: 5%; border: none;"></td>
        <td style="width: 30%; border: none; border-top: 1pt solid #000000; text-align: center; padding-top: 4pt; font-size: 9pt; font-weight: bold;">
          Recepción y Control Recursos Humanos
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;

  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Planilla_Editable_Informatica_${data.monthName}_${data.year}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export to Microsoft Excel (.xls) with 100% Visual Colors, 2 rows per agent, borders, and styles
export function exportToExcelVisual(schedule: MonthSchedule, days: DayInfo[]) {
  const data = buildVisualTableHtml(schedule, days);

  const excelHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>Planilla Matriz Visual Excel - ${data.monthName} ${data.year}</title>
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Planilla Matriz Mensual</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
            <x:Selected/>
            <x:DoNotDisplayGridlines>False</x:DoNotDisplayGridlines>
            <x:FitToPage/>
            <x:Print>
              <x:Orientation>Landscape</x:Orientation>
              <x:ValidPrinterInfo/>
              <x:PaperSizeIndex>9</x:PaperSizeIndex>
              <x:Scale>85</x:Scale>
            </x:Print>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: Calibri, Arial, sans-serif;
      font-size: 10pt;
      color: #0f172a;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    th, td {
      border: 0.5pt solid #94a3b8;
      vertical-align: middle;
      mso-number-format: "\\@";
    }
    .num-cell {
      mso-number-format: "\\#\\,\\#\\#0";
      text-align: center;
    }
  </style>
</head>
<body>
  <!-- Encabezado Institucional -->
  <table style="width: 100%; border: none; margin-bottom: 10pt;">
    <tr style="border: none;">
      <td colspan="${days.length + 9}" style="border: none; background-color: #0f172a; color: #ffffff; font-size: 13pt; font-weight: bold; padding: 8pt; text-align: left;">
        ${data.serviceConfig.hospitalSubtitle ? data.serviceConfig.hospitalSubtitle + ' — ' : ''}${data.serviceConfig.hospitalName || 'HOSPITAL CENTRAL DE EMERGENCIAS'}
      </td>
    </tr>
    <tr style="border: none;">
      <td colspan="${days.length + 9}" style="border: none; background-color: #047857; color: #ffffff; font-size: 11pt; font-weight: bold; padding: 6pt; text-align: left;">
        ${data.serviceConfig.serviceName ? data.serviceConfig.serviceName.toUpperCase() + ' — ' : ''}PLANILLA MENSUAL DE TURNOS Y HORAS EXTRAS — PERÍODO: ${data.monthName.toUpperCase()} ${data.year}
      </td>
    </tr>
  </table>

  <!-- Referencias de Colores -->
  <table style="width: 100%; border: 0.5pt solid #cbd5e1; background-color: #f8fafc; margin-bottom: 8pt;">
    <tr>
      <td colspan="${days.length + 9}" style="padding: 5pt; font-size: 9pt; border: none;">
        <strong>REFERENCIAS:</strong> 
        <span style="background-color: #dbeafe; color: #1e3a8a; font-weight: bold; padding: 2pt 4pt; border: 0.5pt solid #93c5fd;">J: Jornal (${data.serviceConfig.jornalHorarioLabel || '06-13 hs'})</span> &nbsp;|&nbsp;
        <span style="background-color: #d1fae5; color: #065f46; font-weight: bold; padding: 2pt 4pt; border: 0.5pt solid #6ee7b7;">E: Extra Hábil (${data.serviceConfig.extraHabilHorarioLabel || '13-20 hs'})</span> &nbsp;|&nbsp;
        <span style="background-color: #f3e8ff; color: #581c87; font-weight: bold; padding: 2pt 4pt; border: 0.5pt solid #d8b4fe;">IA: Inhábil Activa</span> &nbsp;|&nbsp;
        <span style="background-color: #fef3c7; color: #78350f; font-weight: bold; padding: 2pt 4pt; border: 0.5pt solid #fde68a;">IP: Inhábil Pasiva</span> &nbsp;|&nbsp;
        <span style="background-color: #e2e8f0; color: #475569; font-weight: bold; padding: 2pt 4pt;">-: Franco / Descanso</span>
      </td>
    </tr>
  </table>

  <!-- Tabla Matriz con 2 Filas por Agente -->
  <table border="1" style="border-collapse: collapse; width: 100%;">
    <thead>
      <tr style="background-color: #0f172a; color: #ffffff;">
        <th rowspan="2" style="width: 160pt; background-color: #0f172a; color: #ffffff; text-align: left; font-size: 9pt; padding: 5pt;">Agente / Turno</th>
        ${data.daysHeaderRow1}
        <th colspan="2" style="background-color: #1e3a8a; color: #ffffff; text-align: center; font-size: 8.5pt; padding: 4pt;">JORNAL (06-13)</th>
        <th colspan="2" style="background-color: #065f46; color: #ffffff; text-align: center; font-size: 8.5pt; padding: 4pt;">EXT. HÁBIL (13-20)</th>
        <th colspan="2" style="background-color: #581c87; color: #ffffff; text-align: center; font-size: 8.5pt; padding: 4pt;">INHÁBILES</th>
        <th style="background-color: #047857; color: #ffffff; text-align: center; font-size: 8.5pt; padding: 4pt;">TOT. EXT</th>
        <th rowspan="2" style="width: 55pt; background-color: #022c22; color: #ffffff; text-align: center; font-size: 10pt; padding: 4pt;">TOTAL MES</th>
      </tr>
      <tr>
        ${data.daysHeaderRow2}
        <th style="background-color: #172554; color: #bfdbfe; font-size: 8pt; text-align: center; padding: 3pt;">Días</th>
        <th style="background-color: #172554; color: #bfdbfe; font-size: 8pt; text-align: center; padding: 3pt;">Hs</th>
        <th style="background-color: #022c22; color: #a7f3d0; font-size: 8pt; text-align: center; padding: 3pt;">Días</th>
        <th style="background-color: #022c22; color: #a7f3d0; font-size: 8pt; text-align: center; padding: 3pt;">Hs</th>
        <th style="background-color: #3b0764; color: #e9d5ff; font-size: 8pt; text-align: center; padding: 3pt;">Activa</th>
        <th style="background-color: #451a03; color: #fde68a; font-size: 8pt; text-align: center; padding: 3pt;">Pasiva</th>
        <th style="background-color: #064e3b; color: #6ee7b7; font-size: 8pt; text-align: center; padding: 3pt;">Hs Extra</th>
      </tr>
    </thead>
    <tbody>
      ${data.agentsRowsHtml}
    </tbody>
  </table>

  <br/>

  <!-- Cuadro de Totales Globales -->
  <table border="1" style="width: 100%; border-collapse: collapse; background-color: #f8fafc;">
    <tr>
      <td style="text-align: center; padding: 6pt; background-color: #eff6ff;">
        <div style="font-size: 8pt; color: #64748b; font-weight: bold;">TOTAL HORAS JORNAL</div>
        <div style="font-size: 13pt; font-weight: bold; color: #1d4ed8; margin-top: 2pt;">${data.totalJornalHoras} hs</div>
      </td>
      <td style="text-align: center; padding: 6pt; background-color: #ecfdf5;">
        <div style="font-size: 8pt; color: #64748b; font-weight: bold;">TOTAL HORAS EXTRA HÁBIL</div>
        <div style="font-size: 13pt; font-weight: bold; color: #059669; margin-top: 2pt;">${data.totalExtraHabilHoras} hs</div>
      </td>
      <td style="text-align: center; padding: 6pt; background-color: #f3e8ff;">
        <div style="font-size: 8pt; color: #64748b; font-weight: bold;">TOTAL INHÁBILES ACTIVAS</div>
        <div style="font-size: 13pt; font-weight: bold; color: #7c3aed; margin-top: 2pt;">${data.totalInhabActivaHoras} hs</div>
      </td>
      <td style="text-align: center; padding: 6pt; background-color: #fef3c7;">
        <div style="font-size: 8pt; color: #64748b; font-weight: bold;">TOTAL INHÁBILES PASIVAS</div>
        <div style="font-size: 13pt; font-weight: bold; color: #d97706; margin-top: 2pt;">${data.totalInhabPasivaHoras} hs</div>
      </td>
      <td style="text-align: center; padding: 6pt; background-color: #d1fae5;">
        <div style="font-size: 8pt; color: #065f46; font-weight: bold;">TOTAL GENERAL DEL MES</div>
        <div style="font-size: 14pt; font-weight: 900; color: #047857; margin-top: 2pt;">${data.totalGeneral} hs</div>
      </td>
    </tr>
  </table>

  <br/><br/>

  <!-- Firmas -->
  <table style="width: 100%; border: none; margin-top: 25pt;">
    <tr style="border: none;">
      <td colspan="5" style="border: none; border-top: 1pt solid #000000; text-align: center; padding-top: 5pt; font-size: 9pt; font-weight: bold; width: 30%;">
        Firma y Sello Jefe de Servicio
      </td>
      <td colspan="2" style="border: none; width: 5%;"></td>
      <td colspan="5" style="border: none; border-top: 1pt solid #000000; text-align: center; padding-top: 5pt; font-size: 9pt; font-weight: bold; width: 30%;">
        Firma y Sello Dirección Médica / Administrativa
      </td>
      <td colspan="2" style="border: none; width: 5%;"></td>
      <td colspan="${Math.max(1, days.length + 9 - 14)}" style="border: none; border-top: 1pt solid #000000; text-align: center; padding-top: 5pt; font-size: 9pt; font-weight: bold; width: 30%;">
        Recepción y Control Recursos Humanos
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const blob = new Blob(['\ufeff', excelHtml], {
    type: 'application/vnd.ms-excel;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Planilla_Visual_Excel_${data.monthName}_${data.year}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
