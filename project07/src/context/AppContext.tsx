import { createContext, useContext, useCallback, useReducer, ReactNode } from 'react';
import { Script } from '../types';
import { generateScript } from '../mock';

type AppPage = 'input' | 'loading' | 'result';

interface AppState {
  currentPage: AppPage;
  currentScript: Script | null;
  userInput: string;
  isGenerating: boolean;
}

interface AppContextType extends AppState {
  goToInputPage: () => void;
  goToLoadingPage: () => void;
  goToResultPage: () => void;
  setCurrentScript: (script: Script) => void;
  setUserInput: (input: string) => void;
  startGenerate: (userInput: string) => Promise<void>;
  regenerate: () => Promise<void>;
}

type AppAction =
  | { type: 'SET_PAGE'; payload: AppPage }
  | { type: 'SET_SCRIPT'; payload: Script | null }
  | { type: 'SET_USER_INPUT'; payload: string }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  currentPage: 'input',
  currentScript: null,
  userInput: '',
  isGenerating: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_SCRIPT':
      return { ...state, currentScript: action.payload };
    case 'SET_USER_INPUT':
      return { ...state, userInput: action.payload };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const goToInputPage = useCallback(() => {
    dispatch({ type: 'SET_PAGE', payload: 'input' });
  }, []);

  const goToLoadingPage = useCallback(() => {
    dispatch({ type: 'SET_PAGE', payload: 'loading' });
  }, []);

  const goToResultPage = useCallback(() => {
    dispatch({ type: 'SET_PAGE', payload: 'result' });
  }, []);

  const setCurrentScript = useCallback((script: Script) => {
    dispatch({ type: 'SET_SCRIPT', payload: script });
  }, []);

  const setUserInput = useCallback((input: string) => {
    dispatch({ type: 'SET_USER_INPUT', payload: input });
  }, []);

  const startGenerate = useCallback(async (input: string) => {
    if (state.isGenerating) return;

    try {
      dispatch({ type: 'SET_USER_INPUT', payload: input });
      dispatch({ type: 'SET_GENERATING', payload: true });
      dispatch({ type: 'SET_PAGE', payload: 'loading' });

      const script = await generateScript(input);

      dispatch({ type: 'SET_SCRIPT', payload: script });
      dispatch({ type: 'SET_PAGE', payload: 'result' });
    } catch (error) {
      console.error('生成剧本失败:', error);
      dispatch({ type: 'SET_PAGE', payload: 'input' });
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  }, [state.isGenerating]);

  const regenerate = useCallback(async () => {
    if (!state.userInput || state.isGenerating) return;
    await startGenerate(state.userInput);
  }, [state.userInput, state.isGenerating, startGenerate]);

  const value: AppContextType = {
    ...state,
    goToInputPage,
    goToLoadingPage,
    goToResultPage,
    setCurrentScript,
    setUserInput,
    startGenerate,
    regenerate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
