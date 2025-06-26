// src/screens/ResultScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Button } from 'react-native';
import { processImage } from '../services/measurementService';

export default function ResultScreen({ route, navigation }) {
  // Recebe os parâmetros da tela de ajuste
  const { imageUri, pixelsPerMm } = route.params;
  
  const [measurements, setMeasurements] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Função auto-executável para poder usar async/await no useEffect
    (async () => {
      if (!imageUri || !pixelsPerMm) {
        setError("Informações de imagem ou calibração ausentes.");
        setIsLoading(false);
        return;
      }

      console.log(`Iniciando processamento com escala: ${pixelsPerMm} pixels/mm`);

      // Chama nosso serviço de processamento, agora passando a escala
      const result = await processImage(imageUri, pixelsPerMm);
      
      if (result.error) {
        setError(result.error);
      } else {
        setMeasurements(result);
      }
      setIsLoading(false);
    })();
  }, [imageUri, pixelsPerMm]); // Roda sempre que os parâmetros mudarem

  // Função para renderizar o conteúdo central com base no estado
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <Text style={styles.infoText}>Analisando os pontos faciais...</Text>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.infoText}>Isso pode levar alguns segundos.</Text>
        </>
      );
    }

    if (error) {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.errorText}>Ocorreu um Erro</Text>
          <Text style={styles.infoText}>{error}</Text>
          <Button title="Tentar Novamente" onPress={() => navigation.goBack()} />
        </View>
      );
    }

    if (measurements) {
      return (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultTitle}>Suas Medidas</Text>
          <Text style={styles.resultText}>
            Distância Pupilar (DP): {measurements.pupillaryDistance} mm
          </Text>
          {/* Você pode adicionar outras medidas aqui quando as implementar */}
        </View>
      );
    }

    return null; // Caso nenhum dos estados acima seja verdadeiro
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultados da Análise</Text>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#f0f0f0' 
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
    textAlign: 'center' 
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
    shadowColor: "#000",
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
  },
});