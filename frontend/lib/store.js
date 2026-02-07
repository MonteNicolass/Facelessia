"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const STORAGE_KEY = "celeste-store";
const STORAGE_VERSION = 4;

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

  /* Studio state */
  studio: {
    mode: "short_epico",
    topic: "",
    duration: 60,
    audience: "",
    hasCTA: true,
    output: null,   // { script, prompts, casting, metadata }
    batch: [],      // [{ id, topic, status: pending|running|done|error, output }]
  },

  /* Director edit map */
  editMap: {
    raw: "",
    format: "short",
    segments: [],   // [{ id, start, end, text, keywords[], motion, broll, sfx, onScreenText, notes }]
    selectedId: null,
  },

  /* Recent projects */
  projects: [],  // [{ id, name, type: studio|director, createdAt, data }]

  settings: {
    mvpapiBaseUrl: "",
    mvpapiApiKey: "",
    openaiApiKey: "",
    anthropicApiKey: "",
  },
};

function reducer(state, action) {
  switch (action.type) {
    /* --- Legacy (keep for compatibility) --- */
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

    /* --- Studio --- */
    case "SET_STUDIO_CONFIG":
      return { ...state, studio: { ...state.studio, ...action.payload, output: state.studio.output } };
    case "SET_STUDIO_OUTPUT":
      return { ...state, studio: { ...state.studio, output: action.payload } };
    case "STUDIO_ADD_BATCH": {
      const job = { id: Date.now(), topic: action.payload, status: "pending", output: null };
      return { ...state, studio: { ...state.studio, batch: [...state.studio.batch, job] } };
    }
    case "STUDIO_UPDATE_BATCH": {
      const { id, ...updates } = action.payload;
      return {
        ...state,
        studio: {
          ...state.studio,
          batch: state.studio.batch.map((j) => (j.id === id ? { ...j, ...updates } : j)),
        },
      };
    }
    case "STUDIO_REMOVE_BATCH":
      return {
        ...state,
        studio: { ...state.studio, batch: state.studio.batch.filter((j) => j.id !== action.payload) },
      };
    case "STUDIO_CLEAR_BATCH":
      return { ...state, studio: { ...state.studio, batch: [] } };
    case "STUDIO_RESET":
      return { ...state, studio: initialState.studio };

    /* --- Director Edit Map --- */
    case "SET_EDITMAP_RAW":
      return { ...state, editMap: { ...state.editMap, raw: action.payload } };
    case "SET_EDITMAP_FORMAT":
      return { ...state, editMap: { ...state.editMap, format: action.payload } };
    case "SET_EDITMAP_SEGMENTS":
      return { ...state, editMap: { ...state.editMap, segments: action.payload } };
    case "SET_EDITMAP_SELECTED":
      return { ...state, editMap: { ...state.editMap, selectedId: action.payload } };
    case "UPDATE_SEGMENT": {
      const { id, ...changes } = action.payload;
      return {
        ...state,
        editMap: {
          ...state.editMap,
          segments: state.editMap.segments.map((seg) =>
            seg.id === id ? { ...seg, ...changes } : seg
          ),
        },
      };
    }
    case "EDITMAP_RESET":
      return { ...state, editMap: initialState.editMap };

    /* --- Projects --- */
    case "SAVE_PROJECT": {
      const proj = {
        id: action.payload.id || Date.now(),
        name: action.payload.name,
        type: action.payload.type,
        createdAt: new Date().toISOString(),
        data: action.payload.data,
      };
      const existing = state.projects.filter((p) => p.id !== proj.id);
      return { ...state, projects: [proj, ...existing].slice(0, 20) };
    }
    case "DELETE_PROJECT":
      return { ...state, projects: state.projects.filter((p) => p.id !== action.payload) };

    /* --- System --- */
    case "HYDRATE":
      return { ...initialState, ...action.payload };
    case "RESET":
      return { ...initialState, settings: state.settings, projects: state.projects };
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
