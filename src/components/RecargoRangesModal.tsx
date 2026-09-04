import React, { useState } from 'react';
import { RecargoRange, RecargoCategory, HospitalServiceConfig } from '../types';
import { 
  DEFAULT_RECARGO_RANGES, 
  calculateHoursBetweenTimes, 
  saveGlobalRecargoRanges 
} from '../utils/calendar';
import { 
  X, 
  Plus, 
  Clock, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  CalendarClock, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Info, 
  Save,
  AlertCircle,
  Timer
} from 'lucide-react';

interface RecargoRangesModalProps {
  isOpen: boolean;
  serviceConfig?: HospitalServiceConfig;
  onClose: () => void;
  onSaveRanges: (updatedRanges: RecargoRange[]) => void;
}

export const RecargoRangesModal: React.FC<RecargoRangesModalProps> = ({
  isOpen,
  serviceConfig,
  onClose,
  onSaveRanges,
}) => {
  // Lista de rangos actuales (del servicio, o guardados en localStorage, o los estándar)
  const [ranges, setRanges] = useState<RecargoRange[]>(() => {
    if (serviceConfig?.recargoRanges && serviceConfig.recargoRanges.length > 0) {
      return serviceConfig.recargoRanges;
    }
    const saved = localStorage.getItem('hospital_custom_recargo_ranges');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_RECARGO_RANGES;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | RecargoCategory>('all');
  const [showAddForm, setShowAddForm] = useState<boolean>(true);

  // Estado del formulario para nuevo rango
  const [newCategory, setNewCategory] = useState<RecargoCategory>('habil');
  const [newName, setNewName] = useState<string>('');
  const [newStartTime, setNewStartTime] = useState<string>('13:00');
  const [newEndTime, setNewEndTime] = useState<string>('20:00');
  const [newHours, setNewHours] = useState<number>(7);
  const [newDescription, setNewDescription] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Actualiza horas automáticamente cuando cambian los horarios
  const handleStartTimeChange = (time: string) => {
    setNewStartTime(time);
    const calculated = calculateHoursBetweenTimes(time, newEndTime);
    setNewHours(calculated);
  };

  const handleEndTimeChange = (time: string) => {
    setNewEndTime(time);
    const calculated = calculateHoursBetweenTimes(newStartTime, time);
    setNewHours(calculated);
  };

  if (!isOpen) return null;

  const handleAddRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError('Por favor ingrese un nombre para el rango de recargo');
      return;
    }

    if (!newStartTime || !newEndTime) {
      setFormError('Debe definir la hora de inicio y fin');
      return;
    }

    const calculatedHours = Number(newHours) > 0 ? Number(newHours) : calculateHoursBetweenTimes(newStartTime, newEndTime);
    const generatedLabel = `${newStartTime} a ${newEndTime} hs`;

    const newRange: RecargoRange = {
      id: `recargo_custom_${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      startTime: newStartTime,
      endTime: newEndTime,
      hours: calculatedHours,
      label: generatedLabel,
      description: newDescription.trim() || `${newCategory === 'habil' ? 'Recargo hábil' : newCategory === 'inhabil_activa' ? 'Guardia activa' : 'Guardia pasiva'} (${calculatedHours} hs)`,
      isSystemDefault: false,
    };

    const updated = [newRange, ...ranges];
    setRanges(updated);
    saveGlobalRecargoRanges(updated);
    onSaveRanges(updated);

    // Reset form
    setNewName('');
    setNewDescription('');
    setFormError(null);
  };

  const handleDeleteRange = (id: string, name: string) => {
    if (window.confirm(`¿Confirma eliminar el rango de recargo "${name}"?`)) {
      const updated = ranges.filter(r => r.id !== id);
      setRanges(updated);
      saveGlobalRecargoRanges(updated);
      onSaveRanges(updated);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('¿Desea restablecer todos los rangos a los valores estándar del Hospital? Se mantendrán los recargos oficiales de 7hs, 11hs, 12hs y 24hs.')) {
      setRanges(DEFAULT_RECARGO_RANGES);
      saveGlobalRecargoRanges(DEFAULT_RECARGO_RANGES);
      onSaveRanges(DEFAULT_RECARGO_RANGES);
    }
  };

  const handleSaveAndClose = () => {
    saveGlobalRecargoRanges(ranges);
    onSaveRanges(ranges);
    onClose();
  };

  const filteredRanges = ranges.filter(r => {
    if (activeFilter === 'all') return true;
    return r.category === activeFilter;
  });

  const countHabil = ranges.filter(r => r.category === 'habil').length;
  const countInhabilActiva = ranges.filter(r => r.category === 'inhabil_activa').length;
  const countInhabilPasiva = ranges.filter(r => r.category === 'inhabil_pasiva').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Cabecera del Modal */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg shadow-sm">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight flex items-center gap-2">
                <span>Rangos y Horarios de Recargos</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700">
                  {ranges.length} configurados
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Horas Extras Hábiles e Inhábiles Activas y Pasivas • {serviceConfig?.serviceName || 'Servicio Hospitalario'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Filtros por Tipo de Recargo */}
        <div className="bg-slate-100 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Todos ({ranges.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('habil')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'habil'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-800 hover:bg-emerald-100/80 bg-emerald-50 border border-emerald-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Hábiles ({countHabil})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('inhabil_activa')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'inhabil_activa'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-purple-800 hover:bg-purple-100/80 bg-purple-50 border border-purple-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>Inhábiles Activas ({countInhabilActiva})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('inhabil_pasiva')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'inhabil_pasiva'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-100/80 bg-amber-50 border border-amber-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Inhábiles Pasivas ({countInhabilPasiva})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Ocultar Formulario' : 'Nuevo Rango de Recargo'}</span>
          </button>
        </div>

        {/* Contenido Principal con Scroll */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          
          {/* FORMULARIO PARA AGREGAR NUEVO RANGO */}
          {showAddForm && (
            <div className="bg-slate-50 border-2 border-emerald-200/90 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-emerald-600 text-white rounded">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Agregar Nuevo Rango de Recargo
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500">
                  Configure el horario para hábiles o inhábiles
                </span>
              </div>

              {formError && (
                <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleAddRange} className="space-y-3">
                {/* Selector de Categoría de Recargo */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tipo de Recargo / Guardia:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label 
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        newCategory === 'habil'
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 text-emerald-900 font-bold'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="recargoCategory"
                        value="habil"
                        checked={newCategory === 'habil'}
                        onChange={() => setNewCategory('habil')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="text-xs">🟢 Hábil</div>
                        <div className="text-[10px] text-slate-500 font-normal">Contraturno Lunes a Viernes</div>
                      </div>
                    </label>

                    <label 
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        newCategory === 'inhabil_activa'
                          ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-400 text-purple-900 font-bold'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="recargoCategory"
                        value="inhabil_activa"
                        checked={newCategory === 'inhabil_activa'}
                        onChange={() => setNewCategory('inhabil_activa')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="text-xs">🟣 Inhábil Activa</div>
                        <div className="text-[10px] text-slate-500 font-normal">Sábados, Dom. y Feriados</div>
                      </div>
                    </label>

                    <label 
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        newCategory === 'inhabil_pasiva'
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400 text-amber-900 font-bold'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="recargoCategory"
                        value="inhabil_pasiva"
                        checked={newCategory === 'inhabil_pasiva'}
                        onChange={() => setNewCategory('inhabil_pasiva')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div className="text-xs">🟡 Inhábil Pasiva</div>
                        <div className="text-[10px] text-slate-500 font-normal">A llamado / disponibilidad</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Nombre y Horarios */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Nombre del Recargo:
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={
                        newCategory === 'habil' 
                          ? 'Ej: Recargo Hábil Vespertino' 
                          : newCategory === 'inhabil_activa'
                          ? 'Ej: Guardia Activa 12hs Diurna'
                          : 'Ej: Guardia Pasiva Fin de Semana'
                      }
                      className="w-full bg-white text-slate-900 text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Hora Inicio:
                    </label>
                    <input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-full bg-white text-slate-900 text-xs font-mono py-1.5 px-2 rounded-lg border border-slate-300 focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Hora Fin:
                    </label>
                    <input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      className="w-full bg-white text-slate-900 text-xs font-mono py-1.5 px-2 rounded-lg border border-slate-300 focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Horas a Liquidar:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="24"
                        step="0.5"
                        value={newHours}
                        onChange={(e) => setNewHours(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white text-slate-900 text-xs font-bold py-1.5 px-2 rounded-lg border border-slate-300 focus:border-emerald-500 text-center"
                      />
                      <span className="text-xs font-bold text-slate-500">hs</span>
                    </div>
                  </div>
                </div>

                {/* Descripción y Botón Guardar */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-9">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Descripción u Observaciones (Opcional):
                    </label>
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Ej: Turno de refuerzo para guardia central o consultorio externo"
                      className="w-full bg-white text-slate-900 text-xs py-1.5 px-3 rounded-lg border border-slate-300 focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg shadow-xs text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>+ Guardar Rango</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* LISTA DE RANGOS DE RECARGOS REGISTRADOS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4 text-slate-600" />
                <span>Rangos Configurados ({filteredRanges.length})</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Disponibles para asignar directamente en la planilla
              </span>
            </div>

            {filteredRanges.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                <Timer className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No hay rangos en esta categoría</p>
                <p className="text-[11px] text-slate-500 mt-1">Utilice el formulario superior para agregar un nuevo rango de recargo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredRanges.map((range) => {
                  const isHabil = range.category === 'habil';
                  const isInhabilActiva = range.category === 'inhabil_activa';
                  const isInhabilPasiva = range.category === 'inhabil_pasiva';

                  return (
                    <div
                      key={range.id}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        isHabil
                          ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                          : isInhabilActiva
                          ? 'bg-purple-50/50 border-purple-200 hover:border-purple-300'
                          : 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                isHabil
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : isInhabilActiva
                                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}
                            >
                              {isHabil ? 'Hábil (Contraturno)' : isInhabilActiva ? 'Inhábil Activa' : 'Inhábil Pasiva'}
                            </span>
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-800 shadow-2xs">
                              {range.label || `${range.startTime} a ${range.endTime} hs`}
                            </span>
                          </div>

                          <h5 className="font-bold text-xs text-slate-900 leading-tight">
                            {range.name}
                          </h5>

                          {range.description && (
                            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                              {range.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`text-xs font-black px-2.5 py-1 rounded-lg shadow-2xs border ${
                              isHabil
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : isInhabilActiva
                                ? 'bg-purple-600 text-white border-purple-700'
                                : 'bg-amber-600 text-white border-amber-700'
                            }`}
                          >
                            {range.hours} hs
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteRange(range.id, range.name)}
                            title="Eliminar este rango"
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-white/80 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Caja de ayuda normativa hospitalaria */}
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 leading-relaxed">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <Info className="w-4 h-4 text-slate-600" />
              <span>Reglas de Aplicación Hospitalaria en Formosa:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5">
              <li><strong>Recargos Hábiles:</strong> Se liquidan en días lunes a viernes en horario opuesto al jornal habitual (contraturno de 7hs, 11hs nocturno o módulos especiales).</li>
              <li><strong>Inhábiles Activas:</strong> Guardias presenciales de fin de semana y feriados (esquemas de 7hs, 12hs o 24hs continuas).</li>
              <li><strong>Inhábiles Pasivas:</strong> Disponibilidad domiciliaria a llamado del hospital con liquidación diferenciada.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Rangos Estándar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white hover:border-slate-400 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar y Aplicar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
