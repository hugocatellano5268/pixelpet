// Virtual Pet Types

export interface PetStats {
  hunger: number;      // 0-100, 0 = starving, 100 = full
  happiness: number;   // 0-100, 0 = depressed, 100 = ecstatic
  health: number;      // 0-100, 0 = sick, 100 = healthy
  energy: number;      // 0-100, 0 = exhausted, 100 = energetic
  hygiene: number;     // 0-100, 0 = filthy, 100 = clean
}

export interface PetState extends PetStats {
  id: string;
  name: string;
  birthDate: number;
  lastFed: number;
  lastPlayed: number;
  lastSlept: number;
  lastCleaned: number;
  isSleeping: boolean;
  isSick: boolean;
  stage: 'adult';  // Always adult male
  mood: PetMood;
  gender: 'male';
}

export type PetMood = 'ecstatic' | 'happy' | 'content' | 'neutral' | 'sad' | 'angry' | 'sick' | 'sleepy' | 'hungry';

export interface Interaction {
  id: string;
  type: InteractionType;
  timestamp: number;
  value?: number;
  note?: string;
}

export type InteractionType = 
  | 'feed' 
  | 'play' 
  | 'pet' 
  | 'clean' 
  | 'sleep' 
  | 'wake' 
  | 'medicine' 
  | 'talk' 
  | 'custom';

// Word learning system
export interface LearnedWord {
  word: string;
  learnedAt: number;
  usageCount: number;
  context: string[];  // Contexts where word was used
  sentiment: 'positive' | 'neutral' | 'negative';
  category: WordCategory;
}

export type WordCategory = 
  | 'greeting' 
  | 'food' 
  | 'emotion' 
  | 'action' 
  | 'name' 
  | 'praise' 
  | 'scolding' 
  | 'question' 
  | 'other';

export interface Vocabulary {
  words: LearnedWord[];
  totalWordsLearned: number;
  favoriteWords: string[];  // Most used words
  userName?: string;  // What the user calls themselves
}

export interface Memory {
  interactions: Interaction[];
  favoriteFoods: string[];
  favoriteGames: string[];
  userPreferences: UserPreferences;
  learnedPhrases: string[];
  personalityTraits: PersonalityTrait[];
  vocabulary: Vocabulary;
  conversationHistory: ConversationEntry[];
}

export interface ConversationEntry {
  id: string;
  speaker: 'user' | 'pet';
  message: string;
  timestamp: number;
  wordsUsed: string[];
}

export interface UserPreferences {
  preferredName: string;
  interactionFrequency: 'low' | 'medium' | 'high';
  playStyle: 'gentle' | 'active' | 'competitive';
  customSettings: Record<string, any>;
}

export interface PersonalityTrait {
  trait: string;
  value: number; // -1 to 1
  formed: number;
}

export interface CustomItem {
  id: string;
  name: string;
  type: 'food' | 'toy' | 'accessory' | 'background' | 'decoration';
  pixelData: string; // Base64 encoded pixel art
  color: string;
  effect: {
    hunger?: number;
    happiness?: number;
    health?: number;
    energy?: number;
  };
  unlocked: boolean;
  useCount: number;
}

export interface GameState {
  pet: PetState;
  memory: Memory;
  inventory: CustomItem[];
  unlockedItems: string[];
  achievements: Achievement[];
  gameStats: GameStats;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: number | null;
  icon: string;
  condition: AchievementCondition;
}

export type AchievementCondition = 
  | { type: 'daysAlive'; days: number }
  | { type: 'interactions'; count: number }
  | { type: 'stat'; stat: keyof PetStats; value: number }
  | { type: 'customItem'; count: number }
  | { type: 'perfectCare'; days: number };

export interface GameStats {
  totalInteractions: number;
  daysActive: number;
  itemsCollected: number;
  miniGameHighScores: Record<string, number>;
  lastSave: number;
  wordsLearned: number;
  conversationsHad: number;
}

export interface AIResponse {
  message: string;
  mood: PetMood;
  action?: InteractionType;
  animation?: string;
  learnedWords?: string[];
}

export interface MiniGame {
  id: string;
  name: string;
  description: string;
  highScore: number;
  unlocked: boolean;
}

// Pixel Art Types
export interface PixelFrame {
  width: number;
  height: number;
  pixels: string[]; // Array of color hex codes
}

export interface PetAnimation {
  idle: PixelFrame[];
  eat: PixelFrame[];
  sleep: PixelFrame[];
  play: PixelFrame[];
  happy: PixelFrame[];
  sad: PixelFrame[];
  sick: PixelFrame[];
}

// Speech recognition
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}
