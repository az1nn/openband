import { useState } from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import { PageHeader } from "../src/components/PageHeader";
import { Button } from "../src/components/Button";
import { Badge } from "../src/components/Badge";
import { TextInput } from "../src/components/TextInput";
import { Divider } from "../src/components/Divider";
import { Card } from "../src/components/Card";
import {
  AI_PROVIDERS,
  IMAGE_MODELS,
  REFINER_PROVIDERS,
  useSettingsAIStore,
  type AIProvider,
  type AIProviderMeta,
  type ImageProvider,
} from "../src/lib/settingsStore";
import { API_BASE_URL } from "../src/lib/apiUrl";
import { supabase } from "../src/lib/supabase";

async function testKey(
  provider: AIProvider,
  apiKey: string,
): Promise<{ ok: boolean; message: string }> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? null;
  const res = await fetch(`${API_BASE_URL}/api/ai/test-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ provider, apiKey }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
  };
  return res.ok
    ? { ok: true, message: body.message ?? "Chave funcionando!" }
    : { ok: false, message: body.error ?? "Falha ao testar a chave." };
}

function ProviderCard({ meta }: { meta: AIProviderMeta }) {
  const key = useSettingsAIStore((s) => s.aiKeys[meta.id]);
  const setAIKey = useSettingsAIStore((s) => s.setAIKey);
  const removeAIKey = useSettingsAIStore((s) => s.removeAIKey);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const handleTest = async () => {
    if (!key) return;
    setTesting(true);
    setResult(null);
    try {
      setResult(await testKey(meta.id, key));
    } catch {
      setResult({ ok: false, message: "Falha ao testar a chave. Tente novamente." });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-4 gap-3">
      <View className="flex-row items-center justify-between gap-2 flex-wrap">
        <Text className="text-white text-base font-semibold">{meta.name}</Text>
        <Badge text={meta.function} variant="default" />
      </View>
      <Text className="text-gray-400 text-sm">{meta.description}</Text>
      <Pressable
        onPress={() => Linking.openURL(meta.signupUrl)}
        accessibilityRole="link"
        accessibilityLabel={`Obter chave ${meta.name}`}
        className="self-start"
      >
        <Text className="text-brand-primary text-sm font-semibold">
          Obter chave ↗
        </Text>
      </Pressable>
      <TextInput
        label="API Key"
        value={key ?? ""}
        onChangeText={(t) => {
          setAIKey(meta.id, t);
          setResult(null);
        }}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Cole sua chave de API"
        placeholderTextColor="#555"
        testID={`ai-key-input-${meta.id}`}
      />
      <View className="flex-row items-center gap-3 flex-wrap">
        <Button
          title="Testar chave"
          variant="secondary"
          size="sm"
          loading={testing}
          disabled={!key || testing}
          onPress={handleTest}
          testID={`ai-test-key-${meta.id}`}
        />
        {result && (
          <Text
            className={`flex-1 text-xs ${
              result.ok ? "text-green-400" : "text-red-400"
            }`}
          >
            {result.ok ? "✓ " : "✕ "}
            {result.message}
          </Text>
        )}
      </View>
      {key ? (
        <Button
          title="Apagar chave"
          variant="ghost"
          onPress={() => {
            removeAIKey(meta.id);
            setResult(null);
          }}
          testID={`ai-remove-key-${meta.id}`}
        />
      ) : null}
    </Card>
  );
}

function DefaultsSection() {
  const aiKeys = useSettingsAIStore((s) => s.aiKeys);
  const defaultImageProvider = useSettingsAIStore((s) => s.defaultImageProvider);
  const defaultPromptRefiner = useSettingsAIStore((s) => s.defaultPromptRefiner);
  const setDefaults = useSettingsAIStore((s) => s.setDefaults);

  const imageProviders = (Object.keys(IMAGE_MODELS) as ImageProvider[]).filter(
    (p) => !!aiKeys[p],
  );
  const refinerProviders = REFINER_PROVIDERS.filter((p) => !!aiKeys[p]);
  const noKeysHint =
    "Adicione uma chave para escolher o padrão deste provedor.";

  return (
    <>
      <Divider label="Padrões" />
      <Card className="p-4 gap-3">
        <Text className="text-gray-400 text-sm">Provedor de imagem padrão</Text>
        {imageProviders.length ? (
          <View className="flex-row flex-wrap gap-2">
            {imageProviders.map((p) => {
              const selected = defaultImageProvider === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setDefaults({ defaultImageProvider: p })}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  testID={`default-image-${p}`}
                  className={`px-3 py-1.5 rounded-full border ${
                    selected
                      ? "border-brand-primary bg-brand-primary/10"
                      : "border-dark-border bg-dark-muted"
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      selected ? "text-brand-primary font-semibold" : "text-gray-400"
                    }`}
                  >
                    {AI_PROVIDERS.find((m) => m.id === p)?.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Text className="text-gray-500 text-xs">{noKeysHint}</Text>
        )}

        <Text className="text-gray-400 text-sm">Refinador de prompt padrão</Text>
        {refinerProviders.length ? (
          <View className="flex-row flex-wrap gap-2">
            {refinerProviders.map((p) => {
              const selected = defaultPromptRefiner === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setDefaults({ defaultPromptRefiner: p })}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  testID={`default-refiner-${p}`}
                  className={`px-3 py-1.5 rounded-full border ${
                    selected
                      ? "border-brand-primary bg-brand-primary/10"
                      : "border-dark-border bg-dark-muted"
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      selected ? "text-brand-primary font-semibold" : "text-gray-400"
                    }`}
                  >
                    {AI_PROVIDERS.find((m) => m.id === p)?.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Text className="text-gray-500 text-xs">{noKeysHint}</Text>
        )}
      </Card>
    </>
  );
}

export default function SettingsAI() {
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-dark-bg"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="pt-4 px-4 gap-6 max-w-2xl self-center w-full">
        <View className="flex-row items-start">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            className="w-9 h-9 items-center justify-center rounded-lg bg-dark-elevated border border-dark-border active:opacity-70 mr-3 mt-1"
          >
            <Text className="text-white text-lg">←</Text>
          </Pressable>
          <View className="flex-1">
            <PageHeader
              title="IA & Chaves de API"
              subtitle="Gerencie chaves de provedores de IA"
            />
          </View>
        </View>

        <View className="card-elevated p-4">
          <Text className="text-gray-400 text-sm leading-relaxed">
            Suas chaves ficam guardadas apenas neste dispositivo e nunca são
            salvas nos nossos servidores — elas são enviadas ao nosso backend
            apenas no momento da chamada para serem encaminhadas ao provedor
            de IA.
          </Text>
        </View>

        {AI_PROVIDERS.map((meta) => (
          <ProviderCard key={meta.id} meta={meta} />
        ))}

        <DefaultsSection />

        <Button
          title="Voltar"
          variant="secondary"
          onPress={() => router.back()}
          testID="settings-ai-back"
        />
      </View>
    </ScrollView>
  );
}
