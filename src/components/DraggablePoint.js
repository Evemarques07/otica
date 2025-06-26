// src/components/DraggablePoint.js
import React from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

export default function DraggablePoint({
  x,
  y,
  color,
  imageScale,
  imageTranslateX,
  imageTranslateY,
  enabled,
}) {
  // MUDANÇA PRINCIPAL: Lógica do gesto simplificada e mais estável
  // Usamos .onChange() para obter a mudança incremental em vez de
  // .onUpdate() com um contexto (ctx), que era a causa da instabilidade.
  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onChange((event) => {
      'worklet';
      // Verificação para evitar divisão por zero ou valores inválidos
      if (imageScale?.value > 0) {
        // Atualizamos a posição do ponto somando a mudança (delta) do gesto.
        // A mudança é dividida pela escala da imagem para que o ponto "siga"
        // o dedo corretamente, mesmo quando há zoom.
        x.value += event.changeX / imageScale.value;
        y.value += event.changeY / imageScale.value;
      }
    })
    .onEnd(() => {
      // Exemplo de como logar de forma segura, se necessário
      // runOnJS(console.log)('[END] Posição final X:', x.value);
    });

  const animatedStyle = useAnimatedStyle(() => {
    // Mantemos as verificações para garantir que não haja valores inválidos
    // que possam quebrar a animação.
    const scale = imageScale?.value ?? 1;
    const tx = imageTranslateX?.value ?? 0;
    const ty = imageTranslateY?.value ?? 0;
    const px = x?.value ?? 0;
    const py = y?.value ?? 0;

    if (
      !isFinite(scale) ||
      !isFinite(tx) ||
      !isFinite(ty) ||
      !isFinite(px) ||
      !isFinite(py)
    ) {
      // Se algum valor for inválido, retornamos uma opacidade baixa para indicar um problema.
      return { opacity: 0.2 };
    }

    // A posição final do ponto na tela é sua posição no "mundo" da imagem (px, py)
    // multiplicada pela escala e somada à translação da imagem.
    const translateX = px * scale + tx;
    const translateY = py * scale + ty;

    return {
      transform: [{ translateX }, { translateY }],
      opacity: enabled ? 1 : 0.5,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.pointContainer, animatedStyle]}>
        <Svg height="40" width="40">
          <Circle
            cx="20"
            cy="20"
            r="15"
            stroke={color}
            strokeWidth="3"
            fill="rgba(0,0,0,0.4)"
          />
          <Circle cx="20" cy="20" r="7" fill={color} />
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  pointContainer: {
    position: 'absolute',
    // O centro do ponto (20,20) deve estar na posição (0,0) para o transform funcionar
    left: -20,
    top: -20,
    width: 40,
    height: 40,
  },
});
