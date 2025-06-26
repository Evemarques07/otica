// src/screens/AdjustScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Button, Text, TouchableOpacity, Dimensions } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Svg, { Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';

import DraggablePoint from '../components/DraggablePoint';

const AnimatedLine = Animated.createAnimatedComponent(Line);

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AdjustScreen({ route, navigation }) {
  const { imageUri } = route.params;
  const [mode, setMode] = useState('pan'); // 'pan' para zoom/mover, 'points' para mover os pontos

  // --- LÓGICA DE GESTOS E ZOOM DA IMAGEM ---
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // NOVO: Função para centralizar a imagem ao usar o zoom controlado
  const centerImageForZoom = (newScale) => {
    'worklet';
    // O centro da tela é o nosso ponto de referência para o zoom.
    const imageCenterX = screenWidth / 2;
    const imageCenterY = screenHeight / 2;

    // Calcula a nova translação para manter o centro da imagem no centro da tela.
    // Isso evita que a imagem "fuja" para um canto ao dar zoom.
    const newTranslateX = imageCenterX * (1 - newScale);
    const newTranslateY = imageCenterY * (1 - newScale);

    // Anima suavemente para a nova posição de zoom e translação
    translateX.value = withTiming(newTranslateX);
    translateY.value = withTiming(newTranslateY);
    scale.value = withTiming(newScale);
    
    // Salva os novos valores para que o gesto de pinça/pan continue de onde parou.
    savedScale.value = newScale;
    savedTranslateX.value = newTranslateX;
    savedTranslateY.value = newTranslateY;
  };
  
  // NOVO: Handler para os botões de zoom
  const handleZoomChange = (newZoom) => {
    centerImageForZoom(newZoom);
  };

  const pinchGesture = Gesture.Pinch()
    .enabled(mode === 'pan') // Habilitado apenas no modo 'pan'
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      // Limita o zoom para não ser menor que 1x ou maior que 5x
      scale.value = Math.max(1, Math.min(newScale, 5)); 
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .enabled(mode === 'pan') // Habilitado apenas no modo 'pan'
    .minPointers(2) // Permite pan apenas com dois dedos para não conflitar com o arraste de pontos
    .maxPointers(2)
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // --- LÓGICA DOS PONTOS DE CALIBRAÇÃO ---
  // Coordenadas na imagem ORIGINAL. A posição inicial foi ajustada para ser mais central.
  const pointAX = useSharedValue(screenWidth / 2 - 100);
  const pointAY = useSharedValue(screenHeight / 2);
  const pointBX = useSharedValue(screenWidth / 2 + 100);
  const pointBY = useSharedValue(screenHeight / 2);

  // As propriedades da linha são animadas para seguir os pontos e o zoom/pan da imagem
  const animatedLineProps = useAnimatedProps(() => ({
    x1: pointAX.value * scale.value + translateX.value,
    y1: pointAY.value * scale.value + translateY.value,
    x2: pointBX.value * scale.value + translateX.value,
    y2: pointBY.value * scale.value + translateY.value,
    stroke: 'yellow',
    strokeWidth: 2,
  }));

  const resetZoom = () => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const proceedToMeasurement = () => {
    const pA = { x: pointAX.value, y: pointAY.value };
    const pB = { x: pointBX.value, y: pointBY.value };
    const distanceInPixels = Math.sqrt(
      Math.pow(pB.x - pA.x, 2) + Math.pow(pB.y - pA.y, 2)
    );
    const pixelsPerMm = distanceInPixels / 85.6; // Cartão de crédito = 85.6mm
    navigation.navigate('Measurement', { imageUri, pixelsPerMm });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* CAMADA 1: A IMAGEM COM ZOOM */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, animatedImageStyle]}
            contentFit="contain"
            placeholder={{ blurhash }}
            transition={300}
            cachePolicy="disk"
          />
        </Animated.View>
      </GestureDetector>

      {/* CAMADA 2: OVERLAY DE PONTOS E LINHAS */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Svg height="100%" width="100%">
          <AnimatedLine animatedProps={animatedLineProps} />
        </Svg>
        <DraggablePoint
          x={pointAX}
          y={pointAY}
          color="yellow"
          imageScale={scale}
          imageTranslateX={translateX}
          imageTranslateY={translateY}
          enabled={mode === 'points'} // Habilitado apenas no modo 'points'
        />
        <DraggablePoint
          x={pointBX}
          y={pointBY}
          color="yellow"
          imageScale={scale}
          imageTranslateX={translateX}
          imageTranslateY={translateY}
          enabled={mode === 'points'} // Habilitado apenas no modo 'points'
        />
      </View>

      {/* CAMADA 3: CONTROLES FIXOS */}
      <View style={styles.controls}>
        <View style={styles.modeSelector}>
          <TouchableOpacity style={[styles.modeButton, mode === 'pan' && styles.activeModeButton]} onPress={() => setMode('pan')}>
            <Text style={styles.modeButtonText}>Zoom / Mover Imagem</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeButton, mode === 'points' && styles.activeModeButton]} onPress={() => setMode('points')}>
            <Text style={styles.modeButtonText}>Mover Pontos</Text>
          </TouchableOpacity>
        </View>

        {/* NOVO: Botões de Zoom Controlado (aparecem apenas no modo 'pan') */}
        {mode === 'pan' && (
          <View style={styles.zoomButtons}>
            <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoomChange(1)}>
              <Text style={styles.zoomButtonText}>Zoom 1x</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoomChange(2)}>
              <Text style={styles.zoomButtonText}>Zoom 2x</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoomChange(4)}>
              <Text style={styles.zoomButtonText}>Zoom 4x</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionButtons}>
          <Button title="Resetar Zoom" onPress={resetZoom} />
          <View style={{ width: 20 }} />
          <Button title="Confirmar Calibração" onPress={proceedToMeasurement} />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

// ESTILOS ATUALIZADOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  image: { flex: 1, width: '100%', height: '100%' },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: '5%',
    width: '90%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#555',
    overflow: 'hidden'
  },
  modeButton: { paddingVertical: 10, paddingHorizontal: 15 },
  activeModeButton: { backgroundColor: '#007AFF' },
  modeButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  zoomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    borderRadius: 10,
    paddingVertical: 5,
  },
  zoomButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  zoomButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});