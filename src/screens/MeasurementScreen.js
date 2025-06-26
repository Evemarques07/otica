// src/screens/MeasurementScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Button, Dimensions } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Svg, { Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useDerivedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';

import DraggablePoint from '../components/DraggablePoint';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const calculateDistanceMm = (p1x, p1y, p2x, p2y, pixelsPerMm) => {
  'worklet';
  if (!pixelsPerMm || pixelsPerMm === 0) return '0.00';
  const dist = Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2));
  return (dist / pixelsPerMm).toFixed(2);
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MeasurementScreen({ route, navigation }) {
  const { imageUri, pixelsPerMm } = route.params;
  const [mode, setMode] = useState('points'); // 'pan' ou 'points'

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
    const imageCenterX = screenWidth / 2;
    const imageCenterY = screenHeight / 2;

    const newTranslateX = imageCenterX * (1 - newScale);
    const newTranslateY = imageCenterY * (1 - newScale);

    translateX.value = withTiming(newTranslateX);
    translateY.value = withTiming(newTranslateY);
    scale.value = withTiming(newScale);

    savedScale.value = newScale;
    savedTranslateX.value = newTranslateX;
    savedTranslateY.value = newTranslateY;
  };

  // NOVO: Handler para os botões de zoom
  const handleZoomChange = (newZoom) => {
    centerImageForZoom(newZoom);
  };

  const pinchGesture = Gesture.Pinch()
    .enabled(mode === 'pan')
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      scale.value = Math.max(1, Math.min(newScale, 5));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .enabled(mode === 'pan')
    .minPointers(2)
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

  const resetZoom = () => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  // --- LÓGICA DOS PONTOS DE MEDIÇÃO ---
  const pupilLX = useSharedValue(screenWidth / 2 - 50), pupilLY = useSharedValue(screenHeight / 2 - 30);
  const pupilRX = useSharedValue(screenWidth / 2 + 50), pupilRY = useSharedValue(screenHeight / 2 - 30);
  const nasalLX = useSharedValue(screenWidth / 2 - 20), nasalLY = useSharedValue(screenHeight / 2 + 20);
  const nasalRX = useSharedValue(screenWidth / 2 + 20), nasalRY = useSharedValue(screenHeight / 2 + 20);
  const frameLX = useSharedValue(screenWidth / 2 - 100), frameLY = useSharedValue(screenHeight / 2);
  const frameRX = useSharedValue(screenWidth / 2 + 100), frameRY = useSharedValue(screenHeight / 2);

  // Valores derivados para exibir as medições em tempo real
  const dnpText = useDerivedValue(() => `DNP: ${calculateDistanceMm(pupilLX.value, pupilLY.value, pupilRX.value, pupilRY.value, pixelsPerMm)} mm`);
  const nasalBridgeText = useDerivedValue(() => `Ponte Nasal: ${calculateDistanceMm(nasalLX.value, nasalLY.value, nasalRX.value, nasalRY.value, pixelsPerMm)} mm`);
  const frameWidthText = useDerivedValue(() => `Largura Total: ${calculateDistanceMm(frameLX.value, frameLY.value, frameRX.value, frameRY.value, pixelsPerMm)} mm`);

  const dnpAnimatedProps = useAnimatedProps(() => ({ text: dnpText.value }));
  const nasalBridgeAnimatedProps = useAnimatedProps(() => ({ text: nasalBridgeText.value }));
  const frameWidthAnimatedProps = useAnimatedProps(() => ({ text: frameWidthText.value }));

  // Propriedades animadas para as linhas
  const linePropsDNP = useAnimatedProps(() => ({
    x1: pupilLX.value * scale.value + translateX.value, y1: pupilLY.value * scale.value + translateY.value,
    x2: pupilRX.value * scale.value + translateX.value, y2: pupilRY.value * scale.value + translateY.value,
    strokeWidth: 2, stroke: 'cyan',
  }));
  const linePropsNasal = useAnimatedProps(() => ({
    x1: nasalLX.value * scale.value + translateX.value, y1: nasalLY.value * scale.value + translateY.value,
    x2: nasalRX.value * scale.value + translateX.value, y2: nasalRY.value * scale.value + translateY.value,
    strokeWidth: 2, stroke: 'lime',
  }));
  const linePropsFrame = useAnimatedProps(() => ({
    x1: frameLX.value * scale.value + translateX.value, y1: frameLY.value * scale.value + translateY.value,
    x2: frameRX.value * scale.value + translateX.value, y2: frameRY.value * scale.value + translateY.value,
    strokeWidth: 2, stroke: 'red',
  }));

  const proceedToResults = () => {
    const measurements = {
      pupillaryDistance: parseFloat(calculateDistanceMm(pupilLX.value, pupilLY.value, pupilRX.value, pupilRY.value, pixelsPerMm)),
      nasalBridge: parseFloat(calculateDistanceMm(nasalLX.value, nasalLY.value, nasalRX.value, nasalRY.value, pixelsPerMm)),
      frameWidth: parseFloat(calculateDistanceMm(frameLX.value, frameLY.value, frameRX.value, frameRY.value, pixelsPerMm)),
    };
    navigation.navigate('Result', { imageUri, measurements });
  };


  return (
    <GestureHandlerRootView style={styles.container}>
      {/* CAMADA 1: A IMAGEM COM ZOOM */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <Image source={{ uri: imageUri }} style={[styles.image, animatedImageStyle]} contentFit="contain" cachePolicy="disk" />
        </Animated.View>
      </GestureDetector>

      {/* CAMADA 2: OVERLAY DE PONTOS E LINHAS */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Svg height="100%" width="100%">
          <AnimatedLine animatedProps={linePropsDNP} />
          <AnimatedLine animatedProps={linePropsNasal} />
          <AnimatedLine animatedProps={linePropsFrame} />
        </Svg>
        
        <DraggablePoint x={pupilLX} y={pupilLY} color="cyan" imageScale={scale} imageTranslateX={translateX} imageTranslateY={translateY} enabled={mode === 'points'} />
        <DraggablePoint x={pupilRX} y={pupilRY} color="cyan" imageScale={scale} imageTranslateX={translateX} imageTranslateY={translateY} enabled={mode === 'points'} />
        <DraggablePoint x={nasalLX} y={nasalLY} color="lime" imageScale={scale} imageTranslateX={translateX} imageTranslateY={translateY} enabled={mode === 'points'} />
        <DraggablePoint x={nasalRX} y={nasalRY} color="lime" imageScale={scale} imageTranslateX={translateX} imageTranslateY={translateY} enabled={mode === 'points'} />
        <DraggablePoint x={frameLX} y={frameLY} color="red" imageScale={scale} imageTranslateX={translateX} imageTranslateY={translateY} enabled={mode === 'points'} />
        <DraggablePoint x={frameRX} y={frameRY} color="red" imageScale={scale} imageTranslateX={translateX} imageTranslateY={translateY} enabled={mode === 'points'} />
      </View>

      {/* CAMADA 3: CONTROLES FIXOS */}
      <View style={styles.controls}>
        <View style={styles.modeSelector}>
          <TouchableOpacity style={[styles.modeButton, mode === 'pan' && styles.activeModeButton]} onPress={() => setMode('pan')}><Text style={styles.modeButtonText}>Zoom / Mover</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.modeButton, mode === 'points' && styles.activeModeButton]} onPress={() => setMode('points')}><Text style={styles.modeButtonText}>Ajustar Pontos</Text></TouchableOpacity>
        </View>

        {/* NOVO: Botões de Zoom Controlado */}
        {mode === 'pan' && (
          <View style={styles.zoomButtons}>
            <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoomChange(1)}><Text style={styles.zoomButtonText}>Zoom 1x</Text></TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoomChange(2)}><Text style={styles.zoomButtonText}>Zoom 2x</Text></TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoomChange(4)}><Text style={styles.zoomButtonText}>Zoom 4x</Text></TouchableOpacity>
          </View>
        )}

        <View style={styles.resultsBox}>
          <View style={styles.resultItem}><View style={[styles.colorIndicator, { backgroundColor: 'cyan' }]} /><AnimatedTextInput editable={false} value={dnpText.value} animatedProps={dnpAnimatedProps} style={styles.resultText} /></View>
          <View style={styles.resultItem}><View style={[styles.colorIndicator, { backgroundColor: 'lime' }]} /><AnimatedTextInput editable={false} value={nasalBridgeText.value} animatedProps={nasalBridgeAnimatedProps} style={styles.resultText} /></View>
          <View style={styles.resultItem}><View style={[styles.colorIndicator, { backgroundColor: 'red' }]} /><AnimatedTextInput editable={false} value={frameWidthText.value} animatedProps={frameWidthAnimatedProps} style={styles.resultText} /></View>
        </View>
        <View style={styles.actionButtons}>
          <Button title="Resetar Zoom" onPress={resetZoom} />
          <Button title="Ver Resultados" onPress={proceedToResults} />
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
    bottom: 20,
    left: '5%',
    width: '90%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#555',
    overflow: 'hidden'
  },
  modeButton: { paddingVertical: 10, paddingHorizontal: 15 },
  activeModeButton: { backgroundColor: '#007AFF' },
  modeButtonText: { color: 'white', fontWeight: 'bold' },
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
  resultsBox: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  resultItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  colorIndicator: { width: 15, height: 15, borderRadius: 3, marginRight: 10 },
  resultText: { color: 'white', fontSize: 16, padding: 0 },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});