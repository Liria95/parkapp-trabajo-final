import { API_URLS } from '../config/api.config';

const API_URL = API_URLS.MANUAL_REGISTRATION;
const FINES_API_URL = API_URLS.FINES;

// INTERFACES

export interface UsuarioEncontrado {
  id: string;
  vehicleId: string;
  nombre: string;
  email: string;
  telefono: string;
  saldo: number;
  patente: string;
}

export interface EspacioDisponible {
  id: string;
  numero: string;
  ubicacion: string;
  tarifaPorHora: number;
  latitude?: number;
  longitude?: number;
  distancia?: number;
}

export interface RegistroUsuarioData {
  userId: string;
  vehicleId: string;
  parkingSpaceId: string;
  sendNotification: boolean;
}

export interface RegistroVisitanteData {
  licensePlate: string;
  parkingSpaceId: string;
  hours: number;
}

export interface SessionData {
  sessionId: string;
  startTime: string;
  ubicacion: string;
  espacioCodigo: string;
  tarifaPorHora: number;
  usuario: {
    nombre: string;
    email: string;
  };
}

export interface VisitorData {
  userId: string;
  vehicleId: string;
  sessionId: string;
  startTime: string;
  endTime: string;
  ubicacion: string;
  espacioCodigo: string;
  tarifaPorHora: number;
  hours: number;
  totalAmount: number;
}

export interface MultaData {
  userId: string;
  licensePlate: string;
  reason: string;
  amount: number;
  location: string;
  parkingSpaceId?: string;
  parkingSessionId?: string;
}

export interface MultaResponse {
  fineId: string;
  numero: string;
}

export interface VisitorFineData {
  licensePlate: string;
  visitorName: string;
  parkingSpaceId: string;
  reason: string;
  amount: number;
  location: string;
}

export interface VisitorFineResponse {
  userId: string;
  fineId: string;
  fineNumero: string;
}

// SERVICE CLASS

export class ManualRegistrationService {
  
  static async searchByPlate(
    licensePlate: string,
    authToken: string
  ): Promise<{
    success: boolean;
    found: boolean;
    user?: UsuarioEncontrado;
    message?: string;
  }> {
    try {
      console.log('Buscando usuario por patente:', licensePlate);
      console.log('URL:', `${API_URL}/search-by-plate/${licensePlate}`);
      console.log('Token (primeros 20 chars):', authToken.substring(0, 20));

      const response = await fetch(`${API_URL}/search-by-plate/${licensePlate}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Status de respuesta:', response.status);
      console.log('Status text:', response.statusText);

      const data = await response.json();
      console.log('Datos recibidos completos:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        if (data.found && data.user) {
          console.log('Usuario encontrado:', data.user.nombre);
          console.log('Email:', data.user.email);
          console.log('Patente:', data.user.patente);
          return {
            success: true,
            found: true,
            user: data.user,
            message: data.message,
          };
        } else {
          console.log('Respuesta exitosa pero usuario no encontrado');
          return {
            success: true,
            found: false,
            message: data.message || 'Usuario no encontrado con esta patente',
          };
        }
      } else {
        console.log('Error en respuesta del servidor:', data.message);
        return {
          success: false,
          found: false,
          message: data.message || 'Error al buscar usuario',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión al buscar usuario:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      return {
        success: false,
        found: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }

  static async getAvailableSpaces(
    authToken: string,
    location?: { latitude: number; longitude: number; radius?: number }
  ): Promise<{
    success: boolean;
    espacios?: EspacioDisponible[];
    message?: string;
  }> {
    try {
      console.log('Obteniendo espacios disponibles...');
      
      let url = `${API_URL}/available-spaces`;
      
      if (location) {
        const params = new URLSearchParams({
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          ...(location.radius && { radius: location.radius.toString() })
        });
        url = `${url}?${params.toString()}`;
        console.log('Con ubicación GPS:', location);
      } else {
        console.log('Sin ubicación GPS');
      }
      
      console.log('URL completa:', url);
      console.log('Token (primeros 20 chars):', authToken.substring(0, 20));

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Status de respuesta:', response.status);
      console.log('Status text:', response.statusText);

      const data = await response.json();
      console.log('Datos recibidos:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        console.log('Espacios obtenidos:', data.espacios?.length || 0);
        if (data.ordenadoPor) {
          console.log('Ordenados por:', data.ordenadoPor);
        }
        return {
          success: true,
          espacios: data.espacios,
        };
      } else {
        console.log('Error en respuesta:', data.message);
        return {
          success: false,
          message: data.message || 'Error al obtener espacios',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión al obtener espacios:', error);
      console.error('Error message:', error.message);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }

  static async getUserVehicles(
    userId: string,
    authToken: string
  ): Promise<{
    success: boolean;
    vehicles?: Array<{ id: string; license_plate: string }>;
    message?: string;
  }> {
    try {
      console.log('Obteniendo vehículos del usuario:', userId);

      const response = await fetch(`${API_URL}/user/${userId}/vehicles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Status de respuesta:', response.status);

      const data = await response.json();
      console.log('Datos recibidos:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        console.log('Vehículos obtenidos:', data.vehicles?.length || 0);
        return {
          success: true,
          vehicles: data.vehicles,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener vehículos',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión al obtener vehículos:', error);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }

  static async registerUser(
    registroData: RegistroUsuarioData,
    authToken: string
  ): Promise<{
    success: boolean;
    data?: SessionData;
    message?: string;
  }> {
    try {
      console.log('Registrando usuario con cuenta...');
      console.log('Datos de registro:', JSON.stringify(registroData, null, 2));

      const response = await fetch(`${API_URL}/register-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registroData),
      });

      console.log('Status de respuesta:', response.status);

      const responseData = await response.json();
      console.log('Datos recibidos:', JSON.stringify(responseData, null, 2));

      if (response.ok && responseData.success) {
        console.log('Usuario registrado exitosamente:', responseData.data?.sessionId);
        return {
          success: true,
          data: responseData.data,
          message: responseData.message,
        };
      } else {
        console.log('Error al registrar:', responseData.message);
        return {
          success: false,
          message: responseData.message || 'Error al registrar usuario',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión al registrar usuario:', error);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }

  static async registerVisitor(
    visitanteData: RegistroVisitanteData,
    authToken: string
  ): Promise<{
    success: boolean;
    data?: VisitorData;
    message?: string;
  }> {
    try {
      console.log('Registrando visitante en tabla users...');
      console.log('Datos de visitante:', JSON.stringify(visitanteData, null, 2));

      const response = await fetch(`${API_URL}/register-visitor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitanteData),
      });

      console.log('Status de respuesta:', response.status);

      const responseData = await response.json();
      console.log('Datos recibidos:', JSON.stringify(responseData, null, 2));

      if (response.ok && responseData.success) {
        console.log('Visitante registrado exitosamente');
        console.log('  - User ID:', responseData.data?.userId);
        console.log('  - Vehicle ID:', responseData.data?.vehicleId);
        console.log('  - Session ID:', responseData.data?.sessionId);
        return {
          success: true,
          data: responseData.data,
          message: responseData.message,
        };
      } else {
        console.log('Error al registrar visitante:', responseData.message);
        return {
          success: false,
          message: responseData.message || 'Error al registrar visitante',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión al registrar visitante:', error);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }

  static async createFine(
    multaData: MultaData,
    authToken: string
  ): Promise<{
    success: boolean;
    data?: MultaResponse;
    message?: string;
  }> {
    try {
      console.log('Creando multa...');
      console.log('Datos de multa:', JSON.stringify(multaData, null, 2));
      console.log('URL:', `${FINES_API_URL}/create`);

      const response = await fetch(`${FINES_API_URL}/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(multaData),
      });

      console.log('Status de respuesta:', response.status);

      const responseData = await response.json();
      console.log('Datos recibidos:', JSON.stringify(responseData, null, 2));

      if (response.ok && responseData.success) {
        console.log('Multa creada exitosamente:', responseData.fineId);
        return {
          success: true,
          data: {
            fineId: responseData.fineId,
            numero: responseData.numero
          },
          message: responseData.message,
        };
      } else {
        console.log('Error al crear multa:', responseData.message);
        return {
          success: false,
          message: responseData.message || 'Error al crear multa',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión al crear multa:', error);
      console.error('Stack:', error.stack);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }

  static async createVisitorFine(
    visitorFineData: VisitorFineData,
    authToken: string
  ): Promise<{
    success: boolean;
    data?: VisitorFineResponse;
    message?: string;
  }> {
    try {
      console.log('Creando multa para visitante no registrado...');
      console.log('Datos:', JSON.stringify(visitorFineData, null, 2));
      console.log('URL:', `${API_URL}/visitor-fine`);

      const response = await fetch(`${API_URL}/visitor-fine`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitorFineData),
      });

      console.log('Status de respuesta:', response.status);

      const responseData = await response.json();
      console.log('Datos recibidos:', JSON.stringify(responseData, null, 2));

      if (response.ok && responseData.success) {
        console.log('Multa a visitante creada exitosamente');
        return {
          success: true,
          data: {
            userId: responseData.userId,
            fineId: responseData.fineId,
            fineNumero: responseData.fineNumero
          },
          message: responseData.message,
        };
      } else {
        console.log('Error al crear multa a visitante:', responseData.message);
        return {
          success: false,
          message: responseData.message || 'Error al crear multa a visitante',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }

  static async endSession(
    sessionId: string,
    authToken: string
  ): Promise<{
    success: boolean;
    data?: {
      hoursElapsed: number;
      totalAmount: number;
      newBalance: number;
    };
    message?: string;
  }> {
    try {
      console.log('Finalizando sesión:', sessionId);

      const response = await fetch(`${API_URL}/end-session/${sessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Sesión finalizada exitosamente');
        return {
          success: true,
          data: data.data,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al finalizar sesión',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión al finalizar sesión:', error);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }
}
