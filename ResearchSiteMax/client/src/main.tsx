import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/auth-context";
import { WebSocketProvider } from "./context/websocket-context";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  </AuthProvider>
);
