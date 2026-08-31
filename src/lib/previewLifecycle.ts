export type PreviewStatus = "stopped" | "playing" | "failed";

export class PreviewPlayback {
  status: PreviewStatus = "stopped";
  private ownerToken: string | null = null;

  play(): { accepted: boolean; reason?: "busy" } {
    if (this.status === "playing") {
      return { accepted: false, reason: "busy" };
    }
    this.ownerToken =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `tok-${Math.random()}`;
    this.status = "playing";
    return { accepted: true };
  }

  end(): void {
    this.status = "stopped";
    this.ownerToken = null;
  }

  stop(): void {
    this.status = "stopped";
    this.ownerToken = null;
  }

  get currentToken(): string | null {
    return this.ownerToken;
  }
}
