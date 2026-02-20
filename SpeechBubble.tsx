import React, { useEffect, useState } from 'react';
import type { PetMood } from '@/types/pet';

interface SpeechBubbleProps {
  message: string;
  mood: PetMood;
  onClose?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const moodColors: Record<PetMood, string> = {
  ecstatic: '#ff6b9d',
  happy: '#4fbdba',
  content: '#4fbdba',
  neutral: '#a0a0a0',
  sad: '#708090',
  angry: '#e74c3c',
  sick: '#95a5a6',
  sleepy: '#9b59b6',
  hungry: '#f39c12',
};

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ 
  message, 
  mood, 
  onClose,
  autoHide = true,
  autoHideDelay = 4000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setIsVisible(true);
    setIsTyping(true);
    setDisplayedText('');

    // Typewriter effect
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedText(message.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [message]);

  useEffect(() => {
    if (!autoHide || isTyping) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, autoHideDelay);

    return () => clearTimeout(timer);
  }, [autoHide, autoHideDelay, isTyping, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className="relative animate-fade-in"
      style={{ 
        filter: `drop-shadow(0 2px 0 ${moodColors[mood]}40)`,
      }}
    >
      <div 
        className="bg-gray-800 border-2 p-3 relative"
        style={{ borderColor: moodColors[mood] }}
      >
        <p className="text-xs text-white leading-relaxed min-h-[20px]">
          {displayedText}
          {isTyping && (
            <span className="animate-pulse ml-0.5">▋</span>
          )}
        </p>
        
        {/* Close button */}
        {!autoHide && (
          <button
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 text-white text-xs 
                       flex items-center justify-center hover:bg-gray-600"
          >
            ×
          </button>
        )}
      </div>
      
      {/* Triangle pointer */}
      <div 
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: `8px solid ${moodColors[mood]}`,
        }}
      />
      <div 
        className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #1f2937',
        }}
      />
    </div>
  );
};

export default SpeechBubble;
