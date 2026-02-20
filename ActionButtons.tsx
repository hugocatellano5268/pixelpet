import React from 'react';
import { Utensils, Gamepad2, Hand, Bath, Moon, Sun, Pill, MessageCircle } from 'lucide-react';

interface ActionButtonsProps {
  onFeed: () => void;
  onPlay: () => void;
  onPet: () => void;
  onClean: () => void;
  onSleep: () => void;
  onMedicine: () => void;
  onTalk: () => void;
  isSleeping: boolean;
  isSick: boolean;
}

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  onClick, 
  icon, 
  label, 
  color,
  disabled = false 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      pixel-btn flex flex-col items-center justify-center p-3 min-h-[70px]
      bg-gray-800 border-2 border-gray-700
      active:bg-gray-700 transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
    `}
    style={{ 
      borderColor: disabled ? '#4b5563' : color,
      boxShadow: `0 4px 0 ${disabled ? '#374151' : color}40`
    }}
  >
    <div 
      className="mb-1" 
      style={{ color: disabled ? '#6b7280' : color }}
    >
      {icon}
    </div>
    <span className="text-[9px] uppercase tracking-wider text-gray-300">
      {label}
    </span>
  </button>
);

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onFeed,
  onPlay,
  onPet,
  onClean,
  onSleep,
  onMedicine,
  onTalk,
  isSleeping,
  isSick,
}) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      <ActionButton
        onClick={onFeed}
        icon={<Utensils size={18} />}
        label="Feed"
        color="#fbbf24"
        disabled={isSleeping}
      />
      <ActionButton
        onClick={onPlay}
        icon={<Gamepad2 size={18} />}
        label="Play"
        color="#a78bfa"
        disabled={isSleeping}
      />
      <ActionButton
        onClick={onPet}
        icon={<Hand size={18} />}
        label="Pet"
        color="#f472b6"
      />
      <ActionButton
        onClick={onClean}
        icon={<Bath size={18} />}
        label="Clean"
        color="#06b6d4"
        disabled={isSleeping}
      />
      <ActionButton
        onClick={onSleep}
        icon={isSleeping ? <Sun size={18} /> : <Moon size={18} />}
        label={isSleeping ? 'Wake' : 'Sleep'}
        color={isSleeping ? '#fbbf24' : '#6366f1'}
      />
      <ActionButton
        onClick={onMedicine}
        icon={<Pill size={18} />}
        label="Meds"
        color="#ef4444"
        disabled={isSleeping || !isSick}
      />
      <ActionButton
        onClick={onTalk}
        icon={<MessageCircle size={18} />}
        label="Talk"
        color="#22c55e"
      />
    </div>
  );
};

export default ActionButtons;
