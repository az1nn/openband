from pathlib import Path

path = Path("app/studio/[id].tsx")
text = path.read_text()


def replace_once(old: str, new: str, label: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, found {count}")
    text = text.replace(old, new, 1)

old_block = '''  const applyRegionAction = useCallback(
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

new_block = '''  const refreshEditedTracks = useCallback(
    (updatedTracks: TrackDef[]) => {
      if (!isWeb) return;
      rerenderAfterMuteSolo(updatedTracks).catch((error) =>
        console.warn("region edit audio refresh failed:", error),
      );
    },
    [isWeb, rerenderAfterMuteSolo],
  );

  const handleUndo = useCallback(() => {
    undoHistory();
    if (isWeb) {
      setTimeout(() => refreshEditedTracks(tracksRef.current), 0);
    }
  }, [undoHistory, isWeb, refreshEditedTracks]);

  const handleRedo = useCallback(() => {
    redoHistory();
    if (isWeb) {
      setTimeout(() => refreshEditedTracks(tracksRef.current), 0);
    }
  }, [redoHistory, isWeb, refreshEditedTracks]);

  const applyRegionAction = useCallback(
    (action: "move-left" | "move-right" | "duplicate" | "repeat" | "delete") => {
      if (!selectedRegion) return;
      const { trackId, regionId } = selectedRegion;
      const beatSeconds = 60 / Math.max(1, metronome.bpm);
      const stamp = Date.now();
      const current = tracksRef.current;
      let updatedTracks = current;

      switch (action) {
        case "move-left":
          updatedTracks = moveRegionBySeconds(current, trackId, regionId, -beatSeconds);
          break;
        case "move-right":
          updatedTracks = moveRegionBySeconds(current, trackId, regionId, beatSeconds);
          break;
        case "duplicate":
          updatedTracks = duplicateRegion(current, trackId, regionId, `region-${stamp}-copy`);
          break;
        case "repeat":
          updatedTracks = repeatRegion(current, trackId, regionId, [
            `region-${stamp}-repeat-1`,
            `region-${stamp}-repeat-2`,
            `region-${stamp}-repeat-3`,
          ]);
          break;
        case "delete":
          updatedTracks = deleteRegion(current, trackId, regionId);
          break;
      }

      setTracks(updatedTracks);
      refreshEditedTracks(updatedTracks);
      if (action === "delete") setSelectedRegion(null);
    },
    [selectedRegion, metronome.bpm, setTracks, refreshEditedTracks],
  );

'''
replace_once(old_block, new_block, "region refresh block")

replace_once('      undo: undoHistory,\n      redo: redoHistory,\n', '      undo: handleUndo,\n      redo: handleRedo,\n', "shortcut history handlers")
replace_once('      undoHistory,\n      redoHistory,\n', '      handleUndo,\n      handleRedo,\n', "shortcut dependency handlers")
replace_once('    registerCommand("edit.undo", t("studio.command.undo", "Undo"), "Undo last action", "Edit", undoHistory, "Ctrl+Z");\n    registerCommand("edit.redo", t("studio.command.redo", "Redo"), "Redo last action", "Edit", redoHistory, "Ctrl+Shift+Z");\n', '    registerCommand("edit.undo", t("studio.command.undo", "Undo"), "Undo last action", "Edit", handleUndo, "Ctrl+Z");\n    registerCommand("edit.redo", t("studio.command.redo", "Redo"), "Redo last action", "Edit", handleRedo, "Ctrl+Shift+Z");\n', "command history handlers")
replace_once('  }, [togglePlay, toggleRecording, undoHistory, redoHistory, handleManualSave, selectedTrack, toggleMute, toggleSolo, deleteTrack, handleAddTrack, handleAddClip, setBottomTab, openModal, toggleModal, closeModal, t]);\n', '  }, [togglePlay, toggleRecording, handleUndo, handleRedo, handleManualSave, selectedTrack, toggleMute, toggleSolo, deleteTrack, handleAddTrack, handleAddClip, setBottomTab, openModal, toggleModal, closeModal, t]);\n', "command dependencies")
replace_once('            onPress={undoHistory}\n', '            onPress={handleUndo}\n', "undo button")
replace_once('            onPress={redoHistory}\n', '            onPress={handleRedo}\n', "redo button")

path.write_text(text)
