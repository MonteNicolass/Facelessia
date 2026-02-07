"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const STORAGE_KEY = "celeste-store";
const STORAGE_VERSION = 6;

export const initialState = {
  /* AI Video Studio */
  studio: {
    config: {
      topic: "",
      duration: "60",
      style: "epica",
      language: "es",
    },
    output: null,
    loading: false,
  },

  /* Editing Director */
  director: {
    raw: "",
    mode: "short",
    segments: [],
    selectedId: null,
  },

  /* Settings */
  settings: {
    wpm: 160,
    brollDensity: "medium",
    motionIntensity: "medium",
    language: "es",
    autoIntro: true,
    seriesMode: false,
  },

  /* Saved projects */
  projects: [],
};

function reducer(state, action) {
  switch (action.type) {
    /* --- Studio --- */
    case "SET_STUDIO_CONFIG":
      return {
        ...state,
        studio: {
          ...state.studio,
          config: { ...state.studio.config, ...action.payload },
        },
      };
    case "SET_STUDIO_OUTPUT":
      return { ...state, studio: { ...state.studio, output: action.payload, loading: false } };
    case "SET_STUDIO_LOADING":
      return { ...state, studio: { ...state.studio, loading: action.payload } };
    case "STUDIO_RESET":
      return { ...state, studio: initialState.studio };

    /* --- Director --- */
    case "SET_DIR_RAW":
      return { ...state, director: { ...state.director, raw: action.payload } };
    case "SET_DIR_MODE":
      return { ...state, director: { ...state.director, mode: action.payload } };
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

    /* --- Settings --- */
    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };

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
      return { ...state, projects: [proj, ...existing].slice(0, 30) };
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
      /* corrupt data */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ _v: STORAGE_VERSION, data: state })
      );
    } catch {
      /* storage full */
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
