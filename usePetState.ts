import { useState, useEffect, useCallback, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { 
  PetState, 
  PetStats, 
  PetMood, 
  Interaction, 
  Memory, 
  GameState, 
  CustomItem,
  LearnedWord,
  WordCategory,
  ConversationEntry 
} from '@/types/pet';

const DEFAULT_PET: PetState = {
  id: `pet_${Date.now()}`,
  name: 'Rex',
  birthDate: Date.now(),
  hunger: 80,
  happiness: 70,
  health: 90,
  energy: 85,
  hygiene: 90,
  lastFed: Date.now(),
  lastPlayed: Date.now(),
  lastSlept: Date.now(),
  lastCleaned: Date.now(),
  isSleeping: false,
  isSick: false,
  stage: 'adult',
  mood: 'content',
  gender: 'male',
};

const DEFAULT_MEMORY: Memory = {
  interactions: [],
  favoriteFoods: [],
  favoriteGames: [],
  userPreferences: {
    preferredName: '',
    interactionFrequency: 'medium',
    playStyle: 'gentle',
    customSettings: {},
  },
  learnedPhrases: [],
  personalityTraits: [],
  vocabulary: {
    words: [],
    totalWordsLearned: 0,
    favoriteWords: [],
    userName: undefined,
  },
  conversationHistory: [],
};

const DEFAULT_GAME_STATE: GameState = {
  pet: DEFAULT_PET,
  memory: DEFAULT_MEMORY,
  inventory: [],
  unlockedItems: [],
  achievements: [],
  gameStats: {
    totalInteractions: 0,
    daysActive: 0,
    itemsCollected: 0,
    miniGameHighScores: {},
    lastSave: Date.now(),
    wordsLearned: 0,
    conversationsHad: 0,
  },
};

const STORAGE_KEY = 'pixelpet_game_state';

// Word categories for classification
const GREETING_WORDS = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'yo', 'sup', 'greetings'];
const FOOD_WORDS = ['food', 'eat', 'hungry', 'meal', 'snack', 'treat', 'yummy', 'delicious', 'tasty'];
const PRAISE_WORDS = ['good', 'great', 'awesome', 'amazing', 'wonderful', 'excellent', 'perfect', 'love', 'like', 'best'];
const SCOLDING_WORDS = ['bad', 'wrong', 'no', 'stop', 'dont', 'never', 'hate', 'stupid', 'dumb'];
const QUESTION_WORDS = ['what', 'why', 'how', 'when', 'where', 'who', 'which'];
const EMOTION_WORDS = ['happy', 'sad', 'angry', 'excited', 'tired', 'bored', 'scared', 'worried'];
const ACTION_WORDS = ['play', 'feed', 'pet', 'clean', 'sleep', 'wake', 'go', 'come', 'run', 'walk'];

// Classify a word into a category
const classifyWord = (word: string): WordCategory => {
  const lower = word.toLowerCase();
  if (GREETING_WORDS.some(w => lower.includes(w))) return 'greeting';
  if (FOOD_WORDS.some(w => lower.includes(w))) return 'food';
  if (PRAISE_WORDS.some(w => lower.includes(w))) return 'praise';
  if (SCOLDING_WORDS.some(w => lower.includes(w))) return 'scolding';
  if (QUESTION_WORDS.some(w => lower.startsWith(w))) return 'question';
  if (EMOTION_WORDS.some(w => lower.includes(w))) return 'emotion';
  if (ACTION_WORDS.some(w => lower.includes(w))) return 'action';
  return 'other';
};

// Determine sentiment of a word
const getSentiment = (word: string): 'positive' | 'neutral' | 'negative' => {
  const lower = word.toLowerCase();
  if (PRAISE_WORDS.some(w => lower.includes(w))) return 'positive';
  if (SCOLDING_WORDS.some(w => lower.includes(w))) return 'negative';
  if (EMOTION_WORDS.some(w => lower.includes(w))) {
    const positiveEmotions = ['happy', 'excited', 'joy', 'love'];
    const negativeEmotions = ['sad', 'angry', 'scared', 'worried'];
    if (positiveEmotions.some(e => lower.includes(e))) return 'positive';
    if (negativeEmotions.some(e => lower.includes(e))) return 'negative';
  }
  return 'neutral';
};

// Calculate mood based on stats
const calculateMood = (pet: PetState): PetMood => {
  if (pet.isSick) return 'sick';
  if (pet.isSleeping) return 'sleepy';
  if (pet.hunger < 20) return 'hungry';
  if (pet.happiness > 80 && pet.health > 70) return 'ecstatic';
  if (pet.happiness > 60 && pet.health > 50) return 'happy';
  if (pet.happiness > 40) return 'content';
  if (pet.happiness > 20) return 'neutral';
  if (pet.happiness > 10) return 'sad';
  return 'angry';
};

// Decay stats over time
const decayStats = (pet: PetState): PetStats => {
  const now = Date.now();
  const hoursSinceLastFed = (now - pet.lastFed) / (1000 * 60 * 60);
  const hoursSinceLastPlayed = (now - pet.lastPlayed) / (1000 * 60 * 60);
  const hoursSinceLastSlept = (now - pet.lastSlept) / (1000 * 60 * 60);
  const hoursSinceLastCleaned = (now - pet.lastCleaned) / (1000 * 60 * 60);

  let hunger = Math.max(0, pet.hunger - hoursSinceLastFed * 3);
  let happiness = Math.max(0, pet.happiness - hoursSinceLastPlayed * 2);
  let energy = pet.isSleeping 
    ? Math.min(100, pet.energy + 10) 
    : Math.max(0, pet.energy - hoursSinceLastSlept * 2);
  let hygiene = Math.max(0, pet.hygiene - hoursSinceLastCleaned * 1.5);
  
  // Health affected by other stats
  let health = pet.health;
  if (hunger < 20 || hygiene < 20) {
    health = Math.max(0, health - 2);
  }
  if (happiness > 70 && hunger > 50) {
    health = Math.min(100, health + 1);
  }

  return { hunger, happiness, health, energy, hygiene };
};

export function usePetState() {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastInteraction, setLastInteraction] = useState<number>(Date.now());
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load game state from storage
  useEffect(() => {
    const loadGame = async () => {
      try {
        const { value } = await Preferences.get({ key: STORAGE_KEY });
        if (value) {
          const parsed = JSON.parse(value);
          // Ensure pet is always adult male
          const pet = {
            ...parsed.pet,
            stage: 'adult' as const,
            gender: 'male' as const,
          };
          // Apply stat decay based on time since last save
          const decayedStats = decayStats(pet);
          setGameState({
            ...parsed,
            pet: {
              ...pet,
              ...decayedStats,
              mood: calculateMood({ ...pet, ...decayedStats }),
            },
          });
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
      }
      setIsLoaded(true);
    };
    loadGame();
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (!isLoaded) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await Preferences.set({
          key: STORAGE_KEY,
          value: JSON.stringify(gameState),
        });
      } catch (error) {
        console.error('Failed to save game state:', error);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [gameState, isLoaded]);

  // Stat decay timer
  useEffect(() => {
    if (!isLoaded) return;
    
    const interval = setInterval(() => {
      setGameState(prev => {
        const decayedStats = decayStats(prev.pet);
        return {
          ...prev,
          pet: {
            ...prev.pet,
            ...decayedStats,
            mood: calculateMood({ ...prev.pet, ...decayedStats }),
          },
        };
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isLoaded]);

  const addInteraction = useCallback((type: Interaction['type'], value?: number, note?: string) => {
    const interaction: Interaction = {
      id: `int_${Date.now()}`,
      type,
      timestamp: Date.now(),
      value,
      note,
    };

    setGameState(prev => ({
      ...prev,
      memory: {
        ...prev.memory,
        interactions: [...prev.memory.interactions.slice(-99), interaction],
      },
      gameStats: {
        ...prev.gameStats,
        totalInteractions: prev.gameStats.totalInteractions + 1,
      },
    }));
    setLastInteraction(Date.now());
  }, []);

  // Learn words from user speech
  const learnWords = useCallback((text: string, context: string = 'conversation'): string[] => {
    const words = text.toLowerCase()
      .replace(/[^\w\s']/g, '')
      .split(/\s+/)
      .filter(w => w.length > 1);

    const learnedWords: string[] = [];

    setGameState(prev => {
      const existingWords = new Set(prev.memory.vocabulary.words.map(w => w.word));
      const newWords: LearnedWord[] = [];

      words.forEach(word => {
        if (!existingWords.has(word)) {
          const category = classifyWord(word);
          const sentiment = getSentiment(word);
          newWords.push({
            word,
            learnedAt: Date.now(),
            usageCount: 1,
            context: [context],
            sentiment,
            category,
          });
          learnedWords.push(word);
        } else {
          // Update existing word usage
          const existing = prev.memory.vocabulary.words.find(w => w.word === word);
          if (existing) {
            existing.usageCount++;
            if (!existing.context.includes(context)) {
              existing.context.push(context);
            }
          }
        }
      });

      // Update favorite words (most used)
      const allWords = [...prev.memory.vocabulary.words, ...newWords];
      const favoriteWords = allWords
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10)
        .map(w => w.word);

      return {
        ...prev,
        memory: {
          ...prev.memory,
          vocabulary: {
            words: allWords,
            totalWordsLearned: prev.memory.vocabulary.totalWordsLearned + newWords.length,
            favoriteWords,
            userName: prev.memory.vocabulary.userName,
          },
        },
        gameStats: {
          ...prev.gameStats,
          wordsLearned: prev.gameStats.wordsLearned + newWords.length,
        },
      };
    });

    return learnedWords;
  }, []);

  // Add conversation entry
  const addConversation = useCallback((speaker: 'user' | 'pet', message: string) => {
    const words = message.toLowerCase().match(/\b\w+\b/g) || [];
    
    const entry: ConversationEntry = {
      id: `conv_${Date.now()}`,
      speaker,
      message,
      timestamp: Date.now(),
      wordsUsed: words,
    };

    setGameState(prev => ({
      ...prev,
      memory: {
        ...prev.memory,
        conversationHistory: [...prev.memory.conversationHistory.slice(-49), entry],
      },
      gameStats: {
        ...prev.gameStats,
        conversationsHad: prev.gameStats.conversationsHad + 1,
      },
    }));
  }, []);

  // Set user's preferred name
  const setUserName = useCallback((name: string) => {
    setGameState(prev => ({
      ...prev,
      memory: {
        ...prev.memory,
        vocabulary: {
          ...prev.memory.vocabulary,
          userName: name,
        },
      },
    }));
  }, []);

  // Get learned words by category
  const getWordsByCategory = useCallback((category: WordCategory): LearnedWord[] => {
    return gameState.memory.vocabulary.words.filter(w => w.category === category);
  }, [gameState.memory.vocabulary.words]);

  // Get words by sentiment
  const getWordsBySentiment = useCallback((sentiment: 'positive' | 'neutral' | 'negative'): LearnedWord[] => {
    return gameState.memory.vocabulary.words.filter(w => w.sentiment === sentiment);
  }, [gameState.memory.vocabulary.words]);

  const feed = useCallback((foodValue: number = 25, foodName?: string) => {
    setGameState(prev => ({
      ...prev,
      pet: {
        ...prev.pet,
        hunger: Math.min(100, prev.pet.hunger + foodValue),
        health: Math.min(100, prev.pet.health + 2),
        lastFed: Date.now(),
      },
    }));
    addInteraction('feed', foodValue, foodName);
    
    if (foodName) {
      setGameState(prev => ({
        ...prev,
        memory: {
          ...prev.memory,
          favoriteFoods: [...new Set([...prev.memory.favoriteFoods, foodName])].slice(-10),
        },
      }));
    }
  }, [addInteraction]);

  const play = useCallback((playValue: number = 20, gameName?: string) => {
    setGameState(prev => ({
      ...prev,
      pet: {
        ...prev.pet,
        happiness: Math.min(100, prev.pet.happiness + playValue),
        energy: Math.max(0, prev.pet.energy - 10),
        lastPlayed: Date.now(),
      },
    }));
    addInteraction('play', playValue, gameName);
    
    if (gameName) {
      setGameState(prev => ({
        ...prev,
        memory: {
          ...prev.memory,
          favoriteGames: [...new Set([...prev.memory.favoriteGames, gameName])].slice(-10),
        },
      }));
    }
  }, [addInteraction]);

  const petAnimal = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      pet: {
        ...prev.pet,
        happiness: Math.min(100, prev.pet.happiness + 8),
        health: Math.min(100, prev.pet.health + 1),
      },
    }));
    addInteraction('pet');
  }, [addInteraction]);

  const clean = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      pet: {
        ...prev.pet,
        hygiene: 100,
        happiness: Math.min(100, prev.pet.happiness + 5),
        lastCleaned: Date.now(),
      },
    }));
    addInteraction('clean');
  }, [addInteraction]);

  const toggleSleep = useCallback(() => {
    setGameState(prev => {
      const isSleeping = !prev.pet.isSleeping;
      addInteraction(isSleeping ? 'sleep' : 'wake');
      return {
        ...prev,
        pet: {
          ...prev.pet,
          isSleeping,
          lastSlept: Date.now(),
        },
      };
    });
  }, [addInteraction]);

  const giveMedicine = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      pet: {
        ...prev.pet,
        health: Math.min(100, prev.pet.health + 30),
        isSick: false,
      },
    }));
    addInteraction('medicine');
  }, [addInteraction]);

  const rename = useCallback((newName: string) => {
    setGameState(prev => ({
      ...prev,
      pet: {
        ...prev.pet,
        name: newName.slice(0, 12),
      },
    }));
  }, []);

  const addCustomItem = useCallback((item: CustomItem) => {
    setGameState(prev => ({
      ...prev,
      inventory: [...prev.inventory, item],
      unlockedItems: [...new Set([...prev.unlockedItems, item.id])],
      gameStats: {
        ...prev.gameStats,
        itemsCollected: prev.gameStats.itemsCollected + 1,
      },
    }));
  }, []);

  const useCustomItem = useCallback((itemId: string) => {
    setGameState(prev => {
      const item = prev.inventory.find(i => i.id === itemId);
      if (!item) return prev;

      const updates: Partial<PetStats> = {};
      if (item.effect.hunger) updates.hunger = Math.min(100, Math.max(0, prev.pet.hunger + item.effect.hunger));
      if (item.effect.happiness) updates.happiness = Math.min(100, Math.max(0, prev.pet.happiness + item.effect.happiness));
      if (item.effect.health) updates.health = Math.min(100, Math.max(0, prev.pet.health + item.effect.health));
      if (item.effect.energy) updates.energy = Math.min(100, Math.max(0, prev.pet.energy + item.effect.energy));

      return {
        ...prev,
        pet: { ...prev.pet, ...updates },
        inventory: prev.inventory.map(i => 
          i.id === itemId ? { ...i, useCount: i.useCount + 1 } : i
        ),
      };
    });
    addInteraction('custom', undefined, itemId);
  }, [addInteraction]);

  const exportSaveData = useCallback(async (): Promise<string> => {
    return JSON.stringify(gameState);
  }, [gameState]);

  const importSaveData = useCallback(async (data: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.pet && parsed.memory) {
        // Ensure adult male
        parsed.pet.stage = 'adult';
        parsed.pet.gender = 'male';
        setGameState(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const resetGame = useCallback(async () => {
    setGameState(DEFAULT_GAME_STATE);
    await Preferences.remove({ key: STORAGE_KEY });
  }, []);

  return {
    pet: gameState.pet,
    memory: gameState.memory,
    inventory: gameState.inventory,
    gameStats: gameState.gameStats,
    isLoaded,
    lastInteraction,
    feed,
    play,
    petAnimal,
    clean,
    toggleSleep,
    giveMedicine,
    rename,
    addCustomItem,
    useCustomItem,
    exportSaveData,
    importSaveData,
    resetGame,
    addInteraction,
    learnWords,
    addConversation,
    setUserName,
    getWordsByCategory,
    getWordsBySentiment,
  };
}
