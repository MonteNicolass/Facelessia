"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const STORAGE_KEY = "celeste-store";
const STORAGE_VERSION = 7;

export const initialState = {
  /* AI Video Studio */
  studio: {
    config: { topic: "", duration: 60, style: "epica", language: "es" },
    scenes: [],
    casting: [],
    loading: false,
  },

  /* Director Pro */
  director: {
    raw: "",
    mode: "short_epico",
    detectTimestamps: true,
    clips: [],
    selectedId: null,
  },

  /* Saved projects */
  projects: [],
};

function reducer(state, action) {
  switch (action.type) {
    /* --- Studio --- */
    case "SET_STUDIO_CONFIG":
      return { ...state, studio: { ...state.studio, config: { ...state.studio.config, ...action.payload } } };
    case "SET_STUDIO_SCENES":
      return { ...state, studio: { ...state.studio, scenes: action.payload, loading: false } };
    case "SET_STUDIO_CASTING":
      return { ...state, studio: { ...state.studio, casting: action.payload } };
    case "SET_STUDIO_LOADING":
      return { ...state, studio: { ...state.studio, loading: action.payload } };
    case "UPDATE_STUDIO_SCENE": {
      const { id, ...changes } = action.payload;
      return {
        ...state,
        studio: {
          ...state.studio,
          scenes: state.studio.scenes.map((s) => (s.id === id ? { ...s, ...changes } : s)),
        },
      };
    }
    case "STUDIO_RESET":
      return { ...state, studio: initialState.studio };

    /* --- Director --- */
    case "SET_DIR_RAW":
      return { ...state, director: { ...state.director, raw: action.payload } };
    case "SET_DIR_MODE":
      return { ...state, director: { ...state.director, mode: action.payload } };
    case "SET_DIR_DETECT_TS":
      return { ...state, director: { ...state.director, detectTimestamps: action.payload } };
    case "SET_DIR_CLIPS":
      return { ...state, director: { ...state.director, clips: action.payload } };
    case "SET_DIR_SELECTED":
      return { ...state, director: { ...state.director, selectedId: action.payload } };
    case "UPDATE_DIR_CLIP": {
      const { id, ...changes } = action.payload;
      return {
        ...state,
        director: {
          ...state.director,
          clips: state.director.clips.map((c) => (c.id === id ? { ...c, ...changes } : c)),
        },
      };
    }
    case "DIR_RESET":
      return { ...state, director: initialState.director };

    /* --- Projects --- */
    case "SAVE_PROJECT": {
      const proj = {
        id: action.payload.id || Date.now(),
        name: action.payload.name,
        type: action.payload.type,
        createdAt: new Date().toISOString(),
        data: action.payload.data,
      };
      const rest = state.projects.filter((p) => p.id !== proj.id);
      return { ...state, projects: [proj, ...rest].slice(0, 30) };
    }
    case "DELETE_PROJECT":
      return { ...state, projects: state.projects.filter((p) => p.id !== action.payload) };

    /* --- System --- */
    case "HYDRATE":
      return { ...initialState, ...action.payload };
    case "RESET":
      return { ...initialState, projects: state.projects };

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
