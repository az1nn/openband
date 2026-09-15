import { useState, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NewProject } from "./NewProject";
import type { ProjectStarterResult } from "../lib/projectStarter";
import {
  FIRST_RUN_ACTIONS,
  type FirstRunAction,
} from "../lib/firstRun";

interface OnboardingFlowProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (config: ProjectStarterResult) => void;
  onAction?: (action: FirstRunAction) => void;
  onStartFromScratch?: (result: ProjectStarterResult) => void;
  onDontShowAgain?: () => void;
  testID?: string;
}

export function OnboardingFlow({
  visible,
  onClose,
  onCreate,
  onAction,
  onStartFromScratch,
  onDontShowAgain,
  testID,
}: OnboardingFlowProps) {
  const [showProject, setShowProject] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = useCallback(() => {
    if (dontShowAgain) onDontShowAgain?.();
    onClose();
  }, [dontShowAgain, onDontShowAgain, onClose]);

  const handleProjectCreate = useCallback(
    (result: ProjectStarterResult) => {
      setShowProject(false);
      onCreate(result);
    },
    [onCreate],
  );

  const handleProjectClose = useCallback(() => {
    setShowProject(false);
    onClose();
  }, [onClose]);

  const handleStartFromScratch = useCallback(
    (result: ProjectStarterResult) => {
      setShowProject(false);
      onStartFromScratch?.(result);
      onClose();
    },
    [onStartFromScratch, onClose],
  );

  const handleAction = useCallback(
    (action: FirstRunAction) => {
      if (onAction) {
        onAction(action);
        return;
      }
      setShowProject(true);
    },
    [onAction],
  );

  if (!visible) return null;

  if (showProject) {
    return (
      <NewProject
        visible={true}
        onClose={handleProjectClose}
        onCreate={handleProjectCreate}
        onStartFromScratch={handleStartFromScratch}
        testID={testID}
      />
    );
  }

  return (
    <View testID={testID} style={styles.overlay}>
      <View style={styles.card}>
        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          testID="onboarding-close"
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <Text style={styles.title}>O que você quer fazer primeiro?</Text>
        <Text style={styles.subtitle}>
          Sem cadastro obrigatório. Escolha uma ação e entre direto no Studio.
        </Text>

        <View style={styles.actions}>
          {FIRST_RUN_ACTIONS.map((action) => (
            <Pressable
              key={action.id}
              testID={`onboarding-action-${action.id}`}
              onPress={() => handleAction(action.id)}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.actionIconBox}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionLabel}>{action.label}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          testID="onboarding-advanced-project"
          onPress={() => setShowProject(true)}
          style={({ pressed }) => [
            styles.advancedButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Configurar projeto completo"
        >
          <Text style={styles.advancedText}>Configurar projeto completo</Text>
        </Pressable>

        <Pressable
          onPress={() => setDontShowAgain((value) => !value)}
          style={({ pressed }) => [
            styles.dontShowRow,
            pressed && styles.pressed,
          ]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: dontShowAgain }}
          accessibilityLabel="Não mostrar novamente"
          testID="onboarding-dont-show"
        >
          <View
            style={[
              styles.checkbox,
              dontShowAgain ? styles.checkboxChecked : styles.checkboxUnchecked,
            ]}
          >
            {dontShowAgain && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.dontShowText}>Não mostrar novamente</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 512,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2a2a32",
    backgroundColor: "#141418",
    padding: 28,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1c1c22",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#a1a1aa",
    fontSize: 18,
    lineHeight: 22,
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    paddingRight: 32,
    marginBottom: 8,
  },
  subtitle: {
    color: "#d1d1d6",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  actions: {
    width: "100%",
    gap: 8,
  },
  actionButton: {
    width: "100%",
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a32",
    backgroundColor: "#141418",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 12,
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
  actionCopy: {
    flex: 1,
    minWidth: 0,
  },
  actionLabel: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  actionDescription: {
    color: "#8e8e93",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  actionArrow: {
    color: "#ff3b30",
    fontSize: 18,
    lineHeight: 22,
  },
  advancedButton: {
    minHeight: 36,
    marginTop: 16,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  advancedText: {
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  dontShowRow: {
    alignSelf: "flex-start",
    minHeight: 32,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#ff3b30",
    borderColor: "#ff3b30",
  },
  checkboxUnchecked: {
    borderColor: "#8e8e93",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 14,
  },
  dontShowText: {
    color: "#d1d1d6",
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.8,
  },
});
