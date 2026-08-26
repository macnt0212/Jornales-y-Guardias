import { UserAccount, HospitalAuthSession, HospitalServiceItem } from '../types';

export const USERS_STORAGE_KEY = 'hcef_user_accounts';
export const CURRENT_SESSION_STORAGE_KEY = 'hcef_current_session';

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'user_rrhh_1',
    username: 'rrhh.central',
    password: 'rrhh2026',
    fullName: 'Lic. Administrador Central de Personal',
    role: 'rrhh',
    roleTitle: 'Jefe de Recursos Humanos (ADMINISTRADOR GENERAL DEL SISTEMA)',
    serviceId: null, // Acceso total e irrestricto a todos los servicios y gestión de usuarios
    serviceName: 'Dirección Central de Recursos Humanos y Personal',
    legajo: 'RRHH-ADMIN-01',
    avatarIcon: 'ShieldCheck',
  },
  {
    id: 'user_jefe_info',
    username: 'jefe.informatica',
    password: 'info2026',
    fullName: 'Escobar, Eduardo Martin',
    role: 'jefe_servicio',
    roleTitle: 'Jefe / Encargado de Carga de Informática y Estadística',
    serviceId: 'serv_informatica',
    serviceName: 'Servicio de Informática y Estadística',
    legajo: 'LEG-4820',
    avatarIcon: 'Server',
  },
  {
    id: 'user_jefe_guardia',
    username: 'jefe.guardia',
    password: 'guardia2026',
    fullName: 'Dr. Benítez, Carlos Alberto',
    role: 'jefe_servicio',
    roleTitle: 'Jefe / Encargado de Carga de Guardia Central',
    serviceId: 'serv_guardia_medica',
    serviceName: 'Servicio de Guardia Central y Emergencias',
    legajo: 'M.P. 3140',
    avatarIcon: 'Stethoscope',
  },
  {
    id: 'user_jefe_enf',
    username: 'jefe.enfermeria',
    password: 'enfermeria2026',
    fullName: 'Lic. Sosa, Patricia Beatriz',
    role: 'jefe_servicio',
    roleTitle: 'Jefa / Encargada de Carga de Enfermería',
    serviceId: 'serv_enfermeria',
    serviceName: 'Servicio de Enfermería y Cuidados Críticos',
    legajo: 'LEG-3912',
    avatarIcon: 'HeartHandshake',
  },
  {
    id: 'user_jefe_lab',
    username: 'jefe.laboratorio',
    password: 'lab2026',
    fullName: 'Bioq. Coronel, Andrea Silvina',
    role: 'jefe_servicio',
    roleTitle: 'Jefa / Encargada de Carga de Diagnóstico por Imágenes',
    serviceId: 'serv_laboratorio',
    serviceName: 'Servicio de Diagnóstico por Imágenes y Bioquímica',
    legajo: 'M.P. 1820',
    avatarIcon: 'Activity',
  },
];

export function loadAllUsers(): UserAccount[] {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      const parsed: UserAccount[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading users:', e);
  }
  return INITIAL_USER_ACCOUNTS;
}

export function saveAllUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users:', e);
  }
}

export function getCurrentSession(): HospitalAuthSession | null {
  try {
    const saved = localStorage.getItem(CURRENT_SESSION_STORAGE_KEY);
    if (saved) {
      const parsed: HospitalAuthSession = JSON.parse(saved);
      if (parsed && parsed.user) {
        // Refresh with latest data from user accounts if available
        const allUsers = loadAllUsers();
        const freshUser = allUsers.find(u => u.id === parsed.user.id);
        if (freshUser) {
          return {
            ...parsed,
            user: freshUser,
          };
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading current session:', e);
  }
  return null;
}

export function setCurrentSession(session: HospitalAuthSession | null): void {
  try {
    if (session) {
      localStorage.setItem(CURRENT_SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(CURRENT_SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error saving current session:', e);
  }
}

export function authenticateUser(username: string, password: string): UserAccount | null {
  const allUsers = loadAllUsers();
  const trimmedUser = username.trim().toLowerCase();
  const trimmedPass = password.trim();

  const found = allUsers.find(
    u => u.username.toLowerCase() === trimmedUser && (u.password || '') === trimmedPass
  );

  return found || null;
}

export function canAccessService(user: UserAccount | null, serviceId: string): boolean {
  if (!user) return false;
  if (user.role === 'rrhh') return true; // RRHH has global supervisor access
  return user.serviceId === serviceId; // Jefe can only access their designated service
}

export function registerUserForNewService(
  serviceOrId: HospitalServiceItem | string,
  serviceNameOrJefe?: string,
  jefeNameOrLegajo?: string,
  jefeLegajoParam?: string,
  customUsername?: string,
  customPassword?: string
): UserAccount {
  const users = loadAllUsers();

  let serviceId = '';
  let serviceName = '';
  let jefeName = '';
  let jefeLegajo = '';

  if (typeof serviceOrId === 'object') {
    serviceId = serviceOrId.id;
    serviceName = serviceOrId.config?.serviceName || serviceOrId.name;
    jefeName = serviceNameOrJefe || serviceOrId.config?.jefeName || `Jefe/a de ${serviceName}`;
    jefeLegajo = jefeNameOrLegajo || serviceOrId.config?.jefeLegajo || 'LEG-NEW';
  } else {
    serviceId = serviceOrId;
    serviceName = serviceNameOrJefe || 'Servicio Hospitalario';
    jefeName = jefeNameOrLegajo || `Jefe/a de ${serviceName}`;
    jefeLegajo = jefeLegajoParam || 'LEG-NEW';
  }

  // Generate a clean default username if not provided
  let generatedUsername = customUsername?.trim().toLowerCase();
  if (!generatedUsername) {
    const cleanServiceName = serviceName
      .toLowerCase()
      .replace(/servicio\s+de\s+/gi, '')
      .replace(/[^a-z0-9]/gi, '_')
      .slice(0, 15);
    generatedUsername = `jefe.${cleanServiceName}`;
  }

  // Ensure username uniqueness
  let finalUsername = generatedUsername;
  let counter = 1;
  while (users.some(u => u.username.toLowerCase() === finalUsername.toLowerCase())) {
    finalUsername = `${generatedUsername}_${counter}`;
    counter++;
  }

  const newUser: UserAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    username: finalUsername,
    password: customPassword?.trim() || 'hospital2026',
    fullName: jefeName.trim() || `Jefe/a de ${serviceName}`,
    role: 'jefe_servicio',
    roleTitle: `Jefe/a de ${serviceName}`,
    serviceId: serviceId,
    serviceName: serviceName,
    legajo: jefeLegajo || 'LEG-NEW',
    avatarIcon: 'Building2',
  };

  const updatedUsers = [...users, newUser];
  saveAllUsers(updatedUsers);
  return newUser;
}
