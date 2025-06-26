import React from 'react';
import { StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

export default function DraggablePoint({ x, y, color, scale, enabled }) {
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = x.value;
      ctx.startY = y.value;
    },
    onActive: (event, ctx) => {
      x.value = ctx.startX + event.translationX / scale.value;
      y.value = ctx.startY + event.translationY / scale.value;
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
    opacity: enabled ? 1 : 0.5,
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler} enabled={enabled}>
      <Animated.View style={[styles.pointContainer, animatedStyle]}>
        <Svg height="40" width="40">
          <Circle cx="20" cy="20" r="15" stroke={color} strokeWidth="3" fill="rgba(0,0,0,0.4)" />
          <Circle cx="20" cy="20" r="7" fill={color} />
        </Svg>
      </Animated.View>
    </PanGestureHandler>
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