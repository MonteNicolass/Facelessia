"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const STORAGE_KEY = "celeste-store";
const STORAGE_VERSION = 5;

export const initialState = {
  /* Generator pipeline */
  generator: {
    step: 0, // 0=input, 1=script, 2=assets, 3=assemble, 4=output
    config: {
      topic: "",
      mode: "short_epico",
      duration: 60,
      audience: "",
      hasCTA: true,
    },
    script: null,
    assets: null,
    assembleProgress: 0,
    output: null,
  },

  /* Director */
  director: {
    raw: "",
    format: "short",
    duration: 60,
    segments: [],
    selectedId: null,
  },

  /* Saved runs */
  runs: [],

  /* Settings */
  settings: {
    openaiApiKey: "",
    anthropicApiKey: "",
  },
};

function reducer(state, action) {
  switch (action.type) {
    /* --- Generator --- */
    case "SET_GEN_STEP":
      return { ...state, generator: { ...state.generator, step: action.payload } };
    case "SET_GEN_CONFIG":
      return {
        ...state,
        generator: {
          ...state.generator,
          config: { ...state.generator.config, ...action.payload },
        },
      };
    case "SET_GEN_SCRIPT":
      return { ...state, generator: { ...state.generator, script: action.payload } };
    case "SET_GEN_ASSETS":
      return { ...state, generator: { ...state.generator, assets: action.payload } };
    case "SET_GEN_ASSEMBLE_PROGRESS":
      return { ...state, generator: { ...state.generator, assembleProgress: action.payload } };
    case "SET_GEN_OUTPUT":
      return { ...state, generator: { ...state.generator, output: action.payload } };
    case "GEN_RESET":
      return { ...state, generator: initialState.generator };

    /* --- Director --- */
    case "SET_DIR_RAW":
      return { ...state, director: { ...state.director, raw: action.payload } };
    case "SET_DIR_FORMAT":
      return { ...state, director: { ...state.director, format: action.payload } };
    case "SET_DIR_DURATION":
      return { ...state, director: { ...state.director, duration: action.payload } };
    case "SET_DIR_SEGMENTS":
      return { ...state, director: { ...state.director, segments: action.payload } };
    case "SET_DIR_SELECTED":
      return { ...state, director: { ...state.director, selectedId: action.payload } };
    case "UPDATE_DIR_SEGMENT": {
      const { id, ...changes } = action.payload;
      return {
        ...state,
        director: {
          ...state.director,
          segments: state.director.segments.map((seg) =>
            seg.id === id ? { ...seg, ...changes } : seg
          ),
        },
      };
    }
    case "DIR_RESET":
      return { ...state, director: initialState.director };

    /* --- Runs --- */
    case "SAVE_RUN": {
      const run = {
        id: action.payload.id || Date.now(),
        createdAt: new Date().toISOString(),
        type: action.payload.type,
        name: action.payload.name,
        input: action.payload.input,
        output: action.payload.output,
      };
      const existing = state.runs.filter((r) => r.id !== run.id);
      return { ...state, runs: [run, ...existing].slice(0, 50) };
    }
    case "DELETE_RUN":
      return { ...state, runs: state.runs.filter((r) => r.id !== action.payload) };

    /* --- Settings --- */
    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };

    /* --- System --- */
    case "HYDRATE":
      return { ...initialState, ...action.payload };
    case "RESET":
      return { ...initialState, settings: state.settings, runs: state.runs };

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
    } catch {
      // Corrupt data, ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ _v: STORAGE_VERSION, data: state })
      );
    } catch {
      // Storage full, ignore
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
  if (!ctx) throw new Error("useStore requires StoreProvider");
  return ctx;
}
