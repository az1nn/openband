from pathlib import Path

path = Path("app/studio/[id].tsx")
text = path.read_text()


def replace_once(old: str, new: str, label: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, found {count}")
    text = text.replace(old, new, 1)


replace_once(
    'import { getPlayheadBeat, setPlayheadBeat, subscribePlayhead } from "../../src/lib/playheadStore";\n',
    'import { getPlayheadBeat, setPlayheadBeat, subscribePlayhead } from "../../src/lib/playheadStore";\nimport { deleteRegion, duplicateRegion, moveRegionBySeconds, repeatRegion } from "../../src/lib/creativeLoop";\n',
    "creative loop import",
)

replace_once(
    '  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);\n',
    '  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);\n  const [selectedRegion, setSelectedRegion] = useState<{ trackId: string; regionId: string } | null>(null);\n',
    "selected region state",
)

replace_once(
    '  const toggleRecording = useCallback(async () => {\n',
    '  const toggleRecording = useCallback(async (forceArmed?: boolean | object) => {\n',
    "recording signature",
)
replace_once(
    '      if (!recordSettings.armed) {\n',
    '      if (!recordSettings.armed && forceArmed !== true) {\n',
    "recording armed gate",
)
replace_once(
    '''          if (!blob) {
            setIsRecording(false);
            setWebRecordingStart(null);
            liveRecordingDataRef.current = [];
            return;
          }
''',
    '''          if (!blob) {
            Alert.alert(
              t("studio.errorTitle", "Error"),
              t("studio.recordEmptyError", "Recording stopped without producing audio. Your project was not changed."),
            );
            setIsRecording(false);
            setWebRecordingStart(null);
            liveRecordingDataRef.current = [];
            return;
          }
''',
    "empty recording feedback",
)
replace_once(
    '''          setTracks(updatedTracks);
          if (isWeb) {
            rerenderAfterMuteSolo(updatedTracks).catch((e) =>
              console.warn("rerender after record failed:", e)
            );
          }
''',
    '''          setTracks(updatedTracks);
          if (isWeb) {
            await rerenderAfterMuteSolo(updatedTracks);
          }
''',
    "recording audible refresh",
)

region_actions = '''  const applyRegionAction = useCallback(
    (action: "move-left" | "move-right" | "duplicate" | "repeat" | "delete") => {
      if (!selectedRegion) return;
      const { trackId, regionId } = selectedRegion;
      const beatSeconds = 60 / Math.max(1, metronome.bpm);
      const stamp = Date.now();

      setTracks((current) => {
        switch (action) {
          case "move-left":
            return moveRegionBySeconds(current, trackId, regionId, -beatSeconds);
          case "move-right":
            return moveRegionBySeconds(current, trackId, regionId, beatSeconds);
          case "duplicate":
            return duplicateRegion(current, trackId, regionId, `region-${stamp}-copy`);
          case "repeat":
            return repeatRegion(current, trackId, regionId, [
              `region-${stamp}-repeat-1`,
              `region-${stamp}-repeat-2`,
              `region-${stamp}-repeat-3`,
            ]);
          case "delete":
            return deleteRegion(current, trackId, regionId);
        }
      });

      if (action === "delete") setSelectedRegion(null);
    },
    [selectedRegion, metronome.bpm, setTracks],
  );

'''
replace_once(
    '  const handleCodeRender = useCallback(\n',
    region_actions + '  const handleCodeRender = useCallback(\n',
    "region action handlers",
)

replace_once(
    '''      <View className="flex-1 flex-row">
''',
    '''      {selectedRegion && (
        <View className="h-10 bg-dark-surface/80 border-b border-dark-border/50 flex-row items-center px-3 gap-2">
          <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mr-1">
            {t("studio.regionActions", "Region")}
          </Text>
          <Pressable
            onPress={() => applyRegionAction("move-left")}
            accessibilityRole="button"
            accessibilityLabel={t("studio.moveRegionLeft", "Move region left one beat")}
            className="h-7 px-2 rounded-lg bg-dark-muted items-center justify-center active:opacity-70"
          >
            <Text className="text-gray-300 text-xs">← 1 beat</Text>
          </Pressable>
          <Pressable
            onPress={() => applyRegionAction("move-right")}
            accessibilityRole="button"
            accessibilityLabel={t("studio.moveRegionRight", "Move region right one beat")}
            className="h-7 px-2 rounded-lg bg-dark-muted items-center justify-center active:opacity-70"
          >
            <Text className="text-gray-300 text-xs">1 beat →</Text>
          </Pressable>
          <Pressable
            onPress={() => applyRegionAction("duplicate")}
            accessibilityRole="button"
            className="h-7 px-2 rounded-lg bg-dark-muted items-center justify-center active:opacity-70"
          >
            <Text className="text-gray-300 text-xs">{t("studio.duplicateRegion", "Duplicate")}</Text>
          </Pressable>
          <Pressable
            onPress={() => applyRegionAction("repeat")}
            accessibilityRole="button"
            className="h-7 px-2 rounded-lg bg-dark-muted items-center justify-center active:opacity-70"
          >
            <Text className="text-gray-300 text-xs">{t("studio.repeatRegion", "Repeat ×4")}</Text>
          </Pressable>
          <Pressable
            onPress={() => applyRegionAction("delete")}
            accessibilityRole="button"
            className="h-7 px-2 rounded-lg bg-red-500/15 border border-red-500/30 items-center justify-center active:opacity-70"
          >
            <Text className="text-red-400 text-xs">{t("studio.deleteRegion", "Delete")}</Text>
          </Pressable>
          <Pressable
            onPress={() => setSelectedRegion(null)}
            accessibilityRole="button"
            className="ml-auto w-7 h-7 rounded-lg items-center justify-center active:opacity-70"
          >
            <Text className="text-gray-500 text-xs">✕</Text>
          </Pressable>
        </View>
      )}

      <View className="flex-1 flex-row">
''',
    "region action toolbar",
)

replace_once(
    '''          {tracks.length === 0 ? (
              <View className="flex-1 items-center justify-center px-6" style={{ width: timelineWidth }}>
              <Text className="text-gray-400 text-base font-semibold">{t("studio.noTracksTitle", "No tracks yet")}</Text>
              <Text className="text-gray-500 text-xs mt-1 text-center">
                {t("studio.noTracksHint", "Add a track to get started")}
              </Text>
            </View>
''',
    '''          {tracks.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6" style={{ width: timelineWidth }}>
              <Text className="text-gray-300 text-lg font-bold">{t("studio.quickStartTitle", "Make your first sound")}</Text>
              <Text className="text-gray-500 text-xs mt-1 text-center max-w-md">
                {t("studio.quickStartHint", "Start with your microphone, an instrument, or a sample. No setup detour required.")}
              </Text>
              <View className="flex-row flex-wrap justify-center gap-2 mt-4">
                <Pressable
                  onPress={() => {
                    setRecordSettings((current) => ({ ...current, armed: true }));
                    void toggleRecording(true);
                  }}
                  accessibilityRole="button"
                  className="h-10 px-4 rounded-xl bg-red-500/20 border border-red-500/40 flex-row items-center gap-2 justify-center active:opacity-70"
                >
                  <Text className="text-red-400 text-sm">●</Text>
                  <Text className="text-white text-sm font-bold">{t("studio.quickRecord", "Record")}</Text>
                </Pressable>
                <Pressable
                  onPress={() => openModal("synth")}
                  accessibilityRole="button"
                  className="h-10 px-4 rounded-xl bg-dark-muted border border-dark-border flex-row items-center gap-2 justify-center active:opacity-70"
                >
                  <Text className="text-sm">🎹</Text>
                  <Text className="text-white text-sm font-bold">{t("studio.quickInstrument", "Instrument")}</Text>
                </Pressable>
                <Pressable
                  onPress={() => toggleModal("sampleBrowser")}
                  accessibilityRole="button"
                  className="h-10 px-4 rounded-xl bg-dark-muted border border-dark-border flex-row items-center gap-2 justify-center active:opacity-70"
                >
                  <Text className="text-sm">📂</Text>
                  <Text className="text-white text-sm font-bold">{t("studio.quickSamples", "Samples")}</Text>
                </Pressable>
              </View>
            </View>
''',
    "blank studio quick start",
)

replace_once(
    '''                      {track.regions.map((region) => (
                        <View
                          key={region.id}
                          style={{
                            left: region.start * pxPerSec,
                            width: region.duration * pxPerSec,
                            position: "absolute",
                          }}
                          className={`h-14 rounded-xl border border-white/10 overflow-hidden shadow-md ${
                            track.color
                          } ${isAudible(track) ? "opacity-95" : "opacity-25"}`}
                        >
                          <WaveformCanvas
                            regionId={region.id}
                            duration={region.duration}
                            color={track.color}
                            audible={isAudible(track)}
                            selected={selectedTrackId === track.id}
                            muted={track.muted}
                            height={56}
                          />
                        </View>
                      ))}
''',
    '''                      {track.regions.map((region) => {
                        const regionSelected =
                          selectedRegion?.trackId === track.id && selectedRegion?.regionId === region.id;
                        return (
                          <Pressable
                            key={region.id}
                            onPress={() => {
                              setSelectedTrackId(track.id);
                              setSelectedRegion({ trackId: track.id, regionId: region.id });
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={t("studio.selectRegion", "Select region")}
                            style={{
                              left: region.start * pxPerSec,
                              width: region.duration * pxPerSec,
                              position: "absolute",
                            }}
                            className={`h-14 rounded-xl border overflow-hidden shadow-md ${
                              regionSelected ? "border-2 border-brand-accent" : "border-white/10"
                            } ${track.color} ${isAudible(track) ? "opacity-95" : "opacity-25"}`}
                          >
                            <WaveformCanvas
                              regionId={region.id}
                              duration={region.duration}
                              color={track.color}
                              audible={isAudible(track)}
                              selected={regionSelected}
                              muted={track.muted}
                              height={56}
                            />
                          </Pressable>
                        );
                      })}
''',
    "region selection wiring",
)

path.write_text(text)
