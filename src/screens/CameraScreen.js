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

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

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
      {/* A CameraView agora não tem filhos */}
      <CameraView style={styles.camera} facing="front" ref={cameraRef} />
      {/* O buttonContainer é um irmão da CameraView e está posicionado de forma absoluta */}
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
    // IMPORTANTE: Adicione 'position: relative' ou defina flex: 1 no container pai
    // para que o posicionamento absoluto do buttonContainer funcione corretamente em relação a ele.
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
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    // IMPORTANTE: Adicione um zIndex para garantir que o botão esteja sempre acima da câmera
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
