import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { store } from "./store/index";
import { queryClient } from "./config/queryClient";
import { AuthProvider } from "./context/AuthContext";
import { UserDataProvider } from "./context/UserDataContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {/* AuthProvider restores Firebase session first */}
        <AuthProvider>
          {/* UserDataProvider subscribes to Firestore once auth is ready */}
          <UserDataProvider>
            <App />
            <Toaster
              position="bottom-left"
              toastOptions={{
                style: {
                  background: "#212121",
                  color: "#f1f1f1",
                  border: "1px solid #3f3f3f",
                },
              }}
            />
          </UserDataProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
