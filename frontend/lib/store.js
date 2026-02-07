"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const STORAGE_KEY = "celeste-store";
const STORAGE_VERSION = 2;

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
    case "HYDRATE":
      return { ...initialState, ...action.payload };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restaurar de localStorage al montar
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

  // Persistir a localStorage en cada cambio
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
