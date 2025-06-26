// src/components/ZoomPanView.js
import React from 'react';
import { StyleSheet } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export default function ZoomPanView({ children, enabled = true }) {
  // Valores compartilhados para animações
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Gesto de Pinça (Zoom)
  const pinchGesture = Gesture.Pinch()
    .enabled(enabled) // Permite ativar/desativar o gesto
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      // Limita o zoom para não ficar muito pequeno ou muito grande
      scale.value = Math.max(1, Math.min(newScale, 5));
    })
    .onEnd(() => {
      // Salva a escala final para o próximo gesto
      savedScale.value = scale.value;
    });

  // Gesto de Arrastar (Pan) com 2 dedos
  const panGesture = Gesture.Pan()
    .enabled(enabled) // Permite ativar/desativar o gesto
    .minPointers(2) // Ativado apenas com 2 ou mais dedos
    .maxPointers(2)
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      // Salva a posição final para o próximo gesto
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Estilo animado que aplica as transformações de escala e translação
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Função para resetar o zoom e a posição
  const reset = () => {
    'worklet'; // Indica que esta função pode rodar na thread de UI
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  // Combina os gestos de pan e pinch para que funcionem simultaneamente
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  return (
    // GestureDetector é a forma moderna de usar os gestos
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Usamos o padrão "render prop" para passar o estado (scale) e o controle (reset) para os filhos */}
        {children({ reset, scale })}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});