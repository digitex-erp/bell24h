 
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App.js";
import "./index.css";
import "./styles/material.css";
import { AuthProvider } from "./hooks/use-auth.js";
import { queryClient } from "./lib/queryClient.js";

// Add Roboto font
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
);
