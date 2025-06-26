import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
// A tela de Resultado será nossa nova tela de Medição
import MeasurementScreen from '../screens/MeasurementScreen';
import AdjustScreen from '../screens/AdjustScreen';
import ResultScreen from '../screens/ResultScreen'; // Importe ResultScreen

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Início' }}
        />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ title: 'Posicione o Rosto e o Cartão' }}
        />
        {/* Tela para calibrar com o cartão */}
        <Stack.Screen
          name="Adjust"
          component={AdjustScreen}
          options={{ title: 'Ajuste a Referência do Cartão' }}
        />
        {/* Nova tela para fazer as medições faciais */}
        <Stack.Screen
          name="Measurement"
          component={MeasurementScreen}
          options={{ title: 'Faça suas Medidas' }}
        />
        {/* Adiciona a tela de Resultado */}
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: 'Resultados' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}