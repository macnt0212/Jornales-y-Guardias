import React from 'react';
import { HospitalServiceItem, DayInfo, MonthSchedule } from '../types';
import { calculateAgentStats, MONTH_NAMES, getScheduleStorageKey, generateBlankSchedule } from '../utils/calendar';
import { 
  ShieldCheck, 
  Building2, 
  FileSpreadsheet, 
  Printer, 
  Users, 
  TrendingUp, 
  ExternalLink, 
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';

interface ConsolidatedRRHHTabProps {
  services: HospitalServiceItem[];
  year: number;
  month: number;
  days: DayInfo[];
  onSelectService: (serviceId: string) => void;
  onPrint: () => void;
}

export const ConsolidatedRRHHTab: React.FC<ConsolidatedRRHHTabProps> = ({
  services,
  year,
  month,
  days,
  onSelectService,
  onPrint,
}) => {
  const monthName = MONTH_NAMES[month - 1];

  // Calculate statistics for each service
  const servicesSummaries = services.map(serv => {
    const storageKey = getScheduleStorageKey(serv.id, year, month);
    let sched: MonthSchedule;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        sched = JSON.parse(saved);
      } else {
        sched = generateBlankSchedule(year, month, serv.agents || [], undefined, serv.config);
      }
    } catch {
      sched = generateBlankSchedule(year, month, serv.agents || [], undefined, serv.config);
    }

    const agents = serv.agents || [];
    let jornalHs = 0;
    let extraHabilHs = 0;
    let inhabActivaHs = 0;
    let inhabPasivaHs = 0;

    agents.forEach(agent => {
      const stats = calculateAgentStats(agent, sched, days);
      jornalHs += stats.horasJornal;
      extraHabilHs += stats.horasExtraHabil;
      inhabActivaHs += stats.horasInhabilActiva;
      inhabPasivaHs += stats.horasInhabilPasiva;
    });

    const totalExtrasHs = extraHabilHs + inhabActivaHs + inhabPasivaHs;
    const totalMesHs = jornalHs + totalExtrasHs;

    return {
      service: serv,
      agentsCount: agents.length,
      jornalHs,
      extraHabilHs,
      inhabActivaHs,
      inhabPasivaHs,
      totalExtrasHs,
      totalMesHs,
    };
  });

  const totalHospitalAgents = servicesSummaries.reduce((sum, s) => sum + s.agentsCount, 0);
  const totalHospitalJornal = servicesSummaries.reduce((sum, s) => sum + s.jornalHs, 0);
  const totalHospitalExtraHabil = servicesSummaries.reduce((sum, s) => sum + s.extraHabilHs, 0);
  const totalHospitalInhabActiva = servicesSummaries.reduce((sum, s) => sum + s.inhabActivaHs, 0);
  const totalHospitalInhabPasiva = servicesSummaries.reduce((sum, s) => sum + s.inhabPasivaHs, 0);
  const totalHospitalExtras = servicesSummaries.reduce((sum, s) => sum + s.totalExtrasHs, 0);
  const totalHospitalGeneral = servicesSummaries.reduce((sum, s) => sum + s.totalMesHs, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded">
                Supervisión Global RRHH
              </span>
              <span className="text-xs text-slate-400">
                Hospital Central "Dr. Ramón Carrillo"
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Consolidado General de Horas y Servicios Hospitalarios
            </h2>
            <p className="text-xs text-slate-300">
              Auditoría y control de liquidación mensual consolidada: {monthName} {year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            Imprimir Consolidado
          </button>
        </div>
      </div>

      {/* KPI Global Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Servicios y Personal</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{services.length} <span className="text-xs font-normal text-slate-500">Servicios</span></div>
          <div className="text-xs text-slate-600 font-semibold mt-1">
            {totalHospitalAgents} agentes registrados en nómina
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Jornal Ordinario</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">{totalHospitalJornal} <span className="text-xs font-normal text-slate-500">hs</span></div>
          <div className="text-xs text-slate-600 font-semibold mt-1">
            Cumplimiento Lunes a Viernes (06-13 hs)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Horas Extras Globales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{totalHospitalExtras} <span className="text-xs font-normal text-slate-500">hs</span></div>
          <div className="text-xs text-slate-600 font-semibold mt-1">
            Hábiles ({totalHospitalExtraHabil}h) + Inháb. ({totalHospitalInhabActiva + totalHospitalInhabPasiva}h)
          </div>
        </div>

        <div className="bg-emerald-950 p-4 rounded-xl border border-emerald-800 shadow-xs text-white">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Total General Hospital</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300">{totalHospitalGeneral} <span className="text-xs font-normal text-emerald-400">hs</span></div>
          <div className="text-xs text-emerald-200 font-semibold mt-1">
            Total horas liquidadas del mes
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-xs overflow-hidden printable-area">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Desglose por Servicio Hospitalario • {monthName} {year}
            </h3>
            <p className="text-xs text-slate-500">
              Haga clic en cualquier servicio para ingresar y auditar su planilla individual
            </p>
          </div>
          <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full">
            {services.length} Servicios Activos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3 border-r border-slate-800">Servicio Hospitalario</th>
                <th className="p-3 border-r border-slate-800">Jefe / Responsable</th>
                <th className="p-3 border-r border-slate-800 text-center">Personal</th>
                <th className="p-3 border-r border-slate-800 text-center bg-blue-950">Jornal (hs)</th>
                <th className="p-3 border-r border-slate-800 text-center bg-emerald-950">Ext. Hábil (hs)</th>
                <th className="p-3 border-r border-slate-800 text-center bg-purple-950">Inháb. Activa</th>
                <th className="p-3 border-r border-slate-800 text-center bg-amber-950">Inháb. Pasiva</th>
                <th className="p-3 border-r border-slate-800 text-center bg-emerald-900 font-bold">Total Extras</th>
                <th className="p-3 border-r border-slate-800 text-center bg-slate-950 font-black">TOTAL MES</th>
                <th className="p-3 text-center no-print">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-800">
              {servicesSummaries.map((s, idx) => {
                const isEven = idx % 2 === 0;

                return (
                  <tr key={s.service.id} className={`${isEven ? 'bg-white' : 'bg-slate-50'} hover:bg-emerald-50/50 transition-colors`}>
                    <td className="p-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{s.service.config.serviceName || s.service.name}</span>
                      </div>
                    </td>

                    <td className="p-3 text-slate-700">
                      <div>
                        <div className="font-semibold text-slate-900">{s.service.config.jefeName || 'Sin Jefe Asignado'}</div>
                        <div className="text-[10px] text-slate-500">{s.service.config.jefeCargo} {s.service.config.jefeLegajo ? `(${s.service.config.jefeLegajo})` : ''}</div>
                      </div>
                    </td>

                    <td className="p-3 text-center font-bold text-slate-800">
                      <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-full">
                        {s.agentsCount}
                      </span>
                    </td>

                    <td className="p-3 text-center font-mono font-semibold text-blue-900 bg-blue-50/30">
                      {s.jornalHs} hs
                    </td>

                    <td className="p-3 text-center font-mono font-semibold text-emerald-900 bg-emerald-50/30">
                      {s.extraHabilHs} hs
                    </td>

                    <td className="p-3 text-center font-mono font-semibold text-purple-900 bg-purple-50/30">
                      {s.inhabActivaHs} hs
                    </td>

                    <td className="p-3 text-center font-mono font-semibold text-amber-900 bg-amber-50/30">
                      {s.inhabPasivaHs} hs
                    </td>

                    <td className="p-3 text-center font-mono font-bold text-emerald-700 bg-emerald-100/60">
                      {s.totalExtrasHs} hs
                    </td>

                    <td className="p-3 text-center font-mono font-black text-slate-950 bg-slate-200/80">
                      {s.totalMesHs} hs
                    </td>

                    <td className="p-3 text-center no-print">
                      <button
                        onClick={() => onSelectService(s.service.id)}
                        className="inline-flex items-center gap-1 bg-slate-800 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer"
                        title="Auditar y editar este servicio"
                      >
                        <span>Abrir</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Total Hospital Footer */}
            <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-slate-900">
              <tr>
                <td colSpan={2} className="p-3 text-right uppercase tracking-wider text-xs font-black">
                  TOTAL GENERAL HOSPITAL CENTRAL ({services.length} SERVICIOS):
                </td>
                <td className="p-3 text-center font-black">
                  {totalHospitalAgents}
                </td>
                <td className="p-3 text-center font-mono font-black text-blue-300">
                  {totalHospitalJornal} hs
                </td>
                <td className="p-3 text-center font-mono font-black text-emerald-300">
                  {totalHospitalExtraHabil} hs
                </td>
                <td className="p-3 text-center font-mono font-black text-purple-300">
                  {totalHospitalInhabActiva} hs
                </td>
                <td className="p-3 text-center font-mono font-black text-amber-300">
                  {totalHospitalInhabPasiva} hs
                </td>
                <td className="p-3 text-center font-mono font-black text-emerald-400 bg-emerald-950">
                  {totalHospitalExtras} hs
                </td>
                <td className="p-3 text-center font-mono font-black text-white text-sm bg-black">
                  {totalHospitalGeneral} hs
                </td>
                <td className="p-3 no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
