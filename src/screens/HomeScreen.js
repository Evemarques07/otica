import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen({ navigation }) {
  const pickImage = async () => {
    try {
      // LOG: Verificando status da permissão atual
      console.log('LOG: Solicitando permissão da galeria...');
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      // LOG: Exibindo o status retornado
      console.log(`LOG: Status da permissão da galeria: ${status}`);

      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de acesso à sua galeria para continuar.'
        );
        return;
      }

      // LOG: Se a permissão foi concedida, tentamos abrir a galeria
      console.log('LOG: Permissão concedida. Abrindo a galeria...');
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: false,
        quality: 1,
      });

      // LOG: Exibindo o resultado da galeria (se o usuário cancelou ou escolheu uma imagem)
      console.log(
        'LOG: Resultado da galeria:',
        JSON.stringify(result, null, 2)
      );

      if (!result.canceled) {
        console.log(
          'LOG: Imagem selecionada. Navegando para a tela de ajuste...'
        );
        navigation.navigate('Adjust', { imageUri: result.assets[0].uri });
      } else {
        console.log('LOG: Usuário cancelou a seleção da galeria.');
      }
    } catch (error) {
      // LOG: Capturando qualquer erro inesperado
      console.error('LOG: Erro ao tentar abrir a galeria:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria de imagens.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medidor</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Tirar Foto"
          onPress={() => navigation.navigate('Camera')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Escolher da Galeria" onPress={pickImage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  buttonContainer: {
    width: '80%',
    marginVertical: 10,
  },
});
