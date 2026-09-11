import { test, expect, type Page } from "@playwright/test";

async function importAudio(page: Page, name: string, bytes: number[]) {
  const chooserPromise = page.waitForEvent("filechooser");
  await page.getByText("Audio", { exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name,
    mimeType: "audio/wav",
    buffer: Buffer.from(bytes),
  });
}

function trackName(page: Page, name: string) {
  return page.getByText(name, { exact: true }).first();
}

test.describe("Persistence trust", () => {
  test("keeps imported local audio durable across reload/reopen and rejects failed asset writes", async ({
    context,
    page,
  }) => {
    const projectId = `pw-persistence-${Date.now()}`;
    const route = `/studio/${projectId}?title=Persistence%20Smoke`;

    await page.goto(route);
    await expect(page.getByText("Audio", { exact: true })).toBeVisible();

    await importAudio(page, "persist-smoke.wav", [82, 73, 70, 70, 1, 2, 3, 4]);
    await expect(trackName(page, "persist-smoke")).toBeVisible();

    await expect
      .poll(
        () =>
          page.evaluate((id) => {
            const raw = localStorage.getItem(`openband_project_${id}`);
            if (!raw) return null;
            const project = JSON.parse(raw);
            return project.tracks?.find((track: any) => track.name === "persist-smoke")?.regions?.[0]
              ?.url ?? null;
          }, projectId),
        { timeout: 8000 },
      )
      .toMatch(/^asset:\/\//);

    const pointer = await page.evaluate((id) => {
      const project = JSON.parse(localStorage.getItem(`openband_project_${id}`)!);
      return project.tracks.find((track: any) => track.name === "persist-smoke").regions[0].url as string;
    }, projectId);
    const assetId = pointer.slice("asset://".length);

    await expect
      .poll(() =>
        page.evaluate(
          ({ id }) =>
            new Promise<number>((resolve, reject) => {
              const req = indexedDB.open("openband_assets", 1);
              req.onerror = () => reject(req.error);
              req.onsuccess = () => {
                const db = req.result;
                const getReq = db.transaction("assets", "readonly").objectStore("assets").get(id);
                getReq.onerror = () => reject(getReq.error);
                getReq.onsuccess = () => resolve(getReq.result?.blob?.size ?? 0);
              };
            }),
          { id: assetId },
        ),
      )
      .toBeGreaterThan(0);

    await page.reload();
    await expect(trackName(page, "persist-smoke")).toBeVisible();

    await page.close();
    const reopened = await context.newPage();
    await reopened.goto(`/studio/${projectId}`);
    await expect(trackName(reopened, "persist-smoke")).toBeVisible();

    const beforeFailure = await reopened.evaluate((id) => {
      const project = JSON.parse(localStorage.getItem(`openband_project_${id}`)!);
      return project.tracks.length;
    }, projectId);

    await reopened.evaluate(() => {
      const originalPut = IDBObjectStore.prototype.put;
      (window as any).__openbandOriginalIdbPut = originalPut;
      IDBObjectStore.prototype.put = function () {
        throw new DOMException("Injected quota failure", "QuotaExceededError");
      } as typeof IDBObjectStore.prototype.put;
    });

    await importAudio(reopened, "must-not-persist.wav", [9, 8, 7, 6]);
    await expect(reopened.getByText("must-not-persist", { exact: true })).toHaveCount(0);

    await expect
      .poll(() =>
        reopened.evaluate((id) => {
          const raw = localStorage.getItem(`openband_project_${id}`);
          return raw ? JSON.parse(raw).tracks.length : -1;
        }, projectId),
      )
      .toBe(beforeFailure);

    await reopened.evaluate(() => {
      const originalPut = (window as any).__openbandOriginalIdbPut;
      if (originalPut) IDBObjectStore.prototype.put = originalPut;
    });
  });
});
