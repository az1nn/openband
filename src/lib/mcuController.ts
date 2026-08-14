export interface MCUChannelState {
  faderPosition: number;
  mute: boolean;
  solo: boolean;
  select: boolean;
}

export class MCUController {
  private channels: MCUChannelState[] = Array.from({ length: 8 }, () => ({
    faderPosition: 0,
    mute: false,
    solo: false,
    select: false,
  }));

  public setFader(channelIndex: number, value: number): void {
    if (channelIndex >= 0 && channelIndex < 8) {
      this.channels[channelIndex].faderPosition = Math.max(0, Math.min(127, value));
    }
  }

  public getChannel(channelIndex: number): MCUChannelState | undefined {
    return this.channels[channelIndex];
  }

  public decodeSysex(data: number[]): boolean {
    return data.length >= 5 && data[0] === 0xf0 && data[3] === 0x66;
  }
}
