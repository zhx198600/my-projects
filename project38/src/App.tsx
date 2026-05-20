import { useState } from 'react';
import DashboardLayout from './components/DashboardLayout/DashboardLayout';
import LeftPanel from './components/LeftPanel/LeftPanel';
import RightPanel from './components/RightPanel/RightPanel';
import TrafficMap from './components/TrafficMap/TrafficMap';
import ModeSwitch, { MapMode } from './components/ModeSwitch/ModeSwitch';
import BottomCharts from './components/BottomCharts/BottomCharts';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import useTrafficData from './hooks/useTrafficData';
import './styles/App.css';

function App() {
  const [mapMode, setMapMode] = useState<MapMode>('road');
  const [isLoading, setIsLoading] = useState(true);
  const {
    stats,
    warnings,
    hourlyData,
    districtData,
    isRefreshing,
    lastUpdateTime
  } = useTrafficData(true, 5000);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <DashboardLayout
      leftPanel={
        <LeftPanel
          mapMode={mapMode}
          stats={stats}
          isRefreshing={isRefreshing}
          lastUpdateTime={lastUpdateTime}
        />
      }
      rightPanel={
        <RightPanel
          mapMode={mapMode}
          warnings={warnings}
          isRefreshing={isRefreshing}
          lastUpdateTime={lastUpdateTime}
        />
      }
      mapArea={<TrafficMap mapMode={mapMode} />}
      modeSwitch={<ModeSwitch mode={mapMode} onModeChange={setMapMode} />}
      bottomPanel={
        <BottomCharts
          hourlyData={hourlyData}
          districtData={districtData}
          autoRefresh={false}
        />
      }
    />
  );
}

export default App;
