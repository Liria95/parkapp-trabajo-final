import * as SecureStore from 'expo-secure-store';

const USER_KEY = 'user_data';

interface UserData {
    user: any;
    token?: string;
    refreshToken?: string;
}

export async function setUser(userData: UserData): Promise<void> {
    try {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
        console.log('Datos guardados en SecureStore exitosamente');
    } catch (error) {
        console.error('Error guardando en SecureStore:', error);
        throw error;
    }
}

export async function getUser(): Promise<UserData | null> {
    try {
        const userData = await SecureStore.getItemAsync(USER_KEY);
        if (userData) {
            return JSON.parse(userData);
        }
        return null;
    } catch (error) {
        console.error('Error leyendo de SecureStore:', error);
        return null;
    }
}

export async function deleteUser(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(USER_KEY);
        console.log('Datos eliminados de SecureStore exitosamente');
    } catch (error) {
        console.error('Error eliminando de SecureStore:', error);
        throw error;
    }
}