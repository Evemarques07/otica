// src/components/DraggablePoint.js
import React from 'react';
import { StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

export default function DraggablePoint({ x, y, color, imageScale, imageTranslateX, imageTranslateY, enabled }) {

  // O gesture handler para arrastar o ponto
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      // Armazena a posição inicial do ponto (nas coordenadas da imagem original).
      // Isso é o ponto de partida do arrasto.
      ctx.startX = x.value;
      ctx.startY = y.value;
    },
    onActive: (event, ctx) => {
      // Calcula as novas coordenadas do ponto na imagem original.
      // event.translationX e event.translationY são o deslocamento do dedo na TELA.
      // Para saber o quanto o ponto "andou" na IMAGEM, dividimos pelo zoom atual da imagem.
      x.value = ctx.startX + event.translationX / imageScale.value;
      y.value = ctx.startY + event.translationY / imageScale.value;
    },
  });

  // O estilo animado que posiciona o ponto na tela.
  // Ele pega a coordenada do ponto na imagem (x.value, y.value)
  // e aplica a escala e translação da imagem para renderizá-lo corretamente sobre a imagem zoomada.
  // IMPORTANTE: O TAMANHO DO PONTO EM SI NÃO MUDA, APENAS SUA POSIÇÃO.
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: x.value * imageScale.value + imageTranslateX.value },
        { translateY: y.value * imageScale.value + imageTranslateY.value },
      ],
      // A opacidade é controlada para indicar se o ponto está arrastável ou não
      opacity: enabled ? 1 : 0.5,
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler} enabled={enabled}>
      <Animated.View style={[styles.pointContainer, animatedStyle]}>
        <Svg height="40" width="40">
          {/* Círculo externo para visualização e borda */}
          <Circle cx="20" cy="20" r="15" stroke={color} strokeWidth="3" fill="rgba(0,0,0,0.4)" />
          {/* Círculo interno, que é o ponto principal */}
          <Circle cx="20" cy="20" r="7" fill={color} />
        </Svg>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  pointContainer: {
    position: 'absolute',
    // Esses offsets garantem que o centro do SVG (20,20) esteja
    // na coordenada exata onde o ponto foi calculado.
    left: -20,
    top: -20,
    width: 40,
    height: 40,
  },
});