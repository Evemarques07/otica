// src/screens/ResultScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Button,
} from 'react-native';

export default function ResultScreen({ route, navigation }) {
  const { imageUri, measurements } = route.params;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500); // Carregamento mais rápido
    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <Text style={styles.infoText}>Calculando suas medidas...</Text>
          <ActivityIndicator size="large" color="#007AFF" />
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

        <Text style={styles.resultCategory}>Distância Pupilar</Text>
        <Text style={styles.resultText}>
          DNP Total: {measurements.pupillaryDistance?.toFixed(2) ?? 'N/A'} mm
        </Text>
        <Text style={styles.resultText}>
          DP Esquerda: {measurements.pdLeft?.toFixed(2) ?? 'N/A'} mm
        </Text>
        <Text style={styles.resultText}>
          DP Direita: {measurements.pdRight?.toFixed(2) ?? 'N/A'} mm
        </Text>

        <View style={styles.separator} />

        <Text style={styles.resultCategory}>Altura do Centro Óptico</Text>
        <Text style={styles.resultText}>
          Altura Esquerda: {measurements.opticalCenterLeft?.toFixed(2) ?? 'N/A'}{' '}
          mm
        </Text>
        <Text style={styles.resultText}>
          Altura Direita: {measurements.opticalCenterRight?.toFixed(2) ?? 'N/A'}{' '}
          mm
        </Text>

        <View style={styles.separator} />

        <Text style={styles.resultCategory}>Medidas da Armação</Text>
        <Text style={styles.resultText}>
          Largura Total: {measurements.frameWidth?.toFixed(2) ?? 'N/A'} mm
        </Text>

        <View style={{ marginTop: 20 }}>
          <Button
            title="Fazer Nova Medição"
            onPress={() => navigation.navigate('Home')}
          />
        </View>
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
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  image: {
    width: '100%',
    height: 250,
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
    alignItems: 'stretch',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007AFF',
    textAlign: 'center',
  },
  resultCategory: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#555',
    marginVertical: 4,
    marginLeft: 10,
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#eee',
    marginVertical: 10,
  },
});
