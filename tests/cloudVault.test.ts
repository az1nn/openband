import { describe, it, expect } from "vitest";
import { CloudVaultManager } from "../src/lib/cloudVault";

describe("Cloud Project Vault & S3 Asset Deduplication Suite", () => {
  it("deduplicates asset uploads based on SHA-256 hash checks", () => {
    const vault = new CloudVaultManager();
    const hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    expect(vault.shouldUpload(hash)).toBe(true);
    vault.registerAsset(hash, "https://s3.amazonaws.com/bucket/asset.wav");
    expect(vault.shouldUpload(hash)).toBe(false);
    expect(vault.getExistingUrl(hash)).toBe("https://s3.amazonaws.com/bucket/asset.wav");
  });
});
