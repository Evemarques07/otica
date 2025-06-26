// src/screens/MeasurementScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Svg, { Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useDerivedValue,
} from 'react-native-reanimated';
import { Image } from 'expo-image';

import DraggablePoint from '../components/DraggablePoint';
import ZoomPanView from '../components/ZoomPanView';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const calculateDistanceMm = (p1x, p1y, p2x, p2y, pixelsPerMm) => {
  'worklet';
  if (!pixelsPerMm || pixelsPerMm === 0) return '0.00';
  const dist = Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2));
  return (dist / pixelsPerMm).toFixed(2);
};

export default function MeasurementScreen({ route }) {
  const { imageUri, pixelsPerMm } = route.params;
  const [mode, setMode] = useState('points'); // Começa em modo de pontos

  // Shared values para a posição dos pontos de medição
  const pupilLX = useSharedValue(120), pupilLY = useSharedValue(150);
  const pupilRX = useSharedValue(220), pupilRY = useSharedValue(150);
  const nasalLX = useSharedValue(150), nasalLY = useSharedValue(180);
  const nasalRX = useSharedValue(190), nasalRY = useSharedValue(180);
  const frameLX = useSharedValue(80), frameLY = useSharedValue(165);
  const frameRX = useSharedValue(260), frameRY = useSharedValue(165);

  // Valores derivados para os textos de medição
  const dnpText = useDerivedValue(() => `DNP: ${calculateDistanceMm(pupilLX.value, pupilLY.value, pupilRX.value, pupilRY.value, pixelsPerMm)} mm`);
  const nasalBridgeText = useDerivedValue(() => `Ponte Nasal: ${calculateDistanceMm(nasalLX.value, nasalLY.value, nasalRX.value, nasalRY.value, pixelsPerMm)} mm`);
  const frameWidthText = useDerivedValue(() => `Largura Total: ${calculateDistanceMm(frameLX.value, frameLY.value, frameRX.value, frameRY.value, pixelsPerMm)} mm`);

  // Props animadas para os componentes de texto
  const dnpAnimatedProps = useAnimatedProps(() => ({ text: dnpText.value }));
  const nasalBridgeAnimatedProps = useAnimatedProps(() => ({ text: nasalBridgeText.value }));
  const frameWidthAnimatedProps = useAnimatedProps(() => ({ text: frameWidthText.value }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <ZoomPanView enabled={mode === 'pan'}>
        {({ scale }) => (
          <>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              contentFit="contain"
              cachePolicy="disk"
            />
            
            <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
              <Svg height="100%" width="100%">
                <AnimatedLine animatedProps={useAnimatedProps(() => ({ x1: pupilLX.value, y1: pupilLY.value, x2: pupilRX.value, y2: pupilRY.value, strokeWidth: 2 / scale.value }))} stroke="cyan" />
                <AnimatedLine animatedProps={useAnimatedProps(() => ({ x1: nasalLX.value, y1: nasalLY.value, x2: nasalRX.value, y2: nasalRY.value, strokeWidth: 2 / scale.value }))} stroke="lime" />
                <AnimatedLine animatedProps={useAnimatedProps(() => ({ x1: frameLX.value, y1: frameLY.value, x2: frameRX.value, y2: frameRY.value, strokeWidth: 2 / scale.value }))} stroke="red" />
              </Svg>
              
              {/* Pontos para DNP */}
              <DraggablePoint x={pupilLX} y={pupilLY} color="cyan" scale={scale} enabled={mode === 'points'} />
              <DraggablePoint x={pupilRX} y={pupilRY} color="cyan" scale={scale} enabled={mode === 'points'} />
              {/* Pontos para Ponte Nasal */}
              <DraggablePoint x={nasalLX} y={nasalLY} color="lime" scale={scale} enabled={mode === 'points'} />
              <DraggablePoint x={nasalRX} y={nasalRY} color="lime" scale={scale} enabled={mode === 'points'} />
              {/* Pontos para Largura da Armação */}
              <DraggablePoint x={frameLX} y={frameLY} color="red" scale={scale} enabled={mode === 'points'} />
              <DraggablePoint x={frameRX} y={frameRY} color="red" scale={scale} enabled={mode === 'points'} />
            </View>

            <View style={styles.controls}>
              <View style={styles.modeSelector}>
                <TouchableOpacity style={[styles.modeButton, mode === 'pan' && styles.activeModeButton]} onPress={() => setMode('pan')}><Text style={styles.modeButtonText}>Zoom / Mover</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modeButton, mode === 'points' && styles.activeModeButton]} onPress={() => setMode('points')}><Text style={styles.modeButtonText}>Ajustar Pontos</Text></TouchableOpacity>
              </View>
              <View style={styles.resultsBox}>
                <View style={styles.resultItem}>
                  <View style={[styles.colorIndicator, { backgroundColor: 'cyan' }]} />
                  <AnimatedTextInput editable={false} value={dnpText.value} animatedProps={dnpAnimatedProps} style={styles.resultText} />
                </View>
                <View style={styles.resultItem}>
                  <View style={[styles.colorIndicator, { backgroundColor: 'lime' }]} />
                  <AnimatedTextInput editable={false} value={nasalBridgeText.value} animatedProps={nasalBridgeAnimatedProps} style={styles.resultText} />
                </View>
                <View style={styles.resultItem}>
                  <View style={[styles.colorIndicator, { backgroundColor: 'red' }]} />
                  <AnimatedTextInput editable={false} value={frameWidthText.value} animatedProps={frameWidthAnimatedProps} style={styles.resultText} />
                </View>
              </View>
            </View>
          </>
        )}
      </ZoomPanView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  image: { flex: 1, width: '100%', height: '100%' },
  controls: { position: 'absolute', bottom: 20, left: '5%', width: '90%', alignItems: 'center' },
  modeSelector: { flexDirection: 'row', backgroundColor: 'rgba(40, 40, 40, 0.8)', borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#555', overflow: 'hidden' },
  modeButton: { paddingVertical: 10, paddingHorizontal: 15 },
  activeModeButton: { backgroundColor: '#007AFF' },
  modeButtonText: { color: 'white', fontWeight: 'bold' },
  resultsBox: { width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: 15, borderRadius: 10 },
  resultItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  colorIndicator: { width: 15, height: 15, borderRadius: 3, marginRight: 10 },
  resultText: { color: 'white', fontSize: 16, padding: 0 },
});