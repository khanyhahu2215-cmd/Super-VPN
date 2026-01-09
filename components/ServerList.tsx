import React from 'react';
import { Server } from '../types';
import { Signal, Crown } from 'lucide-react';

interface ServerListProps {
  servers: Server[];
  selectedServerId: string;
  onSelect: (server: Server) => void;
  disabled: boolean;
}

const ServerList: React.FC<ServerListProps> = ({ servers, selectedServerId, onSelect, disabled }) => {
  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-2">
      {servers.map((server) => {
        const isSelected = server.id === selectedServerId;
        const loadColor = server.load < 50 ? 'text-emerald-400' : server.load < 80 ? 'text-yellow-400' : 'text-rose-400';

        return (
          <button
            key={server.id}
            onClick={() => !disabled && onSelect(server)}
            disabled={disabled}
            className={`
              flex items-center justify-between p-3 rounded-lg border transition-all
              ${isSelected 
                ? 'bg-slate-700/50 border-emerald-500/50 ring-1 ring-emerald-500/50' 
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" role="img" aria-label={`Flag of ${server.country}`}>
                {server.flag}
              </span>
              <div className="text-left">
                <div className="font-medium text-slate-200 flex items-center gap-2">
                  {server.country}
                  {server.premium && <Crown size={14} className="text-amber-400" />}
                </div>
                <div className="text-xs text-slate-400">{server.city}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end text-xs">
                <span className={`${loadColor} font-medium`}>{server.load}% Load</span>
                <span className="text-slate-500">{server.ping} ms</span>
              </div>
              <Signal size={18} className={loadColor} />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ServerList;