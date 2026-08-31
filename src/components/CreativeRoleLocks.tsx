import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Badge } from "./Badge";
import type { LockRole } from "../lib/lockPolicy";
import type { RoleLocks } from "../lib/creativeSession";

interface CreativeRoleLocksProps {
  roles: LockRole[];
  locks: RoleLocks;
  onToggle: (role: LockRole) => void;
  incompatible?: LockRole[];
  testID?: string;
}

const roleLabelKey: Record<LockRole, string> = {
  rhythm: "creative.role.rhythm",
  bass: "creative.role.bass",
  harmony: "creative.role.harmony",
  melody: "creative.role.melody",
  fx: "creative.role.fx",
  unknown: "creative.role.unknown",
};

export function CreativeRoleLocks({
  roles,
  locks,
  onToggle,
  incompatible = [],
  testID,
}: CreativeRoleLocksProps) {
  const { t } = useTranslation();
  const incompatibleSet = new Set(incompatible);

  return (
    <View testID={testID} className="mb-4">
      <Text className="text-gray-400 text-xs font-medium mb-2">
        {t("creative.locks", "Travar Papéis")}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {roles.map((role) => {
          const locked = !!locks[role];
          const isIncompatible = incompatibleSet.has(role);
          return (
            <Pressable
              key={role}
              testID={`role-toggle-${role}`}
              onPress={() => onToggle(role)}
              className={`flex-row items-center gap-1.5 px-3 py-2 rounded-lg border ${
                locked
                  ? "bg-brand-accent/20 border-brand-accent"
                  : "bg-dark-surface border-dark-border"
              } ${isIncompatible ? "opacity-60" : ""}`}
            >
              <View
                testID={`role-locked-${role}`}
                className={`w-2.5 h-2.5 rounded-full ${
                  locked ? "bg-brand-accent" : "bg-dark-border"
                }`}
              />
              <Text
                className={`text-sm font-medium ${
                  locked ? "text-brand-accent" : "text-gray-300"
                }`}
              >
                {t(roleLabelKey[role], role)}
              </Text>
              {isIncompatible && (
                <View testID={`role-warning-${role}`}>
                  <Badge text="!" variant="default" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
