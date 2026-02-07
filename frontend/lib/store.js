"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const STORAGE_KEY = "celeste-store";
const STORAGE_VERSION = 8;

export const initialState = {
  currentProjectId: null,

  studio: {
    step: 1,
    idea: { topic: "", duration: 60, language: "es", tone: "epica" },
    script: { text: "", segments: [] },
    edl: null,
    voice: { audioUrl: null, loading: false },
    loading: false,
  },

  director: {
    raw: "",
    edl: null,
    loading: false,
  },

  projects: [],

  settings: {
    llmProvider: "openai",
    openaiKey: "",
    anthropicKey: "",
    openaiModel: "gpt-4o-mini",
    anthropicModel: "claude-sonnet-4-20250514",
    elevenlabsKey: "",
    elevenlabsVoice: "Antoni",
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_STUDIO_STEP":
      return { ...state, studio: { ...state.studio, step: action.payload } };
    case "SET_STUDIO_IDEA":
      return { ...state, studio: { ...state.studio, idea: { ...state.studio.idea, ...action.payload } } };
    case "SET_STUDIO_SCRIPT":
      return { ...state, studio: { ...state.studio, script: { ...state.studio.script, ...action.payload } } };
    case "SET_STUDIO_EDL":
      return { ...state, studio: { ...state.studio, edl: action.payload, loading: false } };
    case "SET_STUDIO_VOICE":
      return { ...state, studio: { ...state.studio, voice: { ...state.studio.voice, ...action.payload } } };
    case "SET_STUDIO_LOADING":
      return { ...state, studio: { ...state.studio, loading: action.payload } };
    case "STUDIO_RESET":
      return { ...state, studio: initialState.studio };

    case "SET_DIR_RAW":
      return { ...state, director: { ...state.director, raw: action.payload } };
    case "SET_DIR_EDL":
      return { ...state, director: { ...state.director, edl: action.payload, loading: false } };
    case "SET_DIR_LOADING":
      return { ...state, director: { ...state.director, loading: action.payload } };
    case "DIR_RESET":
      return { ...state, director: initialState.director };

    case "SAVE_PROJECT": {
      const proj = {
        id: action.payload.id || Date.now(),
        name: action.payload.name,
        mode: action.payload.mode,
        createdAt: action.payload.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: action.payload.data,
      };
      const rest = state.projects.filter((p) => p.id !== proj.id);
      return { ...state, projects: [proj, ...rest].slice(0, 50), currentProjectId: proj.id };
    }
    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
        currentProjectId: state.currentProjectId === action.payload ? null : state.currentProjectId,
      };
    case "SET_CURRENT_PROJECT":
      return { ...state, currentProjectId: action.payload };
    case "LOAD_PROJECT": {
      const proj = state.projects.find((p) => p.id === action.payload);
      if (!proj) return state;
      const next = { ...state, currentProjectId: proj.id };
      if (proj.mode === "studio" && proj.data) {
        next.studio = { ...initialState.studio, ...proj.data };
      } else if (proj.mode === "director" && proj.data) {
        next.director = { ...initialState.director, ...proj.data };
      }
      return next;
    }

    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case "HYDRATE":
      return { ...initialState, ...action.payload };
    case "RESET":
      return { ...initialState, projects: state.projects, settings: state.settings };

    default:
      return state;
  }
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
    } catch { /* corrupt */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ _v: STORAGE_VERSION, data: state }));
    } catch { /* full */ }
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore requires StoreProvider");
  return ctx;
}
