import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Button,
} from 'react-native';
// import { processImage } from '../services/measurementService'; // Não é mais necessário aqui, pois as medidas vêm via rota

export default function ResultScreen({ route, navigation }) {
  // Recebe os parâmetros da tela de medição
  const { imageUri, measurements } = route.params;

  // Como as medidas são passadas diretamente, simulamos um carregamento rápido
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula um pequeno atraso para "processamento"
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 segundo de atraso
    return () => clearTimeout(timer);
  }, []);

  // Função para renderizar o conteúdo central com base no estado
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <Text style={styles.infoText}>Calculando suas medidas...</Text>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.infoText}>Aguarde um momento.</Text>
        </>
      );
    }

    if (!measurements) {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.errorText}>Erro: Medidas não disponíveis.</Text>
          <Button
            title="Voltar para Medição"
            onPress={() => navigation.goBack()}
          />
        </View>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultTitle}>Suas Medidas</Text>
        <Text style={styles.resultText}>
          Distância Pupilar (DNP):{' '}
          {measurements.pupillaryDistance
            ? measurements.pupillaryDistance.toFixed(2)
            : 'N/A'}{' '}
          mm
        </Text>
        <Text style={styles.resultText}>
          Ponte Nasal:{' '}
          {measurements.nasalBridge
            ? measurements.nasalBridge.toFixed(2)
            : 'N/A'}{' '}
          mm
        </Text>
        <Text style={styles.resultText}>
          Largura Total:{' '}
          {measurements.frameWidth ? measurements.frameWidth.toFixed(2) : 'N/A'}{' '}
          mm
        </Text>
        <Button
          title="Fazer Nova Medição"
          onPress={() => navigation.navigate('Home')}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultados da Análise</Text>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.contentContainer}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultsContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007AFF',
  },
  resultText: {
    fontSize: 18,
    color: '#333',
    marginVertical: 5,
  },
});
