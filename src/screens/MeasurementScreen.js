// src/screens/MeasurementScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Button,
  Dimensions,
  Alert,
} from 'react-native';
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
  if (!pixelsPerMm || pixelsPerMm <= 0 || !isFinite(pixelsPerMm)) return '0.00';
  const dist = Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2));
  return (dist / pixelsPerMm).toFixed(2);
};

// Função específica para distância horizontal (PD Monocular)
const calculateHorizontalDistanceMm = (x1, x2, pixelsPerMm) => {
  'worklet';
  if (!pixelsPerMm || pixelsPerMm <= 0 || !isFinite(pixelsPerMm)) return '0.00';
  const dist = Math.abs(x1 - x2);
  return (dist / pixelsPerMm).toFixed(2);
};

// Função específica para distância vertical (Altura Óptica)
const calculateVerticalDistanceMm = (y1, y2, pixelsPerMm) => {
  'worklet';
  if (!pixelsPerMm || pixelsPerMm <= 0 || !isFinite(pixelsPerMm)) return '0.00';
  const dist = Math.abs(y1 - y2);
  return (dist / pixelsPerMm).toFixed(2);
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MeasurementScreen({ route, navigation }) {
  const { imageUri, pixelsPerMm } = route.params;
  const [mode, setMode] = useState('points');

  if (!isFinite(pixelsPerMm) || pixelsPerMm <= 0) {
    Alert.alert('Erro de Calibração', 'O fator de calibração é inválido.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
    return null;
  }

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const centerImageForZoom = (newScale) => {
    'worklet';
    savedScale.value = newScale;
    scale.value = withTiming(newScale);
    const newTranslateX = (screenWidth / 2) * (1 - newScale);
    const newTranslateY = (screenHeight / 2) * (1 - newScale);
    savedTranslateX.value = newTranslateX;
    savedTranslateY.value = newTranslateY;
    translateX.value = withTiming(newTranslateX);
    translateY.value = withTiming(newTranslateY);
  };
  const handleZoomChange = (newZoom) => {
    centerImageForZoom(newZoom);
  };
  const panGesture = Gesture.Pan()
    .enabled(mode === 'pan')
    .minPointers(2)
    .maxPointers(2)
    .onUpdate((event) => {
      'worklet';
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      'worklet';
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });
  const pinchGesture = Gesture.Pinch()
    .enabled(mode === 'pan')
    .onUpdate((event) => {
      'worklet';
      const newScale = savedScale.value * event.scale;
      scale.value = Math.max(0.5, Math.min(newScale, 5));
    })
    .onEnd(() => {
      'worklet';
      savedScale.value = scale.value;
    });
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);
  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));
  const resetZoomWorklet = () => {
    'worklet';
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };
  const handleResetZoom = () => {
    resetZoomWorklet();
  };

  // --- PONTOS DE MEDIÇÃO ---
  // Pontos existentes
  const pupilLX = useSharedValue(screenWidth / 2 - 50),
    pupilLY = useSharedValue(screenHeight / 2 - 30);
  const pupilRX = useSharedValue(screenWidth / 2 + 50),
    pupilRY = useSharedValue(screenHeight / 2 - 30);
  const frameLX = useSharedValue(screenWidth / 2 - 120),
    frameLY = useSharedValue(screenHeight / 2);
  const frameRX = useSharedValue(screenWidth / 2 + 120),
    frameRY = useSharedValue(screenHeight / 2);

  // NOVOS PONTOS
  // Ponto para o centro da ponte nasal (referência para PD monocular)
  const nasalCenterX = useSharedValue(screenWidth / 2),
    nasalCenterY = useSharedValue(screenHeight / 2 + 20);
  // Pontos para a base da armação (referência para Altura Óptica)
  const frameBaseLX = useSharedValue(screenWidth / 2 - 70),
    frameBaseLY = useSharedValue(screenHeight / 2 + 50);
  const frameBaseRX = useSharedValue(screenWidth / 2 + 70),
    frameBaseRY = useSharedValue(screenHeight / 2 + 50);

  // --- CÁLCULOS DERIVADOS ---
  // Medidas existentes
  const dnpText = useDerivedValue(
    () =>
      `DNP Total: ${calculateDistanceMm(pupilLX.value, pupilLY.value, pupilRX.value, pupilRY.value, pixelsPerMm)} mm`
  );
  const frameWidthText = useDerivedValue(
    () =>
      `Largura Armação: ${calculateDistanceMm(frameLX.value, frameLY.value, frameRX.value, frameRY.value, pixelsPerMm)} mm`
  );

  // NOVAS MEDIDAS
  const pdLeftText = useDerivedValue(
    () =>
      `DNP Esquerda: ${calculateHorizontalDistanceMm(pupilLX.value, nasalCenterX.value, pixelsPerMm)} mm`
  );
  const pdRightText = useDerivedValue(
    () =>
      `DNP Direita: ${calculateHorizontalDistanceMm(pupilRX.value, nasalCenterX.value, pixelsPerMm)} mm`
  );
  const opticalCenterLeftText = useDerivedValue(
    () =>
      `Altura Óptica E: ${calculateVerticalDistanceMm(pupilLY.value, frameBaseLY.value, pixelsPerMm)} mm`
  );
  const opticalCenterRightText = useDerivedValue(
    () =>
      `Altura Óptica D: ${calculateVerticalDistanceMm(pupilRY.value, frameBaseRY.value, pixelsPerMm)} mm`
  );

  // --- PROPS PARA COMPONENTES ANIMADOS ---
  const dnpAnimatedProps = useAnimatedProps(() => ({ text: dnpText.value }));
  const frameWidthAnimatedProps = useAnimatedProps(() => ({
    text: frameWidthText.value,
  }));
  const pdLeftAnimatedProps = useAnimatedProps(() => ({
    text: pdLeftText.value,
  }));
  const pdRightAnimatedProps = useAnimatedProps(() => ({
    text: pdRightText.value,
  }));
  const opticalCenterLeftAnimatedProps = useAnimatedProps(() => ({
    text: opticalCenterLeftText.value,
  }));
  const opticalCenterRightAnimatedProps = useAnimatedProps(() => ({
    text: opticalCenterRightText.value,
  }));

  // --- PROPS PARA LINHAS DE GUIA ---
  const createLineProps = (p1x, p1y, p2x, p2y) =>
    useAnimatedProps(() => ({
      x1: p1x.value * scale.value + translateX.value,
      y1: p1y.value * scale.value + translateY.value,
      x2: p2x.value * scale.value + translateX.value,
      y2: p2y.value * scale.value + translateY.value,
    }));
  const linePropsDNP = createLineProps(pupilLX, pupilLY, pupilRX, pupilRY);
  const linePropsFrame = createLineProps(frameLX, frameLY, frameRX, frameRY);
  const linePropsFrameBase = createLineProps(
    frameBaseLX,
    frameBaseLY,
    frameBaseRX,
    frameBaseRY
  );

  // Linha vertical para o centro nasal
  const linePropsNasalCenter = useAnimatedProps(() => ({
    x1: nasalCenterX.value * scale.value + translateX.value,
    y1: 0,
    x2: nasalCenterX.value * scale.value + translateX.value,
    y2: screenHeight,
  }));
  // Linhas verticais para a altura óptica
  const linePropsOpticalCenterL = createLineProps(
    pupilLX,
    pupilLY,
    pupilLX,
    frameBaseLY
  );
  const linePropsOpticalCenterR = createLineProps(
    pupilRX,
    pupilRY,
    pupilRX,
    frameBaseRY
  );

  const proceedToResults = () => {
    const measurements = {
      pupillaryDistance: parseFloat(
        calculateDistanceMm(
          pupilLX.value,
          pupilLY.value,
          pupilRX.value,
          pupilRY.value,
          pixelsPerMm
        )
      ),
      frameWidth: parseFloat(
        calculateDistanceMm(
          frameLX.value,
          frameLY.value,
          frameRX.value,
          frameRY.value,
          pixelsPerMm
        )
      ),
      // Novas medidas
      pdLeft: parseFloat(
        calculateHorizontalDistanceMm(
          pupilLX.value,
          nasalCenterX.value,
          pixelsPerMm
        )
      ),
      pdRight: parseFloat(
        calculateHorizontalDistanceMm(
          pupilRX.value,
          nasalCenterX.value,
          pixelsPerMm
        )
      ),
      opticalCenterLeft: parseFloat(
        calculateVerticalDistanceMm(
          pupilLY.value,
          frameBaseLY.value,
          pixelsPerMm
        )
      ),
      opticalCenterRight: parseFloat(
        calculateVerticalDistanceMm(
          pupilRY.value,
          frameBaseRY.value,
          pixelsPerMm
        )
      ),
    };
    navigation.navigate('Result', { imageUri, measurements });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[StyleSheet.absoluteFill, animatedImageStyle]}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="contain"
            cachePolicy="disk"
          />
        </Animated.View>
      </GestureDetector>

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Svg height="100%" width="100%">
          {/* Linhas de Medição */}
          <AnimatedLine
            animatedProps={linePropsDNP}
            stroke="cyan"
            strokeWidth={2}
          />
          <AnimatedLine
            animatedProps={linePropsFrame}
            stroke="red"
            strokeWidth={2}
          />
          <AnimatedLine
            animatedProps={linePropsFrameBase}
            stroke="magenta"
            strokeWidth={2}
          />

          {/* Linhas de Guia */}
          <AnimatedLine
            animatedProps={linePropsNasalCenter}
            stroke="white"
            strokeWidth={1}
            strokeDasharray="5, 5"
          />
          <AnimatedLine
            animatedProps={linePropsOpticalCenterL}
            stroke="magenta"
            strokeWidth={1}
            strokeDasharray="5, 5"
          />
          <AnimatedLine
            animatedProps={linePropsOpticalCenterR}
            stroke="magenta"
            strokeWidth={1}
            strokeDasharray="5, 5"
          />
        </Svg>

        {/* Pontos de DNP */}
        <DraggablePoint
          x={pupilLX}
          y={pupilLY}
          color="cyan"
          imageScale={scale}
          imageTranslateX={translateX}
          imageTranslateY={translateY}
          enabled={mode === 'points'}
        />
        <DraggablePoint
          x={pupilRX}
          y={pupilRY}
          color="cyan"
          imageScale={scale}
          imageTranslateX={translateX}
          imageTranslateY={translateY}
          enabled={mode === 'points'}
        />

        {/* Pontos de Largura */}
        <DraggablePoint
          x={frameLX}
          y={frameLY}
          color="red"
          imageScale={scale}
          imageTranslateX={translateX}
          imageTranslateY={translateY}
          enabled={mode === 'points'}
        />
        <DraggablePoint
          x={frameRX}
          y={frameRY}
          color="red"
          imageScale={scale}
          imageTranslateX={translateX}
          imageTranslateY={translateY}
          enabled={mode === 'points'}
        />

        {/* Novos Pontos */}
        <DraggablePoint
          x={nasalCenterX}
          y={nasalCenterY}
          color="orange"
          imageScale={scale}
          imageTranslateX={translateX}
          imageTranslateY={translateY}
          enabled={mode === 'points'}
        />
        <DraggablePoint
          x={frameBaseLX}
          y={frameBaseLY}
          color="magenta"
          imageScale={scale}
          imageTranslateX={translateX}
          imageTranslateY={translateY}
          enabled={mode === 'points'}
        />
        <DraggablePoint
          x={frameBaseRX}
          y={frameBaseRY}
          color="magenta"
          imageScale={scale}
          imageTranslateX={translateX}
          imageTranslateY={translateY}
          enabled={mode === 'points'}
        />
      </View>

      <View style={styles.controls}>
        {/* ... (Controles de modo e zoom permanecem os mesmos) ... */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'pan' && styles.activeModeButton,
            ]}
            onPress={() => setMode('pan')}
          >
            <Text style={styles.modeButtonText}>Zoom / Mover</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'points' && styles.activeModeButton,
            ]}
            onPress={() => setMode('points')}
          >
            <Text style={styles.modeButtonText}>Ajustar Pontos</Text>
          </TouchableOpacity>
        </View>
        {mode === 'pan' && (
          <View style={styles.zoomButtons}>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => handleZoomChange(1)}
            >
              <Text style={styles.zoomButtonText}>Zoom 1x</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => handleZoomChange(2)}
            >
              <Text style={styles.zoomButtonText}>Zoom 2x</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => handleZoomChange(4)}
            >
              <Text style={styles.zoomButtonText}>Zoom 4x</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.resultsBox}>
          {/* DNP Total */}
          <View style={styles.resultItem}>
            <View
              style={[styles.colorIndicator, { backgroundColor: 'cyan' }]}
            />
            <AnimatedTextInput
              editable={false}
              value={dnpText.value}
              animatedProps={dnpAnimatedProps}
              style={styles.resultText}
            />
          </View>
          {/* Largura da Armação */}
          <View style={styles.resultItem}>
            <View style={[styles.colorIndicator, { backgroundColor: 'red' }]} />
            <AnimatedTextInput
              editable={false}
              value={frameWidthText.value}
              animatedProps={frameWidthAnimatedProps}
              style={styles.resultText}
            />
          </View>
          {/* DNP Monocular */}
          <View style={styles.resultItem}>
            <View
              style={[styles.colorIndicator, { backgroundColor: 'orange' }]}
            />
            <AnimatedTextInput
              editable={false}
              value={pdLeftText.value}
              animatedProps={pdLeftAnimatedProps}
              style={styles.resultText}
            />
          </View>
          <View style={styles.resultItem}>
            <View
              style={[styles.colorIndicator, { backgroundColor: 'orange' }]}
            />
            <AnimatedTextInput
              editable={false}
              value={pdRightText.value}
              animatedProps={pdRightAnimatedProps}
              style={styles.resultText}
            />
          </View>
          {/* Altura Óptica */}
          <View style={styles.resultItem}>
            <View
              style={[styles.colorIndicator, { backgroundColor: 'magenta' }]}
            />
            <AnimatedTextInput
              editable={false}
              value={opticalCenterLeftText.value}
              animatedProps={opticalCenterLeftAnimatedProps}
              style={styles.resultText}
            />
          </View>
          <View style={styles.resultItem}>
            <View
              style={[styles.colorIndicator, { backgroundColor: 'magenta' }]}
            />
            <AnimatedTextInput
              editable={false}
              value={opticalCenterRightText.value}
              animatedProps={opticalCenterRightAnimatedProps}
              style={styles.resultText}
            />
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button title="Resetar Zoom" onPress={handleResetZoom} />
          <Button title="Ver Resultados" onPress={proceedToResults} />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

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
    overflow: 'hidden',
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
  zoomButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
  zoomButtonText: { color: 'white', fontWeight: 'bold' },
  resultsBox: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  resultItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  colorIndicator: { width: 15, height: 15, borderRadius: 3, marginRight: 10 },
  resultText: { color: 'white', fontSize: 14, padding: 0 }, // Diminuí um pouco a fonte
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});
