import { useState, useEffect, useCallback } from 'react';
import { Package, Save, Sparkles, Heart, Info, MessageCircle } from 'lucide-react';
import { PixelPet } from '@/components/PixelPet';
import { StatBars } from '@/components/StatBars';
import { ActionButtons } from '@/components/ActionButtons';
import { SpeechBubble } from '@/components/SpeechBubble';
import { ItemImport } from '@/components/ItemImport';
import { Inventory } from '@/components/Inventory';
import { DataManager } from '@/components/DataManager';
import { TalkModal } from '@/components/TalkModal';
import { usePetState } from '@/hooks/usePetState';
import { usePetAI } from '@/hooks/usePetAI';
import type { AIResponse, CustomItem } from '@/types/pet';
import './App.css';

function App() {
  const {
    pet,
    memory,
    inventory,
    gameStats,
    isLoaded,
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
  } = usePetState();

  const {
    generateGreeting,
    generateFeedResponse,
    generatePlayResponse,
    generatePetResponse,
    generateRandomThought,
    generateSpeechResponse,
  } = usePetAI();

  const [speech, setSpeech] = useState<AIResponse | null>(null);
  const [currentAnimation, setCurrentAnimation] = useState<string | undefined>();
  const [showItemImport, setShowItemImport] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const [showTalkModal, setShowTalkModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(pet.name);
  const [lastLearnedWords, setLastLearnedWords] = useState<string[]>([]);

  // Generate greeting on load
  useEffect(() => {
    if (isLoaded) {
      const greeting = generateGreeting(pet, memory);
      setSpeech(greeting);
    }
  }, [isLoaded]);

  // Random thoughts
  useEffect(() => {
    if (!isLoaded || pet.isSleeping) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.3 && !speech) {
        const thought = generateRandomThought(pet, memory);
        setSpeech(thought);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoaded, pet, memory, speech, generateRandomThought]);

  const handleFeed = useCallback(() => {
    if (pet.isSleeping) return;
    feed(25, 'Regular Food');
    const response = generateFeedResponse(pet, memory);
    setSpeech(response);
    setCurrentAnimation('eat');
    setTimeout(() => setCurrentAnimation(undefined), 1000);
  }, [pet, feed, memory, generateFeedResponse]);

  const handlePlay = useCallback(() => {
    if (pet.isSleeping) return;
    play(20, 'Playtime');
    const response = generatePlayResponse(pet, memory);
    setSpeech(response);
    setCurrentAnimation('happy');
    setTimeout(() => setCurrentAnimation(undefined), 1000);
  }, [pet, play, memory, generatePlayResponse]);

  const handlePet = useCallback(() => {
    petAnimal();
    const response = generatePetResponse(pet, memory);
    setSpeech(response);
  }, [pet, memory, petAnimal, generatePetResponse]);

  const handleClean = useCallback(() => {
    if (pet.isSleeping) return;
    clean();
    setSpeech({ message: "Much better! I feel fresh and clean!", mood: 'happy' });
  }, [pet.isSleeping, clean]);

  const handleSleep = useCallback(() => {
    toggleSleep();
    if (!pet.isSleeping) {
      setSpeech({ message: "Goodnight... zzz...", mood: 'sleepy' });
    } else {
      setSpeech({ message: "Good morning! I feel refreshed!", mood: 'happy' });
    }
  }, [pet.isSleeping, toggleSleep]);

  const handleMedicine = useCallback(() => {
    if (pet.isSleeping || !pet.isSick) return;
    giveMedicine();
    setSpeech({ message: "Thank you... I'm starting to feel better...", mood: 'content' });
  }, [pet.isSleeping, pet.isSick, giveMedicine]);

  const handleTalk = useCallback(() => {
    setShowTalkModal(true);
  }, []);

  // Handle user speaking (typing or voice)
  const handleUserSpeak = useCallback((text: string) => {
    // Add to conversation history
    addConversation('user', text);
    
    // Learn words from input
    const learned = learnWords(text, 'conversation');
    setLastLearnedWords(learned);
    
    // Generate response
    const response = generateSpeechResponse(text, learned, pet, memory);
    setSpeech(response);
    
    // Check if user told us their name
    const nameMatch = text.match(/my name is (\w+)/i) || text.match(/i am (\w+)/i) || text.match(/call me (\w+)/i);
    if (nameMatch) {
      setUserName(nameMatch[1]);
    }
    
    addInteraction('talk');
  }, [pet, memory, learnWords, addConversation, generateSpeechResponse, setUserName, addInteraction]);

  // Handle voice input
  const handleVoiceInput = useCallback((text: string, learned: string[]) => {
    // Add to conversation history
    addConversation('user', text);
    
    // Learn words from input
    const newLearned = learnWords(text, 'conversation');
    const allLearned = [...new Set([...learned, ...newLearned])];
    setLastLearnedWords(allLearned);
    
    // Generate response
    const response = generateSpeechResponse(text, allLearned, pet, memory);
    setSpeech(response);
    
    // Check if user told us their name
    const nameMatch = text.match(/my name is (\w+)/i) || text.match(/i am (\w+)/i) || text.match(/call me (\w+)/i);
    if (nameMatch) {
      setUserName(nameMatch[1]);
    }
    
    addInteraction('talk');
  }, [pet, memory, learnWords, addConversation, generateSpeechResponse, setUserName, addInteraction]);

  const handleRename = useCallback(() => {
    if (nameInput.trim() && nameInput !== pet.name) {
      rename(nameInput.trim());
      setSpeech({ message: `My name is ${nameInput.trim()}! Nice to meet you!`, mood: 'happy' });
    }
    setIsEditingName(false);
  }, [nameInput, pet.name, rename]);

  const handleImportItem = useCallback((item: CustomItem) => {
    addCustomItem(item);
    setSpeech({ message: `Ooh! A new ${item.name}! Thank you!`, mood: 'ecstatic' });
  }, [addCustomItem]);

  const handleUseItem = useCallback((itemId: string) => {
    useCustomItem(itemId);
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      setSpeech({ message: `Using ${item.name}!`, mood: 'happy' });
    }
    setShowInventory(false);
  }, [useCustomItem, inventory]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-400 text-xs uppercase tracking-wider">Loading PixelPet...</p>
        </div>
      </div>
    );
  }

  const ageDays = Math.floor((Date.now() - pet.birthDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-grid">
      {/* Header */}
      <header className="bg-[#16213e] border-b-2 border-[#e94560] p-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#e94560]" size={18} />
            <h1 className="text-sm text-white uppercase tracking-wider">PixelPet</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowTalkModal(true)}
              className="p-2 text-blue-400 hover:text-blue-300 transition-colors relative"
            >
              <MessageCircle size={16} />
              {memory.vocabulary.totalWordsLearned > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 text-white 
                               text-[8px] flex items-center justify-center rounded-full">
                  {memory.vocabulary.totalWordsLearned}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowInfo(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Info size={16} />
            </button>
            <button
              onClick={() => setShowInventory(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors relative"
            >
              <Package size={16} />
              {inventory.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#e94560] text-white 
                               text-[8px] flex items-center justify-center">
                  {inventory.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowDataManager(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Save size={16} />
            </button>
            <button
              onClick={() => setShowItemImport(true)}
              className="p-2 text-[#e94560] hover:text-[#ff6b9d] transition-colors"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Pet Info Card */}
        <div className="bg-[#0f3460] border-2 border-[#533483] p-3">
          <div className="flex items-center justify-between">
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value.slice(0, 12))}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    onBlur={handleRename}
                    autoFocus
                    className="bg-[#1a1a2e] border border-[#533483] px-2 py-1 text-sm text-white
                             focus:border-[#e94560] focus:outline-none"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-lg text-white hover:text-[#e94560] transition-colors"
                >
                  {pet.name}
                </button>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-blue-400 uppercase">♂ {pet.stage}</span>
                <span className="text-[9px] text-gray-500">•</span>
                <span className="text-[9px] text-gray-400">{ageDays} day{ageDays !== 1 ? 's' : ''} old</span>
                {memory.vocabulary.userName && (
                  <>
                    <span className="text-[9px] text-gray-500">•</span>
                    <span className="text-[9px] text-purple-400">knows {memory.vocabulary.userName}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <Heart size={10} className="text-[#e94560]" />
                <span>{Math.round((pet.happiness + pet.health + pet.hunger + pet.energy + pet.hygiene) / 5)}%</span>
              </div>
              <p className="text-[9px] text-gray-500 mt-0.5 capitalize">{pet.mood}</p>
            </div>
          </div>
        </div>

        {/* Pet Display */}
        <div className="relative">
          {/* Speech Bubble */}
          {speech && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-[90%]">
              <SpeechBubble
                message={speech.message}
                mood={speech.mood}
                onClose={() => setSpeech(null)}
              />
            </div>
          )}

          {/* Pet Screen */}
          <div className="crt-screen bg-[#0f3460] border-4 border-[#16213e] aspect-square 
                        flex items-center justify-center relative overflow-hidden">
            {/* Background pattern based on mood */}
            <div className={`absolute inset-0 opacity-10 ${
              pet.mood === 'ecstatic' ? 'bg-gradient-to-br from-pink-500 to-purple-500' :
              pet.mood === 'happy' ? 'bg-gradient-to-br from-green-400 to-blue-500' :
              pet.mood === 'sad' ? 'bg-gradient-to-br from-gray-500 to-gray-700' :
              pet.mood === 'sick' ? 'bg-gradient-to-br from-gray-600 to-gray-800' :
              pet.mood === 'sleepy' ? 'bg-gradient-to-br from-purple-900 to-blue-900' :
              'bg-gradient-to-br from-blue-900 to-purple-900'
            }`} />

            {/* Stars for happy moods */}
            {(pet.mood === 'ecstatic' || pet.mood === 'happy') && (
              <div className="absolute inset-0">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white animate-pulse"
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${20 + Math.random() * 60}%`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* The Pet */}
            <div className="relative z-10">
              <PixelPet
                pet={pet}
                animation={currentAnimation}
                onPet={handlePet}
                size="large"
              />
            </div>

            {/* Status indicators */}
            <div className="absolute bottom-2 left-2 flex gap-1">
              {pet.isSleeping && (
                <span className="text-[8px] bg-purple-900/80 text-purple-300 px-1.5 py-0.5">
                  SLEEPING
                </span>
              )}
              {pet.isSick && (
                <span className="text-[8px] bg-red-900/80 text-red-300 px-1.5 py-0.5">
                  SICK
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <StatBars
          hunger={pet.hunger}
          happiness={pet.happiness}
          health={pet.health}
          energy={pet.energy}
          hygiene={pet.hygiene}
        />

        {/* Actions */}
        <ActionButtons
          onFeed={handleFeed}
          onPlay={handlePlay}
          onPet={handlePet}
          onClean={handleClean}
          onSleep={handleSleep}
          onMedicine={handleMedicine}
          onTalk={handleTalk}
          isSleeping={pet.isSleeping}
          isSick={pet.isSick}
        />

        {/* Stats Footer */}
        <div className="text-center text-[9px] text-gray-500">
          <p>
            Interactions: {gameStats.totalInteractions} • 
            Items: {inventory.length} • 
            Words: {gameStats.wordsLearned}
          </p>
        </div>
      </main>

      {/* Talk Modal */}
      {showTalkModal && (
        <TalkModal
          isOpen={showTalkModal}
          onClose={() => setShowTalkModal(false)}
          onSpeak={handleUserSpeak}
          onListen={handleVoiceInput}
          memory={memory}
          lastResponse={speech}
          isListening={false}
          transcript=""
          learnedWords={lastLearnedWords}
        />
      )}

      {/* Modals */}
      {showItemImport && (
        <ItemImport
          onImport={handleImportItem}
          onClose={() => setShowItemImport(false)}
        />
      )}

      {showInventory && (
        <Inventory
          items={inventory}
          onUseItem={handleUseItem}
          onClose={() => setShowInventory(false)}
        />
      )}

      {showDataManager && (
        <DataManager
          onExport={exportSaveData}
          onImport={importSaveData}
          onReset={resetGame}
          onClose={() => setShowDataManager(false)}
        />
      )}

      {showInfo && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfo(false)}
        >
          <div 
            className="bg-gray-900 border-2 border-purple-500 max-w-sm w-full p-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-sm text-purple-400 uppercase tracking-wider mb-3">
              About PixelPet
            </h2>
            <div className="space-y-2 text-[10px] text-gray-400 leading-relaxed">
              <p>
                PixelPet is a nostalgic virtual pet experience inspired by the 
                2000s digital pet craze. Take care of your pixel companion by 
                feeding, playing, and keeping them healthy!
              </p>
              <p>
                <strong className="text-blue-400">Talk Feature:</strong> Use the microphone 
                or type to talk with your pet! He will learn your words and use them 
                in conversations. Tell him your name and he'll remember it!
              </p>
              <p className="text-purple-400">
                Tip: Tap your pet to pet them! They love attention!
              </p>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-4 w-full p-2 bg-purple-600 text-white text-xs uppercase tracking-wider
                       hover:bg-purple-500 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
