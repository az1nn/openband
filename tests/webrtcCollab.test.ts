import { describe, it, expect } from "vitest";
import { WebRTCManager } from "../src/lib/webrtcCollab";

describe("WebRTC Voice & Video Collab Chat Suite", () => {
  it("creates signaling offers and handles peer messages", () => {
    const managerA = WebRTCManager ? new WebRTCManager("peer-1") : null;
    const managerB = new WebRTCManager("peer-2");

    const offer = managerA!.createOfferPayload("peer-2");
    expect(offer.type).toBe("offer");
    expect(offer.senderId).toBe("peer-1");

    managerB.handleMessage(offer);
    expect(managerB.getConnectedPeers()).toContain("peer-1");
  });
});
