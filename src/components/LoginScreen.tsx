import React, { useState } from 'react';
import { UserAccount, HospitalAuthSession } from '../types';
import { authenticateUser, loadAllUsers, saveAllUsers } from '../utils/auth';
import { loadAllServices } from '../utils/calendar';
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
  CheckCircle2,
  Sparkles,
  UserPlus,
  Check,
  X
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (session: HospitalAuthSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick Register Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regLegajo, setRegLegajo] = useState('');
  const [regServiceId, setRegServiceId] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMessage, setRegMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const allUsers = loadAllUsers();
  const allServices = loadAllServices();

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

  const handleSuggestRegCredentials = () => {
    if (!regFullName.trim()) {
      setRegMessage({ type: 'error', text: 'Escriba primero el Apellido y Nombre.' });
      return;
    }
    const cleanName = regFullName.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, '');
    const shortUser = `jefe.${cleanName.slice(0, 10)}`;
    const randomPass = `guardia${Math.floor(1000 + Math.random() * 9000)}`;
    setRegUsername(shortUser);
    setRegPassword(randomPass);
  };

  const handleRegisterNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    setRegMessage(null);

    const trimmedUser = regUsername.trim().toLowerCase();
    if (!trimmedUser || !regPassword.trim() || !regFullName.trim()) {
      setRegMessage({ type: 'error', text: 'Por favor complete todos los campos obligatorios.' });
      return;
    }

    const currentUsers = loadAllUsers();
    if (currentUsers.some(u => u.username.toLowerCase() === trimmedUser)) {
      setRegMessage({ type: 'error', text: `El usuario "${trimmedUser}" ya existe. Elija otro nombre de usuario.` });
      return;
    }

    const targetServiceId = regServiceId || allServices[0]?.id || 'serv_guardia_medica';
    const targetService = allServices.find(s => s.id === targetServiceId);

    const newUser: UserAccount = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      username: trimmedUser,
      password: regPassword.trim(),
      fullName: regFullName.trim(),
      role: 'jefe_servicio',
      roleTitle: `Jefe / Encargado de Carga de ${targetService?.config?.serviceName || targetService?.name || 'Servicio'}`,
      serviceId: targetServiceId,
      serviceName: targetService?.config?.serviceName || targetService?.name || 'Servicio Hospitalario',
      legajo: regLegajo.trim() || undefined,
      avatarIcon: 'Building2',
    };

    const updated = [...currentUsers, newUser];
    saveAllUsers(updated);

    setRegMessage({ type: 'success', text: `✓ Usuario "${newUser.fullName}" dado de alta con éxito para ${newUser.serviceName}.` });
    
    // Auto-fill login form
    setUsername(newUser.username);
    setPassword(newUser.password || '');

    setTimeout(() => {
      setIsRegisterOpen(false);
      setRegFullName('');
      setRegLegajo('');
      setRegUsername('');
      setRegPassword('');
      setRegMessage(null);
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Background radial gradient decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.18),rgba(15,23,42,0))] pointer-events-none" />

      <div className="w-full max-w-xl z-10 space-y-6">
        
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
            Portal institucional de acceso. Ingrese con su usuario y contraseña habilitados para acceder a la planilla de su servicio.
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
            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/80 hover:bg-emerald-800 border border-emerald-700/60 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dar de Alta Usuario</span>
            </button>
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
                  placeholder="ej: jefe.guardia, rrhh.central, etc."
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

          {/* Bottom Security / Privacy Badge */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Acceso seguro y restringido por servicio</span>
            </div>
            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
            >
              + Nuevo Responsable
            </button>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500">
          Sistema Oficial de Control de Guardias, Horas Extras y Jornal • Hospital Central "Dr. Ramón Carrillo"
        </p>

      </div>

      {/* Modal de Alta de Usuario para Cargar Guardias */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <UserPlus className="w-4 h-4" />
                <span>Dar de Alta Usuario que Cargará Guardias</span>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterNewUser} className="p-5 space-y-3.5">
              {regMessage && (
                <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  regMessage.type === 'success' ? 'bg-emerald-950 border border-emerald-700 text-emerald-200' : 'bg-rose-950 border border-rose-700 text-rose-200'
                }`}>
                  {regMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  <span>{regMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Apellido y Nombre del Encargado / Jefe *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: Dr. Insfrán, Marcelo"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Matrícula / Legajo
                  </label>
                  <input
                    type="text"
                    placeholder="ej: M.P. 4902"
                    value={regLegajo}
                    onChange={(e) => setRegLegajo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Servicio a Cargar *
                  </label>
                  <select
                    value={regServiceId || allServices[0]?.id}
                    onChange={(e) => setRegServiceId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-emerald-600/70 text-emerald-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {allServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.config?.serviceName || s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Credenciales de Login
                  </span>
                  <button
                    type="button"
                    onClick={handleSuggestRegCredentials}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    Sugerir Usuario y Contraseña
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Usuario *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ej: jefe.trauma"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Contraseña *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ej: guardia2026"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-amber-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Dar de Alta y Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
