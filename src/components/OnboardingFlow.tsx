import { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { Card } from "./Card";
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
    <View
      testID={testID}
      className="absolute inset-0 z-50 bg-black/80 justify-center items-center px-6"
    >
      <Card className="relative w-full max-w-lg p-7">
        <Pressable
onPress={handleClose}
className="absolute top-3 right-3 w-8 h-8 rounded-full bg-dark-surface items-center justify-center active:opacity-70"
accessibilityRole="button"
accessibilityLabel="Fechar"
testID="onboarding-close"
        >
<Text className="text-gray-400 text-lg">✕</Text>
        </Pressable>

        <Text className="text-white text-2xl font-bold mb-2 pr-8">
O que você quer fazer primeiro?
        </Text>
        <Text className="text-gray-300 text-sm mb-5 leading-5">
Sem cadastro obrigatório. Escolha uma ação e entre direto no Studio.
        </Text>

        <View className="gap-2">
{FIRST_RUN_ACTIONS.map((action) => (
  <Pressable
    key={action.id}
    testID={`onboarding-action-${action.id}`}
    onPress={() => handleAction(action.id)}
    accessibilityRole="button"
    accessibilityLabel={action.label}
    className="w-full rounded-xl border border-dark-border bg-dark-surface px-4 py-3 flex-row items-center gap-3 active:opacity-80"
  >
    <View className="w-10 h-10 rounded-xl bg-brand-primary/15 items-center justify-center">
      <Text className="text-xl">{action.icon}</Text>
    </View>
    <View className="flex-1">
      <Text className="text-white text-sm font-bold">{action.label}</Text>
      <Text className="text-gray-500 text-xs mt-0.5">{action.description}</Text>
    </View>
    <Text className="text-brand-primary text-lg">›</Text>
  </Pressable>
))}
        </View>

        <Pressable
testID="onboarding-advanced-project"
onPress={() => setShowProject(true)}
className="mt-4 py-2 items-center"
accessibilityRole="button"
accessibilityLabel="Configurar projeto completo"
        >
<Text className="text-gray-400 text-xs font-semibold">
  Configurar projeto completo
</Text>
        </Pressable>

        <Pressable
onPress={() => setDontShowAgain((v) => !v)}
className="mt-2 flex-row items-center gap-2 self-start"
accessibilityRole="checkbox"
accessibilityState={{ checked: dontShowAgain }}
accessibilityLabel="Não mostrar novamente"
testID="onboarding-dont-show"
        >
<View
  className={`w-5 h-5 rounded border items-center justify-center ${
    dontShowAgain
      ? "bg-brand-primary border-brand-primary"
      : "border-gray-500"
  }`}
>
  {dontShowAgain && <Text className="text-white text-xs">✓</Text>}
</View>
<Text className="text-gray-300 text-sm">Não mostrar novamente</Text>
        </Pressable>
      </Card>
    </View>
  );
}
