export interface WebRTCSignalingMessage {
  type: "offer" | "answer" | "candidate";
  senderId: string;
  targetId: string;
  payload: unknown;
}

export class WebRTCManager {
  private peerId: string;
  private connections = new Map<string, unknown>();

  constructor(peerId: string) {
    this.peerId = peerId;
  }

  public createOfferPayload(targetId: string): WebRTCSignalingMessage {
    return {
      type: "offer",
      senderId: this.peerId,
      targetId,
      payload: { sdp: "mock-sdp-offer" },
    };
  }

  public handleMessage(msg: WebRTCSignalingMessage): void {
    if (msg.targetId !== this.peerId) return;
    this.connections.set(msg.senderId, msg.payload);
  }

  public getConnectedPeers(): string[] {
    return Array.from(this.connections.keys());
  }
}
