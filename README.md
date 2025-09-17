# ParkApp - Sistema de Estacionamiento

## Descripción

ParkApp es una aplicación móvil desarrollada con React Native y TypeScript que permite gestionar espacios de estacionamiento. La aplicación cuenta con dos tipos de usuarios: usuarios finales que buscan estacionar y administradores que gestionan el sistema.

## Funcionalidades Implementadas

### Usuario Final
- Registro de nuevos usuarios con validaciones completas
- Login con credenciales
- Formularios con validación de campos requeridos, formato de email y confirmación de contraseña

### Administrador  
- Dashboard con estadísticas en tiempo real
- Gestión de usuarios activos
- Vista de infracciones pendientes
- Registro manual de vehículos
- Navegación por tabs (Dashboard, Espacios, Usuarios)

## Tecnologías Utilizadas

- React Native con TypeScript
- Expo
- Styled Components 
- StyleSheet API
- Flexbox para diseño responsive

## Estructura del Proyecto

parkapp/
├── App.tsx                    # Componente principal con navegación
├── screens/
│   ├── LoginScreen.tsx        # Pantalla de login
│   ├── RegisterScreen.tsx     # Pantalla de registro  
│   └── AdminDashboard.tsx     # Dashboard administrativo
├── assets/
     └── logo.png              # Logo de la aplicación

## Instalación

1. Instalar dependencias:
```bash
npm install styled-components @expo/vector-icons
```

2. Ejecutar la aplicación:
```bash
npx expo start
```

## Usuarios de Prueba

**Administradores:**
- admin@gmail.com / admin123
- admin@parkapp.com / admin123

**Usuarios Finales:**
- Cualquier usuario puede registrarse

## Pantallas Implementadas

### LoginScreen
- Formulario de autenticación con validaciones
- Navegación a registro
- Detección automática de tipo de usuario

### RegisterScreen  
- Formulario completo con 5 campos validados
- Solo para usuarios finales
- Validaciones de formato y confirmación

### AdminDashboard
- 4 tarjetas de estadísticas con colores diferenciados
- Lista de usuarios activos
- Secciones de gestión e infracciones
- Navegación inferior responsive