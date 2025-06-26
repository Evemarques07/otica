import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  colors,
  layout,
  typography,
  components,
  spacing,
} from '../styles/theme';

export default function ResultScreen({ route, navigation }) {
  const { imageUri, measurements } = route.params;

  if (!measurements) {
    return (
      <View style={[layout.container, layout.centered]}>
        <Text style={styles.errorText}>Erro: Medidas não disponíveis.</Text>
        <TouchableOpacity
          style={[components.buttonPrimary, { width: '80%' }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={components.buttonPrimaryText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const MeasurementGroup = ({ title, data }) => (
    <View style={styles.groupContainer}>
      <Text style={styles.resultCategory}>{title}</Text>
      {data.map((item, index) => (
        <View key={index} style={styles.resultRow}>
          <Text style={styles.resultLabel}>{item.label}</Text>
          <Text style={styles.resultValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.title}>Resultados da Análise</Text>

      <Image source={{ uri: imageUri }} style={styles.image} />

      <View style={styles.resultsCard}>
        <MeasurementGroup
          title="Distância Pupilar (DP)"
          data={[
            {
              label: 'DNP Total',
              value: `${measurements.pupillaryDistance?.toFixed(2) ?? 'N/A'} mm`,
            },
            {
              label: 'DP Esquerda',
              value: `${measurements.pdLeft?.toFixed(2) ?? 'N/A'} mm`,
            },
            {
              label: 'DP Direita',
              value: `${measurements.pdRight?.toFixed(2) ?? 'N/A'} mm`,
            },
          ]}
        />
        <MeasurementGroup
          title="Altura do Centro Óptico"
          data={[
            {
              label: 'Altura Esquerda',
              value: `${measurements.opticalCenterLeft?.toFixed(2) ?? 'N/A'} mm`,
            },
            {
              label: 'Altura Direita',
              value: `${measurements.opticalCenterRight?.toFixed(2) ?? 'N/A'} mm`,
            },
          ]}
        />
        <MeasurementGroup
          title="Medidas da Armação"
          data={[
            {
              label: 'Largura Total',
              value: `${measurements.frameWidth?.toFixed(2) ?? 'N/A'} mm`,
            },
          ]}
        />
      </View>

      <TouchableOpacity
        style={[components.buttonPrimary, styles.finalButton]}
        onPress={() => navigation.popToTop()} // Volta para a primeira tela (Home)
      >
        <Text style={components.buttonPrimaryText}>Fazer Nova Medição</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.l,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    borderRadius: layout.borderRadius,
    marginBottom: spacing.l,
    backgroundColor: colors.border,
  },
  resultsCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius,
    padding: spacing.l,
    width: '100%',
    ...layout.shadow,
  },
  groupContainer: {
    marginBottom: spacing.l,
    '&:last-child': {
      marginBottom: 0,
    },
  },
  resultCategory: {
    ...typography.label,
    marginBottom: spacing.m,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  resultLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  resultValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  finalButton: {
    marginTop: spacing.xl,
    width: '100%',
  },
});
