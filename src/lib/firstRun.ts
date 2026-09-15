import {
  setupProjectStarter,
  type ProjectStarterResult,
} from "./projectStarter";

export type FirstRunAction = "record" | "instrument" | "drums" | "import";

export interface FirstRunActionDefinition {
  id: FirstRunAction;
  label: string;
  description: string;
  icon: string;
  studioTool: "record" | "synth" | "sampler" | "import";
}

export const FIRST_RUN_ACTIONS: readonly FirstRunActionDefinition[] = [
  {
    id: "record",
    label: "Gravar áudio",
    description: "Use o microfone e capture sua primeira ideia.",
    icon: "●",
    studioTool: "record",
  },
  {
    id: "instrument",
    label: "Instrumento",
    description: "Abra o synth e toque uma ideia imediatamente.",
    icon: "🎹",
    studioTool: "synth",
  },
  {
    id: "drums",
    label: "Bateria / sample",
    description: "Comece pelo sampler e construa o groove.",
    icon: "🥁",
    studioTool: "sampler",
  },
  {
    id: "import",
    label: "Importar áudio",
    description: "Traga um WAV, MP3 ou outro áudio local.",
    icon: "↥",
    studioTool: "import",
  },
] as const;

export function firstRunStudioTool(action: FirstRunAction): FirstRunActionDefinition["studioTool"] {
  const definition = FIRST_RUN_ACTIONS.find((item) => item.id === action);
  if (!definition) throw new Error(`Unknown first-run action: ${action}`);
  return definition.studioTool;
}

export function createFirstRunProject(): ProjectStarterResult {
  return setupProjectStarter({
    name: "Meu primeiro projeto",
    genreId: "pop",
    bpm: 120,
    numBars: 8,
    timeSignature: "4/4",
    key: "C",
    startFromScratch: true,
  });
}

export function buildFirstRunStudioRoute(action: FirstRunAction): string {
  const project = createFirstRunProject();
  const params = new URLSearchParams({
    title: project.name,
    genre: project.genreId,
    key: project.key,
    bpm: String(project.bpm),
    numBars: String(project.numBars),
    timeSignature: project.timeSignature,
    scratch: "1",
    fromOnboarding: "1",
    tool: firstRunStudioTool(action),
  });
  return `/studio/${project.id}?${params.toString()}`;
}
