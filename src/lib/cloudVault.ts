export interface CloudAssetManifest {
  assetId: string;
  sha256Hash: string;
  sizeBytes: number;
  s3Url: string;
}

export class CloudVaultManager {
  private remoteManifests = new Map<string, string>();

  public registerAsset(sha256Hash: string, s3Url: string): void {
    this.remoteManifests.set(sha256Hash, s3Url);
  }

  public shouldUpload(sha256Hash: string): boolean {
    return !this.remoteManifests.has(sha256Hash);
  }

  public getExistingUrl(sha256Hash: string): string | undefined {
    return this.remoteManifests.get(sha256Hash);
  }
}
