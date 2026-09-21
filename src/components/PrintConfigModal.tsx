import React from 'react';
import { 
  Printer, 
  X, 
  FileText, 
  Check, 
  Eye, 
  Download, 
  Info,
  Sparkles,
  Maximize2,
  Columns,
  ZoomIn,
  SunMedium
} from 'lucide-react';
import { 
  MonthSchedule, 
  DayInfo, 
  PrintSettings, 
  PrintPaperSize, 
  PrintBadgeDetail,
  PrintPageSplit,
  PrintFontSizeScale,
  PrintTotalsMode
} from '../types';
import { MONTH_NAMES } from '../utils/calendar';

interface PrintConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: MonthSchedule;
  days: DayInfo[];
  printSettings: PrintSettings;
  onUpdateSettings: (settings: Partial<PrintSettings>) => void;
  onPrintNow: () => void;
  onExportVisualHtml?: () => void;
  isPreviewMode: boolean;
  onTogglePreviewMode: () => void;
}

export const PrintConfigModal: React.FC<PrintConfigModalProps> = ({
  isOpen,
  onClose,
  schedule,
  days,
  printSettings,
  onUpdateSettings,
  onPrintNow,
  onExportVisualHtml,
  isPreviewMode,
  onTogglePreviewMode,
}) => {
  if (!isOpen) return null;

  const monthName = MONTH_NAMES[schedule.month - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Configuración de Impresión Legible
              </h3>
              <p className="text-[11px] text-slate-300">
                Planilla de <strong className="text-emerald-400">{monthName} {schedule.year}</strong> • Ajuste para que se vea grande y nítido
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Advice card highlighting how to solve the small text issue */}
          {/* Banner explicativo con Arial 12 y formatos de hoja */}
          <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-xl p-3 text-emerald-950 flex items-start gap-2.5 shadow-2xs">
            <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[11.5px] leading-relaxed">
              <strong className="text-emerald-900">¿Cómo entra en 1 hoja y se lee perfectamente con Arial 12?</strong>
              <div className="mt-1 text-emerald-950 space-y-1">
                <div>
                  • 📜 <strong>En Hoja Oficio / Legal (35.6 cm):</strong> <u>Entra el mes COMPLETO en 1 sola hoja</u> en <strong>Arial 12</strong> con máxima holgura y nitidez porque la hoja Oficio es 7.7 cm más ancha.
                </div>
                <div>
                  • 📄 <strong>En Hoja Carta / Letter (27.9 cm):</strong> En <u>1 sola hoja</u> entra optimizado con códigos nítidos de <strong>Arial 12</strong>. Si prefieres letras gigantes con horarios detallados de guardia, puedes usar <u>2 Hojas (Quincenas)</u>.
                </div>
              </div>
            </div>
          </div>

          {/* 1. Formato de Distribución y Páginas (CLAVE PARA EL TAMAÑO) */}
          <div>
            <label className="font-bold text-slate-900 text-xs block mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Columns className="w-3.5 h-3.5 text-blue-600" />
                1. Distribución de Páginas (Solución de Tamaño):
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.2 rounded border border-emerald-300">
                Recomendado: 2 Hojas
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Opción 1: 2 Hojas (1ª y 2ª Quincena) */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ pageSplit: 'two_pages' })}
                className={`p-3 rounded-lg border-2 text-left cursor-pointer transition-all relative ${
                  printSettings.pageSplit === 'two_pages'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                    : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-950 text-xs flex items-center gap-1.5">
                    📄📄 2 Hojas (1ª y 2ª Quincena)
                  </span>
                  {printSettings.pageSplit === 'two_pages' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="text-[10.5px] text-emerald-900 font-bold mt-1">
                  ⭐ ¡MÁXIMA LEGIBILIDAD! Letra grande de 12px
                </div>
                <div className="text-[10px] text-slate-600 mt-1 leading-normal">
                  • <b>Hoja 1:</b> Días 1 al 15 (celdas muy anchas y nítidas)<br />
                  • <b>Hoja 2:</b> Días 16 al {days.length} con Totales y Firmas
                </div>
              </button>

              {/* Opción 2: 1 Sola Hoja (Mes Completo) */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ pageSplit: 'single_page' })}
                className={`p-3 rounded-lg border-2 text-left cursor-pointer transition-all ${
                  printSettings.pageSplit === 'single_page'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30'
                    : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">
                    📄 1 Sola Hoja (Mes Completo)
                  </span>
                  {printSettings.pageSplit === 'single_page' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="text-[10.5px] text-slate-700 font-medium mt-1">
                  Todos los {days.length} días comprimidos en 1 sola hoja física.
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  En <b>Oficio / Legal</b> entra con máxima holgura. En <b>Carta / Letter</b> usa códigos concisos para mantener <b>Arial 12</b> legible.
                </div>
              </button>

              {/* Opción 3: Solo 1ª Quincena */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ pageSplit: 'quincena_1' })}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  printSettings.pageSplit === 'quincena_1'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/30'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">📅 Solo 1ª Quincena (1-15)</span>
                  {printSettings.pageSplit === 'quincena_1' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  Imprime una sola hoja grande con la primera mitad del mes.
                </div>
              </button>

              {/* Opción 4: Solo 2ª Quincena */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ pageSplit: 'quincena_2' })}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  printSettings.pageSplit === 'quincena_2'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/30'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">📅 Solo 2ª Quincena (16-{days.length})</span>
                  {printSettings.pageSplit === 'quincena_2' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  Imprime la segunda mitad con los totales del mes y firmas.
                </div>
              </button>
            </div>
          </div>

          {/* 2. Escala de Tamaño de Letra y Tipografía */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="font-bold text-slate-900 text-xs block mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
                2. Tipografía y Tamaño de Letra:
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">Arial 12 Estándar Oficial</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontSizeScale: 'arial12', fontFamily: 'arial' })}
                className={`p-2 rounded-md border text-center cursor-pointer transition-all ${
                  printSettings.fontSizeScale === 'arial12'
                    ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-black text-emerald-900">🔤 Arial 12 ⭐</div>
                <div className="text-[9px] text-emerald-700 font-bold">Oficial 12 pt</div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ fontSizeScale: 'large' })}
                className={`p-2 rounded-md border text-center cursor-pointer transition-all ${
                  printSettings.fontSizeScale === 'large'
                    ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold">Grande</div>
                <div className="text-[9.5px] text-indigo-700 font-bold">11 px</div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ fontSizeScale: 'xlarge' })}
                className={`p-2 rounded-md border text-center cursor-pointer transition-all ${
                  printSettings.fontSizeScale === 'xlarge'
                    ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-black">Extra Grande</div>
                <div className="text-[9.5px] text-indigo-700 font-bold">12.5 px</div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ fontSizeScale: 'normal' })}
                className={`p-2 rounded-md border text-center cursor-pointer transition-all ${
                  printSettings.fontSizeScale === 'normal'
                    ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs">Compacta</div>
                <div className="text-[9.5px] text-slate-500">9.5 px</div>
              </button>
            </div>
          </div>

          {/* 3. Selección de Papel y Columnas de Totales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Papel */}
            <div>
              <label className="font-bold text-slate-800 text-xs block mb-1.5">
                3. Tamaño de Papel de la Impresora:
              </label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ paperSize: 'letter' })}
                  className={`w-full p-2 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                    printSettings.paperSize === 'letter'
                      ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-xs">📄 Hoja Carta (Letter)</div>
                    <div className="text-[9.5px] text-slate-500 font-mono">216 × 279 mm</div>
                  </div>
                  {printSettings.paperSize === 'letter' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings({ paperSize: 'legal' })}
                  className={`w-full p-2 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                    printSettings.paperSize === 'legal'
                      ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-xs">📜 Hoja Oficio (Legal)</div>
                    <div className="text-[9.5px] text-emerald-700 font-bold font-mono">+77mm más ancho para días</div>
                  </div>
                  {printSettings.paperSize === 'legal' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              </div>
            </div>

            {/* Columnas de Totales */}
            <div>
              <label className="font-bold text-slate-800 text-xs block mb-1.5">
                4. Columnas de Totales en Impresión:
              </label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ totalsMode: 'none' })}
                  className={`w-full p-2 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                    printSettings.totalsMode === 'none'
                      ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950 ring-1 ring-emerald-500/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-xs">🚫 Sin Totales (0 cols - Máximo Ancho)</div>
                    <div className="text-[9.5px] text-emerald-800 font-medium">Solo los días del mes. Máximo espacio por celda.</div>
                  </div>
                  {printSettings.totalsMode === 'none' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings({ totalsMode: 'compact' })}
                  className={`w-full p-2 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                    printSettings.totalsMode === 'compact'
                      ? 'border-blue-600 bg-blue-50 font-bold text-blue-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-xs">Totales Esenciales (3 cols)</div>
                    <div className="text-[9.5px] text-blue-800 font-medium">Jornal + Extras + Total Mes</div>
                  </div>
                  {printSettings.totalsMode === 'compact' && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings({ totalsMode: 'full' })}
                  className={`w-full p-2 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                    printSettings.totalsMode === 'full'
                      ? 'border-blue-600 bg-blue-50 font-bold text-blue-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-xs">Totales Completos (8 cols)</div>
                    <div className="text-[9.5px] text-slate-500">Detalle discriminado de hábiles e inhábiles</div>
                  </div>
                  {printSettings.totalsMode === 'full' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              </div>
            </div>
          </div>

          {/* 4. Detalle de Códigos y Contraste */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            {/* Detalle en Celdas */}
            <div>
              <label className="font-bold text-slate-800 text-xs block mb-1.5">
                5. Formato de Celdas:
              </label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ badgeDetail: 'compact_hours' })}
                  className={`w-full p-2 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                    printSettings.badgeDetail === 'compact_hours'
                      ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-xs">Código + Horas (ej: JM 6-13)</div>
                    <div className="text-[9.5px] text-slate-500">Muestra el turno y la franja horaria</div>
                  </div>
                  {printSettings.badgeDetail === 'compact_hours' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings({ badgeDetail: 'codes_only' })}
                  className={`w-full p-2 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                    printSettings.badgeDetail === 'codes_only'
                      ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">Solo Códigos (ej: JM, 24A)</div>
                    <div className="text-[9.5px] text-indigo-700 font-bold">Letra aún más grande y despejada</div>
                  </div>
                  {printSettings.badgeDetail === 'codes_only' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              </div>
            </div>

            {/* Opciones y Alto Contraste */}
            <div>
              <label className="font-bold text-slate-800 text-xs block mb-1.5">
                6. Opciones y Legibilidad:
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printSettings.highContrast}
                    onChange={(e) => onUpdateSettings({ highContrast: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <SunMedium className="w-3.5 h-3.5 text-amber-600" />
                      Alto Contraste (Texto Negro Puro)
                    </span>
                    <div className="text-[9.5px] text-slate-500">Líneas negras nítidas para fotocopia o tóner gastado</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printSettings.includeSignatures}
                    onChange={(e) => onUpdateSettings({ includeSignatures: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900">Incluir Firmas Oficiales</span>
                    <div className="text-[9.5px] text-slate-500">Jefatura de Servicio, Dirección y RRHH</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePreviewMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                isPreviewMode
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Ver en pantalla exactamente cómo saldrán las páginas impresas"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreviewMode ? 'Desactivar Vista Previa' : 'Vista Previa en Pantalla'}</span>
            </button>

            {onExportVisualHtml && (
              <button
                type="button"
                onClick={onExportVisualHtml}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-all"
                title="Descargar documento HTML listo para imprimir o guardar como PDF"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Descargar HTML / PDF</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-all"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => {
                onPrintNow();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md cursor-pointer transition-all hover:shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ahora (Ctrl+P)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

