import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

function audibleWav(durationSec = 0.5, sampleRate = 44100): Buffer {
  const samples = Math.floor(durationSec * sampleRate);
  const dataSize = samples * 2;
  const out = Buffer.alloc(44 + dataSize);
  out.write("RIFF", 0, "ascii");
  out.writeUInt32LE(36 + dataSize, 4);
  out.write("WAVE", 8, "ascii");
  out.write("fmt ", 12, "ascii");
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(1, 22);
  out.writeUInt32LE(sampleRate, 24);
  out.writeUInt32LE(sampleRate * 2, 28);
  out.writeUInt16LE(2, 32);
  out.writeUInt16LE(16, 34);
  out.write("data", 36, "ascii");
  out.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples; i++) {
    const value = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.3;
    out.writeInt16LE(Math.round(value * 32767), 44 + i * 2);
  }
  return out;
}

function wavData(bytes: Buffer): {
  dataOffset: number;
  dataSize: number;
  bits: number;
} {
  expect(bytes.subarray(0, 4).toString("ascii")).toBe("RIFF");
  expect(bytes.subarray(8, 12).toString("ascii")).toBe("WAVE");
  let offset = 12;
  let bits = 0;
  while (offset + 8 <= bytes.length) {
    const id = bytes.subarray(offset, offset + 4).toString("ascii");
    const size = bytes.readUInt32LE(offset + 4);
    if (id === "fmt " && size >= 16) {
      bits = bytes.readUInt16LE(offset + 8 + 14);
    }
    if (id === "data") {
      return { dataOffset: offset + 8, dataSize: size, bits };
    }
    offset += 8 + size + (size % 2);
  }
  throw new Error("WAV data chunk not found");
}

async function persistedTrackPointer(
  page: Page,
  projectId: string,
  trackName: string,
) {
  return page.evaluate(
    ({ projectId, trackName }) => {
      const raw = localStorage.getItem(`openband_project_${projectId}`);
      if (!raw) return null;
      const project = JSON.parse(raw);
      return (
        project.tracks?.find((track: any) => track.name === trackName)
          ?.regions?.[0]?.url ?? null
      );
    },
    { projectId, trackName },
  );
}

async function persistedAssetSize(page: Page, assetPointer: string) {
  return page.evaluate(
    (pointer) =>
      new Promise<number>((resolve, reject) => {
        const assetId = pointer.slice("asset://".length);
        const open = indexedDB.open("openband_assets", 1);
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const get = db
            .transaction("assets", "readonly")
            .objectStore("assets")
            .get(assetId);
          get.onerror = () => reject(get.error);
          get.onsuccess = () => resolve(get.result?.blob?.size ?? 0);
        };
      }),
    assetPointer,
  );
}

test(
  "visitor first-run imports durable audio, persists an edit, reloads and exports audible WAV",
  async ({ page }) => {
    test.setTimeout(120000);
    const startedAt = Date.now();
    page.on("dialog", (dialog) => void dialog.accept());

    await page.goto("/");
    await expect(page.getByText("Make music. Keep the project.")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Web alpha")).toBeVisible();
    await page.getByTestId("launch-start-creating").click();

    await expect(page.getByText("Começar sem conta")).toBeVisible({
      timeout: 15000,
    });
    await page.getByText("Começar sem conta").click();

    await expect(
      page.getByText("O que você quer fazer primeiro?"),
    ).toBeVisible({ timeout: 15000 });
    await page.getByTestId("onboarding-action-import").click();
    await expect(page.getByTestId("first-run-import-prompt")).toBeVisible({
      timeout: 15000,
    });

    const studioUrl = new URL(page.url());
    const projectId = studioUrl.pathname.split("/").pop();
    expect(projectId).toBeTruthy();

    const chooserPromise = page.waitForEvent("filechooser");
    await page.getByTestId("first-run-import-audio").click();
    const chooser = await chooserPromise;
    await chooser.setFiles({
      name: "launch-audible.wav",
      mimeType: "audio/wav",
      buffer: audibleWav(),
    });

    await expect(
      page.getByText("launch-audible", { exact: true }).first(),
    ).toBeVisible({ timeout: 15000 });
    await expect
      .poll(() => persistedTrackPointer(page, projectId!, "launch-audible"), {
        timeout: 10000,
      })
      .toMatch(/^asset:\/\//);

    const assetPointer = await persistedTrackPointer(
      page,
      projectId!,
      "launch-audible",
    );
    expect(assetPointer).toMatch(/^asset:\/\//);
    await expect
      .poll(() => persistedAssetSize(page, assetPointer!), { timeout: 10000 })
      .toBeGreaterThan(0);
    expect(Date.now() - startedAt).toBeLessThan(60000);

    await page.getByLabel("Edit project title").click();
    const titleInput = page.getByLabel("Project title");
    await titleInput.fill("Launch E2E Edited");
    await titleInput.press("Enter");
    await expect
      .poll(
        () =>
          page.evaluate(
            (id) =>
              JSON.parse(
                localStorage.getItem(`openband_project_${id}`) || "{}",
              ).title,
            projectId,
          ),
        { timeout: 5000 },
      )
      .toBe("Launch E2E Edited");

    await page.reload();
    await expect(
      page.getByText("Launch E2E Edited", { exact: true }),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByText("launch-audible", { exact: true }).first(),
    ).toBeVisible({ timeout: 15000 });
    const pointerAfterReload = await persistedTrackPointer(
      page,
      projectId!,
      "launch-audible",
    );
    expect(pointerAfterReload).toMatch(/^asset:\/\//);
    expect(pointerAfterReload).not.toMatch(/^blob:/);
    await expect
      .poll(() => persistedAssetSize(page, pointerAfterReload!), {
        timeout: 10000,
      })
      .toBeGreaterThan(0);

    await page.keyboard.press("Control+Shift+E");
    await expect(page.getByText("Exportar Mix", { exact: true })).toBeVisible({
      timeout: 10000,
    });
    const downloadPromise = page.waitForEvent("download", { timeout: 30000 });
    await page.getByText("Exportar", { exact: true }).click();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    const bytes = fs.readFileSync(downloadPath!);
    const info = wavData(bytes);
    expect(info.dataSize).toBeGreaterThan(0);
    expect(info.bits).toBe(16);

    let nonZeroEnergy = false;
    for (
      let offset = info.dataOffset;
      offset + 1 < info.dataOffset + info.dataSize;
      offset += 2
    ) {
      if (bytes.readInt16LE(offset) !== 0) {
        nonZeroEnergy = true;
        break;
      }
    }
    expect(nonZeroEnergy).toBe(true);
    expect(Date.now() - startedAt).toBeLessThan(10 * 60 * 1000);
  },
);
