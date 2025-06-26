// src/screens/AdjustScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Button,
  Text,
  TouchableOpacity,
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
  const [mode, setMode] = useState('pan');

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Usaremos estes para salvar o estado entre os gestos.
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

  // MUDANÇA FINAL: Lógica correta de gestos
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

  const pointAX = useSharedValue(screenWidth / 2 - 100);
  const pointAY = useSharedValue(screenHeight / 2);
  const pointBX = useSharedValue(screenWidth / 2 + 100);
  const pointBY = useSharedValue(screenHeight / 2);

  const animatedLineProps = useAnimatedProps(() => ({
    x1: pointAX.value * scale.value + translateX.value,
    y1: pointAY.value * scale.value + translateY.value,
    x2: pointBX.value * scale.value + translateX.value,
    y2: pointBY.value * scale.value + translateY.value,
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

  const proceedToMeasurement = () => {
    const pA = { x: pointAX.value, y: pointAY.value };
    const pB = { x: pointBX.value, y: pointBY.value };
    const distanceInPixels = Math.sqrt(
      Math.pow(pB.x - pA.x, 2) + Math.pow(pB.y - pA.y, 2)
    );
    const pixelsPerMm = distanceInPixels / 85.6;

    if (!isFinite(pixelsPerMm) || pixelsPerMm <= 0) {
      Alert.alert(
        'Calibração falhou',
        'Tente posicionar os pontos novamente nos cantos do cartão.'
      );
      return;
    }

    navigation.navigate('Measurement', { imageUri, pixelsPerMm });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[StyleSheet.absoluteFill, animatedImageStyle]}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="contain"
            placeholder={{ blurhash }}
            transition={300}
            cachePolicy="disk"
          />
        </Animated.View>
      </GestureDetector>

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Svg height="100%" width="100%">
          <AnimatedLine
            animatedProps={animatedLineProps}
            stroke="yellow"
            strokeWidth="2"
          />
        </Svg>
        <DraggablePoint
          x={pointAX}
          y={pointAY}
          color="yellow"
          imageScale={scale}
          imageTranslateX={translateX}
          imageTranslateY={translateY}
          enabled={mode === 'points'}
        />
        <DraggablePoint
          x={pointBX}
          y={pointBY}
          color="yellow"
          imageScale={scale}
          imageTranslateX={translateX}
          imageTranslateY={translateY}
          enabled={mode === 'points'}
        />
      </View>

      <View style={styles.controls}>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'pan' && styles.activeModeButton,
            ]}
            onPress={() => setMode('pan')}
          >
            <Text style={styles.modeButtonText}>Zoom / Mover Imagem</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'points' && styles.activeModeButton,
            ]}
            onPress={() => setMode('points')}
          >
            <Text style={styles.modeButtonText}>Mover Pontos</Text>
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

        <View style={styles.actionButtons}>
          <Button title="Resetar Zoom" onPress={handleResetZoom} />
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
    overflow: 'hidden',
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
  zoomButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
  zoomButtonText: { color: 'white', fontWeight: 'bold' },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});
