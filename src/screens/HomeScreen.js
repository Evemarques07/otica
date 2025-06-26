import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  colors,
  layout,
  typography,
  components,
  spacing,
} from '../styles/theme';
import CustomModal from '../components/CustomModal';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
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

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showModal(
          'Permissão Necessária',
          'Precisamos de acesso à sua galeria de fotos para que você possa selecionar uma imagem.',
          [{ text: 'OK', onPress: hideModal, style: 'primary' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        navigation.navigate('Adjust', { imageUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Erro ao abrir a galeria:', error);
      showModal(
        'Ops, ocorreu um erro',
        'Não foi possível abrir a galeria de imagens. Por favor, tente novamente.',
        [{ text: 'OK', onPress: hideModal, style: 'primary' }]
      );
    }
  };

  return (
    <View style={[layout.container, styles.homeContainer]}>
      <View style={styles.header}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} />
        <Text style={styles.title}>Medidor Inteligente</Text>
        <Text style={styles.subtitle}>
          Precisão e praticidade para suas medições ópticas.
        </Text>
      </View>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={components.buttonPrimary}
          onPress={() => navigation.navigate('Camera')}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="camera-outline" size={22} color={colors.surface} />
            <Text style={components.buttonPrimaryText}>Tirar Foto</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={components.buttonSecondary}
          onPress={pickImage}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="image-outline" size={22} color={colors.primary} />
            <Text style={components.buttonSecondaryText}>
              Escolher da Galeria
            </Text>
          </View>
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
  homeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.l,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  subtitle: {
    ...typography.subheadline,
    textAlign: 'center',
    maxWidth: '90%',
  },
  buttonWrapper: {
    width: '100%',
    marginVertical: spacing.s,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
});
