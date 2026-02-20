import { useCallback } from 'react';
import type { PetState, PetMood, Memory, AIResponse, Interaction } from '@/types/pet';

// AI-driven responses based on pet state and memory
const GREETINGS: Record<PetMood, string[]> = {
  ecstatic: [
    "Yay! You're here! I've been waiting!",
    "Best day ever! You're back!",
    "I'm so happy to see you!",
    "*happy dance* You're here!",
  ],
  happy: [
    "Hi there! Nice to see you!",
    "Welcome back!",
    "Hey! I missed you!",
    "Good to see you again!",
  ],
  content: [
    "Hello! How are you?",
    "Hi! What's up?",
    "Nice to see you.",
    "Welcome back!",
  ],
  neutral: [
    "Oh, hi.",
    "Hey.",
    "You're back.",
    "Hello.",
  ],
  sad: [
    "I was lonely...",
    "*sniff* You came back...",
    "I missed you a lot...",
    "Don't leave me again...",
  ],
  angry: [
    "Where were you?!",
    "You left me alone!",
    "Hmph! About time!",
    "I'm upset with you!",
  ],
  sick: [
    "I don't feel good...",
    "*cough* Help me...",
    "I need medicine...",
    "Please... I feel sick...",
  ],
  sleepy: [
    "*yawn* Hi...",
    "So... tired...",
    "Can I sleep more?",
    "*sleepy blink*",
  ],
  hungry: [
    "I'm starving!",
    "Food... please...",
    "My tummy hurts...",
    "I need to eat!",
  ],
};

const FEED_RESPONSES: Record<PetMood, string[]> = {
  ecstatic: [
    "Yummy! My favorite!",
    "Delicious! Thank you!",
    "Best food ever!",
    "*happy munching*",
  ],
  happy: [
    "Tasty!",
    "Thanks for the food!",
    "Yum!",
    "That was good!",
  ],
  content: [
    "Thanks.",
    "That hit the spot.",
    "Good food.",
    "I'm full now.",
  ],
  neutral: [
    "Food. Thanks.",
    "I ate it.",
    "Okay.",
    "Thanks.",
  ],
  sad: [
    "I guess I'll eat...",
    "Food won't fix my sadness...",
    "Thanks, I guess...",
    "*eats quietly*",
  ],
  angry: [
    "About time you fed me!",
    "This better be good!",
    "Hmph! *eats*",
    "I was starving!",
  ],
  sick: [
    "I can't eat much...",
    "*weak chewing*",
    "My stomach hurts...",
    "Thanks... I think...",
  ],
  sleepy: [
    "*sleepy eating*",
    "Too tired to chew...",
    "*yawns while eating*",
    "Food... then sleep...",
  ],
  hungry: [
    "FINALLY! Food!",
    "SO HUNGRY!",
    "*devours quickly*",
    "More! Please!",
  ],
};

const PLAY_RESPONSES: Record<PetMood, string[]> = {
  ecstatic: [
    "This is so fun!",
    "I love playing with you!",
    "Again! Again!",
    "Best playtime ever!",
  ],
  happy: [
    "Fun!",
    "I enjoy this!",
    "Let's play more!",
    "This is great!",
  ],
  content: [
    "This is nice.",
    "I like this game.",
    "Not bad.",
    "Okay, I'll play.",
  ],
  neutral: [
    "Sure, I'll play.",
    "Okay.",
    "This is fine.",
    "*plays half-heartedly*",
  ],
  sad: [
    "I don't feel like playing...",
    "*plays quietly*",
    "This won't make me happy...",
    "I guess I'll try...",
  ],
  angry: [
    "Fine! I'll play!",
    "This better be fun!",
    "*grumpy playing*",
    "I'm still mad!",
  ],
  sick: [
    "I'm too weak to play...",
    "*tries but gets tired*",
    "Maybe later...",
    "I can't right now...",
  ],
  sleepy: [
    "*yawns* Can we play later?",
    "I'm too sleepy...",
    "*falls asleep mid-game*",
    "Zzz... what?",
  ],
  hungry: [
    "I'm too hungry to play...",
    "Can I eat first?",
    "*distracted by hunger*",
    "Food... then play...",
  ],
};

const PET_RESPONSES: Record<PetMood, string[]> = {
  ecstatic: [
    "*purrs happily*",
    "I love you!",
    "*melts with joy*",
    "You're the best!",
  ],
  happy: [
    "*happy noises*",
    "That feels nice!",
    "*content sigh*",
    "I like that!",
  ],
  content: [
    "*relaxed*",
    "That's nice.",
    "Mmm...",
    "*closes eyes happily*",
  ],
  neutral: [
    "*acknowledges*",
    "Okay.",
    "That's fine.",
    "*slight nod*",
  ],
  sad: [
    "*sniff* Thanks...",
    "That helps a little...",
    "*small smile*",
    "I needed that...",
  ],
  angry: [
    "*grumbles*",
    "Don't touch me!",
    "I'm still mad!",
    "...fine.",
  ],
  sick: [
    "*weak smile*",
    "That helps...",
    "*cough* Thanks...",
    "I feel a bit better...",
  ],
  sleepy: [
    "*sleepy purr*",
    "Zzz... oh...",
    "*snores softly*",
    "So... sleepy...",
  ],
  hungry: [
    "*stomach growls*",
    "Petting won't fix hunger...",
    "Food... please...",
    "*weak appreciation*",
  ],
};

const RANDOM_THOUGHTS: Record<PetMood, string[]> = {
  ecstatic: [
    "Life is perfect!",
    "I have the best owner!",
    "Everything is wonderful!",
    "I'm so lucky!",
  ],
  happy: [
    "Today is a good day!",
    "I feel great!",
    "Things are going well!",
    "I'm in a good mood!",
  ],
  content: [
    "Things are okay.",
    "I'm doing fine.",
    "Nothing special, but good.",
    "Just chilling.",
  ],
  neutral: [
    "Hmm...",
    "*thinking*",
    "Just existing.",
    "Not much to say.",
  ],
  sad: [
    "I feel empty...",
    "What's the point...",
    "I miss being happy...",
    "*sigh*",
  ],
  angry: [
    "Everything annoys me!",
    "Why is life so unfair!",
    "I'm so frustrated!",
    "Grrr!",
  ],
  sick: [
    "Everything hurts...",
    "I need rest...",
    "Please get better...",
    "*weak whimper*",
  ],
  sleepy: [
    "So... tired...",
    "Need... sleep...",
    "*heavy eyelids*",
    "Bed... calling...",
  ],
  hungry: [
    "Food... on my mind...",
    "Stomach... empty...",
    "When's dinner?",
    "*dreams of food*",
  ],
};

// Get random item from array
const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Analyze interaction patterns
const analyzePatterns = (interactions: Interaction[]) => {
  const recent = interactions.slice(-20);
  const feedCount = recent.filter(i => i.type === 'feed').length;
  const playCount = recent.filter(i => i.type === 'play').length;
  const petCount = recent.filter(i => i.type === 'pet').length;
  const talkCount = recent.filter(i => i.type === 'talk').length;
  
  return { feedCount, playCount, petCount, talkCount };
};

// Calculate relationship score
const calculateRelationship = (pet: PetState, memory: Memory): number => {
  let score = 50; // Base score
  
  // Stats contribution
  score += (pet.happiness - 50) * 0.3;
  score += (pet.health - 50) * 0.2;
  score += (pet.hunger - 50) * 0.1;
  
  // Interaction frequency
  const patterns = analyzePatterns(memory.interactions);
  score += patterns.petCount * 2;
  score += patterns.playCount * 1.5;
  score += patterns.talkCount * 1;
  score -= Math.max(0, 10 - patterns.feedCount) * 3;
  
  // Time since last interaction
  const lastInteraction = memory.interactions[memory.interactions.length - 1];
  if (lastInteraction) {
    const hoursSince = (Date.now() - lastInteraction.timestamp) / (1000 * 60 * 60);
    score -= hoursSince * 2;
  }
  
  // Bonus for learned words
  score += Math.min(10, memory.vocabulary.totalWordsLearned * 0.5);
  
  return Math.max(0, Math.min(100, score));
};

// Build a response using learned words
const buildResponseWithLearnedWords = (
  baseResponse: string,
  vocabulary: Memory['vocabulary'],
  mood: PetMood,
  context?: string
): string => {
  const { words, favoriteWords, userName } = vocabulary;
  
  if (words.length === 0) return baseResponse;
  
  let response = baseResponse;
  const insertions: string[] = [];
  
  // Use user's name if learned
  if (userName && Math.random() < 0.4) {
    insertions.push(userName);
  }
  
  // Use favorite words
  if (favoriteWords.length > 0 && Math.random() < 0.3) {
    const favWord = favoriteWords[Math.floor(Math.random() * Math.min(3, favoriteWords.length))];
    insertions.push(favWord);
  }
  
  // Use context-appropriate words
  if (context) {
    const contextWords = words.filter(w => w.context.includes(context));
    if (contextWords.length > 0 && Math.random() < 0.3) {
      const word = random(contextWords).word;
      insertions.push(word);
    }
  }
  
  // Use mood-appropriate words
  const moodWords = words.filter(w => {
    if (mood === 'happy' || mood === 'ecstatic') return w.sentiment === 'positive';
    if (mood === 'sad' || mood === 'angry') return w.sentiment === 'negative';
    return w.sentiment === 'neutral';
  });
  
  if (moodWords.length > 0 && Math.random() < 0.25) {
    insertions.push(random(moodWords).word);
  }
  
  // Insert learned words into response
  if (insertions.length > 0) {
    const insertion = insertions[Math.floor(Math.random() * insertions.length)];
    
    // Smart insertion based on response structure
    if (response.includes('!') && Math.random() < 0.5) {
      response = response.replace('!', `, ${insertion}!`);
    } else if (response.includes('?') && Math.random() < 0.5) {
      response = response.replace('?', `, ${insertion}?`);
    } else if (response.length > 20) {
      response = `${response} ${insertion}!`;
    }
  }
  
  return response;
};

// Generate response based on learned words
const generateLearnedWordResponse = (vocabulary: Memory['vocabulary']): string | null => {
  const { words } = vocabulary;
  if (words.length === 0) return null;
  
  // Get recent words (learned in last 24 hours)
  const recentWords = words.filter(w => Date.now() - w.learnedAt < 24 * 60 * 60 * 1000);
  
  if (recentWords.length > 0) {
    const word = random(recentWords);
    const responses = [
      `I learned "${word.word}"! That's a ${word.sentiment} word!`,
      `"${word.word}"... I like that word!`,
      `You taught me "${word.word}"! Cool!`,
      `I'm getting smarter! I know "${word.word}" now!`,
    ];
    return random(responses);
  }
  
  // Reference frequently used words
  const frequentWords = words.filter(w => w.usageCount > 3);
  if (frequentWords.length > 0 && Math.random() < 0.3) {
    const word = random(frequentWords);
    const responses = [
      `You say "${word.word}" a lot!`,
      `"${word.word}" is one of my favorite words you taught me!`,
      `I noticed you use "${word.word}" often!`,
    ];
    return random(responses);
  }
  
  return null;
};

export function usePetAI() {

  const generateGreeting = useCallback((pet: PetState, memory: Memory): AIResponse => {
    const relationship = calculateRelationship(pet, memory);
    const timeSinceLastVisit = memory.interactions.length > 0
      ? (Date.now() - memory.interactions[memory.interactions.length - 1].timestamp) / (1000 * 60 * 60)
      : 0;
    
    // Check for learned word response first
    const learnedResponse = generateLearnedWordResponse(memory.vocabulary);
    if (learnedResponse && Math.random() < 0.3) {
      return { message: learnedResponse, mood: pet.mood };
    }

    let message: string;
    
    // Special greetings for long absences
    if (timeSinceLastVisit > 24) {
      message = `You were gone for so long! ${random(GREETINGS[pet.mood])}`;
    } else if (timeSinceLastVisit > 8) {
      message = `I missed you! ${random(GREETINGS[pet.mood])}`;
    } else if (relationship > 80) {
      message = random(GREETINGS.ecstatic);
    } else if (relationship > 50) {
      message = random(GREETINGS.happy);
    } else if (relationship < 20) {
      message = random(GREETINGS.angry);
    } else {
      message = random(GREETINGS[pet.mood]);
    }
    
    // Enhance with learned words
    message = buildResponseWithLearnedWords(message, memory.vocabulary, pet.mood, 'greeting');

    return { message, mood: pet.mood };
  }, []);

  const generateFeedResponse = useCallback((pet: PetState, memory: Memory, foodName?: string): AIResponse => {
    const baseResponse = random(FEED_RESPONSES[pet.mood]);
    let message = foodName 
      ? `${baseResponse} ${foodName} was ${pet.hunger > 80 ? 'amazing' : 'good'}!`
      : baseResponse;
    
    // Enhance with learned words
    message = buildResponseWithLearnedWords(message, memory.vocabulary, pet.mood, 'food');
    
    return { 
      message, 
      mood: pet.mood,
      animation: 'eat'
    };
  }, []);

  const generatePlayResponse = useCallback((pet: PetState, memory: Memory, gameName?: string): AIResponse => {
    const baseResponse = random(PLAY_RESPONSES[pet.mood]);
    let message = gameName
      ? `${baseResponse} ${gameName} is ${pet.happiness > 70 ? 'my favorite' : 'fun'}!`
      : baseResponse;
    
    // Enhance with learned words
    message = buildResponseWithLearnedWords(message, memory.vocabulary, pet.mood, 'play');
    
    return { 
      message, 
      mood: pet.mood,
      animation: 'play'
    };
  }, []);

  const generatePetResponse = useCallback((pet: PetState, memory: Memory): AIResponse => {
    let message = random(PET_RESPONSES[pet.mood]);
    
    // Enhance with learned words
    message = buildResponseWithLearnedWords(message, memory.vocabulary, pet.mood, 'pet');
    
    return { 
      message, 
      mood: pet.mood,
      animation: 'happy'
    };
  }, []);

  const generateRandomThought = useCallback((pet: PetState, memory: Memory): AIResponse => {
    const relationship = calculateRelationship(pet, memory);
    
    // Sometimes mention learned words
    if (memory.vocabulary.words.length > 5 && Math.random() < 0.3) {
      const learnedResponse = generateLearnedWordResponse(memory.vocabulary);
      if (learnedResponse) {
        return { message: learnedResponse, mood: pet.mood };
      }
    }
    
    // Sometimes reference memory
    if (memory.favoriteFoods.length > 0 && Math.random() < 0.3) {
      let message = `I could really go for some ${random(memory.favoriteFoods)} right now...`;
      message = buildResponseWithLearnedWords(message, memory.vocabulary, pet.mood, 'food');
      return { message, mood: pet.mood };
    }
    
    if (memory.favoriteGames.length > 0 && Math.random() < 0.3) {
      let message = `Remember when we played ${random(memory.favoriteGames)}? That was fun!`;
      message = buildResponseWithLearnedWords(message, memory.vocabulary, pet.mood, 'play');
      return { message, mood: pet.mood };
    }
    
    // Reference relationship
    if (relationship > 80 && Math.random() < 0.2) {
      let message = "You're the best friend I could ask for!";
      message = buildResponseWithLearnedWords(message, memory.vocabulary, pet.mood);
      return { message, mood: 'ecstatic' };
    }
    
    let message = random(RANDOM_THOUGHTS[pet.mood]);
    message = buildResponseWithLearnedWords(message, memory.vocabulary, pet.mood);
    
    return { message, mood: pet.mood };
  }, []);

  const generateStatusComment = useCallback((pet: PetState, memory: Memory): AIResponse => {
    let message: string;
    
    if (pet.hunger < 20) {
      message = "I'm really hungry... please feed me...";
    } else if (pet.happiness < 20) {
      message = "I feel so lonely and sad...";
    } else if (pet.health < 30) {
      message = "I don't feel good at all... I need help...";
    } else if (pet.energy < 20) {
      message = "I'm exhausted... need sleep...";
    } else if (pet.hygiene < 20) {
      message = "I feel dirty... can you clean me?";
    } else if (pet.happiness > 80 && pet.health > 80) {
      message = "I feel amazing! Life is great!";
    } else {
      message = "I'm doing okay!";
    }
    
    // Enhance with learned words
    message = buildResponseWithLearnedWords(message, memory.vocabulary, pet.mood);
    
    return { message, mood: pet.mood };
  }, []);

  // Generate response to user's speech input
  const generateSpeechResponse = useCallback((
    userInput: string,
    learnedWords: string[],
    pet: PetState,
    memory: Memory
  ): AIResponse => {
    const lowerInput = userInput.toLowerCase();
    
    // Check for specific patterns in user input
    if (lowerInput.includes('name') && memory.vocabulary.userName) {
      return {
        message: `Your name is ${memory.vocabulary.userName}! I remember!`,
        mood: 'happy',
        learnedWords,
      };
    }
    
    if (lowerInput.includes('hungry') || lowerInput.includes('food') || lowerInput.includes('eat')) {
      const response = pet.hunger < 50 
        ? "Yes, I'm hungry! Can we eat?"
        : "I'm not hungry right now, but thanks for asking!";
      return {
        message: buildResponseWithLearnedWords(response, memory.vocabulary, pet.mood, 'food'),
        mood: pet.mood,
        learnedWords,
      };
    }
    
    if (lowerInput.includes('play') || lowerInput.includes('game')) {
      const response = pet.energy > 30
        ? "Yes! Let's play! That sounds fun!"
        : "I'm too tired to play right now... maybe later?";
      return {
        message: buildResponseWithLearnedWords(response, memory.vocabulary, pet.mood, 'play'),
        mood: pet.mood,
        learnedWords,
      };
    }
    
    if (lowerInput.includes('sleep') || lowerInput.includes('tired')) {
      const response = pet.energy < 40
        ? "Yes, I'm sleepy... time for bed?"
        : "I'm not tired yet! Let's do something!";
      return {
        message: buildResponseWithLearnedWords(response, memory.vocabulary, pet.mood),
        mood: pet.mood,
        learnedWords,
      };
    }
    
    if (lowerInput.includes('how are you') || lowerInput.includes('how do you feel')) {
      return {
        message: generateStatusComment(pet, memory).message,
        mood: pet.mood,
        learnedWords,
      };
    }
    
    // Check for learned words in input and acknowledge them
    if (learnedWords.length > 0 && Math.random() < 0.5) {
      const word = learnedWords[Math.floor(Math.random() * learnedWords.length)];
      const responses = [
        `I just learned "${word}"! Cool word!`,
        `"${word}"... I'll remember that!`,
        `Thanks for teaching me "${word}"!`,
        `I'm getting smarter! I learned "${word}"!`,
      ];
      return {
        message: random(responses),
        mood: 'happy',
        learnedWords,
      };
    }
    
    // Default response
    const defaultResponses = [
      "I understand! Tell me more!",
      "That's interesting!",
      "I'm listening!",
      "Cool! What else?",
      "I like talking with you!",
    ];
    
    let message = random(defaultResponses);
    message = buildResponseWithLearnedWords(message, memory.vocabulary, pet.mood);
    
    return {
      message,
      mood: pet.mood,
      learnedWords,
    };
  }, []);

  const learnFromInteraction = useCallback((type: string, context: string, _memory: Memory): string => {
    // Simulate learning by generating a "learned" phrase
    const learnings: Record<string, string[]> = {
      feed: [
        `I learned that ${context} is tasty!`,
        "I love eating!",
        "Food makes me happy!",
      ],
      play: [
        `Playing ${context} is so fun!`,
        "I love active games!",
        "Playtime is the best time!",
      ],
      pet: [
        "Your touch is comforting!",
        "I feel safe with you!",
        "Physical affection is nice!",
      ],
      talk: [
        "I like hearing your voice!",
        "Communication is important!",
        "You have interesting things to say!",
      ],
    };
    
    return random(learnings[type] || ["I'm learning so much!"]);
  }, []);

  return {
    generateGreeting,
    generateFeedResponse,
    generatePlayResponse,
    generatePetResponse,
    generateRandomThought,
    generateStatusComment,
    generateSpeechResponse,
    learnFromInteraction,
    calculateRelationship,
    analyzePatterns,
  };
}
