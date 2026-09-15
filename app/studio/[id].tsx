import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
} from "expo-audio";
import { getProjectDurationSeconds } from "../../src/lib/midiSynth";
import { audioSystem, markBlobActive, revokeTrackedBlob } from "../../src/lib/universalAudio";
import { saveAsset, resolveAssetUrl, revokeAssetCache, deleteAssetUrl } from "../../src/lib/assetStore";
import { API_BASE_URL } from "../../src/lib/apiUrl";
import { assignTrackToBus } from "../../src/lib/busRouter";
import { setMasteringInput } from "../../src/lib/masteringBridge";
import { buildAutomationSchedule, interpolateAutomationValue, type ScheduledAutomationPoint } from "../../src/lib/automationEngine";
import {
  Metronome,
  PluginRack,
  MasterRack,
  MixManager,
  WaveformCanvas,
  AutomationLane,
  TrackGroupManager,
  SampleBrowser,
  PedalRack,
  OneKnobProcessor,
  ONE_KNOB_TYPES,
  ChordTrack,
  VuMeter,
  TrackColorPicker,
  Sidebar,
  LiveWaveformCanvas,
  MasteringSuite,
} from "../../src/components";
import {
  applyMidiMessage,
  setMidiTargetHandler,
  subscribeToInputs,
} from "../../src/lib/midiLearn";
import type { MidiTarget } from "../../src/lib/midiLearn";
import { registerCommand, initKeyBindings, disposeKeyBindings } from "../../src/lib/commandRegistry";
import { chordsToMIDINotes } from "../../src/lib/harmonicAssistant";
import { useHistory } from "../../src/lib/history";
import { useKeyboardShortcuts } from "../../src/lib/keyboard";
import type { ProjectData } from "../../src/lib/projectStore";
import { useCloudSync } from "../../src/lib/cloudSync";
import { parseMidi, midiToTrackRegions } from "../../src/lib/midiParser";
import { getGroupVolume } from "../../src/components/TrackGroup";
import type {
  Plugin,
  MetronomeSettings,
  RecordSettings,
  TrackDef,
  GroupDef,
  TrackRegion,
  MIDINote,
} from "../../src/lib/types";
import { PLUGIN_SPECS, clampParam } from "../../src/lib/types";
import { useResponsive } from "../../src/lib/responsive";
import { autoMix, AUTOMIX_GENRES } from "../../src/lib/automix";
import { generateTracksForGenre } from "../../src/lib/projectTemplates";
import type { AutomationPoint } from "../../src/lib/types";
import { useWebAudioPlayer } from "../../src/hooks/useWebAudioPlayer";
import { usePresence } from "../../src/lib/presence";
import { useAuth } from "../../src/context/AuthContext";
import {
  TimeDisplay,
  CollaboratorCursors,
  GROUP_COLORS,
  TRACK_COLORS,
  TIMELINE_WIDTH,
  buildProjectData,
  StudioOnboardingCoachmark,
  StudioDrawer,
  type PluginSource,
} from "./parts";
import { StudioModals } from "./StudioModals";
import { useProjectParams, useStudioPersistence, useMixSnapshots, useStudioModals, useStudioTransport, usePluginChains, useMixerState, applyPitchShift, renderTracksCached, type BottomTab, type RenderCache } from "./hooks";
import { persistImportedAudioFiles, resolvePersistedTrackAssets } from "./persistenceTrust";
import { getPlayheadBeat, setPlayheadBeat, subscribePlayhead } from "../../src/lib/playheadStore";
import { deleteRegion, duplicateRegion, moveRegionBySeconds, repeatRegion } from "../../src/lib/creativeLoop";

export function deriveRecordingUri(
  recorder: { uri: string | null },
  recorderState: { url?: string | null } | null,
): string {
  return recorder.uri || recorderState?.url || "";
}

export class RecordingSingleFlight {
  private inFlight = false;

  begin(): boolean {
    if (this.inFlight) return false;
    this.inFlight = true;
    return true;
  }

  end(): void {
    this.inFlight = false;
  }
}

function PlayheadBeatDisplay() {
  const [b, setB] = useState(getPlayheadBeat());
  useEffect(() => subscribePlayhead(setB), []);
  return <Text className="text-gray-500 text-[9px] font-mono ml-1">♩{Math.floor(b) + 1}</Text>;
}

export default function Studio() {
  const {
    id,
    genreParam,
    projectKey,
    initialBpm,
    initialTitle,
    projectMood,
    initialNumBars,
    projectTimeSig,
    isScratch,
    rawTool,
    isFromOnboarding,
    initialBottomTab,
  } = useProjectParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [projectTitle, setProjectTitle] = useState(initialTitle);
  const [projectLyrics, setProjectLyrics] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
  const [editingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef<TextInput>(null);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const launchActionStorageKey =
    Platform.OS === "web" && id && rawTool
      ? `openband_first_run_action_${id}_${rawTool}`
      : null;
  const [launchActionConsumed, setLaunchActionConsumed] = useState(() => {
    if (!launchActionStorageKey || typeof sessionStorage === "undefined") return false;
    return sessionStorage.getItem(launchActionStorageKey) === "1";
  });
  const consumeLaunchAction = useCallback(() => {
    if (launchActionStorageKey && typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(launchActionStorageKey, "1");
    }
    setLaunchActionConsumed(true);
  }, [launchActionStorageKey]);
  const { completeOnboarding } = useAuth();
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const webAudio = useWebAudioPlayer();
  const isWeb = Platform.OS === "web";

  const renderCacheRef = useRef<RenderCache>({ key: null, url: null });

  useEffect(() => () => {
    if (renderCacheRef.current.url) revokeTrackedBlob(renderCacheRef.current.url);
  }, []);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const resp = useResponsive();
  const [zoom, setZoom] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleNavigate = useCallback((route: string) => {
    const target = route === "index" ? "/tabs/feed" : `/tabs/${route}`;
    router.push(target as Parameters<typeof router.push>[0]);
    setDrawerOpen(false);
  }, [router]);

  const [isRecording, setIsRecording] = useState(false);
  const [webRecordingStart, setWebRecordingStart] = useState<number | null>(null);
  const [, setRecordingTick] = useState(0);
  const faderHeightRef = useRef<Record<string, number>>({});
  const panWidthRef = useRef<Record<string, number>>({});
  useEffect(() => {
    if (!isRecording || webRecordingStart == null) return;
    const id = setInterval(() => setRecordingTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, [isRecording, webRecordingStart]);
  const liveRecordingDataRef = useRef<Float32Array[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<{ trackId: string; regionId: string } | null>(null);
  const [bottomTab, setBottomTab] = useState<BottomTab>(initialBottomTab);
  const { modals, openModal, closeModal, toggleModal } = useStudioModals({
    synth: rawTool === "synth" && !launchActionConsumed,
    pianoRoll: rawTool === "piano",
  });
  useEffect(() => {
    if (launchActionConsumed) return;
    if (rawTool === "record") {
      openModal("recordOptions");
      consumeLaunchAction();
      return;
    }
    if (rawTool === "sampler") {
      openModal("sampler");
      consumeLaunchAction();
      return;
    }
    if (rawTool === "synth") {
      consumeLaunchAction();
    }
  }, [rawTool, launchActionConsumed, openModal, consumeLaunchAction]);
  const [colorPickerTrackId, setColorPickerTrackId] = useState<string | null>(null);
  const [oneKnobValues, setOneKnobValues] = useState<
    Record<string, Record<string, number>>
  >({});

  const { groups, setGroups, createGroup, deleteGroup, moveTrackToGroup, toggleGroupCollapse, updateGroup } = useTrackGroups();
  const { buses, setBuses, trackAssignments, setTrackAssignments, createBus, deleteBus, updateBus } = useBusState();
  const { sendBuses, setSendBuses, createSendBus, deleteSendBus, updateSendBus, addSend, removeSend, updateSend } = useSendBusState();
  const { trackAmpChains, setTrackAmpChains, setTrackAmpChain } = useAmpChains();
  const { masterPlugins, setMasterPlugins, addMasterPlugin, removeMasterPlugin, updateMasterPlugin } = useMasterPlugins();
  const { masteringChain, setMasteringChain, updateMasteringModule } = useMasteringChain();
  const { mixSnapshots, setMixSnapshots, activeMixId, setActiveMixId, createMixSnapshot, recallMixSnapshot, deleteMixSnapshot } = useMixSnapshots();

  const { user, visitorId } = useAuth();
  const presenceUserId = user?.id ?? visitorId ?? "anon-studio";
  const presenceUserName =
    (user?.user_metadata?.name as string | undefined) ?? "Visitante";
  const { cursors, sendCursor, isConnected } = usePresence({
    projectId: typeof id === "string" ? id : null,
    userId: presenceUserId,
    userName: presenceUserName,
    throttleMs: 50,
  });

  const {
    state: tracks,
    setState: setTracks,
    undo: undoHistory,
    redo: redoHistory,
    canUndo,
    canRedo,
  } = useHistory<TrackDef[]>(
    isScratch ? [] : generateTracksForGenre(genreParam || "pop", initialBpm, projectKey, projectMood, initialNumBars, projectTimeSig),
  );

  const trackIds = useMemo(() => tracks.map((t) => t.id), [tracks]);

  const [metronome, setMetronome] = useState<MetronomeSettings>({
    bpm: initialBpm,
    timeSig: [4, 4],
    accentInterval: 4,
    volume: 60,
    enabled: true,
    countIn: true,
    countInBars: 2,
  });

  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [pitchShiftSemitones, setPitchShiftSemitones] = useState(0);
  const [pitchCorrected, setPitchCorrected] = useState(false);

  const [recordSettings, setRecordSettings] = useState<RecordSettings>({
    armed: false,
    inputSource: "mic",
    quality: "high",
    sampleRate: 48000,
    mono: false,
    preRoll: 2,
  });

  const projectSnapshot = useMemo(
    () =>
      buildProjectData({
        title: projectTitle,
        genre: genreParam,
        key: projectKey,
        mood: projectMood,
        lyrics: projectLyrics,
        coverUrl,
        metronome,
        tracks,
        groups,
        buses,
        trackAssignments,
        masterPlugins,
        masteringChain,
        mixSnapshots,
        activeMixId,
        recordSettings,
        sendBuses,
        trackAmpChains,
      }),
    [
      projectTitle,
      projectLyrics,
      coverUrl,
      genreParam,
      projectKey,
      projectMood,
      metronome,
      tracks,
      groups,
      buses,
      trackAssignments,
      masterPlugins,
      masteringChain,
      mixSnapshots,
      activeMixId,
      recordSettings,
      sendBuses,
      trackAmpChains,
    ],
  );

  const hydrateProject = useCallback((saved: ProjectData) => {
    if (typeof saved.title === "string" && saved.title.trim()) {
      setProjectTitle(saved.title);
    }
    setTracks(saved.tracks as TrackDef[]);
    setGroups(saved.groups);
    setTrackAssignments(saved.trackAssignments);
    setMasterPlugins(saved.masterPlugins);
    setMasteringChain(saved.masteringChain);
    setMixSnapshots(saved.mixSnapshots);
    setActiveMixId(saved.activeMixId);
    setBuses(saved.buses ?? []);
    setSendBuses(saved.sendBuses ?? []);
    setTrackAmpChains(saved.trackAmpChains ?? {});
    if (saved.metronome) setMetronome(saved.metronome);
    if (saved.recordSettings) setRecordSettings(saved.recordSettings);
    if (typeof saved.lyrics === "string") setProjectLyrics(saved.lyrics);
    if (typeof saved.coverUrl === "string") setCoverUrl(saved.coverUrl);
  }, [setTracks]);

  const {
    lastSavedLabel,
    save: saveProjectNow,
    handleManualSave,
  } = useStudioPersistence({
    id,
    snapshot: projectSnapshot,
    hydrate: hydrateProject,
  });

  const commitTitle = useCallback(() => {
    setEditingTitle(false);
    const trimmed = projectTitle.trim() || "Projeto";
    setProjectTitle(trimmed);
    saveProjectNow(trimmed);
  }, [projectTitle, saveProjectNow]);

  const handleProjectLyricsChange = useCallback((text: string) => {
    setProjectLyrics(text);
  }, []);

  const handleUseAsCover = useCallback(
    (coverDataUrl: string) => {
      const ok = saveProjectNow({ coverUrl: coverDataUrl });
      if (ok) setCoverUrl(coverDataUrl);
    },
    [saveProjectNow],
  );

  const {
    isPlaying,
    currentTime,
    isLooping,
    setIsLooping,
    handlePlay,
    handleStop,
    seekTo,
    setCurrentTime,
  } = useStudioTransport({
    tracks,
    isWeb,
    webAudio,
    player,
    playbackRate,
    metronome,
  });

  const setTrackPlugins = useCallback((trackId: string, plugins: Plugin[]) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, plugins } : t)));
  }, [setTracks]);

  const setTrackVolume = useCallback((trackId: string, volume: number) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, volume } : t)));
  }, [setTracks]);

  const setTrackPan = useCallback((trackId: string, pan: number) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, pan } : t)));
  }, [setTracks]);

  const toggleTrackMute = useCallback((trackId: string) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, mute: !t.mute } : t)));
  }, [setTracks]);

  const toggleTrackSolo = useCallback((trackId: string) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, solo: !t.solo } : t)));
  }, [setTracks]);

  const setTrackName = useCallback((trackId: string, name: string) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, name } : t)));
  }, [setTracks]);

  const setTrackColor = useCallback((trackId: string, color: string) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, color } : t)));
  }, [setTracks]);

  const setTrackFx = useCallback((trackId: string, fx: TrackDef["fx"]) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, fx } : t)));
  }, [setTracks]);

  const toggleTrackArmed = useCallback((trackId: string) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, armed: !t.armed } : t)));
  }, [setTracks]);

  const updateTrack = useCallback((trackId: string, patch: Partial<TrackDef>) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, ...patch } : t)));
  }, [setTracks]);

  const addTrack = useCallback((track: TrackDef) => {
    setTracks((prev) => [...prev, track]);
  }, [setTracks]);

  const removeTrack = useCallback((trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  }, [setTracks]);

  const duplicateTrack = useCallback((trackId: string) => {
    setTracks((prev) => {
      const source = prev.find((t) => t.id === trackId);
      if (!source) return prev;
      const clone = {
        ...source,
        id: `${source.id}-copy-${Date.now()}`,
        name: `${source.name} Copy`,
      };
      return [...prev, clone];
    });
  }, [setTracks]);

  const moveTrack = useCallback((fromIndex: number, toIndex: number) => {
    setTracks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, [setTracks]);

  const reorderTracks = useCallback((next: TrackDef[]) => {
    setTracks(next);
  }, [setTracks]);

  const updateMetronome = useCallback((patch: Partial<MetronomeSettings>) => {
    setMetronome((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateRecordSettings = useCallback((patch: Partial<RecordSettings>) => {
    setRecordSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const setBpm = useCallback((bpm: number) => {
    setMetronome((prev) => ({ ...prev, bpm }));
  }, []);

  const setTimeSignature = useCallback((timeSig: [number, number]) => {
    setMetronome((prev) => ({ ...prev, timeSig }));
  }, []);

  const setMasteringPreset = useCallback((preset: string) => {
    setMasteringChain((prev) => ({ ...prev, preset }));
  }, []);

  const setActiveMix = useCallback((mixId: string | null) => {
    setActiveMixId(mixId);
  }, []);

  const setTrackGroup = useCallback((trackId: string, groupId: string | null) => {
    moveTrackToGroup(trackId, groupId);
  }, [moveTrackToGroup]);

  const setTrackBus = useCallback((trackId: string, busId: string | null) => {
    assignTrackToBus(trackId, busId);
    setTrackAssignments((prev) => ({ ...prev, [trackId]: busId }));
  }, [setTrackAssignments]);

  const addTrackSend = useCallback((trackId: string, sendBusId: string, level: number) => {
    addSend(trackId, sendBusId, level);
  }, [addSend]);

  const removeTrackSend = useCallback((trackId: string, sendBusId: string) => {
    removeSend(trackId, sendBusId);
  }, [removeSend]);

  const setTrackSendLevel = useCallback((trackId: string, sendBusId: string, level: number) => {
    updateSend(trackId, sendBusId, level);
  }, [updateSend]);

  const setAmpChain = useCallback((trackId: string, chain: TrackDef["ampChain"]) => {
    setTrackAmpChain(trackId, chain);
  }, [setTrackAmpChain]);

  const handleExport = useCallback(async () => {
    const sourceUrl = await renderTracksCached(tracks, renderCacheRef.current);
    if (!sourceUrl) return;
    renderCacheRef.current = { key: JSON.stringify(tracks), url: sourceUrl };
    setMasteringInput(sourceUrl);
    openModal("export");
  }, [tracks, openModal]);

  const handleApplyPitchShift = useCallback(async () => {
    await applyPitchShift(tracks, pitchShiftSemitones, setTracks);
  }, [tracks, pitchShiftSemitones, setTracks]);

  const handleAutoMix = useCallback(() => {
    const result = autoMix(tracks, "balanced");
    setTracks(result.tracks);
  }, [tracks, setTracks]);

  const handleTemplate = useCallback((genre: string) => {
    setTracks(generateTracksForGenre(genre, metronome.bpm, projectKey, projectMood, initialNumBars, projectTimeSig));
  }, [metronome.bpm, projectKey, projectMood, initialNumBars, projectTimeSig, setTracks]);

  const handleDeleteSelectedRegion = useCallback(() => {
    if (!selectedRegion) return;
    setTracks((prev) =>
      prev.map((track) =>
        track.id === selectedRegion.trackId
          ? { ...track, regions: track.regions.filter((region) => region.id !== selectedRegion.regionId) }
          : track,
      ),
    );
    setSelectedRegion(null);
  }, [selectedRegion, setTracks]);

  const handleDuplicateSelectedRegion = useCallback(() => {
    if (!selectedRegion) return;
    setTracks((prev) =>
      prev.map((track) =>
        track.id === selectedRegion.trackId
          ? {
              ...track,
              regions: duplicateRegion(track.regions, selectedRegion.regionId),
            }
          : track,
      ),
    );
  }, [selectedRegion, setTracks]);

  const handleMoveSelectedRegion = useCallback((deltaSeconds: number) => {
    if (!selectedRegion) return;
    setTracks((prev) =>
      prev.map((track) =>
        track.id === selectedRegion.trackId
          ? {
              ...track,
              regions: moveRegionBySeconds(track.regions, selectedRegion.regionId, deltaSeconds),
            }
          : track,
      ),
    );
  }, [selectedRegion, setTracks]);

  const handleRepeatSelectedRegion = useCallback((count: number) => {
    if (!selectedRegion) return;
    setTracks((prev) =>
      prev.map((track) =>
        track.id === selectedRegion.trackId
          ? {
              ...track,
              regions: repeatRegion(track.regions, selectedRegion.regionId, count),
            }
          : track,
      ),
    );
  }, [selectedRegion, setTracks]);

  const addMidiTrackFromFile = useCallback(async (file: File) => {
    const buffer = await file.arrayBuffer();
    const midi = parseMidi(buffer);
    const regions = midiToTrackRegions(midi);
    addTrack({
      id: `midi-${Date.now()}`,
      name: file.name.replace(/\.[^.]+$/, ""),
      type: "midi",
      color: TRACK_COLORS[tracks.length % TRACK_COLORS.length],
      volume: 80,
      pan: 0,
      mute: false,
      solo: false,
      armed: false,
      plugins: [],
      regions,
    });
  }, [addTrack, tracks.length]);

  const handleAudioImport = useCallback(async (files: File[]) => {
    if (!files.length) return;
    const next = await persistImportedAudioFiles(files, tracks.length);
    setTracks((prev) => [...prev, ...next]);
  }, [setTracks, tracks.length]);

  useEffect(() => {
    if (!isWeb || !id) return;
    void resolvePersistedTrackAssets(tracks).then((resolved) => {
      if (resolved !== tracks) setTracks(resolved);
    });
  }, [id, isWeb, tracks, setTracks]);

  const handleRecordingComplete = useCallback(async (uri: string) => {
    const sourceUrl = uri;
    const assetId = `${id}-recording-${Date.now()}`;
    const assetUrl = await saveAsset(assetId, await (await fetch(sourceUrl)).blob());
    setTracks((prev) => [...prev, {
      id: `recording-${Date.now()}`,
      name: `Recording ${tracks.length + 1}`,
      type: "audio",
      color: TRACK_COLORS[tracks.length % TRACK_COLORS.length],
      volume: 80,
      pan: 0,
      mute: false,
      solo: false,
      armed: false,
      plugins: [],
      regions: [{ id: `region-${Date.now()}`, start: 0, duration: 1, sourceUrl: assetUrl }],
    }]);
  }, [id, setTracks, tracks.length]);

  const handleDeleteTrack = useCallback(async (trackId: string) => {
    const track = tracks.find((t) => t.id === trackId);
    if (track) {
      for (const region of track.regions) {
        if (region.sourceUrl?.startsWith("asset://")) await deleteAssetUrl(region.sourceUrl);
      }
    }
    removeTrack(trackId);
  }, [tracks, removeTrack]);

  const handleRegionFocus = useCallback((trackId: string, regionId: string) => {
    setSelectedTrackId(trackId);
    setSelectedRegion({ trackId, regionId });
  }, []);

  const handleProjectDelete = useCallback(() => {
    if (!id) return;
    if (Platform.OS === "web") localStorage.removeItem(`openband_project_${id}`);
    router.replace("/tabs");
  }, [id, router]);

  const handleProjectDuplicate = useCallback(() => {
    const newId = `${id}-copy-${Date.now()}`;
    if (Platform.OS === "web") {
      localStorage.setItem(
        `openband_project_${newId}`,
        JSON.stringify({ ...projectSnapshot, title: `${projectTitle} Copy` }),
      );
    }
    router.push(`/studio/${newId}`);
  }, [id, projectSnapshot, projectTitle, router]);

  const handleBack = useCallback(() => router.back(), [router]);

  const handleOpenSettings = useCallback(() => openModal("settings"), [openModal]);
  const handleOpenCollaboration = useCallback(() => openModal("collaboration"), [openModal]);
  const handleOpenLyrics = useCallback(() => openModal("lyrics"), [openModal]);
  const handleOpenCover = useCallback(() => openModal("cover"), [openModal]);
  const handleOpenAutomation = useCallback(() => openModal("automation"), [openModal]);
  const handleOpenTrackGroups = useCallback(() => openModal("groups"), [openModal]);
  const handleOpenSampleBrowser = useCallback(() => openModal("samples"), [openModal]);
  const handleOpenPedals = useCallback(() => openModal("pedals"), [openModal]);
  const handleOpenMastering = useCallback(() => openModal("mastering"), [openModal]);
  const handleOpenAutoMix = useCallback(() => openModal("automix"), [openModal]);
  const handleOpenTrackColor = useCallback((trackId: string) => setColorPickerTrackId(trackId), []);
  const handleOpenOneKnob = useCallback((trackId: string) => {
    setSelectedTrackId(trackId);
    openModal("oneKnob");
  }, [openModal]);

  const handleKeyCommand = useCallback((command: string) => {
    if (command === "delete") handleDeleteSelectedRegion();
    if (command === "duplicate") handleDuplicateSelectedRegion();
    if (command === "undo") undoHistory();
    if (command === "redo") redoHistory();
    if (command === "export") void handleExport();
    if (command === "save") handleManualSave();
  }, [handleDeleteSelectedRegion, handleDuplicateSelectedRegion, undoHistory, redoHistory, handleExport, handleManualSave]);

  useKeyboardShortcuts(handleKeyCommand);

  useEffect(() => {
    initKeyBindings();
    return () => disposeKeyBindings();
  }, []);

  useEffect(() => {
    const unregister = registerCommand({
      id: "studio.export",
      label: "Export Mix",
      shortcut: "Ctrl+Shift+E",
      run: () => void handleExport(),
    });
    return unregister;
  }, [handleExport]);

  useEffect(() => {
    if (!id || !isFromOnboarding) return;
    completeOnboarding();
  }, [id, isFromOnboarding, completeOnboarding]);

  useEffect(() => {
    return () => {
      revokeAssetCache();
    };
  }, []);

  const projectDurationSeconds = useMemo(() => getProjectDurationSeconds(tracks), [tracks]);

  const activeTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) ?? null,
    [tracks, selectedTrackId],
  );

  return (
    <View className="flex-1 bg-[#0a0a0d]">