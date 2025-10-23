import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../../../config/theme';

interface InfoUsuarioProps {
  nombre: string;
  email: string;
  avatar?: string;
  onAvatarChange?: (uri: string) => void;
}

export default function InfoUsuario({ nombre, email, avatar, onAvatarChange }: InfoUsuarioProps) {
  const [imageUri, setImageUri] = useState<string | undefined>(avatar);

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
      onAvatarChange?.(uri);
    }
  };

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
      onAvatarChange?.(uri);
    }
  };

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
        
        <View style={styles.editButton}>
          <Ionicons name="camera" size={20} color={theme.colors.white} />
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
    position: 'relative',
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
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  iniciales: {
    fontSize: 36,
    fontWeight: "bold",
    color: theme.colors.white,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  nombre: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
});