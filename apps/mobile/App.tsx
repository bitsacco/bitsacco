// Import polyfills first
import "react-native-get-random-values";
import { Buffer } from "buffer";

import React from "react";
import RenderApp from "./src/renderApp";

// Make polyfills globally available
if (typeof global !== "undefined") {
  global.Buffer = Buffer;
  // Add other global polyfills if needed
  if (!global.process) {
    global.process = { env: {} } as any;
  }
}

export default function App() {
  return <RenderApp />;
}
