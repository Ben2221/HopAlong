import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../theme/colors';
import { Info, AlertTriangle, CheckCircle2, X } from 'lucide-react-native';

import { BlurView } from 'expo-blur';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  actionText?: string;
  onAction?: () => void;
}

const CustomAlert = ({ visible, title, message, type = 'info', onClose, actionText, onAction }: CustomAlertProps) => {
  const { colors } = useTheme();
  
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={32} color={colors.success} strokeWidth={2.5} />;
      case 'error': return <AlertTriangle size={32} color={colors.danger} strokeWidth={2.5} />;
      case 'warning': return <AlertTriangle size={32} color={colors.warning} strokeWidth={2.5} />;
      default: return <Info size={32} color={colors.primary} strokeWidth={2.5} />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.danger;
      case 'warning': return colors.warning;
      default: return colors.primary;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: getBorderColor() + '40' }]}>
          <View style={styles.header}>
            <View style={[styles.iconBox, { backgroundColor: getBorderColor() + '15' }]}>
              {getIcon()}
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surface }]}>
              <X size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
          </View>
          
          <View style={styles.footer}>
            {onAction && actionText && (
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: getBorderColor(), shadowColor: getBorderColor() }]}
                onPress={() => {
                  onAction();
                  onClose();
                }}
              >
                <Text style={[styles.actionText, { color: colors.black }]}>{actionText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.cancelBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>{onAction ? 'Cancel' : 'Dismiss'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    borderRadius: 40,
    borderWidth: 1.5,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    opacity: 0.8,
  },
  footer: {
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  actionText: {
    fontSize: 17,
    fontWeight: '900',
  },
  cancelBtn: {
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '700',
  },
});

export default CustomAlert;
