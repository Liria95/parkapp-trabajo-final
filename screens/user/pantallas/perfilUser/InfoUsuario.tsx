import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import colores from '../../constantes/colores';

interface InfoUsuarioProps {
  nombre: string;
  email: string;
  avatar?: string;
  onAvatarChange?: (uri: string) => void; // ← NUEVO: callback para cuando cambie la foto
}

export default function InfoUsuario({ nombre, email, avatar, onAvatarChange }: InfoUsuarioProps) {
  const [imageUri, setImageUri] = useState<string | undefined>(avatar);

  // ← NUEVO: Función para elegir imagen de la galería
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      onAvatarChange?.(uri); // Llamar al callback del padre
    }
  };

  // ← NUEVO: Función para tomar foto con la cámara
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      onAvatarChange?.(uri); // Llamar al callback del padre
    }
  };

  // ← NUEVO: Mostrar opciones
  const showOptions = () => {
    Alert.alert(
      'Foto de Perfil',
      'Elige una opción',
      [
        { text: 'Tomar foto', onPress: takePhoto },
        { text: 'Elegir de galería', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.contenedor}>
      {/* ← CAMBIADO: Ahora es TouchableOpacity para que sea clickeable */}
      <TouchableOpacity style={styles.avatarContainer} onPress={showOptions}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.iniciales}>
              {nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
        )}
        
        {/* ← NUEVO: Botón de editar sobre la imagen */}
        <View style={styles.editButton}>
          <Ionicons name="camera" size={20} color="white" />
        </View>
      </TouchableOpacity>

      <Text style={styles.nombre}>{nombre}</Text>
      <Text style={styles.email}>{email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginHorizontal: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    position: 'relative', // ← NUEVO: para posicionar el botón
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colores.AZUL_SECUNDARIO,
    justifyContent: "center",
    alignItems: "center",
  },
  iniciales: {
    fontSize: 36,
    fontWeight: "bold",
    color: colores.BLANCO,
  },
  // ← NUEVO: Estilo del botón de cámara
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colores.AZUL_PRINCIPAL,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  nombre: {
    fontSize: 22,
    fontWeight: "bold",
    color: colores.GRIS_OSCURO,
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
});