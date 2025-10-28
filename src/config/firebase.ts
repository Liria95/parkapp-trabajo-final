import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CONFIGURACIÓN DE FIREBASE

const firebaseConfig = {
  apiKey: "AIzaSyAOUJv2TYiuQfpMRyn14OkMMsXP1KyMJ74",
  authDomain: "parkapp-57f3f.firebaseapp.com",
  projectId: "parkapp-57f3f",
  storageBucket: "parkapp-57f3f.firebasestorage.app",
  messagingSenderId: "774016319035",
  appId: "1:774016319035:web:7af9f0a8434f73f190e61e"
};

// INICIALIZAR FIREBASE
const app = initializeApp(firebaseConfig);

// EXPORTAR SERVICIOS

// Auth con persistencia en AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export default app;