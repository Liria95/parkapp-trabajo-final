export interface User {
  id: number,
  email: string;
  password: string;
  type: 'admin' | 'user';
  name: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  isAdmin: boolean;
  message?: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export class AuthService {
  private static SYSTEM_ADMINS: User[] = [
    { 
      id: 1,
      email: 'admin@parkapp.com', 
      password: 'admin123', 
      type: 'admin', 
      name: 'Super Administrador' 
    },
    { 
      id: 2,
      email: 'admin@gmail.com', 
      password: 'admin123', 
      type: 'admin', 
      name: 'Admin Principal' 
    },
    { 
      id: 3,
      email: 'soporte@parkapp.com', 
      password: 'soporte123', 
      type: 'admin', 
      name: 'Soporte Técnico' 
    },
  ];

  // lista de usuarios finales hardcodeados
  private static SYSTEM_USERS: User[] = [
    { 
      email: 'usuario@gmail.com', 
      password: '123456', 
      type: 'user', 
      name: 'Juan Pérez' 
    },
    { 
      email: 'maria@gmail.com', 
      password: 'maria123', 
      type: 'user', 
      name: 'María González' 
    },
    { 
      email: 'carlos@gmail.com', 
      password: 'carlos456', 
      type: 'user', 
      name: 'Carlos Rodriguez' 
    },
    { 
      email: 'ana@gmail.com', 
      password: 'ana789', 
      type: 'user', 
      name: 'Ana Martinez' 
    },
  ];

  static async login(email: string, password: string): Promise<LoginResult> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar si es un admin del sistema
    const adminUser = this.SYSTEM_ADMINS.find(admin => 
      admin.email === email && admin.password === password
    );
    
    if (adminUser) {
      return {
        success: true,
        user: adminUser,
        isAdmin: true,
        message: `Bienvenido ${adminUser.name}`,
      };
    }

    // Verificar si es un usuario final registrado
    const regularUser = this.SYSTEM_USERS.find(user => 
      user.email === email && user.password === password
    );
    
    if (regularUser) {
      return {
        success: true,
        user: regularUser,
        isAdmin: false,
        message: `Bienvenido ${regularUser.name}`,
      };
    }

    // Si no encuentra el usuario o la contraseña es incorrecta
    return {
      success: false,
      isAdmin: false,
      message: 'Email o contraseña incorrectos',
    };
  }

  static async register(data: RegisterData): Promise<LoginResult> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Verificar si el email ya existe
    const emailExists = [...this.SYSTEM_ADMINS, ...this.SYSTEM_USERS]
      .some(user => user.email === data.email);

    if (emailExists) {
      return {
        success: false,
        isAdmin: false,
        message: 'Este email ya está registrado',
      };
    }

    // Simular registro exitoso
    const newUser: User = {
      email: data.email,
      password: data.password,
      type: 'user',
      name: data.fullName
    };

    return {
      success: true,
      user: newUser,
      isAdmin: false,
      message: `¡Bienvenido ${data.fullName}!\nTu cuenta ha sido creada exitosamente.`,
    };
  }

  static isAdminEmail(email: string): boolean {
    return this.SYSTEM_ADMINS.some(admin => admin.email === email);
  }

  // Método útil para debugging
  static getAvailableUsers(): { admins: User[], users: User[] } {
    return {
      admins: this.SYSTEM_ADMINS,
      users: this.SYSTEM_USERS
    };
  }
}