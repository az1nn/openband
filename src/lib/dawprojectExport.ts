export interface ProjectExportState {
  title: string;
  bpm: number;
  timeSignature: string;
  tracks: { name: string; volume: number }[];
}

function escapeXmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function serializeToDawprojectXml(project: ProjectExportState): string {
  const tracksXml = project.tracks
    .map(
      (t) =>
        `    <Track name="${escapeXmlAttribute(t.name)}" volume="${t.volume}"/>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<DAWProject version="1.0" application="OpenBand">
  <Project name="${escapeXmlAttribute(project.title)}" tempo="${project.bpm}" timeSignature="${escapeXmlAttribute(project.timeSignature)}">
    <Tracks>
${tracksXml}
    </Tracks>
  </Project>
</DAWProject>`;
}
