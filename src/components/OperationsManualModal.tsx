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
  Crown
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
                Guía completa con diagramas de flujo para Operadores, Jefes de Servicio y RRHH
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
                <strong className="text-emerald-800">2.</strong> Diagrama del Circuito Mensual
              </div>
              <div className="p-2 rounded bg-slate-50 hover:bg-emerald-50/60 border border-slate-200">
                <strong className="text-emerald-800">3.</strong> Régimen y Tipos de Guardias
              </div>
              <div className="p-2 rounded bg-slate-50 hover:bg-emerald-50/60 border border-slate-200">
                <strong className="text-emerald-800">4.</strong> Paso a Paso: Carga de Planilla
              </div>
              <div className="p-2 rounded bg-slate-50 hover:bg-emerald-50/60 border border-slate-200">
                <strong className="text-emerald-800">5.</strong> Rotación Equitativa Inteligente
              </div>
              <div className="p-2 rounded bg-slate-50 hover:bg-emerald-50/60 border border-slate-200">
                <strong className="text-emerald-800">6.</strong> Exportación y Firmas Oficiales
              </div>
            </div>
          </div>

          {/* SECCIÓN 1: DIAGRAMA DE FLUJO DE SEGURIDAD Y ACCESO POR ROLES */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 break-inside-avoid">
            <div className="flex items-center gap-2 text-emerald-900 border-b pb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold">1. Diagrama de Seguridad y Control de Acceso (RBAC)</h2>
            </div>
            <p className="text-xs text-slate-600">
              El sistema implementa un esquema estricto de seguridad basado en roles. Cada Jefe o Encargado únicamente puede ver y cargar los datos correspondientes a los agentes de su servicio asignado.
            </p>

            {/* DIAGRAMA VECTORIAL 1: ACCESO POR ROLES */}
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-4">
              <div className="text-center font-bold text-xs tracking-wider uppercase text-emerald-400">
                DIAGRAMA 1: FLUJO DE AUTENTICACIÓN Y SEGURIDAD POR ROL
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* ROL 1: JEFE DE SERVICIO */}
                <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <UserCheck className="w-4 h-4" />
                    <span>Jefe / Encargado de Servicio</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-2">
                    <div className="flex items-start gap-2 bg-slate-900 p-2 rounded border border-slate-800">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</div>
                      <span>Ingreso con Usuario y Contraseña personal</span>
                    </div>
                    <div className="flex items-start gap-2 bg-slate-900 p-2 rounded border border-slate-800">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</div>
                      <span>Apertura directa de su <strong>Servicio Exclusivo</strong></span>
                    </div>
                    <div className="flex items-start gap-2 bg-slate-900 p-2 rounded border border-slate-800">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</div>
                      <span>Carga y edición de <strong>únicamente su personal</strong></span>
                    </div>
                    <div className="flex items-start gap-2 bg-blue-950/60 p-2 rounded border border-blue-800/60 text-blue-200">
                      <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span><strong>Aislamiento Total:</strong> No tiene acceso a otros servicios ni al consolidado general.</span>
                    </div>
                  </div>
                </div>

                {/* ROL 2: ADMINISTRADOR CENTRAL RRHH */}
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Crown className="w-4 h-4" />
                    <span>Administrador General (RRHH)</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-2">
                    <div className="flex items-start gap-2 bg-slate-900 p-2 rounded border border-slate-800">
                      <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</div>
                      <span>Ingreso como <code>rrhh.central</code></span>
                    </div>
                    <div className="flex items-start gap-2 bg-slate-900 p-2 rounded border border-slate-800">
                      <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</div>
                      <span><strong>Supervisión Global:</strong> Puede alternar y auditar cualquier servicio</span>
                    </div>
                    <div className="flex items-start gap-2 bg-slate-900 p-2 rounded border border-slate-800">
                      <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</div>
                      <span>Acceso a <strong>Consolidado Hospitalario General</strong></span>
                    </div>
                    <div className="flex items-start gap-2 bg-amber-950/60 p-2 rounded border border-amber-800/60 text-amber-200">
                      <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Gestión de Cuentas:</strong> Alta de nuevos usuarios y creación de servicios.</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* SECCIÓN 2: DIAGRAMA DEL CICLO MENSUAL OPERATIVO */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 break-inside-avoid">
            <div className="flex items-center gap-2 text-emerald-900 border-b pb-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold">2. Diagrama del Circuito Mensual de Carga y Liquidación</h2>
            </div>

            {/* DIAGRAMA VECTORIAL 2: ETAPAS DEL PROCESO */}
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-4">
              <div className="text-center font-bold text-xs tracking-wider uppercase text-emerald-400">
                DIAGRAMA 2: CIRCUITO OPERATIVO DE 5 PASOS
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
                
                {/* Paso 1 */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mx-auto">1</div>
                  <div className="font-bold text-emerald-300">Seleccionar Período</div>
                  <p className="text-[11px] text-slate-400">Elegir Año y Mes en la cinta superior (calendario automático y feriados).</p>
                </div>

                {/* Paso 2 */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mx-auto">2</div>
                  <div className="font-bold text-emerald-300">Nómina de Agentes</div>
                  <p className="text-[11px] text-slate-400">Revisar agentes, matrículas y roles en "Personal del Servicio".</p>
                </div>

                {/* Paso 3 */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mx-auto">3</div>
                  <div className="font-bold text-emerald-300">Asignar Guardias</div>
                  <p className="text-[11px] text-slate-400">Cargar Jornal (06-13), Extras (13-20) e Inhábiles (Activas/Pasivas).</p>
                </div>

                {/* Paso 4 */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mx-auto">4</div>
                  <div className="font-bold text-emerald-300">Auditar Totales</div>
                  <p className="text-[11px] text-slate-400">Verificar balance de horas en "Fichas" y "Liquidación".</p>
                </div>

                {/* Paso 5 */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mx-auto">5</div>
                  <div className="font-bold text-emerald-300">Exportar y Firmar</div>
                  <p className="text-[11px] text-slate-400">Generar PDF Oficial, Excel (.xls) o Word (.doc) para elevación.</p>
                </div>

              </div>
            </div>
          </section>

          {/* SECCIÓN 3: RÉGIMEN HORARIO Y TIPOS DE TURNOS */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 break-inside-avoid">
            <div className="flex items-center gap-2 text-emerald-900 border-b pb-2">
              <Clock className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold">3. Régimen Horario y Nomenclatura Oficial de Turnos</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300 rounded-lg overflow-hidden">
                <thead className="bg-slate-800 text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-2.5">Concepto</th>
                    <th className="p-2.5">Días de Aplicación</th>
                    <th className="p-2.5">Horario Habitual</th>
                    <th className="p-2.5">Horas Cómputo</th>
                    <th className="p-2.5">Código Celda</th>
                    <th className="p-2.5">Color Celda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-blue-50/50">
                    <td className="p-2.5 font-bold text-blue-900">Jornal Ordinario</td>
                    <td className="p-2.5">Lunes a Viernes Hábiles</td>
                    <td className="p-2.5">06:00 a 13:00 hs</td>
                    <td className="p-2.5 font-bold">7 hs</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 bg-blue-100 border border-blue-300 text-blue-900 font-bold rounded">J</span></td>
                    <td className="p-2.5 text-blue-800">Fondo Azul Suave</td>
                  </tr>
                  <tr className="bg-emerald-50/50">
                    <td className="p-2.5 font-bold text-emerald-900">Horas Extras Hábiles</td>
                    <td className="p-2.5">Lunes a Viernes Hábiles</td>
                    <td className="p-2.5">13:00 a 20:00 hs</td>
                    <td className="p-2.5 font-bold">7 hs</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold rounded">H</span></td>
                    <td className="p-2.5 text-emerald-800">Fondo Verde Suave</td>
                  </tr>
                  <tr className="bg-purple-50/50">
                    <td className="p-2.5 font-bold text-purple-900">Guardia Inhábil ACTIVA</td>
                    <td className="p-2.5">Sábados, Domingos y Feriados</td>
                    <td className="p-2.5">06:00 a 13:00 / 13:00 a 20:00</td>
                    <td className="p-2.5 font-bold">7 hs (o 12/24hs)</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 bg-purple-100 border border-purple-300 text-purple-900 font-bold rounded">A</span></td>
                    <td className="p-2.5 text-purple-800">Fondo Púrpura</td>
                  </tr>
                  <tr className="bg-amber-50/50">
                    <td className="p-2.5 font-bold text-amber-900">Guardia Inhábil PASIVA</td>
                    <td className="p-2.5">Sábados, Domingos y Feriados</td>
                    <td className="p-2.5">Disponibilidad en Domicilio</td>
                    <td className="p-2.5 font-bold">7 hs (o 12/24hs)</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 font-bold rounded">P</span></td>
                    <td className="p-2.5 text-amber-800">Fondo Ámbar</td>
                  </tr>
                  <tr className="bg-indigo-50/50">
                    <td className="p-2.5 font-bold text-indigo-900">Jornal + Extra Hábil (Doble)</td>
                    <td className="p-2.5">Lunes a Viernes Hábiles</td>
                    <td className="p-2.5">06:00 a 20:00 hs continuas</td>
                    <td className="p-2.5 font-bold">14 hs (7J + 7H)</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 bg-indigo-100 border border-indigo-300 text-indigo-900 font-bold rounded">JH</span></td>
                    <td className="p-2.5 text-indigo-800">Bicolor Azul/Verde</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECCIÓN 4: GUÍA PASO A PASO PARA EL OPERADOR */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 break-inside-avoid">
            <div className="flex items-center gap-2 text-emerald-900 border-b pb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold">4. Guía de Operación Paso a Paso</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Cómo Cargar Turnos en la Planilla Matriz</h3>
                  <p className="text-slate-600 mt-0.5">
                    Haga <strong>clic sobre cualquier celda</strong> de la tabla correspondiente al día y agente deseado. Se abrirá el <em>Editor Rápido de Turno</em> donde podrá seleccionar Jornal, Horas Extras Hábiles, o Guardias Inhábiles (Activas o Pasivas).
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Atajos Rápidos de un Clic</h3>
                  <p className="text-slate-600 mt-0.5">
                    Al posar el cursor sobre las celdas en días hábiles, aparecen botones rápidos <code>[J]</code> y <code>[H]</code> para activar o desactivar turnos de manera instantánea sin abrir el modal.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Asignación Masiva de Guardias Inhábiles</h3>
                  <p className="text-slate-600 mt-0.5">
                    En la pestaña <strong>"Guardias Inhábiles"</strong>, el sistema agrupa todos los sábados, domingos y feriados del mes. Dispone de botones como <em>"Asignar Todo en Activa"</em>, <em>"Asignar Todo en Pasiva"</em> o <em>"Regla Oficial de Fines de Semana"</em> para distribuir en duplas automáticamente.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Auditoría en Tiempo Real y Cero Sobrecargas</h3>
                  <p className="text-slate-600 mt-0.5">
                    La columna de totales a la derecha y la barra inferior calculan inmediatamente las horas de Jornal, Extras Hábiles, Inhábiles Activas e Inhábiles Pasivas, evitando errores de cálculo manual.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 5: EXPORTACIÓN Y REPORTES OFICIALES */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 break-inside-avoid">
            <div className="flex items-center gap-2 text-emerald-900 border-b pb-2">
              <Download className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold">5. Formatos de Exportación Oficial</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Excel Visual (.xls)</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Genera la planilla con cuadrícula exacta, colores y fórmulas, 100% compatible con Microsoft Excel.
                </p>
              </div>

              <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                <div className="flex items-center gap-2 font-bold text-sky-900 mb-1">
                  <FileText className="w-4 h-4 text-sky-700" />
                  <span>Word (.doc)</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Documento editable para notas institucionales y elevaciones jerárquicas a la Dirección.
                </p>
              </div>

              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2 font-bold text-indigo-900 mb-1">
                  <Printer className="w-4 h-4 text-indigo-700" />
                  <span>Impresión / PDF Oficial</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Diseño apaisado (Landscape A3/A4) con cuadro de firmas de Jefe de Servicio y Dirección Médica.
                </p>
              </div>

            </div>
          </section>

          {/* Cuadro Oficial de Firmas y Validación Institucional */}
          <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs break-inside-avoid">
            <div className="space-y-8">
              <div className="border-t border-slate-700 pt-2 w-48 mx-auto font-bold text-slate-800">
                FIRMA Y SELLO
                <div className="text-[10px] text-slate-500 font-normal">Jefe / Responsable del Servicio</div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="border-t border-slate-700 pt-2 w-48 mx-auto font-bold text-slate-800">
                DIRECCIÓN DE PERSONAL / RRHH
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
