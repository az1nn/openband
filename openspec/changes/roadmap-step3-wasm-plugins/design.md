# Roadmap Step 3: WebAssembly DSP Plugin Ecosystem — Design

## Architecture
- **Plugin Manifest**: JSON schema defining control inputs, outputs, DSP memory pointers, and render functions.
- **`src/lib/wasmPluginHost.ts`**: Instantiates Wasm modules, allocates AudioWorklet memory buffers, and routes parameter automation via MessagePort JSON-RPC.
- **Fallback**: Graceful fallback to JS native DSP nodes when WebAssembly is unsupported or loading fails.
