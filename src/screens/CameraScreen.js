import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons'; // NOVO: Importando ícones

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  // NOVO: Estado para controlar a câmera (front ou back)
  const [facing, setFacing] = useState('front');

  // NOVO: Função para alternar a câmera
  function toggleCameraFacing() {
    setFacing((current) => (current === 'front' ? 'back' : 'front'));
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const data = await cameraRef.current.takePictureAsync({ quality: 1 });
        console.log('LOG: Foto tirada com sucesso. URI:', data.uri);
        navigation.navigate('Adjust', { imageUri: data.uri });
      } catch (error) {
        console.error('LOG: Erro ao tirar a foto:', error);
        Alert.alert('Erro', 'Não foi possível capturar a imagem.');
      }
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          Precisamos da sua permissão para mostrar a câmera.
        </Text>
        <Button onPress={requestPermission} title="Conceder Permissão" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing} // NOVO: Usando o estado dinâmico
        ref={cameraRef}
      />

      {/* NOVO: Container para o botão de troca de câmera */}
      <View style={styles.topControlsContainer}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleCameraFacing}
        >
          <Ionicons name="camera-reverse-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <View style={styles.innerButton} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // NOVO: Estilo para o container dos controles superiores
  topControlsContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  // NOVO: Estilo para o botão de troca
  toggleButton: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 50,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'gray',
  },
  innerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
  },
});
