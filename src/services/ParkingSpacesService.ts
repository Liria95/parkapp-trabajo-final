import { API_URLS } from '../config/api.config';

const API_URL = API_URLS.PARKING_SPACES || `${API_URLS.USERS}/parking-spaces`;

export interface ParkingSpace {
  id: string;
  spaceCode: string;
  streetAddress: string;
  status: 'available' | 'occupied';
  feePerHour: number;
  latitude?: number;
  longitude?: number;
}

export interface EspacioDisponible {
  id: string;
  numero: string;
  ubicacion: string;
  tarifaPorHora: number;
  latitude: number;
  longitude: number;
  distancia?: number;
}

export interface SpacesStats {
  total: number;
  available: number;
  occupied: number;
}

export interface ParkingSession {
  id: string;
  licensePlate: string;
  spaceNumber?: string;
  spaceCode?: string;
  location?: string;
  streetAddress?: string;
  userName?: string;
  startTime: string;
  rate?: number;
  feePerHour?: number;
  userId?: string;
  isVisitor?: boolean;
  status: 'active' | 'completed';
}

export class ParkingSpacesService {
  
  static async getAvailableSpacesForUser(
    authToken: string,
    location?: {
      latitude: number;
      longitude: number;
      radius?: number;
    }
  ): Promise<{
    success: boolean;
    espacios?: EspacioDisponible[];
    total?: number;
    message?: string;
  }> {
    try {
      console.log('Obteniendo espacios disponibles para usuario...');
      console.log('Ubicacion:', location);

      let url = `${API_URL}/available`;
      
      if (location) {
        const params = new URLSearchParams({
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          ...(location.radius && { radius: location.radius.toString() })
        });
        url += `?${params.toString()}`;
      }

      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Status de respuesta:', response.status);

      const data = await response.json();
      console.log('Espacios recibidos:', data.total);

      if (response.ok && data.success) {
        return {
          success: true,
          espacios: data.espacios,
          total: data.total
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener espacios',
        };
      }
    } catch (error: any) {
      console.error('Error de conexion:', error);
      return {
        success: false,
        message: `Error de conexion: ${error.message}`,
      };
    }
  }

  static async getSpacesStats(
    authToken: string
  ): Promise<{
    success: boolean;
    stats?: SpacesStats;
    activeSessions?: ParkingSession[];
    message?: string;
  }> {
    try {
      console.log('Obteniendo estadisticas de espacios...');

      const response = await fetch(
        `${API_URLS.USERS.replace('/users', '')}/parking-sessions/stats`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Status de respuesta:', response.status);

      const data = await response.json();
      console.log('Datos recibidos:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        console.log('Estadísticas obtenidas:', data.stats);
        
        const mappedSessions: ParkingSession[] = data.activeSessions 
          ? data.activeSessions.map((session: any) => ({
              id: session.id,
              licensePlate: session.licensePlate,
              spaceCode: session.spaceCode,
              streetAddress: session.streetAddress,
              startTime: session.startTime,
              feePerHour: session.feePerHour,
              userId: session.userId,
              isVisitor: session.isVisitor || false,
              status: 'active' as const
            }))
          : [];

        return {
          success: true,
          stats: data.stats,
          activeSessions: mappedSessions
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener estadisticas',
        };
      }
    } catch (error: any) {
      console.error('Error de conexion:', error);
      return {
        success: false,
        message: `Error de conexion: ${error.message}`,
      };
    }
  }

  static async getAllSpaces(
    authToken: string
  ): Promise<{
    success: boolean;
    spaces?: ParkingSpace[];
    message?: string;
  }> {
    try {
      console.log('Obteniendo todos los espacios...');

      const response = await fetch(`${API_URL}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          spaces: data.spaces,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener espacios',
        };
      }
    } catch (error: any) {
      console.error('Error de conexion:', error);
      return {
        success: false,
        message: `Error de conexion: ${error.message}`,
      };
    }
  }
}
