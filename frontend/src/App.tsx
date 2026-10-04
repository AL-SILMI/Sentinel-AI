import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { CommandCenter } from './pages/CommandCenter';
import { ProtectedChat } from './pages/ProtectedChat';
import { AttackSimulator } from './pages/AttackSimulator';
import { ToolGateway } from './pages/ToolGateway';
import { SecurityEvents } from './pages/SecurityEvents';
import { DetectionPolicies } from './pages/DetectionPolicies';
import { SystemArchitecture } from './pages/SystemArchitecture';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('command-center');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'command-center':
        return <CommandCenter key={refreshKey} />;
      case 'protected-chat':
        return <ProtectedChat key={refreshKey} />;
      case 'attack-simulator':
        return <AttackSimulator key={refreshKey} />;
      case 'tool-gateway':
        return <ToolGateway key={refreshKey} />;
      case 'security-events':
        return <SecurityEvents key={refreshKey} />;
      case 'detection-policies':
        return <DetectionPolicies key={refreshKey} />;
      case 'system-architecture':
        return <SystemArchitecture key={refreshKey} />;
      default:
        return <CommandCenter key={refreshKey} />;
    }
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab} onRefresh={handleRefresh}>
      {renderContent()}
    </Layout>
  );
};

export default App;
