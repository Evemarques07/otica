import React, { useState } from 'react';
import {
  View,
  StyleSheet,
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
  runOnUI,
  runOnJS,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import DraggablePoint from '../components/DraggablePoint';
import {
  colors,
  layout,
  typography,
  components,
  spacing,
} from '../styles/theme';
import CustomModal from '../components/CustomModal';
import { MaterialIcons } from '@expo/vector-icons';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AdjustScreen({ route, navigation }) {
  const { imageUri, originalImageWidth, originalImageHeight } = route.params;
  const [mode, setMode] = useState('pan');
  const [modalInfo, setModalInfo] = useState({
    isVisible: false,
    title: '',
    message: '',
    buttons: [],
  });

  // --- LÓGICA REANIMATED (INTACTA) ---
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const pinchContext = useSharedValue({ x: 0, y: 0, scale: 1 });

  const pinchGesture = Gesture.Pinch()
    .enabled(mode === 'pan')
    .onStart(() => {
      'worklet';
      pinchContext.value = {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
      };
    })
    .onUpdate((event) => {
      'worklet';
      const newScale = pinchContext.value.scale * event.scale;
      scale.value = Math.max(0.5, Math.min(newScale, 5));
      translateX.value =
        event.focalX -
        (event.focalX - pinchContext.value.x) *
          (scale.value / pinchContext.value.scale);
      translateY.value =
        event.focalY -
        (event.focalY - pinchContext.value.y) *
          (scale.value / pinchContext.value.scale);
    });

  const panGesture = Gesture.Pan()
    .enabled(mode === 'pan')
    .minPointers(1)
    .maxPointers(1)
    .onStart(() => {
      'worklet';
      pinchContext.value = {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
      };
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = pinchContext.value.x + event.translationX;
      translateY.value = pinchContext.value.y + event.translationY;
    });

  const composedGesture = Gesture.Race(pinchGesture, panGesture);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleZoomChange = (newZoom) => {
    'worklet';
    scale.value = withTiming(newZoom);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
  };
  const handleResetZoom = () => {
    'worklet';
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
  };

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
  // --- FIM DA LÓGICA REANIMATED ---

  const hideModal = () => setModalInfo({ ...modalInfo, isVisible: false });

  const proceedToMeasurement = () => {
    const navigateOnJS = (params) => {
      if (!isFinite(params.pixelsPerMm) || params.pixelsPerMm <= 0) {
        setModalInfo({
          isVisible: true,
          title: 'Calibração Falhou',
          message:
            'A distância entre os pontos é muito pequena ou inválida. Por favor, posicione os pontos nos cantos do cartão de crédito.',
          buttons: [{ text: 'OK', onPress: hideModal, style: 'primary' }],
        });
        return;
      }
      navigation.navigate('Measurement', params);
    };

    runOnUI(() => {
      'worklet';
      const pA = { x: pointAX.value, y: pointAY.value };
      const pB = { x: pointBX.value, y: pointBY.value };
      const distanceInPixels = Math.sqrt(
        Math.pow(pB.x - pA.x, 2) + Math.pow(pB.y - pA.y, 2)
      );
      const pixelsPerMm = distanceInPixels / 85.6; // Largura de um cartão de crédito

      runOnJS(navigateOnJS)({
        imageUri,
        pixelsPerMm,
        originalImageWidth,
        originalImageHeight,
      });
    })();
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.instructionHeader}>
        Calibração: Posicione a linha nos cantos do cartão
      </Text>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[StyleSheet.absoluteFill, animatedImageStyle]}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="contain"
          />
        </Animated.View>
      </GestureDetector>

      <View
        style={StyleSheet.absoluteFill}
        pointerEvents={mode === 'points' ? 'box-none' : 'none'}
      >
        <Svg height="100%" width="100%">
          <AnimatedLine
            animatedProps={animatedLineProps}
            stroke={colors.calibrationLine}
            strokeWidth="3"
          />
        </Svg>
        <DraggablePoint
          x={pointAX}
          y={pointAY}
          color={colors.calibrationLine}
          imageScale={scale}
          imageTranslateX={translateX}
          imageTranslateY={translateY}
          enabled={mode === 'points'}
        />
        <DraggablePoint
          x={pointBX}
          y={pointBY}
          color={colors.calibrationLine}
          imageScale={scale}
          imageTranslateX={translateX}
          imageTranslateY={translateY}
          enabled={mode === 'points'}
        />
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'pan' && styles.activeModeButton,
            ]}
            onPress={() => setMode('pan')}
          >
            <MaterialIcons name="pan-tool" size={20} color={colors.surface} />
            <Text style={styles.modeButtonText}>Zoom/Mover</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'points' && styles.activeModeButton,
            ]}
            onPress={() => setMode('points')}
          >
            <MaterialIcons
              name="control-point"
              size={20}
              color={colors.surface}
            />
            <Text style={styles.modeButtonText}>Mover Pontos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[components.buttonSecondary, { flex: 1 }]}
            onPress={handleResetZoom}
          >
            <Text style={components.buttonSecondaryText}>Resetar Zoom</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[components.buttonPrimary, { flex: 1 }]}
            onPress={proceedToMeasurement}
          >
            <Text style={components.buttonPrimaryText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomModal
        isVisible={modalInfo.isVisible}
        title={modalInfo.title}
        message={modalInfo.message}
        buttons={modalInfo.buttons}
        onClose={hideModal}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  instructionHeader: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
    ...typography.subheadline,
    color: colors.surface,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: spacing.s,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.blackOverlay,
    paddingTop: spacing.m,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.m,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: layout.borderRadius,
    marginBottom: spacing.m,
    overflow: 'hidden',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.s,
  },
  activeModeButton: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
});
