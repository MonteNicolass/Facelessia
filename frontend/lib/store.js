"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const STORAGE_KEY = "celeste-store";
const STORAGE_VERSION = 3;

export const initialState = {
  project: {
    title: "",
    durationSec: 60,
    tone: "informativo",
    language: "es",
    aspectRatio: "9:16",
  },
  script: {
    raw: "",
    scenes: [],
  },
  edl: [],
  settings: {
    mvpapiBaseUrl: "",
    mvpapiApiKey: "",
    openaiApiKey: "",
    anthropicApiKey: "",
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_PROJECT":
      return { ...state, project: { ...state.project, ...action.payload } };
    case "SET_SCRIPT_RAW":
      return { ...state, script: { ...state.script, raw: action.payload } };
    case "SET_SCENES":
      return { ...state, script: { ...state.script, scenes: action.payload } };
    case "SET_SCRIPT":
      return { ...state, script: action.payload };
    case "SET_EDL":
      return { ...state, edl: action.payload };
    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case "IMPORT_SCRIPTPACK": {
      const pack = action.payload;
      return {
        ...state,
        project: {
          ...state.project,
          title: pack.title || state.project.title,
          durationSec: pack.durationSec || state.project.durationSec,
          tone: pack.tone || state.project.tone,
        },
        script: {
          raw: pack.scenes.map((s) => `[${fmtSec(s.startSec)}] ${s.narration}`).join("\n\n"),
          scenes: pack.scenes,
        },
      };
    }
    case "IMPORT_FULL_PROJECT": {
      const data = action.payload;
      return {
        ...state,
        project: data.project || state.project,
        script: data.script || state.script,
        edl: data.edl || state.edl,
      };
    }
    case "HYDRATE":
      return { ...initialState, ...action.payload };
    case "RESET":
      return { ...initialState, settings: state.settings };
    default:
      return state;
  }
}

function fmtSec(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed._v === STORAGE_VERSION) {
          dispatch({ type: "HYDRATE", payload: parsed.data });
        }
      }
    } catch {
      // Datos corruptos, se ignoran
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ _v: STORAGE_VERSION, data: state })
      );
    } catch {
      // Storage lleno, se ignora
    }
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore requiere StoreProvider");
  return ctx;
}
