import React, { useState } from 'react';
import { HospitalAuthSession } from '../types';
import { authenticateUser, loadAllUsers } from '../utils/auth';
import { 
  Hospital, 
  Lock, 
  User, 
  ShieldCheck, 
  KeyRound, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Building2, 
  AlertCircle,
  BookOpen
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (session: HospitalAuthSession) => void;
  onOpenManual?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onOpenManual }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const allUsers = loadAllUsers();

  // Detect matching user in real-time as user types username
  const matchedUser = username.trim()
    ? allUsers.find(u => u.username.toLowerCase() === username.trim().toLowerCase())
    : null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor ingrese su usuario institucional y contraseña.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const user = authenticateUser(username, password);
      setIsLoading(false);

      if (user) {
        const session: HospitalAuthSession = {
          user,
          loginTime: new Date().toISOString(),
        };
        onLoginSuccess(session);
      } else {
        setErrorMsg('Usuario o contraseña incorrectos. Verifique sus credenciales habilitadas.');
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Background radial gradient decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.18),rgba(15,23,42,0))] pointer-events-none" />

      <div className="w-full max-w-lg z-10 space-y-6">
        
        {/* Top Header / Institutional Title */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold tracking-wide shadow-xs">
            <Hospital className="w-4 h-4 text-emerald-400" />
            Gobierno de Formosa • Ministerio de Desarrollo Humano
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            HOSPITAL CENTRAL DE EMERGENCIAS
          </h1>
          <p className="text-sm font-bold text-emerald-400 tracking-wider uppercase">
            "DR. RAMÓN CARRILLO" — CONTROL DE HORAS EXTRAS Y JORNAL
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Portal institucional seguro. Cada Jefe o Encargado habilitado accede exclusivamente a la nómina de su propio servicio.
          </p>
        </div>

        {/* Focused Login Form Card */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-black/60">
          
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Ingreso al Sistema</h2>
                <p className="text-xs text-slate-400">Credenciales del Servicio Hospitalario</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acceso Seguro</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-950/80 border border-rose-700/80 rounded-xl text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Usuario Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="input-username"
                  required
                  autoFocus
                  placeholder="ej: jefe.guardia, jefe.informatica, rrhh.central"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="input-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Real-time Target Service Preview if matched */}
            {matchedUser && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-700/60 rounded-xl text-xs flex items-center gap-2.5 text-emerald-200 animate-in fade-in">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold block truncate text-white">
                    {matchedUser.role === 'rrhh' ? '👑 Dirección de Recursos Humanos (Administración General)' : `Servicio Asignado: ${matchedUser.serviceName}`}
                  </span>
                  <span className="text-[11px] text-emerald-300 block truncate">
                    Responsable: {matchedUser.fullName} {matchedUser.legajo ? `(${matchedUser.legajo})` : ''}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              id="btn-submit-login"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{matchedUser?.serviceName ? `Ingresar a ${matchedUser.serviceName.replace('Servicio de ', '')}` : 'Ingresar al Servicio'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Security / Privacy Badge & Manual Button */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Aislamiento estricto de datos por servicio</span>
            </div>
            {onOpenManual && (
              <button
                type="button"
                onClick={onOpenManual}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer bg-emerald-950/70 border border-emerald-800/60 px-2 py-1 rounded"
              >
                <BookOpen className="w-3 h-3 text-emerald-400" />
                <span>Manual de Operador (PDF)</span>
              </button>
            )}
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500">
          Sistema Oficial de Control de Guardias, Horas Extras y Jornal • Hospital Central "Dr. Ramón Carrillo"
        </p>

      </div>
    </div>
  );
};
