// src/screens/AdjustScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Button,
  Text,
  TouchableOpacity,
  Dimensions,
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
  runOnJS,
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
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const centerImageForZoom = (newScale) => {
    'worklet';
    const imageCenterX = screenWidth / 2;
    const imageCenterY = screenHeight / 2;
    const newTranslateX = imageCenterX - imageCenterX * newScale;
    const newTranslateY = imageCenterY - imageCenterY * newScale;
    translateX.value = withTiming(newTranslateX);
    translateY.value = withTiming(newTranslateY);
    scale.value = withTiming(newScale);
    savedScale.value = newScale;
    savedTranslateX.value = newTranslateX;
    savedTranslateY.value = newTranslateY;
  };

  const handleZoomChange = (newZoom) => {
    runOnJS(centerImageForZoom)(newZoom);
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

  const pointAX = useSharedValue(screenWidth / 2 - 100);
  const pointAY = useSharedValue(screenHeight / 2);
  const pointBX = useSharedValue(screenWidth / 2 + 100);
  const pointBY = useSharedValue(screenHeight / 2);

  const animatedLineProps = useAnimatedProps(() => {
    const pAx_transformed = pointAX.value * scale.value + translateX.value;
    const pAy_transformed = pointAY.value * scale.value + translateY.value;
    const pBx_transformed = pointBX.value * scale.value + translateX.value;
    const pBy_transformed = pointBY.value * scale.value + translateY.value;

    return {
      x1: pAx_transformed,
      y1: pAy_transformed,
      x2: pBx_transformed,
      y2: pBy_transformed,
    };
  });

  const resetZoomWorklet = () => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
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
      alert(
        'Calibração falhou. Tente posicionar os pontos novamente nos cantos do cartão.'
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
