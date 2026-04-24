import { AppProvider, useAppContext } from './context';
import { InputPage } from './components/InputPage';
import LoadingOverlay from './components/LoadingOverlay';
import { ScriptDisplay } from './components/ScriptDisplay';
import './App.css';

function AppContent() {
  const { currentPage, isGenerating } = useAppContext();

  return (
    <div className="min-h-screen">
      {currentPage === 'input' && <InputPage />}
      {currentPage === 'loading' && <LoadingOverlay visible={true} />}
      {currentPage === 'result' && <ScriptDisplay />}

      {isGenerating && currentPage !== 'loading' && <LoadingOverlay visible={true} />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
