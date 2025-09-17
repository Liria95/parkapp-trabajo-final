export interface User {
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
      email: 'admin@parkapp.com', 
      password: 'admin123', 
      type: 'admin', 
      name: 'Super Administrador' 
    },
    { 
      email: 'admin@gmail.com', 
      password: 'admin123', 
      type: 'admin', 
      name: 'Admin Principal' 
    },
    { 
      email: 'soporte@parkapp.com', 
      password: 'soporte123', 
      type: 'admin', 
      name: 'Soporte Técnico' 
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

    // Validación básica para usuarios finales
    if (email && password && password.length >= 6) {
      return {
        success: true,
        isAdmin: false,
        message: `Bienvenido Usuario Final!\nEmail: ${email}`,
      };
    }

    return {
      success: false,
      isAdmin: false,
      message: 'Credenciales inválidas',
    };
  }

  static async register(data: RegisterData): Promise<LoginResult> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simular registro exitoso
    return {
      success: true,
      isAdmin: false,
      message: `¡Bienvenido ${data.fullName}!\nTu cuenta ha sido creada exitosamente.`,
    };
  }

  static isAdminEmail(email: string): boolean {
    return this.SYSTEM_ADMINS.some(admin => admin.email === email);
  }
}