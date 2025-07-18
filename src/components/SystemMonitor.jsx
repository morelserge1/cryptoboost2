
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Wifi, Shield, Zap } from 'lucide-react';

const SystemMonitor = () => {
  const [systemStatus, setSystemStatus] = useState({
    database: 'online',
    api: 'online',
    trading: 'active',
    security: 'secure',
    lastUpdate: new Date()
  });

  useEffect(() => {
    const checkSystemStatus = () => {
      // Simulate system monitoring
      setSystemStatus(prev => ({
        ...prev,
        lastUpdate: new Date()
      }));
    };

    const interval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'active':
      case 'secure':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'offline':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'api':
        return <Wifi className="w-4 h-4" />;
      case 'trading':
        return <Activity className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <Card className="glass-card neon-border">
      <CardHeader>
        <CardTitle className="text-lg font-mono gradient-text-primary flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          SYSTÈME STATUS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(systemStatus).map(([key, value]) => {
            if (key === 'lastUpdate') return null;
            
            return (
              <div key={key} className="flex items-center justify-between p-3 glass-card-dark rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(key)}
                  <span className="text-sm font-mono capitalize">{key}</span>
                </div>
                <Badge className={`${getStatusColor(value)} text-white font-mono text-xs`}>
                  {value}
                </Badge>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-xs text-gray-400 font-mono text-center">
          Dernière mise à jour: {systemStatus.lastUpdate.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemMonitor;
