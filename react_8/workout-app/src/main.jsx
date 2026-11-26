import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { AuthProvider } from "./context/AuthContext";
import { registerServiceWorker } from "./pwa/registerSW";
import { startConnectivityMonitor } from "./pwa/connectivity";
import "./index.css";
import App from "./App.jsx";

registerServiceWorker();
startConnectivityMonitor();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {}
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  </StrictMode>
);
