import { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "./Button";
import { TextInput } from "./TextInput";
import { Divider } from "./Divider";
import {
  AI_PROVIDERS,
  ASPECT_RATIOS,
  IMAGE_MODELS,
  REFINER_PROVIDERS,
  useSettingsAIStore,
  type AspectRatio,
  type ImageProvider,
  type RefinerProvider,
} from "../lib/settingsStore";
import { API_BASE_URL } from "../lib/apiUrl";
import { getSupabase } from "../lib/supabase";
import { OpenBandNative, isElectron } from "../bridge";

interface GenerateCoverModalProps {
  visible: boolean;
  onClose: () => void;
  projectTitle: string;
  genre?: string;
  lyrics?: string;
  onLyricsChange?: (text: string) => void;
  onUseAsCover: (coverDataUrl: string) => void;
}

type SourceMode = "lyrics" | "custom";
type Quality = "standard" | "high";

export function sanitizeCoverFilename(title: string): string {
  const cleaned = title
    .replace(/[\/\\:*?"<>|]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "capa";
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function dataURLToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mime = meta.match(/data:(.*?);/)?.[1] ?? "image/png";
  const bin = atob(b64 ?? "");
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function dataURLToArrayBuffer(dataUrl: string): ArrayBuffer {
  const b64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function getToken(): Promise<string | null> {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export function GenerateCoverModal({
  visible,
  onClose,
  projectTitle,
  genre,
  lyrics,
  onLyricsChange,
  onUseAsCover,
}: GenerateCoverModalProps) {
  const router = useRouter();
  const aiKeys = useSettingsAIStore((s) => s.aiKeys);

  const [sourceMode, setSourceMode] = useState<SourceMode>("lyrics");
  const [lyricsText, setLyricsText] = useState("");
  const [customText, setCustomText] = useState("");
  const [refinedPrompt, setRefinedPrompt] = useState("");
  const [refinerProvider, setRefinerProvider] = useState<RefinerProvider>("claude");
  const [refining, setRefining] = useState(false);
  const [imageProvider, setImageProvider] = useState<ImageProvider>("gemini");
  const [model, setModel] = useState<string>(IMAGE_MODELS.gemini[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [quality, setQuality] = useState<Quality>("standard");
  const [generating, setGenerating] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lyricsRef = useRef(lyrics);
  lyricsRef.current = lyrics;
  const prevVisibleRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      prevVisibleRef.current = false;
      return;
    }
    if (prevVisibleRef.current) return;
    prevVisibleRef.current = true;
    const runOpenReset = () => {
      const st = useSettingsAIStore.getState();
      const keys = st.aiKeys;
      const imgProviders = (Object.keys(IMAGE_MODELS) as ImageProvider[]).filter(
        (p) => !!keys[p],
      );
      const refProviders = REFINER_PROVIDERS.filter((p) => !!keys[p]);
      const imgDefault = imgProviders.includes(st.defaultImageProvider as ImageProvider)
        ? (st.defaultImageProvider as ImageProvider)
        : (imgProviders[0] ?? "gemini");
      const refDefault =
        st.defaultPromptRefiner &&
        refProviders.includes(st.defaultPromptRefiner as RefinerProvider)
          ? (st.defaultPromptRefiner as RefinerProvider)
          : (refProviders[0] ?? "claude");
      setSourceMode("lyrics");
      setLyricsText(typeof lyricsRef.current === "string" ? lyricsRef.current : "");
      setCustomText("");
      setRefinedPrompt("");
      setImageProvider(imgDefault);
      setModel((IMAGE_MODELS[imgDefault] ?? IMAGE_MODELS.gemini)[0]);
      setAspectRatio("1:1");
      setQuality("standard");
      setRefinerProvider(refDefault);
      setRefining(false);
      setGenerating(false);
      setResultDataUrl(null);
      setError(null);
    };
    if (useSettingsAIStore.persist.hasHydrated()) {
      runOpenReset();
      return;
    }
    return useSettingsAIStore.persist.onFinishHydration(runOpenReset);
  }, [visible]);

  const imageProviders = (Object.keys(IMAGE_MODELS) as ImageProvider[]).filter(
    (p) => !!aiKeys[p],
  );
  const refinerProviders = REFINER_PROVIDERS.filter((p) => !!aiKeys[p]);
  const hasImageKey = imageProviders.length > 0;

  const promptSource =
    (refinedPrompt ||
      (sourceMode === "lyrics" ? lyricsText : customText) ||
      "").trim();

  const handleRefine = async () => {
    const source =
      (sourceMode === "lyrics" ? lyricsText : customText).trim();
    if (!source) {
      setError("Digite um texto ou a letra da música para refinar.");
      return;
    }
    const key = aiKeys[refinerProvider];
    if (!key) {
      setError("Configure a chave do refinador primeiro.");
      return;
    }
    setRefining(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/ai/refine-prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          provider: refinerProvider,
          apiKey: key,
          lyrics: lyricsText,
          customPrompt: customText,
          projectTitle,
          genre,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error || "Falha ao refinar o prompt.");
        return;
      }
      setRefinedPrompt((data as { refined?: string }).refined || "");
    } catch {
      setError("Falha ao refinar o prompt. Tente novamente.");
    } finally {
      setRefining(false);
    }
  };

  const handleGenerate = async () => {
    const prompt = promptSource;
    if (!prompt) {
      setError("Digite um texto ou refine o prompt antes de gerar.");
      return;
    }
    const key = aiKeys[imageProvider];
    if (!key) {
      setError("Configure a chave deste provedor primeiro.");
      return;
    }
    setGenerating(true);
    setError(null);
    setResultDataUrl(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/ai/generate-cover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          provider: imageProvider,
          apiKey: key,
          prompt,
          model,
          aspectRatio,
          quality,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || "Falha ao gerar a capa.");
        return;
      }
      const blob = await res.blob();
      const dataUrl = await blobToDataURL(blob);
      setResultDataUrl(dataUrl);
    } catch {
      setError("Falha ao gerar a capa. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  const handleNewVersion = () => {
    void handleGenerate();
  };

  const handleDownload = async () => {
    if (!resultDataUrl) return;
    const filename = `${sanitizeCoverFilename(projectTitle)}.png`;
    const isDesktopElectron = isElectron;
    try {
      if (isDesktopElectron || Platform.OS !== "web") {
        const path = await OpenBandNative.showSaveDialog({
          defaultPath: filename,
          filters: [{ name: "PNG", extensions: ["png"] }],
        });
        if (path) {
          await OpenBandNative.writeFile(path, dataURLToArrayBuffer(resultDataUrl));
        }
      } else {
        const blob = dataURLToBlob(resultDataUrl);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 3000);
      }
    } catch {
      setError("Falha ao baixar a capa. Tente novamente.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID="generate-cover-modal"
    >
      <View className="flex-1 bg-black/60 justify-center px-4 py-8">
        <View className="w-full max-w-lg bg-dark-surface rounded-3xl border border-dark-border p-5 self-center">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-bold">
              ✨ Gerar Capa com IA
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              className="w-8 h-8 items-center justify-center active:opacity-60"
            >
              <Text className="text-gray-400 text-lg">✕</Text>
            </Pressable>
          </View>

          <ScrollView className="max-h-[70vh]">
            {!hasImageKey ? (
              <View className="card p-4 items-center gap-3">
                <Text className="text-gray-300 text-sm font-semibold">
                  Configure sua chave de IA primeiro
                </Text>
                <Text className="text-gray-500 text-xs text-center">
                  Adicione uma chave de um provedor de imagens (ex: Gemini) nas
                  configurações para gerar capas.
                </Text>
                <Button
                  title="Configurar chaves"
                  variant="secondary"
                  onPress={() => router.push("/settings-ai")}
                />
              </View>
            ) : (
              <>
                <Divider label="Fonte do prompt" labelAlign="left" className="mb-3" />
                <View className="flex-row gap-2 mb-3">
                  {(
                    [
                      { id: "lyrics", label: "Letra da música" },
                      { id: "custom", label: "Texto personalizado" },
                    ] as { id: SourceMode; label: string }[]
                  ).map((tab) => (
                    <Pressable
                      key={tab.id}
                      onPress={() => {
                        setSourceMode(tab.id);
                        setRefinedPrompt("");
                      }}
                      accessibilityRole="button"
                      className={`flex-1 py-2 px-2 items-center rounded-full border-2 ${
                        sourceMode === tab.id
                          ? "border-brand-primary bg-brand-primary/10"
                          : "border-dark-border"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          sourceMode === tab.id
                            ? "text-brand-primary"
                            : "text-gray-400"
                        }`}
                      >
                        {tab.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {sourceMode === "lyrics" ? (
                  <TextInput
                    label="Letra da música"
                    value={lyricsText}
                    onChangeText={(t) => {
                      setLyricsText(t);
                      onLyricsChange?.(t);
                    }}
                    multiline
                    placeholder="Cole a letra da música..."
                    placeholderTextColor="#555"
                    className="min-h-[90px]"
                  />
                ) : (
                  <TextInput
                    label="Texto personalizado"
                    value={customText}
                    onChangeText={setCustomText}
                    multiline
                    placeholder="Descreva a capa que você quer..."
                    placeholderTextColor="#555"
                    className="min-h-[90px]"
                  />
                )}

                <Divider label="Refinar prompt" labelAlign="left" className="my-4" />
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {refinerProviders.map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setRefinerProvider(p)}
                      accessibilityRole="button"
                      className={`px-3 py-1.5 rounded-full border ${
                        refinerProvider === p
                          ? "border-brand-primary bg-brand-primary/10"
                          : "border-dark-border bg-dark-muted"
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          refinerProvider === p
                            ? "text-brand-primary font-semibold"
                            : "text-gray-400"
                        }`}
                      >
                        {AI_PROVIDERS.find((m) => m.id === p)?.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Button
                  title="✨ Deixar profissional"
                  variant="secondary"
                  loading={refining}
                  disabled={
                    refining ||
                    refinerProviders.length === 0 ||
                    (sourceMode === "lyrics" ? lyricsText : customText).trim() === ""
                  }
                  onPress={handleRefine}
                />
                <TextInput
                  label="Prompt refinado (editável)"
                  value={refinedPrompt}
                  onChangeText={(t) => {
                    setRefinedPrompt(t);
                    if (error) setError(null);
                  }}
                  multiline
                  placeholder="O prompt refinado aparece aqui..."
                  placeholderTextColor="#555"
                  className="min-h-[70px] mt-3"
                />

                <Divider label="Configurações" labelAlign="left" className="my-4" />
                <Text className="label ml-1 mb-1">Provedor de imagem</Text>
                <View className="flex-row flex-wrap gap-2 mb-2">
                  {imageProviders.map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => {
                        setImageProvider(p);
                        setModel(IMAGE_MODELS[p][0]);
                      }}
                      accessibilityRole="button"
                      className={`px-3 py-1.5 rounded-full border ${
                        imageProvider === p
                          ? "border-brand-primary bg-brand-primary/10"
                          : "border-dark-border bg-dark-muted"
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          imageProvider === p
                            ? "text-brand-primary font-semibold"
                            : "text-gray-400"
                        }`}
                      >
                        {AI_PROVIDERS.find((m) => m.id === p)?.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text className="label ml-1 mb-1">Modelo</Text>
                <View className="flex-row flex-wrap gap-2 mb-2">
                  {IMAGE_MODELS[imageProvider].map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => setModel(m)}
                      accessibilityRole="button"
                      className={`px-3 py-1.5 rounded-full border ${
                        model === m
                          ? "border-brand-accent bg-brand-accent/10"
                          : "border-dark-border bg-dark-muted"
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          model === m
                            ? "text-brand-accent font-semibold"
                            : "text-gray-400"
                        }`}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text className="label ml-1 mb-1">Proporção</Text>
                <View className="flex-row flex-wrap gap-2 mb-2">
                  {ASPECT_RATIOS.map((r) => (
                    <Pressable
                      key={r.id}
                      onPress={() => setAspectRatio(r.id)}
                      accessibilityRole="button"
                      className={`px-3 py-1.5 rounded-full border ${
                        aspectRatio === r.id
                          ? "border-brand-primary bg-brand-primary/10"
                          : "border-dark-border bg-dark-muted"
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          aspectRatio === r.id
                            ? "text-brand-primary font-semibold"
                            : "text-gray-400"
                        }`}
                      >
                        {r.id} · {r.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {imageProvider === "openai" && (
                  <View className="flex-row gap-2 mb-2">
                    {(
                      [
                        { id: "standard", label: "Standard" },
                        { id: "high", label: "High" },
                      ] as { id: Quality; label: string }[]
                    ).map((q) => (
                      <Pressable
                        key={q.id}
                        onPress={() => setQuality(q.id)}
                        accessibilityRole="button"
                        className={`flex-1 py-2 px-2 items-center rounded-full border-2 ${
                          quality === q.id
                            ? "border-brand-primary bg-brand-primary/10"
                            : "border-dark-border"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            quality === q.id
                              ? "text-brand-primary"
                              : "text-gray-400"
                          }`}
                        >
                          {q.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {error && (
                  <Text className="text-red-400 text-xs mb-2">{error}</Text>
                )}

                <Button
                  title="🎨 Gerar capa"
                  variant="primary"
                  loading={generating}
                  disabled={generating || !promptSource}
                  onPress={handleGenerate}
                  className="mt-1"
                />
              </>
            )}

            {resultDataUrl && (
              <View className="mt-4 gap-3">
                <Image
                  source={{ uri: resultDataUrl }}
                  accessibilityLabel="Prévia da capa gerada"
                  className="w-full aspect-square rounded-xl border border-dark-border bg-dark-muted"
                  resizeMode="contain"
                />
                <Button
                  title="✅ Usar como Capa"
                  variant="primary"
                  onPress={() => onUseAsCover(resultDataUrl)}
                />
                <Button
                  title="🔄 Nova Versão"
                  variant="secondary"
                  loading={generating}
                  disabled={generating}
                  onPress={handleNewVersion}
                />
                <Button
                  title="💾 Baixar"
                  variant="ghost"
                  onPress={handleDownload}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
