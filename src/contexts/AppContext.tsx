import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface AppState {
  user: null | { id: string; name: string; preferences: any };
  theme: 'light' | 'dark' | 'high-contrast';
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    contrast: 'normal' | 'high';
    hapticFeedback: boolean;
    screenReader: boolean;
  };
  emergency: {
    contacts: Array<{ id: string; name: string; phone: string; relation: string }>;
    quickPhrases: string[];
  };
  isLoading: boolean;
  error: string | null;
}

type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'high-contrast' }
  | { type: 'SET_ACCESSIBILITY'; payload: Partial<AppState['accessibility']> }
  | { type: 'SET_USER'; payload: AppState['user'] }
  | { type: 'ADD_EMERGENCY_CONTACT'; payload: AppState['emergency']['contacts'][0] }
  | { type: 'REMOVE_EMERGENCY_CONTACT'; payload: string };

const initialState: AppState = {
  user: null,
  theme: 'light',
  accessibility: {
    fontSize: 'medium',
    contrast: 'normal',
    hapticFeedback: true,
    screenReader: false,
  },
  emergency: {
    contacts: [],
    quickPhrases: [
      "I need help",
      "Call emergency services",
      "I cannot speak",
      "Please be patient with me",
      "I am deaf/mute"
    ],
  },
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_ACCESSIBILITY':
      return { 
        ...state, 
        accessibility: { ...state.accessibility, ...action.payload } 
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_EMERGENCY_CONTACT':
      return {
        ...state,
        emergency: {
          ...state.emergency,
          contacts: [...state.emergency.contacts, action.payload]
        }
      };
    case 'REMOVE_EMERGENCY_CONTACT':
      return {
        ...state,
        emergency: {
          ...state.emergency,
          contacts: state.emergency.contacts.filter(c => c.id !== action.payload)
        }
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}