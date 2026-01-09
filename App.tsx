import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Power, Globe, Activity, Lock, Settings, 
  MapPin, CheckCircle, XCircle, Terminal, Cpu, Wand2 
} from 'lucide-react';
import { ConnectionState, Server, TrafficPoint, LogEntry, UserPreferences } from './types';
import { MOCK_SERVERS, APP_NAME } from './constants';
import Button from './components/Button';
import ServerList from './components/ServerList';
import TrafficChart from './components/TrafficChart';
import { getSmartRecommendation } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [selectedServer, setSelectedServer] = useState<Server>(MOCK_SERVERS[0]);
  const [duration, setDuration] = useState<number>(0);
  const [trafficData, setTrafficData] = useState<TrafficPoint[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'servers' | 'settings' | 'ai'>('dashboard');
  const [preferences, setPreferences] = useState<UserPreferences>({
    protocol: 'IKEv2',
    killSwitch: true,
    autoConnect: false
  });
  
  // AI State
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{server: Server, reason: string} | null>(null);

  // --- Refs & Timers ---
  const timerRef = useRef<number | null>(null);
  const trafficIntervalRef = useRef<number | null>(null);

  // --- Helpers ---
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [entry, ...prev].slice(0, 50));
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // --- Effects ---

  // Initialize Traffic Data
  useEffect(() => {
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: i.toString(),
      download: 0,
      upload: 0
    }));
    setTrafficData(initialData);
  }, []);

  // Handle Connection Simulation
  const toggleConnection = () => {
    if (connectionState === ConnectionState.CONNECTED) {
      // Disconnect
      setConnectionState(ConnectionState.DISCONNECTING);
      addLog('Initiating disconnect sequence...', 'info');
      
      setTimeout(() => {
        setConnectionState(ConnectionState.DISCONNECTED);
        setDuration(0);
        addLog('Disconnected successfully.', 'warning');
        if (timerRef.current) clearInterval(timerRef.current);
        if (trafficIntervalRef.current) clearInterval(trafficIntervalRef.current);
      }, 1500);

    } else {
      // Connect
      setConnectionState(ConnectionState.CONNECTING);
      addLog(`Connecting to ${selectedServer.country} (${selectedServer.city})...`, 'info');
      addLog(`Protocol: ${preferences.protocol}`, 'info');

      setTimeout(() => {
        setConnectionState(ConnectionState.CONNECTED);
        addLog(`Encrypted tunnel established. IP: ${selectedServer.ip}`, 'success');
        
        // Start Timer
        const startTime = Date.now();
        timerRef.current = window.setInterval(() => {
          setDuration(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        // Start Traffic Simulation
        trafficIntervalRef.current = window.setInterval(() => {
          setTrafficData(prev => {
            const newPoint = {
              time: new Date().toLocaleTimeString(),
              download: Math.random() * 80 + 20, // 20-100 Mbps
              upload: Math.random() * 30 + 5     // 5-35 Mbps
            };
            return [...prev.slice(1), newPoint];
          });
        }, 1000);

      }, 2000);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (trafficIntervalRef.current) clearInterval(trafficIntervalRef.current);
    };
  }, []);

  // --- AI Handler ---
  const handleAiAsk = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiRecommendation(null);
    
    try {
      const resultJson = await getSmartRecommendation(aiQuery);
      const result = JSON.parse(resultJson);
      
      const server = MOCK_SERVERS.find(s => s.id === result.recommendedServerId) || MOCK_SERVERS[0];
      setAiRecommendation({
        server,
        reason: result.reason
      });
      addLog(`AI Recommended: ${server.country} for "${aiQuery}"`, 'success');
    } catch (e) {
      addLog('Failed to get AI recommendation', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // --- UI Components ---
  
  const StatusIndicator = () => {
    const colors = {
      [ConnectionState.DISCONNECTED]: 'bg-rose-500 shadow-rose-500/20',
      [ConnectionState.CONNECTING]: 'bg-amber-500 shadow-amber-500/20 animate-pulse',
      [ConnectionState.CONNECTED]: 'bg-emerald-500 shadow-emerald-500/20',
      [ConnectionState.DISCONNECTING]: 'bg-slate-500 shadow-slate-500/20'
    };

    const labels = {
      [ConnectionState.DISCONNECTED]: 'Unsecured',
      [ConnectionState.CONNECTING]: 'Connecting...',
      [ConnectionState.CONNECTED]: 'Secured',
      [ConnectionState.DISCONNECTING]: 'Disconnecting...'
    };

    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative">
          <div className={`w-48 h-48 rounded-full flex items-center justify-center border-8 border-slate-800 bg-slate-900 shadow-2xl transition-all duration-500 ${connectionState === ConnectionState.CONNECTED ? 'border-emerald-500/20' : ''}`}>
            <Power 
              size={64} 
              className={`transition-all duration-500 ${
                connectionState === ConnectionState.CONNECTED ? 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 
                connectionState === ConnectionState.DISCONNECTED ? 'text-rose-500' : 'text-slate-400'
              }`} 
            />
          </div>
          {/* Pulse Ring */}
          {connectionState === ConnectionState.CONNECTED && (
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/50 animate-ping"></div>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-white shadow-lg ${colors[connectionState]}`}>
            {connectionState === ConnectionState.CONNECTED ? <CheckCircle size={16}/> : <XCircle size={16}/>}
            {labels[connectionState]}
          </div>
          <div className="mt-2 text-slate-400 font-mono">
            {connectionState === ConnectionState.CONNECTED ? formatTime(duration) : '--:--:--'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
      
      {/* Main App Container */}
      <div className="w-full max-w-5xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-20 bg-slate-900 border-r border-slate-800 flex md:flex-col items-center justify-between md:justify-start p-4 gap-6 z-10">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Shield size={28} />
          </div>
          
          <nav className="flex md:flex-col gap-4 w-full justify-center md:justify-start">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Dashboard"
            >
              <Activity size={24} />
            </button>
            <button 
              onClick={() => setActiveTab('servers')}
              className={`p-3 rounded-xl transition-all ${activeTab === 'servers' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Servers"
            >
              <Globe size={24} />
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`p-3 rounded-xl transition-all ${activeTab === 'ai' ? 'bg-slate-800 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
              title="AI Assistant"
            >
              <Wand2 size={24} className={activeTab === 'ai' ? 'text-emerald-400' : ''} />
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`p-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Settings"
            >
              <Settings size={24} />
            </button>
          </nav>

          <div className="hidden md:block mt-auto text-xs text-slate-600 text-center">
            v1.0.2
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm">
            <h1 className="text-xl font-bold tracking-tight text-white">{APP_NAME}</h1>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                  <MapPin size={12} className="text-emerald-400" />
                  {connectionState === ConnectionState.CONNECTED ? selectedServer.ip : 'Real IP Exposed'}
               </div>
            </div>
          </header>

          {/* Main Content Render */}
          <main className="flex-1 overflow-y-auto p-6 bg-slate-950/30">
            
            {/* --- DASHBOARD TAB --- */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Connection Control - Left Col */}
                <div className="lg:col-span-1 bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-between">
                  <div className="w-full">
                    <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Current Session</h2>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{selectedServer.flag}</span>
                        <div>
                          <div className="text-sm font-medium text-white">{selectedServer.country}</div>
                          <div className="text-xs text-slate-400">{selectedServer.city}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('servers')}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                        disabled={connectionState !== ConnectionState.DISCONNECTED}
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <StatusIndicator />

                  <Button 
                    onClick={toggleConnection}
                    className="w-full mt-6 py-4 text-lg shadow-lg shadow-emerald-900/20"
                    variant={connectionState === ConnectionState.CONNECTED ? 'danger' : 'primary'}
                    disabled={connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.DISCONNECTING}
                  >
                    {connectionState === ConnectionState.CONNECTED ? 'Disconnect' : 'Quick Connect'}
                  </Button>
                </div>

                {/* Stats & Graphs - Right Col */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Traffic Card */}
                  <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                        <Activity size={16} /> Network Traffic
                      </h2>
                      <div className="flex gap-4 text-sm font-mono">
                        <span className="text-emerald-400 flex items-center gap-1">↓ {trafficData[trafficData.length-1]?.download.toFixed(1)} Mb/s</span>
                        <span className="text-blue-400 flex items-center gap-1">↑ {trafficData[trafficData.length-1]?.upload.toFixed(1)} Mb/s</span>
                      </div>
                    </div>
                    <TrafficChart data={trafficData} isConnected={connectionState === ConnectionState.CONNECTED} />
                  </div>

                  {/* Logs / Terminal */}
                  <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 h-48 flex flex-col">
                    <h2 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Terminal size={14} /> Connection Log
                    </h2>
                    <div className="flex-1 overflow-y-auto bg-slate-950 rounded-lg p-3 font-mono text-xs space-y-1 border border-slate-800/50">
                      {logs.length === 0 && <span className="text-slate-600 italic">Ready to connect...</span>}
                      {logs.map((log) => (
                        <div key={log.id} className="flex gap-2">
                          <span className="text-slate-600">[{log.timestamp}]</span>
                          <span className={`${
                            log.type === 'error' ? 'text-rose-400' :
                            log.type === 'success' ? 'text-emerald-400' :
                            log.type === 'warning' ? 'text-amber-400' : 'text-slate-300'
                          }`}>
                            {log.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* --- SERVERS TAB --- */}
            {activeTab === 'servers' && (
              <div className="max-w-2xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-slate-800">
                  <h2 className="text-xl font-semibold text-white mb-1">Select Location</h2>
                  <p className="text-slate-400 text-sm">Choose a secure server to route your traffic.</p>
                </div>
                <div className="p-4 overflow-hidden flex-1">
                  <ServerList 
                    servers={MOCK_SERVERS} 
                    selectedServerId={selectedServer.id}
                    onSelect={(s) => {
                      setSelectedServer(s);
                      setActiveTab('dashboard'); // Auto navigate back
                      addLog(`Selected server: ${s.country}`, 'info');
                    }}
                    disabled={connectionState !== ConnectionState.DISCONNECTED}
                  />
                </div>
              </div>
            )}

            {/* --- AI ASSISTANT TAB --- */}
            {activeTab === 'ai' && (
              <div className="max-w-2xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg text-white">
                    <Wand2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Smart Connect AI</h2>
                    <p className="text-slate-400 text-sm">Ask Gemini to find the perfect server for your needs.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">What do you want to do?</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        placeholder="e.g., I want to watch Anime in high quality"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                      />
                      <Button onClick={handleAiAsk} isLoading={aiLoading} disabled={!aiQuery}>
                        Ask AI
                      </Button>
                    </div>
                  </div>

                  {aiRecommendation && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mt-6 animate-fade-in">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{aiRecommendation.server.flag}</div>
                        <div>
                          <h3 className="text-lg font-medium text-emerald-400 mb-1">Recommended: {aiRecommendation.server.country}</h3>
                          <p className="text-slate-300 text-sm mb-4 leading-relaxed">{aiRecommendation.reason}</p>
                          <Button 
                            variant="secondary" 
                            className="text-sm py-1.5"
                            disabled={connectionState !== ConnectionState.DISCONNECTED}
                            onClick={() => {
                              setSelectedServer(aiRecommendation.server);
                              setActiveTab('dashboard');
                              addLog(`Applied AI recommendation: ${aiRecommendation.server.country}`, 'success');
                            }}
                          >
                            Select & Go to Dashboard
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-3">
                    {['Watch Netflix US', 'Low ping gaming', 'Maximum Privacy', 'P2P File Sharing'].map(preset => (
                      <button 
                        key={preset}
                        onClick={() => setAiQuery(preset)}
                        className="text-left text-xs text-slate-500 hover:text-emerald-400 hover:bg-slate-800 p-2 rounded transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- SETTINGS TAB --- */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Settings</h2>
                
                <div className="space-y-6">
                  {/* Protocol */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <div className="font-medium text-slate-200">VPN Protocol</div>
                      <div className="text-xs text-slate-500">Choose the connection method</div>
                    </div>
                    <select 
                      value={preferences.protocol}
                      onChange={(e) => setPreferences({...preferences, protocol: e.target.value as any})}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="IKEv2">IKEv2 (Fastest)</option>
                      <option value="WireGuard">WireGuard (Modern)</option>
                      <option value="OpenVPN">OpenVPN (Stable)</option>
                    </select>
                  </div>

                  {/* Kill Switch */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <div className="font-medium text-slate-200">Kill Switch</div>
                      <div className="text-xs text-slate-500">Block internet if VPN drops</div>
                    </div>
                    <button 
                      onClick={() => setPreferences(p => ({...p, killSwitch: !p.killSwitch}))}
                      className={`w-12 h-6 rounded-full transition-colors relative ${preferences.killSwitch ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${preferences.killSwitch ? 'translate-x-6' : ''}`}></div>
                    </button>
                  </div>

                   {/* Browser Limitations Notice */}
                  <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                    <Lock className="text-amber-400 shrink-0" size={20} />
                    <div>
                      <h4 className="text-amber-400 font-medium text-sm mb-1">Architecture Note</h4>
                      <p className="text-amber-200/70 text-xs leading-relaxed">
                        This is a Frontend Control Panel. Standard web browsers prevent direct manipulation of network interfaces (TUN/TAP) required for a true system-wide VPN. 
                        In a production environment, this UI would communicate with a local system daemon (Backend) via localhost API to establish the OpenVPN/WireGuard tunnel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default App;