import { createRoot } from "react-dom/client";
import { App } from "./App";

// The shared artifact opens straight into the demo portal on a viewer's first
// visit. After that, the demo sign-in/out state is remembered like in the app.
try {
  if (!window.localStorage.getItem("baesa-artifact-init")) {
    window.localStorage.setItem("baesa-artifact-init", "1");
    window.localStorage.setItem("baesa-demo-session", "1");
  }
} catch {
  /* storage blocked: the demo session treats the viewer as signed in */
}

createRoot(document.getElementById("root")!).render(<App />);
