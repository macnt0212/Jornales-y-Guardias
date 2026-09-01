import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function downloadOperationsManualPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper colors
  const primaryColor: [number, number, number] = [6, 78, 59]; // Emerald 900
  const secondaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const accentColor: [number, number, number] = [5, 150, 105]; // Emerald 600
  const lightBg: [number, number, number] = [241, 245, 249]; // Slate 100

  // ---------------- PAGE 1 ----------------
  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('GOBIERNO DE LA PROVINCIA DE FORMOSA • MINISTERIO DE DESARROLLO HUMANO', pageWidth / 2, 8, { align: 'center' });
  
  doc.setFontSize(13);
  doc.text('HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"', pageWidth / 2, 16, { align: 'center' });
  
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('SISTEMA INTEGRAL DE CONTROL Y LIQUIDACIÓN DE GUARDIAS, JORNALES Y HORAS EXTRAS', pageWidth / 2, 23, { align: 'center' });

  // Document Title Box
  let y = 34;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...accentColor);
  doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, 'FD');

  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('MANUAL DE OPERACIONES Y PROCEDIMIENTOS DEL SISTEMA', 18, y + 7);
  
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Guía Oficial • Modalidades Flexibles, Jornal en Turnos, Guardias en Contraturno y Liquidación', 18, y + 13);

  // SECCIÓN 1: SEGURIDAD Y CONTROL DE ACCESO POR ROLES
  y += 24;
  doc.setFillColor(...accentColor);
  doc.rect(14, y, 4, 7, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. SEGURIDAD Y CONTROL DE ACCESO POR ROLES (RBAC)', 21, y + 5.5);

  y += 9;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(
    'El sistema hospitalario implementa aislamiento estricto por servicio para garantizar la privacidad y consistencia de las liquidaciones de Recursos Humanos:',
    14,
    y,
    { maxWidth: pageWidth - 28 }
  );

  y += 7;
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Rol / Perfil', 'Responsable Modelo', 'Alcance y Permisos Operativos', 'Aislamiento']],
    body: [
      [
        'Jefe de Servicio\n(Informática / Médica)',
        'Cantero, Miguel Angel\n(Jefe de Informática)',
        '• Visualiza únicamente a su personal asignado.\n• Carga Jornal flexible, Extras y Guardias.\n• Aprueba y exporta planilla oficial firmada.',
        'Bloqueo estricto de otros sectores y del consolidado general.'
      ],
      [
        'Soporte Técnico / SIGHO',
        'Escobar, Eduardo Martin\n(Soporte SIGHO)',
        '• Asistencia a la operación y carga de datos.\n• Mantenimiento del catálogo de agentes y turnos.',
        'Operación técnica del servicio asignado.'
      ],
      [
        'Administrador Central\n(Dirección / RRHH)',
        'rrhh.central\n(Recursos Humanos)',
        '• Auditoría de todos los servicios del Hospital.\n• Acceso a Consolidado General Hospitalario.\n• Creación de usuarios y configuración de servicios.',
        'Supervisión y control institucional global.'
      ]
    ],
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // SECCIÓN 2: RÉGIMEN HORARIO Y MODALIDADES FLEXIBLES
  // @ts-ignore
  y = doc.lastAutoTable.finalY + 7;

  doc.setFillColor(...accentColor);
  doc.rect(14, y, 4, 7, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. MODALIDADES DE TRABAJO Y CÓDIGO DE TURNOS', 21, y + 5.5);

  y += 8;
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Modalidad / Turno', 'Franja Horaria', 'Cómputo', 'Código', 'Regla de Negocio']],
    body: [
      ['Jornal Ordinario Mañana', '06:00 a 13:00 hs', '7 hs', 'JM', 'Cumplimiento regular en días hábiles.'],
      ['Jornal Ordinario Tarde', '13:00 a 20:00 hs', '7 hs', 'JT', 'Personal con jornada ordinaria vespertina.'],
      ['Jornal Ordinario Noche', '20:00 a 07:00 hs', '7/11 hs', 'JN', 'Personal con jornada ordinaria nocturna.'],
      ['Extra Hábil en Contraturno', 'Mañana / Tarde (Contraturno)', '7 hs', 'EM / ET', 'Solo en turno inverso a su Jornal.'],
      ['Guardia Inhábil ACTIVA', '06-13 / 13-20 hs', '7 / 14 hs', 'IA', 'Sábados, Domingos y Feriados (Presencial).'],
      ['Guardia Inhábil PASIVA', 'Disponibilidad Domiciliaria', '7 / 14 hs', 'IP', 'Sábados, Domingos y Feriados (Llamado).'],
      ['Personal Solo Guardias', 'Guardias asignadas', 'Variables', '[Ext]', 'Jornal cumplido en otra institución externa.'],
      ['Personal Solo Jornal', 'Turno habitual', '7 hs/día', 'JM / JT', 'No realiza guardias extraordinarias.']
    ],
    headStyles: {
      fillColor: secondaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // Footer Page 1
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Hospital Central de Emergencias "Dr. Ramón Carrillo" • Manual de Operaciones • Página 1 de 2', pageWidth / 2, pageHeight - 5, { align: 'center' });

  // ---------------- PAGE 2 ----------------
  doc.addPage('a4', 'portrait');

  // Header Banner Page 2
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('HOSPITAL CENTRAL DE EMERGENCIAS • MANUAL DE OPERACIONES Y PROCEDIMIENTOS', pageWidth / 2, 10, { align: 'center' });

  // SECCIÓN 3: CIRCUITO OPERATIVO DE 5 PASOS
  y = 22;
  doc.setFillColor(...accentColor);
  doc.rect(14, y, 4, 7, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. CIRCUITO OPERATIVO MENSUAL (PASO A PASO)', 21, y + 5.5);

  y += 9;
  const steps = [
    { 
      num: '1', 
      title: 'Selección de Período y Servicio', 
      desc: 'En la cinta superior, elija el Año y Mes a programar. El sistema carga automáticamente el calendario oficial con feriados nacionales y provinciales de Formosa.' 
    },
    { 
      num: '2', 
      title: 'Configuración del Personal y Modalidad', 
      desc: 'En "Personal del Servicio" o en el editor del agente, configure la modalidad (Jornal + Contraturno, Solo Guardias con Jornal Externo, o Solo Jornal) y el horario habitual (Mañana/Tarde/Noche).' 
    },
    { 
      num: '3', 
      title: 'Generación Automática / Edición Manual', 
      desc: 'Haga clic en "Generar Rotación Inteligente" para distribuir equitativamente las guardias respetando contraturnos y descansos, o edite celda por celda con los atajos interactivos.' 
    },
    { 
      num: '4', 
      title: 'Auditoría y Control de Sobrecargas', 
      desc: 'Revise la barra de distribución de horas y la pestaña "Resumen de Liquidación" para constatar que las horas extras cumplan las normativas hospitalarias sin exceder los topes autorizados.' 
    },
    { 
      num: '5', 
      title: 'Exportación Oficial y Elevación a RRHH', 
      desc: 'Descargue la Planilla en Formato Visual Excel (.xls), Microsoft Word (.doc) o genere el PDF con las firmas del Jefe de Servicio (Miguel Ángel Cantero) y elevación a Recursos Humanos.' 
    }
  ];

  steps.forEach((st) => {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, pageWidth - 28, 14, 1.5, 1.5, 'F');

    doc.setFillColor(...primaryColor);
    doc.circle(20, y + 7, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(st.num, 20, y + 8.2, { align: 'center' });

    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(st.title, 26, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(st.desc, 26, y + 10, { maxWidth: pageWidth - 44 });

    y += 16;
  });

  // SECCIÓN 4: PREGUNTAS FRECUENTES Y CASOS ESPECIALES
  y += 3;
  doc.setFillColor(...accentColor);
  doc.rect(14, y, 4, 7, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('4. CASOS ESPECIALES Y REGLAS DE LIQUIDACIÓN', 21, y + 5.5);

  y += 8;
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Situación Especial', 'Tratamiento en el Sistema', 'Impacto en Liquidación']],
    body: [
      [
        'Agente con Jornal en otra institución',
        'Se configura como "Solo Guardias". La fila de Jornal marca [Ext] y no computa horas de jornal en el hospital.',
        'Solo percibe remuneración por Guardias Extras (Hábiles / Inhábiles).'
      ],
      [
        'Agente en turno Tarde o Noche',
        'Se le asigna jornada de tarde o noche. Sus horas extras se programan en contraturno (Mañana).',
        'Cómputo exacto de 7 hs por turno sin solapamiento horario.'
      ],
      [
        'Feriados Nacionales y Provinciales',
        'El sistema computa automáticamente los feriados como días inhábiles.',
        'Toda guardia realizada en feriado se liquida como Inhábil Activa (IA) o Pasiva (IP).'
      ]
    ],
    headStyles: {
      fillColor: secondaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // Signatures Area
  // @ts-ignore
  y = doc.lastAutoTable.finalY + 12;
  if (y > pageHeight - 32) {
    y = pageHeight - 32;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, pageWidth - 14, y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Cantero, Miguel Angel', 45, y + 8, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Jefe del Servicio de Informática', 45, y + 12, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Depto. Recursos Humanos / Dirección', pageWidth - 45, y + 8, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Hospital Central de Emergencias Formosa', pageWidth - 45, y + 12, { align: 'center' });

  // Footer Page 2
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Hospital Central de Emergencias "Dr. Ramón Carrillo" • Manual de Operaciones • Página 2 de 2', pageWidth / 2, pageHeight - 5, { align: 'center' });

  // Save the PDF directly to download
  doc.save('Manual_de_Operaciones_Hospital_Central_Formosa.pdf');
}
