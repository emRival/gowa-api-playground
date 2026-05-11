"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface GlobalConfig {
  baseUrl: string;
  username: string;
  password: string;
  deviceId: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  endpointName: string;
  method: string;
  path: string;
  status: number;
  statusText: string;
  isError: boolean;
  values: Record<string, string>;
}

interface ConfigContextValue {
  config: GlobalConfig;
  setField: (field: keyof GlobalConfig, value: string) => void;
  reset: () => void;
  remember: boolean;
  setRemember: (value: boolean) => void;
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, "id" | "timestamp">) => void;
  clearHistory: () => void;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<GlobalConfig>({
    baseUrl: "http://localhost:3000",
    username: "",
    password: "",
    deviceId: "",
  });

  const [remember, setRememberState] = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRemember = localStorage.getItem("gowa_remember");
      const shouldRemember = storedRemember !== "false"; // default to true
      setRememberState(shouldRemember);

      if (shouldRemember) {
        setConfig({
          baseUrl: localStorage.getItem("gowa_baseUrl") || "http://localhost:3000",
          username: localStorage.getItem("gowa_username") || "",
          password: localStorage.getItem("gowa_password") || "",
          deviceId: localStorage.getItem("gowa_deviceId") || "",
        });
      }

      // Load history from sessionStorage
      const storedHistory = sessionStorage.getItem("gowa_history");
      if (storedHistory) {
        try {
          setHistory(JSON.parse(storedHistory));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const setRemember = (value: boolean) => {
    setRememberState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("gowa_remember", String(value));
      if (!value) {
        localStorage.removeItem("gowa_baseUrl");
        localStorage.removeItem("gowa_username");
        localStorage.removeItem("gowa_password");
        localStorage.removeItem("gowa_deviceId");
      } else {
        localStorage.setItem("gowa_baseUrl", config.baseUrl);
        localStorage.setItem("gowa_username", config.username);
        localStorage.setItem("gowa_password", config.password);
        localStorage.setItem("gowa_deviceId", config.deviceId);
      }
    }
  };

  const setField = (field: keyof GlobalConfig, value: string) => {
    setConfig((prev) => {
      const updated = { ...prev, [field]: value };
      if (typeof window !== "undefined" && remember) {
        localStorage.setItem(`gowa_${field}`, value);
      }
      return updated;
    });
  };

  const reset = () => {
    const cleared = {
      baseUrl: "http://localhost:3000",
      username: "",
      password: "",
      deviceId: "",
    };
    setConfig(cleared);
    if (typeof window !== "undefined") {
      localStorage.removeItem("gowa_baseUrl");
      localStorage.removeItem("gowa_username");
      localStorage.removeItem("gowa_password");
      localStorage.removeItem("gowa_deviceId");
    }
  };

  const addHistoryItem = (item: Omit<HistoryItem, "id" | "timestamp">) => {
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 50); // cap at 50 items
      if (typeof window !== "undefined") {
        sessionStorage.setItem("gowa_history", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("gowa_history");
    }
  };

  return (
    <ConfigContext value={{ config, setField, reset, remember, setRemember, history, addHistoryItem, clearHistory }}>
      {children}
    </ConfigContext>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}
