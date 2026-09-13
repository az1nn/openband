import fs from "node:fs";
import { chromium } from "@playwright/test";

const baseUrl = "http://127.0.0.1:4173";

function makeSourceWavBase64() {
  const sampleRate = 44100;
  const frames = Math.floor(sampleRate * 0.25);
  const dataSize = frames * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8, "ascii");
  buffer.write("fmt ", 12, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < frames; i++) {
    const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.5;
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }
  return buffer.toString("base64");
}

function project(id, title, url) {
  return {
    id,
    title,
    genre: "",
    key: "C",
    bpm: 120,
    tracks: [{
      id: `${id}-track`,
      name: title,
      color: "#5ac8fa",
      muted: false,
      solo: false,
      volume: 80,
      pan: -25,
      sends: {},
      regions: [{ id: `${id}-region`, start: 0, duration: 0.25, url }],
      sidechainSource: null,
      plugins: [],
      automation: {},
      outputId: null,
    }],
    groups: [],
    buses: [],
    trackAssignments: {},
    masterPlugins: [],
    masteringChain: [],
    sendBuses: [],
    trackAmpChains: {},
    mixSnapshots: [],
    metronome: {
      bpm: 120,
      timeSig: [4, 4],
      accentInterval: 4,
      volume: 0.5,
      enabled: false,
      countIn: false,
      countInBars: 2,
    },
    recordSettings: {
      armed: false,
      inputSource: "mic",
      quality: "high",
      sampleRate: 44100,
      mono: false,
      preRoll: 0,
    },
    lastSaved: Date.now(),
  };
}

function verifyAudibleWav(path) {
  const bytes = fs.readFileSync(path);
  if (bytes.length <= 44) throw new Error(`downloaded WAV too small: ${bytes.length}`);
  if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("download is not RIFF/WAVE");
  }
  let offset = 12;
  let peak = 0;
  let dataSize = 0;
  while (offset + 8 <= bytes.length) {
    const id = bytes.toString("ascii", offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    if (id === "data") {
      dataSize = Math.min(size, bytes.length - offset - 8);
      for (let p = offset + 8; p + 1 < offset + 8 + dataSize; p += 2) {
        peak = Math.max(peak, Math.abs(bytes.readInt16LE(p)));
      }
      break;
    }
    offset += 8 + size + (size % 2);
  }
  if (dataSize <= 0 || peak <= 0) {
    throw new Error(`WAV is not audibly populated: data=${dataSize}, peak=${peak}`);
  }
  return { size: bytes.length, dataSize, peak };
}

async function seed(page, projectData, asset) {
  await page.goto(baseUrl + "/", { waitUntil: "domcontentloaded" });
  await page.evaluate(async ({ projectData, asset }) => {
    localStorage.setItem("openband_onboarding", JSON.stringify({ completed: true }));
    localStorage.setItem(`openband_project_${projectData.id}`, JSON.stringify(projectData));
    localStorage.setItem("openband_project_index", JSON.stringify({
      [projectData.id]: {
        title: projectData.title,
        lastSaved: projectData.lastSaved,
        bpm: projectData.bpm,
        key: projectData.key,
      },
    }));
    if (!asset) return;
    const bytes = Uint8Array.from(atob(asset.base64), (c) => c.charCodeAt(0));
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open("openband_assets", 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("assets")) {
          req.result.createObjectStore("assets", { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    await new Promise((resolve, reject) => {
      const tx = db.transaction("assets", "readwrite");
      tx.objectStore("assets").put({
        id: asset.id,
        blob: new Blob([bytes], { type: "audio/wav" }),
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  }, { projectData, asset });
}

async function openBounce(page) {
  await page.keyboard.press("Control+b");
  await page.getByText("Exportar Mix", { exact: true }).waitFor({ timeout: 15000 });
}

async function functionalSnapshot(page, id) {
  return page.evaluate((projectId) => {
    const raw = localStorage.getItem(`openband_project_${projectId}`);
    if (!raw) return null;
    const value = JSON.parse(raw);
    delete value.lastSaved;
    return JSON.stringify(value);
  }, id);
}

async function settledSnapshot(page, id) {
  await page.waitForTimeout(2500);
  let previous = null;
  for (let i = 0; i < 20; i++) {
    const current = await functionalSnapshot(page, id);
    if (current === previous) return current;
    previous = current;
    await page.waitForTimeout(250);
  }
  throw new Error(`project ${id} did not stabilize`);
}

async function expectStrictFailure(page, consoleErrors, fixture, asset) {
  await seed(page, fixture, asset);
  await page.goto(`${baseUrl}/studio/${fixture.id}?bpm=120&title=${encodeURIComponent(fixture.title)}`, { waitUntil: "networkidle" });
  await page.getByText(fixture.title, { exact: true }).first().waitFor({ timeout: 20000 });
  const before = await settledSnapshot(page, fixture.id);
  consoleErrors.length = 0;
  await openBounce(page);
  const unexpectedDownload = page.waitForEvent("download", { timeout: 5000 }).then(() => true).catch(() => false);
  await page.getByText("Exportar", { exact: true }).last().click();
  const didDownload = await unexpectedDownload;
  if (didDownload) throw new Error(`${fixture.id} unexpectedly downloaded a file`);
  const after = await settledSnapshot(page, fixture.id);
  if (before !== after) {
    console.error("before project", before);
    console.error("after project", after);
    throw new Error(`${fixture.id} mutated persisted project state`);
  }
  const exportErrors = consoleErrors.filter((message) => /Export failed/i.test(message));
  if (exportErrors.length === 0) {
    throw new Error(`${fixture.id} did not reach strict export failure: ${JSON.stringify(consoleErrors)}`);
  }
  console.log(`${fixture.id} strict failure ok`, exportErrors);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ acceptDownloads: true });
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
await page.route("**/*", async (route) => {
  const url = new URL(route.request().url());
  if (url.hostname === "127.0.0.1") await route.continue();
  else await route.abort();
});

try {
  const good = project("export-smoke", "Persisted Audio", "asset://fixture");
  await seed(page, good, { id: "fixture", base64: makeSourceWavBase64() });
  await page.goto(`${baseUrl}/studio/export-smoke?bpm=120&title=Export%20Smoke`, { waitUntil: "networkidle" });
  await page.getByText("Persisted Audio", { exact: true }).first().waitFor({ timeout: 20000 });
  await openBounce(page);
  const downloadPromise = page.waitForEvent("download", { timeout: 30000 });
  await page.getByText("Exportar", { exact: true }).last().click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  if (!downloadPath) throw new Error("browser did not retain downloaded WAV");
  console.log("persistent asset export ok", verifyAudibleWav(downloadPath));

  await expectStrictFailure(
    page,
    consoleErrors,
    project("export-missing", "Missing Audio", "asset://does-not-exist"),
    null,
  );

  await expectStrictFailure(
    page,
    consoleErrors,
    project("export-corrupt", "Corrupt Audio", "asset://corrupt"),
    { id: "corrupt", base64: Buffer.from("not-a-valid-wav").toString("base64") },
  );
} finally {
  await browser.close();
}
