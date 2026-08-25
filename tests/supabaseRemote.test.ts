import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { configureRemote, pullState, checkAssetExists } from "../src/lib/supabaseRemote";

function mockFetch(body: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("supabaseRemote M10 URL-injection-safe encoding", () => {
  beforeEach(() => {
    configureRemote({
      supabaseUrl: "https://example.com/",
      supabaseKey: "k",
      projectId: "p",
      bucketName: "b",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("encodes projectId and branch in pullState query params", async () => {
    const fetchMock = mockFetch([{ state_json: "{}", commit_id: "c1" }]);
    await pullState("a&x=1", "b/c");
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("project_id=eq.a%26x%3D1");
    expect(calledUrl).toContain("branch=eq.b%2Fc");
    expect(calledUrl).not.toContain("x=1");
  });

  it("encodes the hash in checkAssetExists query param", async () => {
    const fetchMock = mockFetch([]);
    await checkAssetExists("h#1/2");
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("hash=eq.h%231%2F2");
  });
});
