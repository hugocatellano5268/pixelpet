import React from 'react';
import { Heart, Smile, Zap, Droplets, Sparkles } from 'lucide-react';

interface StatBarsProps {
  hunger: number;
  happiness: number;
  health: number;
  energy: number;
  hygiene: number;
}

const StatBar: React.FC<{ 
  value: number; 
  icon: React.ReactNode; 
  label: string;
  color: string;
}> = ({ value, icon, label, color }) => {
  const getColor = () => {
    if (value > 70) return 'bg-green-500';
    if (value > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 flex items-center justify-center" style={{ color }}>
        {icon}
      </div>
      <span className="text-[10px] w-16 text-gray-300 uppercase tracking-wider">{label}</span>
      <div className="flex-1 stat-bar rounded-none">
        <div 
          className={`stat-fill ${getColor()}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] w-8 text-right text-gray-400">{Math.round(value)}%</span>
    </div>
  );
};

export const StatBars: React.FC<StatBarsProps> = ({ 
  hunger, 
  happiness, 
  health, 
  energy, 
  hygiene 
}) => {
  return (
    <div className="bg-gray-900/80 p-3 pixel-border">
      <StatBar 
        value={hunger} 
        icon={<Sparkles size={14} />} 
        label="Hunger"
        color="#fbbf24"
      />
      <StatBar 
        value={happiness} 
        icon={<Smile size={14} />} 
        label="Happy"
        color="#f472b6"
      />
      <StatBar 
        value={health} 
        icon={<Heart size={14} />} 
        label="Health"
        color="#ef4444"
      />
      <StatBar 
        value={energy} 
        icon={<Zap size={14} />} 
        label="Energy"
        color="#3b82f6"
      />
      <StatBar 
        value={hygiene} 
        icon={<Droplets size={14} />} 
        label="Clean"
        color="#06b6d4"
      />
    </div>
  );
};

export default StatBars;
