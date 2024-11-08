import { useState, useEffect } from 'react';
import MoodLights from './algorithm/MoodLights';
import { initializeModel } from './algorithm/utils';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModel = async () => {
      await initializeModel();
      setIsLoading(false);
    };
    loadModel();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        color: '#fff',
        gap: '20px'
      }}>
        <div className="loading-spinner"></div>
        <div>Loading AI Model...</div>
      </div>
    );
  }

  return <MoodLights />;
}

export default App;
