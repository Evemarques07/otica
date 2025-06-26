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
  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onChange((event) => {
      'worklet';
      if (imageScale?.value > 0) {
        x.value += event.changeX / imageScale.value;
        y.value += event.changeY / imageScale.value;
      }
    })
    .onEnd(() => {
      // runOnJS(console.log)('[END] Posição final X:', x.value);
    });

  const animatedStyle = useAnimatedStyle(() => {
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
      return { opacity: 0.2 };
    }

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
    left: -20,
    top: -20,
    width: 40,
    height: 40,
  },
});
