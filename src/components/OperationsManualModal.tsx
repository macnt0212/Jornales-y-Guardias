import React, { useRef } from 'react';
import { 
  BookOpen, 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  UserCheck, 
  Calendar, 
  Clock, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  Hospital, 
  Users, 
  Building2, 
  Layers, 
  AlertTriangle, 
  ArrowRight, 
  Check, 
  Sparkles,
  Lock,
  Crown,
  Sun,
  Moon,
  Briefcase
} from 'lucide-react';
import { downloadOperationsManualPDF } from '../utils/pdfManualGenerator';

interface OperationsManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName?: string;
  isRRHH?: boolean;
}

export const OperationsManualModal: React.FC<OperationsManualModalProps> = ({
  isOpen,
  onClose,
  serviceName = 'Servicio Hospitalario',
  isRRHH = false,
}) => {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Sticky Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Manual de Operaciones y Procedimientos del Sistema</span>
                <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full">
                  PDF / Oficial
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Guía oficial con diagramas de flujo para Operadores, Jefes de Servicio y Recursos Humanos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadOperationsManualPDF()}
              id="btn-direct-download-manual-pdf"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow cursor-pointer transition-all"
              title="Descargar archivo PDF directamente a su equipo"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={handlePrintPDF}
              id="btn-print-manual-pdf"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg border border-slate-700 shadow cursor-pointer transition-all"
              title="Abrir vista de impresión / Guardar en PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Vista Previa</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Manual Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-slate-50 printable-area text-slate-800 text-sm leading-relaxed" ref={printableRef}>
          
          {/* Institutional Document Header */}
          <div className="border-b-2 border-emerald-700 pb-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                  <Hospital className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Gobierno de la Provincia de Formosa • Ministerio de Desarrollo Humano
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                    HOSPITAL CENTRAL DE EMERGENCIAS "DR. RAMÓN CARRILLO"
                  </h1>
                  <p className="text-xs font-semibold text-slate-600">
                    Dirección de Personal y Recursos Humanos • Control Operativo de Guardias, Horas Extras y Jornal
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="inline-block bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-lg">
                  MANUAL DE OPERADOR v2.5
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Vigencia: Período Hospitalario 2026
                </div>
              </div>
            </div>
          </div>

          {/* Índice Rápido */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-emerald-950 flex items-center gap-2 border-b pb-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              Contenido del Manual
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-medium text-slate-700">
              <div className="p-2 rounded bg-slate-50 hover:bg-emerald-50/60 border border-slate-200">
                <strong className="text-emerald-800">1.</strong> Arquitectura y Seguridad (RBAC)
              </div>
              <div className="p-2 rounded bg-slate-50 hover:bg-emerald-50/60 border border-slate-200">
                <strong className="text-emerald-800">2.</strong> Modalidades Flexibles y Turnos
              </div>
              <div className="p-2 rounded bg-slate-50 hover:bg-emerald-50/60 border border-slate-200">
                <strong className="text-emerald-800">3.</strong> Diagrama del Circuito Mensual
              </div>
              <div className="p-2 rounded bg-slate-50 hover:bg-emerald-50/60 border border-slate-200">
                <strong className="text-emerald-800">4.</strong> Paso a Paso: Carga de Planilla
              </div>
              <div className="p-2 rounded bg-slate-50 hover:bg-emerald-50/60 border border-slate-200">
                <strong className="text-emerald-800">5.</strong> Casos Especiales (Jornal Externo)
              </div>
              <div className="p-2 rounded bg-slate-50 hover:bg-emerald-50/60 border border-slate-200">
                <strong className="text-emerald-800">6.</strong> Exportación y Firmas Oficiales
              </div>
            </div>
          </div>

          {/* SECCIÓN 1: SEGURIDAD Y CONTROL DE ACCESO POR ROLES */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 break-inside-avoid">
            <div className="flex items-center gap-2 text-emerald-900 border-b pb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold">1. Diagrama de Seguridad y Control de Acceso (RBAC)</h2>
            </div>
            <p className="text-xs text-slate-600">
              El sistema implementa un esquema estricto de seguridad basado en roles. Cada Jefe o Encargado únicamente puede ver y cargar los datos correspondientes a los agentes de su servicio asignado.
            </p>

            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-4">
              <div className="text-center font-bold text-xs tracking-wider uppercase text-emerald-400">
                DIAGRAMA 1: ROLES Y RESPONSABILIDADES EN EL SISTEMA
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* ROL 1 */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-500/40 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                    <UserCheck className="w-4 h-4" />
                    <span>Jefe del Servicio de Informática</span>
                  </div>
                  <div className="font-bold text-slate-100">Cantero, Miguel Angel</div>
                  <p className="text-[11px] text-slate-300">
                    Aprobación final de la rotación mensual, control de carga horaria y firma oficial de la planilla de liquidación.
                  </p>
                </div>

                {/* ROL 2 */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-teal-500/40 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-teal-400 font-bold text-xs">
                    <Users className="w-4 h-4" />
                    <span>Soporte Informático SIGHO</span>
                  </div>
                  <div className="font-bold text-slate-100">Escobar, Eduardo Martin</div>
                  <p className="text-[11px] text-slate-300">
                    Soporte operativo al sistema hospitalario SIGHO, mantenimiento técnico y asistencia en la carga de turnos.
                  </p>
                </div>

                {/* ROL 3 */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/40 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Crown className="w-4 h-4" />
                    <span>Dirección de RRHH</span>
                  </div>
                  <div className="font-bold text-slate-100">rrhh.central</div>
                  <p className="text-[11px] text-slate-300">
                    Supervisión integral de todos los servicios hospitalarios, consolidado general y procesamiento de haberes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: MODALIDADES FLEXIBLES */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 break-inside-avoid">
            <div className="flex items-center gap-2 text-emerald-900 border-b pb-2">
              <Clock className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold">2. Modalidades de Trabajo y Horarios Flexibles</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <Sun className="w-4 h-4 text-blue-600" />
                  <span>Jornal + Guardias Contraturno</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Agentes que cumplen su jornada habitual en el hospital (Mañana de 06:00 a 13:00 o Tarde de 13:00 a 20:00) y realizan sus guardias extras en el contraturno opuesto.
                </p>
              </div>

              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-teal-900">
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  <span>Solo Guardias (Jornal Externo)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Agentes que cumplen su jornal obligatorio en otra institución de salud. En este hospital <strong>no computan horas de jornal</strong> (marcado con <code>[Ext]</code>) y solo cobran sus guardias asignadas.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>Solo Jornal (Sin Guardias)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Personal abocado con exclusividad a sus tareas de jornal en su turno asignado. No se les programan guardias extraordinarias en días hábiles ni fines de semana.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs border border-slate-300 rounded-lg overflow-hidden">
                <thead className="bg-slate-800 text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-2.5">Turno / Código</th>
                    <th className="p-2.5">Días Habilitados</th>
                    <th className="p-2.5">Horario Oficial</th>
                    <th className="p-2.5">Cómputo</th>
                    <th className="p-2.5">Regla Operativa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-blue-50/40">
                    <td className="p-2.5 font-bold text-blue-900"><span className="px-2 py-0.5 bg-blue-100 border border-blue-300 text-blue-900 rounded font-mono font-bold">JM</span> Jornal Mañana</td>
                    <td className="p-2.5">Lunes a Viernes Hábiles</td>
                    <td className="p-2.5">06:00 a 13:00 hs</td>
                    <td className="p-2.5 font-bold">7 hs</td>
                    <td className="p-2.5 text-slate-600">Jornal estándar matutino.</td>
                  </tr>
                  <tr className="bg-blue-50/40">
                    <td className="p-2.5 font-bold text-blue-900"><span className="px-2 py-0.5 bg-blue-100 border border-blue-300 text-blue-900 rounded font-mono font-bold">JT</span> Jornal Tarde</td>
                    <td className="p-2.5">Lunes a Viernes Hábiles</td>
                    <td className="p-2.5">13:00 a 20:00 hs</td>
                    <td className="p-2.5 font-bold">7 hs</td>
                    <td className="p-2.5 text-slate-600">Jornal vespertino (Guardias en turno mañana).</td>
                  </tr>
                  <tr className="bg-emerald-50/40">
                    <td className="p-2.5 font-bold text-emerald-900"><span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded font-mono font-bold">EM / ET</span> Extra Contraturno</td>
                    <td className="p-2.5">Lunes a Viernes Hábiles</td>
                    <td className="p-2.5">06-13 o 13-20 hs</td>
                    <td className="p-2.5 font-bold">7 hs</td>
                    <td className="p-2.5 text-slate-600">Guardia en contraturno al horario habitual.</td>
                  </tr>
                  <tr className="bg-purple-50/40">
                    <td className="p-2.5 font-bold text-purple-900"><span className="px-2 py-0.5 bg-purple-100 border border-purple-300 text-purple-900 rounded font-mono font-bold">IA</span> Inhábil Activa</td>
                    <td className="p-2.5">Sábados, Domingos y Feriados</td>
                    <td className="p-2.5">06-13 / 13-20 hs</td>
                    <td className="p-2.5 font-bold">7 hs</td>
                    <td className="p-2.5 text-slate-600">Guardia presencial de soporte en el hospital.</td>
                  </tr>
                  <tr className="bg-amber-50/40">
                    <td className="p-2.5 font-bold text-amber-900"><span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 rounded font-mono font-bold">IP</span> Inhábil Pasiva</td>
                    <td className="p-2.5">Sábados, Domingos y Feriados</td>
                    <td className="p-2.5">Disponibilidad Domiciliaria</td>
                    <td className="p-2.5 font-bold">7 hs</td>
                    <td className="p-2.5 text-slate-600">Guardia pasiva para contingencias y llamados.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECCIÓN 3: GUÍA OPERATIVA */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 break-inside-avoid">
            <div className="flex items-center gap-2 text-emerald-900 border-b pb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold">3. Guía de Operación Paso a Paso</h2>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Selección del Período Mensual</h3>
                  <p className="text-slate-600 mt-0.5">En la barra superior, elija el Mes y Año a liquidar. El sistema configurará automáticamente los días hábiles, fines de semana y feriados de Formosa.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Configuración de Modalidad de Personal</h3>
                  <p className="text-slate-600 mt-0.5">En "Personal del Servicio" o en el editor del agente, configure la modalidad (Jornal + Contraturno, Solo Guardias, o Solo Jornal) y el horario habitual (Mañana/Tarde/Noche).</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">3</div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Rotación Automática Equitativa</h3>
                  <p className="text-slate-600 mt-0.5">El botón "Rotación Automática" distribuye las guardias respetando descansos, contraturnos y modalidades autorizadas sin sobrecargar a ningún agente.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">4</div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Auditoría en Tiempo Real y Exportación</h3>
                  <p className="text-slate-600 mt-0.5">Consulte la pestaña "Liquidación del Servicio" para verificar los totales de horas antes de emitir los reportes en Excel (.xls), Word (.doc) o PDF firmado.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Cuadro Oficial de Firmas */}
          <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs break-inside-avoid">
            <div className="space-y-4">
              <div className="border-t border-slate-700 pt-2 w-48 mx-auto font-bold text-slate-800">
                Cantero, Miguel Angel
                <div className="text-[10px] text-slate-500 font-normal">Jefe del Servicio de Informática</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="border-t border-slate-700 pt-2 w-48 mx-auto font-bold text-slate-800">
                DIRECCIÓN DE RRHH / MÉDICA
                <div className="text-[10px] text-slate-500 font-normal">Hospital Central de Emergencias</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Actions Bar (Hidden on Print) */}
        <div className="bg-slate-100 px-5 py-3.5 border-t border-slate-300 flex items-center justify-between shrink-0 no-print">
          <span className="text-xs text-slate-500">
            💡 Puede <strong>descargar el archivo PDF directamente</strong> o abrir la <strong>vista de impresión</strong> para imprimirlo en papel.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadOperationsManualPDF()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
            <button
              onClick={handlePrintPDF}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg shadow cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Cerrar Manual
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
