import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  layout,
  typography,
  components,
  spacing,
} from '../styles/theme';
import CustomModal from '../components/CustomModal';
import { ActivityIndicator } from 'react-native';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState('back');
  const [modalInfo, setModalInfo] = useState({
    isVisible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showModal = (title, message, buttons) => {
    setModalInfo({ isVisible: true, title, message, buttons });
  };

  const hideModal = () => {
    setModalInfo({ ...modalInfo, isVisible: false });
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const data = await cameraRef.current.takePictureAsync({
          quality: 1,
          skipProcessing: true,
        });
        navigation.navigate('Adjust', {
          imageUri: data.uri,
          originalImageWidth: data.width,
          originalImageHeight: data.height,
        });
      } catch (error) {
        console.error('Erro ao tirar a foto:', error);
        showModal(
          'Erro ao Capturar',
          'Não foi possível registrar a imagem. Por favor, tente novamente.',
          [{ text: 'OK', onPress: hideModal, style: 'primary' }]
        );
      }
    }
  };

  if (!permission) {
    return (
      <View style={[styles.container, layout.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          layout.container,
          layout.centered,
          { paddingHorizontal: spacing.xl },
        ]}
      >
        <Text style={styles.permissionTitle}>Acesso à Câmera</Text>
        <Text style={styles.permissionText}>
          Precisamos da sua permissão para usar a câmera e realizar a medição.
        </Text>
        <TouchableOpacity
          style={[components.buttonPrimary, { width: '100%' }]}
          onPress={requestPermission}
        >
          <Text style={components.buttonPrimaryText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        ref={cameraRef}
      />

      <View style={styles.topControlsContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleCameraFacing}
        >
          <Ionicons
            name="camera-reverse-outline"
            size={30}
            color={colors.surface}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomControlsContainer}>
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>

      <CustomModal
        isVisible={modalInfo.isVisible}
        title={modalInfo.title}
        message={modalInfo.message}
        buttons={modalInfo.buttons}
        onClose={hideModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  permissionTitle: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  permissionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  topControlsContainer: {
    position: 'absolute',
    top: 60,
    right: spacing.l,
    zIndex: 1,
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 25,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  captureButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.surface,
  },
});
