import { useState, useEffect, useCallback } from 'react';
import type { PetState, PetMood } from '@/types/pet';

interface PixelPetProps {
  pet: PetState;
  animation?: string;
  onPet: () => void;
  size?: 'small' | 'medium' | 'large';
}

// Adult Male Pixel Art - Always adult, always male
const ADULT_MALE_PIXELS: Record<PetMood, string[][]> = {
  ecstatic: [
    ['transparent', 'transparent', '#2d5a87', '#2d5a87', '#2d5a87', 'transparent', 'transparent'],
    ['transparent', '#2d5a87', '#fff', '#000', '#fff', '#2d5a87', 'transparent'],
    ['#2d5a87', '#2d5a87', '#2d5a87', '#2d5a87', '#2d5a87', '#2d5a87', '#2d5a87'],
    ['#2d5a87', '#2d5a87', '#1a3a52', '#1a3a52', '#1a3a52', '#2d5a87', '#2d5a87'],
    ['transparent', '#2d5a87', '#2d5a87', '#2d5a87', '#2d5a87', '#2d5a87', 'transparent'],
    ['transparent', '#2d5a87', 'transparent', 'transparent', 'transparent', '#2d5a87', 'transparent']
  ],
  happy: [
    ['transparent', 'transparent', '#4a7c59', '#4a7c59', '#4a7c59', 'transparent', 'transparent'],
    ['transparent', '#4a7c59', '#fff', '#000', '#fff', '#4a7c59', 'transparent'],
    ['#4a7c59', '#4a7c59', '#4a7c59', '#4a7c59', '#4a7c59', '#4a7c59', '#4a7c59'],
    ['#4a7c59', '#4a7c59', '#2d5238', '#2d5238', '#2d5238', '#4a7c59', '#4a7c59'],
    ['transparent', '#4a7c59', '#4a7c59', '#4a7c59', '#4a7c59', '#4a7c59', 'transparent'],
    ['transparent', '#4a7c59', 'transparent', 'transparent', 'transparent', '#4a7c59', 'transparent']
  ],
  content: [
    ['transparent', 'transparent', '#5a7a8a', '#5a7a8a', '#5a7a8a', 'transparent', 'transparent'],
    ['transparent', '#5a7a8a', '#fff', '#000', '#fff', '#5a7a8a', 'transparent'],
    ['#5a7a8a', '#5a7a8a', '#5a7a8a', '#5a7a8a', '#5a7a8a', '#5a7a8a', '#5a7a8a'],
    ['#5a7a8a', '#5a7a8a', '#3d5a6a', '#3d5a6a', '#3d5a6a', '#5a7a8a', '#5a7a8a'],
    ['transparent', '#5a7a8a', '#5a7a8a', '#5a7a8a', '#5a7a8a', '#5a7a8a', 'transparent'],
    ['transparent', '#5a7a8a', 'transparent', 'transparent', 'transparent', '#5a7a8a', 'transparent']
  ],
  neutral: [
    ['transparent', 'transparent', '#6a7a8a', '#6a7a8a', '#6a7a8a', 'transparent', 'transparent'],
    ['transparent', '#6a7a8a', '#fff', '#000', '#fff', '#6a7a8a', 'transparent'],
    ['#6a7a8a', '#6a7a8a', '#6a7a8a', '#6a7a8a', '#6a7a8a', '#6a7a8a', '#6a7a8a'],
    ['#6a7a8a', '#6a7a8a', '#4a5a6a', '#4a5a6a', '#4a5a6a', '#6a7a8a', '#6a7a8a'],
    ['transparent', '#6a7a8a', '#6a7a8a', '#6a7a8a', '#6a7a8a', '#6a7a8a', 'transparent'],
    ['transparent', '#6a7a8a', 'transparent', 'transparent', 'transparent', '#6a7a8a', 'transparent']
  ],
  sad: [
    ['transparent', 'transparent', '#5a6a7a', '#5a6a7a', '#5a6a7a', 'transparent', 'transparent'],
    ['transparent', '#5a6a7a', '#fff', '#000', '#fff', '#5a6a7a', 'transparent'],
    ['#5a6a7a', '#5a6a7a', '#5a6a7a', '#5a6a7a', '#5a6a7a', '#5a6a7a', '#5a6a7a'],
    ['#5a6a7a', '#5a6a7a', '#3a4a5a', '#3a4a5a', '#3a4a5a', '#5a6a7a', '#5a6a7a'],
    ['transparent', '#5a6a7a', '#5a6a7a', '#5a6a7a', '#5a6a7a', '#5a6a7a', 'transparent'],
    ['transparent', '#5a6a7a', 'transparent', 'transparent', 'transparent', '#5a6a7a', 'transparent']
  ],
  angry: [
    ['transparent', 'transparent', '#8a3a3a', '#8a3a3a', '#8a3a3a', 'transparent', 'transparent'],
    ['transparent', '#8a3a3a', '#fff', '#000', '#fff', '#8a3a3a', 'transparent'],
    ['#8a3a3a', '#8a3a3a', '#8a3a3a', '#8a3a3a', '#8a3a3a', '#8a3a3a', '#8a3a3a'],
    ['#8a3a3a', '#8a3a3a', '#5a2a2a', '#5a2a2a', '#5a2a2a', '#8a3a3a', '#8a3a3a'],
    ['transparent', '#8a3a3a', '#8a3a3a', '#8a3a3a', '#8a3a3a', '#8a3a3a', 'transparent'],
    ['transparent', '#8a3a3a', 'transparent', 'transparent', 'transparent', '#8a3a3a', 'transparent']
  ],
  sick: [
    ['transparent', 'transparent', '#7a8a8a', '#7a8a8a', '#7a8a8a', 'transparent', 'transparent'],
    ['transparent', '#7a8a8a', '#fff', '#000', '#fff', '#7a8a8a', 'transparent'],
    ['#7a8a8a', '#7a8a8a', '#7a8a8a', '#7a8a8a', '#7a8a8a', '#7a8a8a', '#7a8a8a'],
    ['#7a8a8a', '#7a8a8a', '#5a6a6a', '#5a6a6a', '#5a6a6a', '#7a8a8a', '#7a8a8a'],
    ['transparent', '#7a8a8a', '#7a8a8a', '#7a8a8a', '#7a8a8a', '#7a8a8a', 'transparent'],
    ['transparent', '#7a8a8a', 'transparent', 'transparent', 'transparent', '#7a8a8a', 'transparent']
  ],
  sleepy: [
    ['transparent', 'transparent', '#6a5a8a', '#6a5a8a', '#6a5a8a', 'transparent', 'transparent'],
    ['transparent', '#6a5a8a', '#fff', '#fff', '#fff', '#6a5a8a', 'transparent'],
    ['#6a5a8a', '#6a5a8a', '#6a5a8a', '#6a5a8a', '#6a5a8a', '#6a5a8a', '#6a5a8a'],
    ['#6a5a8a', '#6a5a8a', '#4a3a6a', '#4a3a6a', '#4a3a6a', '#6a5a8a', '#6a5a8a'],
    ['transparent', '#6a5a8a', '#6a5a8a', '#6a5a8a', '#6a5a8a', '#6a5a8a', 'transparent'],
    ['transparent', '#6a5a8a', 'transparent', 'transparent', 'transparent', '#6a5a8a', 'transparent']
  ],
  hungry: [
    ['transparent', 'transparent', '#8a7a3a', '#8a7a3a', '#8a7a3a', 'transparent', 'transparent'],
    ['transparent', '#8a7a3a', '#fff', '#000', '#fff', '#8a7a3a', 'transparent'],
    ['#8a7a3a', '#8a7a3a', '#8a7a3a', '#8a7a3a', '#8a7a3a', '#8a7a3a', '#8a7a3a'],
    ['#8a7a3a', '#8a7a3a', '#5a4a2a', '#5a4a2a', '#5a4a2a', '#8a7a3a', '#8a7a3a'],
    ['transparent', '#8a7a3a', '#8a7a3a', '#8a7a3a', '#8a7a3a', '#8a7a3a', 'transparent'],
    ['transparent', '#8a7a3a', 'transparent', 'transparent', 'transparent', '#8a7a3a', 'transparent']
  ],
};

// Animation frames for different actions
const ANIMATION_FRAMES: Record<string, string[][][]> = {
  eat: [
    [
      ['transparent', 'transparent', '#4a7c59', '#4a7c59', '#4a7c59', 'transparent', 'transparent'],
      ['transparent', '#4a7c59', '#fff', '#000', '#fff', '#4a7c59', 'transparent'],
      ['#4a7c59', '#4a7c59', '#ff6b6b', '#4a7c59', '#ff6b6b', '#4a7c59', '#4a7c59'],
      ['#4a7c59', '#4a7c59', '#2d5238', '#2d5238', '#2d5238', '#4a7c59', '#4a7c59'],
      ['transparent', '#4a7c59', '#4a7c59', '#4a7c59', '#4a7c59', '#4a7c59', 'transparent'],
      ['transparent', '#4a7c59', 'transparent', 'transparent', 'transparent', '#4a7c59', 'transparent']
    ],
    [
      ['transparent', 'transparent', '#4a7c59', '#4a7c59', '#4a7c59', 'transparent', 'transparent'],
      ['transparent', '#4a7c59', '#fff', '#000', '#fff', '#4a7c59', 'transparent'],
      ['#4a7c59', '#4a7c59', '#4a7c59', '#4a7c59', '#4a7c59', '#4a7c59', '#4a7c59'],
      ['#4a7c59', '#4a7c59', '#2d5238', '#2d5238', '#2d5238', '#4a7c59', '#4a7c59'],
      ['transparent', '#4a7c59', '#4a7c59', '#4a7c59', '#4a7c59', '#4a7c59', 'transparent'],
      ['transparent', '#4a7c59', 'transparent', 'transparent', 'transparent', '#4a7c59', 'transparent']
    ],
  ],
  sleep: [
    [
      ['transparent', 'transparent', '#6a5a8a', '#6a5a8a', '#6a5a8a', 'transparent', 'transparent'],
      ['transparent', '#6a5a8a', '#fff', '#fff', '#fff', '#6a5a8a', 'transparent'],
      ['#6a5a8a', '#6a5a8a', '#6a5a8a', '#6a5a8a', '#6a5a8a', '#6a5a8a', '#6a5a8a'],
      ['#6a5a8a', '#6a5a8a', '#4a3a6a', '#4a3a6a', '#4a3a6a', '#6a5a8a', '#6a5a8a'],
      ['transparent', '#6a5a8a', '#6a5a8a', '#6a5a8a', '#6a5a8a', '#6a5a8a', 'transparent'],
      ['transparent', '#6a5a8a', 'transparent', 'transparent', 'transparent', '#6a5a8a', 'transparent']
    ],
  ],
  happy: [
    [
      ['transparent', 'transparent', '#2d5a87', '#2d5a87', '#2d5a87', 'transparent', 'transparent'],
      ['transparent', '#2d5a87', '#fff', '#000', '#fff', '#2d5a87', 'transparent'],
      ['#2d5a87', '#2d5a87', '#2d5a87', '#2d5a87', '#2d5a87', '#2d5a87', '#2d5a87'],
      ['#2d5a87', '#2d5a87', '#1a3a52', '#1a3a52', '#1a3a52', '#2d5a87', '#2d5a87'],
      ['transparent', '#2d5a87', 'transparent', '#2d5a87', 'transparent', '#2d5a87', 'transparent'],
      ['transparent', '#2d5a87', 'transparent', 'transparent', 'transparent', '#2d5a87', 'transparent']
    ],
    [
      ['transparent', 'transparent', '#2d5a87', '#2d5a87', '#2d5a87', 'transparent', 'transparent'],
      ['transparent', '#2d5a87', '#fff', '#000', '#fff', '#2d5a87', 'transparent'],
      ['#2d5a87', '#2d5a87', '#2d5a87', '#2d5a87', '#2d5a87', '#2d5a87', '#2d5a87'],
      ['#2d5a87', '#2d5a87', '#1a3a52', '#1a3a52', '#1a3a52', '#2d5a87', '#2d5a87'],
      ['transparent', '#2d5a87', '#2d5a87', 'transparent', '#2d5a87', '#2d5a87', 'transparent'],
      ['transparent', '#2d5a87', 'transparent', 'transparent', 'transparent', '#2d5a87', 'transparent']
    ],
  ],
};

const SIZE_MULTIPLIERS = { small: 3, medium: 4, large: 6 };

export const PixelPet: React.FC<PixelPetProps> = ({ pet, animation, onPet, size = 'medium' }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const pixelSize = SIZE_MULTIPLIERS[size];

  // Get current pixel data - always use adult male
  const getPixelData = useCallback(() => {
    if (animation && ANIMATION_FRAMES[animation]) {
      const frames = ANIMATION_FRAMES[animation];
      return frames[currentFrame % frames.length];
    }
    return ADULT_MALE_PIXELS[pet.mood];
  }, [pet.mood, animation, currentFrame]);

  // Animation loop
  useEffect(() => {
    if (!animation) {
      setCurrentFrame(0);
      return;
    }

    setIsAnimating(true);
    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        const frames = ANIMATION_FRAMES[animation];
        if (frames && prev >= frames.length - 1) {
          setIsAnimating(false);
          return 0;
        }
        return prev + 1;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [animation]);

  // Idle animation
  useEffect(() => {
    if (isAnimating) return;
    
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 2);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const pixels = getPixelData();

  return (
    <div 
      className="relative cursor-pointer select-none touch-manipulation"
      onClick={onPet}
      style={{
        width: pixels[0].length * pixelSize,
        height: pixels.length * pixelSize,
      }}
    >
      {/* Pixel grid */}
      {pixels.map((row, y) => (
        row.map((color, x) => (
          color !== 'transparent' && (
            <div
              key={`${x}-${y}`}
              className="absolute"
              style={{
                left: x * pixelSize,
                top: y * pixelSize,
                width: pixelSize,
                height: pixelSize,
                backgroundColor: color,
                imageRendering: 'pixelated',
              }}
            />
          )
        ))
      ))}
      
      {/* Sleep bubbles */}
      {pet.isSleeping && (
        <div className="absolute -top-4 right-0 animate-float">
          <span className="text-white text-xs opacity-70">Zzz...</span>
        </div>
      )}
      
      {/* Sick indicator */}
      {pet.isSick && !pet.isSleeping && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 animate-bounce-soft">
          <span className="text-red-400 text-xs">🤒</span>
        </div>
      )}
      
      {/* Hunger indicator */}
      {pet.hunger < 30 && !pet.isSleeping && !pet.isSick && (
        <div className="absolute -top-2 right-0 animate-bounce-soft">
          <span className="text-yellow-400 text-xs">🍖</span>
        </div>
      )}
      
      {/* Talking indicator */}
      {!pet.isSleeping && !pet.isSick && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <span className="text-blue-400 text-[10px]">💬</span>
        </div>
      )}
    </div>
  );
};

export default PixelPet;
