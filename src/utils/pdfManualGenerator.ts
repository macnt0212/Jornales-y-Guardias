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

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('GOBIERNO DE LA PROVINCIA DE FORMOSA • MINISTERIO DE DESARROLLO HUMANO', pageWidth / 2, 8, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"', pageWidth / 2, 16, { align: 'center' });
  
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('SISTEMA OFICIAL DE CONTROL DE GUARDIAS, HORAS EXTRAS Y JORNAL', pageWidth / 2, 23, { align: 'center' });

  // Document Title Box
  let y = 35;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...accentColor);
  doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, 'FD');

  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('MANUAL DE OPERACIONES Y PROCEDIMIENTOS (GUÍA DEL OPERADOR)', 18, y + 7);
  
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Versión Oficial 2.5 • Instructivo con Diagramas de Seguridad, Carga de Turnos y Liquidación', 18, y + 13);

  // SECCIÓN 1: SEGURIDAD Y AISLAMIENTO
  y += 24;
  doc.setFillColor(...accentColor);
  doc.rect(14, y, 4, 7, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. SEGURIDAD Y CONTROL DE ACCESO POR ROLES (RBAC)', 21, y + 5.5);

  y += 10;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(
    'El sistema cuenta con un esquema de seguridad de datos estricto. Cada usuario ingresa con credenciales institucionales y accede únicamente a las facultades asignadas a su nivel de responsabilidad:',
    14,
    y,
    { maxWidth: pageWidth - 28 }
  );

  y += 9;
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Rol / Perfil', 'Usuario Modelo', 'Alcance y Permisos Operativos', 'Restricciones']],
    body: [
      [
        'Jefe / Encargado de Servicio',
        'jefe.guardia\njefe.informatica\njefe.laboratorio',
        '• Visualiza únicamente a su personal asignado.\n• Carga y edita Jornal, Extras e Inhábiles.\n• Exporta planilla oficial de su sector.',
        'Bloqueo total de otros servicios y del consolidado general institucional.'
      ],
      [
        'Administrador Central (RRHH)',
        'rrhh.central',
        '• Supervisa todos los servicios del hospital.\n• Acceso a Consolidado General RRHH.\n• Alta de nuevos usuarios y creación de servicios.',
        'Administración y auditoría global de toda la institución.'
      ]
    ],
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // SECCIÓN 2: RÉGIMEN HORARIO
  // @ts-ignore
  y = doc.lastAutoTable.finalY + 8;

  doc.setFillColor(...accentColor);
  doc.rect(14, y, 4, 7, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. RÉGIMEN HORARIO Y NOMENCLATURA DE TURNOS', 21, y + 5.5);

  y += 9;
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Concepto', 'Días Habilitados', 'Franja Horaria', 'Cómputo', 'Código', 'Color']],
    body: [
      ['Jornal Ordinario', 'Lunes a Viernes Hábiles', '06:00 a 13:00 hs', '7 horas', 'J', 'Azul'],
      ['Horas Extras Hábiles', 'Lunes a Viernes Hábiles', '13:00 a 20:00 hs', '7 horas', 'H', 'Verde'],
      ['Guardia Inhábil ACTIVA', 'Sábados, Domingos y Feriados', '06-13 / 13-20 hs (Presencial)', '7 / 14 hs', 'A', 'Púrpura'],
      ['Guardia Inhábil PASIVA', 'Sábados, Domingos y Feriados', 'Disponibilidad Domiciliaria', '7 / 14 hs', 'P', 'Ámbar'],
      ['Turno Doble Continuo', 'Lunes a Viernes Hábiles', '06:00 a 20:00 hs (Jornal + Extra)', '14 horas', 'JH', 'Bicolor']
    ],
    headStyles: {
      fillColor: secondaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // SECCIÓN 3: CIRCUITO OPERATIVO DE 5 PASOS
  // @ts-ignore
  y = doc.lastAutoTable.finalY + 8;

  doc.setFillColor(...accentColor);
  doc.rect(14, y, 4, 7, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. CIRCUITO OPERATIVO MENSUAL (PASO A PASO)', 21, y + 5.5);

  y += 8;
  const steps = [
    { num: 'Paso 1', title: 'Selección del Período', desc: 'En la cinta superior, seleccione el Año y Mes a liquidar. El sistema configurará automáticamente los días hábiles, fines de semana y feriados.' },
    { num: 'Paso 2', title: 'Verificación de Nómina', desc: 'Acceda a "Personal del Servicio" para confirmar legajos, matrículas y cargos de los agentes asignados a su sector.' },
    { num: 'Paso 3', title: 'Carga de Guardias y Turnos', desc: 'Haga clic en las celdas de la cuadrícula o use los atajos rápidos [J] y [H]. En fines de semana, asigne guardias Activas/Pasivas de forma equitativa.' },
    { num: 'Paso 4', title: 'Auditoría y Control de Totales', desc: 'Verifique en la columna lateral y en "Fichas Individuales" el balance de horas para asegurar que no existan sobrecargas ni omisiones.' },
    { num: 'Paso 5', title: 'Exportación y Elevación', desc: 'Exporte la planilla en PDF Oficial, Excel (.xls) o Word (.doc) para la firma del Jefe de Servicio y su presentación ante la Dirección / RRHH.' }
  ];

  steps.forEach((st) => {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, pageWidth - 28, 12, 1.5, 1.5, 'F');

    doc.setFillColor(...primaryColor);
    doc.circle(20, y + 6, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(st.num.replace('Paso ', ''), 20, y + 7.2, { align: 'center' });

    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(st.title, 26, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(st.desc, 26, y + 9.5, { maxWidth: pageWidth - 44 });

    y += 14;
  });

  // Footer / Signatures Area
  y = pageHeight - 26;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y - 4, pageWidth - 14, y - 4);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('__________________________________', 45, y + 6, { align: 'center' });
  doc.text('FIRMA Y SELLO JEFE DE SERVICIO', 45, y + 11, { align: 'center' });

  doc.text('__________________________________', pageWidth - 45, y + 6, { align: 'center' });
  doc.text('DIRECCIÓN DE RRHH / MÉDICA', pageWidth - 45, y + 11, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Hospital Central de Emergencias "Dr. Ramón Carrillo" • Formosa • Documento de Instrucción Oficial', pageWidth / 2, pageHeight - 4, { align: 'center' });

  // Save the PDF directly to download
  doc.save('Manual_de_Operaciones_Hospital_Central_Formosa.pdf');
}
