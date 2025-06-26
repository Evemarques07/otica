// src/screens/AdjustScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Button, Text, TouchableOpacity } from 'react-native';
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

export default function AdjustScreen({ route, navigation }) {
  const { imageUri } = route.params;
  const [mode, setMode] = useState('pan');

  // --- LÓGICA DE GESTOS (AGORA DENTRO DA TELA) ---
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
  .enabled(mode === 'pan') // <-- APLIQUE AQUI
  .onUpdate((e) => {
    const newScale = savedScale.value * e.scale;
    scale.value = Math.max(1, Math.min(newScale, 5));
  })
  .onEnd(() => {
    savedScale.value = scale.value;
  });

const panGesture = Gesture.Pan()
  .enabled(mode === 'pan') // <-- E APLIQUE AQUI
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

// AGORA A COMBINAÇÃO FICA LIMPA, SEM O .enabled() NO FINAL
const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // --- LÓGICA DOS PONTOS ---
  const pointAX = useSharedValue(100);
  const pointAY = useSharedValue(200);
  const pointBX = useSharedValue(300);
  const pointBY = useSharedValue(200);

  const animatedLineProps = useAnimatedProps(() => ({
    x1: pointAX.value,
    y1: pointAY.value,
    x2: pointBX.value,
    y2: pointBY.value,
    stroke: 'yellow',
    strokeWidth: 2, // A linha agora tem espessura fixa
  }));

  // --- FUNÇÕES DE CONTROLE ---
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
    const pixelsPerMm = distanceInPixels / 85.6;
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

      {/* CAMADA 2: OVERLAY DE PONTOS E LINHAS (NÃO TEM ZOOM) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Svg height="100%" width="100%">
          <AnimatedLine animatedProps={animatedLineProps} />
        </Svg>
        <DraggablePoint x={pointAX} y={pointAY} color="yellow" scale={scale} enabled={mode === 'points'} />
        <DraggablePoint x={pointBX} y={pointBY} color="yellow" scale={scale} enabled={mode === 'points'} />
      </View>

      {/* CAMADA 3: CONTROLES FIXOS (NÃO TEM ZOOM) */}
      <View style={styles.controls}>
        <View style={styles.modeSelector}>
          <TouchableOpacity style={[styles.modeButton, mode === 'pan' && styles.activeModeButton]} onPress={() => setMode('pan')}>
            <Text style={styles.modeButtonText}>Zoom / Mover Imagem</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeButton, mode === 'points' && styles.activeModeButton]} onPress={() => setMode('points')}>
            <Text style={styles.modeButtonText}>Mover Pontos</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtons}>
          <Button title="Resetar Zoom" onPress={resetZoom} />
          <View style={{ width: 20 }} />
          <Button title="Confirmar Calibração" onPress={proceedToMeasurement} />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  image: { flex: 1, width: '100%', height: '100%' },
  controls: { position: 'absolute', bottom: 30, left: '5%', width: '90%', alignItems: 'center' },
  modeSelector: { flexDirection: 'row', backgroundColor: 'rgba(40, 40, 40, 0.8)', borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#555', overflow: 'hidden' },
  modeButton: { paddingVertical: 10, paddingHorizontal: 15 },
  activeModeButton: { backgroundColor: '#007AFF' },
  modeButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
});