import React, { useState, useEffect } from 'react';
import { UserAccount, HospitalServiceItem } from '../types';
import { loadAllUsers, saveAllUsers } from '../utils/auth';
import { 
  X, 
  ShieldCheck, 
  UserPlus, 
  KeyRound, 
  Trash2, 
  Check, 
  Building2, 
  User, 
  Lock, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Crown,
  ClipboardList
} from 'lucide-react';

interface UserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: HospitalServiceItem[];
  currentUser: UserAccount;
  initialTab?: 'list' | 'create';
}

export const UserManagerModal: React.FC<UserManagerModalProps> = ({
  isOpen,
  onClose,
  services,
  currentUser,
  initialTab = 'list',
}) => {
  const [users, setUsers] = useState<UserAccount[]>(() => loadAllUsers());
  const [activeTab, setActiveTab] = useState<'list' | 'create'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setUsers(loadAllUsers());
      setMessage(null);
    }
  }, [isOpen, initialTab]);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<'jefe_servicio' | 'rrhh'>('jefe_servicio');
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newServiceId, setNewServiceId] = useState(services[0]?.id || '');
  const [newLegajo, setNewLegajo] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit password state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPasswordValue, setEditPasswordValue] = useState('');

  if (!isOpen) return null;

  const handleGenerateSuggested = () => {
    if (!newFullName.trim()) {
      setMessage({ type: 'error', text: 'Escriba primero el Apellido y Nombre para generar sugerencias.' });
      return;
    }
    const cleanName = newFullName.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, '');
    const shortUser = `jefe.${cleanName.slice(0, 10)}`;
    const randomPass = `guardia${Math.floor(1000 + Math.random() * 9000)}`;
    setNewUsername(shortUser);
    setNewPassword(randomPass);
    setMessage({ type: 'success', text: '✓ Usuario y contraseña sugeridos generados automáticamente.' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const trimmedUser = newUsername.trim().toLowerCase();
    if (!trimmedUser || !newPassword.trim() || !newFullName.trim()) {
      setMessage({ type: 'error', text: 'Por favor complete todos los campos obligatorios (*).' });
      return;
    }

    if (users.some(u => u.username.toLowerCase() === trimmedUser)) {
      setMessage({ type: 'error', text: `El usuario "${trimmedUser}" ya existe en el sistema. Elija otro nombre.` });
      return;
    }

    const targetService = services.find(s => s.id === newServiceId);

    const newUser: UserAccount = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      username: trimmedUser,
      password: newPassword.trim(),
      fullName: newFullName.trim(),
      role: newRole,
      roleTitle: newRoleTitle.trim() || (newRole === 'rrhh' 
        ? 'Jefe de Recursos Humanos (Administrador General)' 
        : `Jefe / Encargado de Carga de Guardias de ${targetService?.config?.serviceName || targetService?.name || 'Servicio'}`),
      serviceId: newRole === 'rrhh' ? null : newServiceId,
      serviceName: newRole === 'rrhh' ? 'Dirección Central de Recursos Humanos' : (targetService?.config?.serviceName || targetService?.name || 'Servicio Hospitalario'),
      legajo: newLegajo.trim() || undefined,
      avatarIcon: newRole === 'rrhh' ? 'ShieldCheck' : 'Building2',
    };

    const updated = [...users, newUser];
    setUsers(updated);
    saveAllUsers(updated);

    setMessage({ type: 'success', text: `✓ ¡Usuario "${newUser.fullName}" dado de alta con éxito! Ya puede iniciar sesión y cargar guardias.` });
    setNewUsername('');
    setNewPassword('');
    setNewFullName('');
    setNewRoleTitle('');
    setNewLegajo('');
    setTimeout(() => setActiveTab('list'), 1500);
  };

  const handleSavePassword = (userId: string) => {
    if (!editPasswordValue.trim()) return;
    const updated = users.map(u => u.id === userId ? { ...u, password: editPasswordValue.trim() } : u);
    setUsers(updated);
    saveAllUsers(updated);
    setEditingUserId(null);
    setEditPasswordValue('');
    setMessage({ type: 'success', text: '✓ Contraseña actualizada correctamente.' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      alert('No puede eliminar su propio usuario de Administrador con sesión activa.');
      return;
    }
    if (users.length <= 1) {
      alert('Debe existir al menos un usuario en el sistema.');
      return;
    }
    if (!confirm('¿Está seguro de dar de baja / eliminar esta cuenta de acceso?')) return;

    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    saveAllUsers(updated);
    setMessage({ type: 'success', text: '✓ Cuenta de usuario eliminada del sistema.' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950 border border-emerald-700/60 text-emerald-400 rounded-xl">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Panel de Alta y Administración de Usuarios
                </h2>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800/60 font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Jefe RRHH (Administrador)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dar de alta encargados/as de cargar guardias hospitalarias y gestionar permisos institucionales
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            ➕ Dar de Alta Usuario que Cargará Guardias
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Usuarios Registrados ({users.length})
          </button>
        </div>

        {/* Feedback message */}
        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-200' : 'bg-rose-950/80 border border-rose-700 text-rose-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <UserPlus className="w-4 h-4" />
                    <span>Formulario de Alta de Usuario para Carga de Guardias</span>
                  </div>
                  <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Rol: Encargado de Carga / Jefe
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Apellido y Nombre del Encargado / Jefe *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ej: Dr. Ramírez, Juan Pablo"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Matrícula Profesional / Legajo *
                    </label>
                    <input
                      type="text"
                      placeholder="ej: M.P. 5120 o LEG-3890"
                      value={newLegajo}
                      onChange={(e) => setNewLegajo(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Tipo de Permiso / Rol *
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'jefe_servicio' | 'rrhh')}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    >
                      <option value="jefe_servicio">Encargado de Cargar Guardias (Solo ve y carga su servicio)</option>
                      <option value="rrhh">Jefe de Recursos Humanos (Administrador General)</option>
                    </select>
                  </div>

                  {newRole === 'jefe_servicio' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Servicio Hospitalario a su Cargo *
                      </label>
                      <select
                        value={newServiceId}
                        onChange={(e) => setNewServiceId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-emerald-600/60 text-emerald-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.config?.serviceName || s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Cargo / Título Institucional
                      </label>
                      <input
                        type="text"
                        placeholder="ej: Jefe de Recursos Humanos / Administrador"
                        value={newRoleTitle}
                        onChange={(e) => setNewRoleTitle(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>

                {/* Credentials */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Credenciales de Acceso
                    </span>
                    <button
                      type="button"
                      onClick={handleGenerateSuggested}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-700/60 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      Sugerir Usuario y Contraseña
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Nombre de Usuario para Login *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ej: jefe.guardia o juan.ramirez"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Contraseña de Acceso *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ej: guardia2026"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-amber-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-300 flex items-start gap-2">
                  <ClipboardList className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Aislamiento y Seguridad:</strong> El usuario creado podrá ingresar inmediatamente al sistema. Únicamente tendrá acceso para ver, cargar agentes y liquidar las guardias del servicio asignado.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Ver Lista de Usuarios
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Dar de Alta y Habilitar para Cargar Guardias
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Usuarios habilitados en el sistema hospitalario y sus respectivos servicios asignados:
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  + Nuevo Usuario
                </button>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
                {users.map((u) => {
                  const isRRHH = u.role === 'rrhh';
                  const isEditingPass = editingUserId === u.id;

                  return (
                    <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl mt-0.5 ${isRRHH ? 'bg-amber-950/60 text-amber-400 border border-amber-700/60' : 'bg-slate-800 text-slate-300'}`}>
                          {isRRHH ? <Crown className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{u.fullName}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isRRHH ? 'bg-amber-950 text-amber-300 border border-amber-700/80' : 'bg-blue-950 text-blue-300 border border-blue-800/50'
                            }`}>
                              {isRRHH ? '👑 Administrador General RRHH' : 'Encargado de Guardias'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {u.roleTitle} {u.legajo ? `• ${u.legajo}` : ''}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono mt-1">
                            <span>Usuario: <strong className="text-slate-300">{u.username}</strong></span>
                            <span>•</span>
                            <span>Servicio: <strong className="text-emerald-400">{u.serviceName || (isRRHH ? 'Auditoría Global (Todos)' : 'No especificado')}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Password & Actions */}
                      <div className="flex items-center gap-2 shrink-0 sm:self-center">
                        {isEditingPass ? (
                          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-700">
                            <input
                              type="text"
                              placeholder="Nueva contraseña"
                              value={editPasswordValue}
                              onChange={(e) => setEditPasswordValue(e.target.value)}
                              className="text-xs px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white w-32 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                              onClick={() => handleSavePassword(u.id)}
                              className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs cursor-pointer"
                              title="Guardar"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-slate-900 border border-slate-800 text-amber-300 font-bold px-2 py-1 rounded">
                              Pass: {u.password}
                            </span>
                            <button
                              onClick={() => {
                                setEditingUserId(u.id);
                                setEditPasswordValue(u.password || '');
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition-colors cursor-pointer"
                              title="Modificar Contraseña"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-slate-300" />
                            </button>
                            {u.id !== currentUser.id && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-lg text-xs transition-colors cursor-pointer"
                                title="Dar de baja / Eliminar usuario"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>El <strong>Jefe de Recursos Humanos</strong> posee privilegios de Administrador General sobre todas las cuentas.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  );
};

