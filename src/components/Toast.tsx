import { createContext, useCallback, useContext, useState } from "react";
import { View, Text, Animated } from "react-native";

type ToastType = "info" | "error" | "success";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  opacity: Animated.Value;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ACCENT: Record<ToastType, string> = {
  info: "#007aff",
  error: "#ff3b30",
  success: "#34c759",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Date.now() + Math.random();
      const opacity = new Animated.Value(0);
      setToasts((prev) => [...prev, { id, message, type, opacity }]);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      const dismiss = () => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => remove(id));
      };
      setTimeout(dismiss, 3000);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toasts.length > 0 && (
        <View
          pointerEvents="none"
          className="absolute bottom-6 left-0 right-0 items-center z-[9999]"
          accessibilityRole="alert"
        >
          {toasts.map((t) => (
            <Animated.View
              key={t.id}
              className="bg-[rgb(28_28_34)] border border-[rgb(42_42_50)] border-l-4 rounded-[10px] py-3 px-[18px] mb-2 max-w-[360px]"
              style={{ opacity: t.opacity, borderLeftColor: ACCENT[t.type] }}
            >
              <Text className="text-white text-sm font-semibold">{t.message}</Text>
            </Animated.View>
          ))}
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
