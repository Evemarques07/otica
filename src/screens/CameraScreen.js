// src/screens/CameraScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';

// MUDANÇA 1: Importações atualizadas para a nova API
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen({ navigation }) {
  // MUDANÇA 2: Usando o hook useCameraPermissions em vez da função antiga
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const data = await cameraRef.current.takePictureAsync({ quality: 1 });
        console.log('LOG: Foto tirada com sucesso. URI:', data.uri);
        navigation.navigate('Adjust', { imageUri: data.uri });
      } catch (error) {
        console.error("LOG: Erro ao tirar a foto:", error);
        Alert.alert("Erro", "Não foi possível capturar a imagem.");
      }
    }
  };

  // MUDANÇA 3: Nova lógica para verificar as permissões
  // Se as permissões ainda estão carregando
  if (!permission) {
    return <View />;
  }

  // Se as permissões não foram concedidas
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

  // Se as permissões foram concedidas, mostra a câmera
  return (
    <View style={styles.container}>
      {/* MUDANÇA 4: O componente agora é <CameraView> e a prop é 'facing' */}
      <CameraView 
        style={styles.camera} 
        facing="front"
        ref={cameraRef} // MUDANÇA 5: A ref agora é para o CameraView
      >
        <View style={styles.buttonContainer}>
          {/* Usando TouchableOpacity para um botão mais estilizado, como no exemplo */}
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <View style={styles.innerButton} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  // Estilos para um botão de câmera mais bonito
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