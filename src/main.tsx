import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import "./index.css";
// @ts-ignore
import { TransactionProvider } from "./context/TransactionContext.jsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <TransactionProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
    ,
  </TransactionProvider>
);
