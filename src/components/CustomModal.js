import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  colors,
  layout,
  typography,
  components,
  spacing,
} from '../styles/theme';

const CustomModal = ({ isVisible, onClose, title, message, buttons }) => {
  if (!isVisible) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  button.style === 'primary'
                    ? components.buttonPrimary
                    : components.buttonSecondary,
                  { flex: 1, marginHorizontal: spacing.xs }, // Adiciona espaçamento entre botões
                ]}
                onPress={button.onPress}
              >
                <Text
                  style={
                    button.style === 'primary'
                      ? components.buttonPrimaryText
                      : components.buttonSecondaryText
                  }
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.blackOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  container: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius,
    padding: spacing.l,
    alignItems: 'center',
    ...layout.shadow,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.l,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default CustomModal;
