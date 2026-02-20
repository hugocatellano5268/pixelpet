import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Mic, MicOff, Send, Volume2, BookOpen } from 'lucide-react';
import type { Memory, AIResponse } from '@/types/pet';

// Type declarations for Web Speech API
interface SpeechRecognitionType {
  new (): SpeechRecognitionInstance;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionType;
    webkitSpeechRecognition: SpeechRecognitionType;
  }
}

interface TalkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeak: (text: string) => void;
  onListen: (text: string, learnedWords: string[]) => void;
  memory: Memory;
  lastResponse: AIResponse | null;
  isListening: boolean;
  transcript: string;
  learnedWords: string[];
}

// Speech recognition hook
const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          setTranscript(finalTranscript || interimTranscript);
        };
        
        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          setError(event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript('');
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setError('Could not start microphone');
      }
    } else {
      setError('Speech recognition not supported');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: !!recognitionRef.current,
  };
};

// Text-to-speech hook
const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      
      // Try to find a male voice
      const voices = window.speechSynthesis.getVoices();
      const maleVoice = voices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('man') ||
        v.name.toLowerCase().includes('david') ||
        v.name.toLowerCase().includes('james')
      );
      if (maleVoice) {
        utterance.voice = maleVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking };
};

export const TalkModal: React.FC<TalkModalProps> = ({
  isOpen,
  onClose,
  onSpeak,
  onListen,
  memory,
  lastResponse,
  isListening: externalIsListening,
  transcript: externalTranscript,
  learnedWords,
}) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'talk' | 'vocabulary'>('talk');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    isListening, 
    transcript, 
    error, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported 
  } = useSpeechRecognition();
  
  const { speak, stop } = useTextToSpeech();

  // Use external transcript if provided (from parent)
  const displayTranscript = externalTranscript || transcript;
  const displayIsListening = externalIsListening || isListening;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [memory.conversationHistory, lastResponse]);

  // Speak the pet's response
  useEffect(() => {
    if (lastResponse?.message && isOpen) {
      speak(lastResponse.message);
    }
    return () => stop();
  }, [lastResponse, isOpen, speak, stop]);

  const handleSend = useCallback(() => {
    if (inputText.trim()) {
      onSpeak(inputText.trim());
      setInputText('');
    }
  }, [inputText, onSpeak]);

  const handleMicToggle = useCallback(() => {
    if (displayIsListening) {
      stopListening();
      if (displayTranscript.trim()) {
        onListen(displayTranscript.trim(), learnedWords);
        resetTranscript();
      }
    } else {
      startListening();
    }
  }, [displayIsListening, displayTranscript, learnedWords, onListen, startListening, stopListening, resetTranscript]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-purple-500 w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Volume2 size={18} className="text-purple-400" />
            <h2 className="text-sm text-purple-400 uppercase tracking-wider">
              Talk with {memory.vocabulary.userName || 'Me'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('talk')}
            className={`flex-1 p-2 text-xs uppercase tracking-wider ${
              activeTab === 'talk' 
                ? 'bg-purple-900/50 text-purple-400 border-b-2 border-purple-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Talk
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`flex-1 p-2 text-xs uppercase tracking-wider ${
              activeTab === 'vocabulary' 
                ? 'bg-purple-900/50 text-purple-400 border-b-2 border-purple-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen size={12} className="inline mr-1" />
            Words ({memory.vocabulary.totalWordsLearned})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'talk' ? (
          <>
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px]">
              {/* Welcome message */}
              {memory.conversationHistory.length === 0 && (
                <div className="text-center text-gray-500 text-xs py-8">
                  <p>Talk to me and I'll learn your words!</p>
                  <p className="mt-2">Use the microphone or type a message.</p>
                  {!isSupported && (
                    <p className="text-red-400 mt-2">Speech recognition not supported on this device.</p>
                  )}
                </div>
              )}

              {/* Conversation history */}
              {memory.conversationHistory.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-2 text-xs ${
                      entry.speaker === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    {entry.message}
                  </div>
                </div>
              ))}

              {/* Current listening transcript */}
              {displayIsListening && displayTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] p-2 text-xs bg-purple-600/50 text-white italic">
                    {displayTranscript}
                    <span className="animate-pulse ml-1">▋</span>
                  </div>
                </div>
              )}

              {/* Last response */}
              {lastResponse && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-2 text-xs bg-gray-700 text-gray-200 border-l-2 border-purple-500">
                    {lastResponse.message}
                    {learnedWords.length > 0 && (
                      <div className="mt-1 text-[10px] text-purple-400">
                        Learned: {learnedWords.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700 space-y-2">
              {error && (
                <div className="text-[10px] text-red-400 bg-red-900/30 p-2">
                  {error}
                </div>
              )}

              {/* Text Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border border-gray-700 p-2 text-xs text-white
                           focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="p-2 bg-purple-600 text-white disabled:bg-gray-700 disabled:text-gray-500
                           hover:bg-purple-500 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Mic Button */}
              {isSupported && (
                <button
                  onClick={handleMicToggle}
                  className={`w-full p-3 flex items-center justify-center gap-2 text-xs uppercase
                           tracking-wider transition-all ${
                             displayIsListening
                               ? 'bg-red-600 text-white animate-pulse'
                               : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                           }`}
                >
                  {displayIsListening ? (
                    <>
                      <MicOff size={16} />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic size={16} />
                      Tap to Speak
                    </>
                  )}
                </button>
              )}

              {/* Listening indicator */}
              {displayIsListening && (
                <div className="flex items-center justify-center gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-purple-500 animate-pulse"
                      style={{
                        height: `${12 + Math.random() * 16}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                  <span className="text-[10px] text-purple-400 ml-2">Listening...</span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Vocabulary Tab */
          <div className="flex-1 overflow-y-auto p-4 min-h-[300px] max-h-[400px]">
            {memory.vocabulary.words.length === 0 ? (
              <div className="text-center text-gray-500 text-xs py-8">
                <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
                <p>No words learned yet!</p>
                <p className="mt-2">Talk to me and I'll start learning.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-800 p-2">
                    <div className="text-lg text-purple-400">{memory.vocabulary.totalWordsLearned}</div>
                    <div className="text-[9px] text-gray-500">Total Words</div>
                  </div>
                  <div className="bg-gray-800 p-2">
                    <div className="text-lg text-green-400">
                      {memory.vocabulary.words.filter(w => w.sentiment === 'positive').length}
                    </div>
                    <div className="text-[9px] text-gray-500">Positive</div>
                  </div>
                  <div className="bg-gray-800 p-2">
                    <div className="text-lg text-blue-400">
                      {memory.vocabulary.favoriteWords.length}
                    </div>
                    <div className="text-[9px] text-gray-500">Favorites</div>
                  </div>
                </div>

                {/* Favorite Words */}
                {memory.vocabulary.favoriteWords.length > 0 && (
                  <div>
                    <h3 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                      Favorite Words
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {memory.vocabulary.favoriteWords.map((word) => (
                        <span
                          key={word}
                          className="px-2 py-1 bg-purple-900/50 text-purple-300 text-[10px]"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Words */}
                <div>
                  <h3 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                    All Learned Words
                  </h3>
                  <div className="grid grid-cols-2 gap-1">
                    {memory.vocabulary.words
                      .sort((a, b) => b.usageCount - a.usageCount)
                      .map((word) => (
                        <div
                          key={word.word}
                          className={`p-2 text-[10px] flex justify-between items-center ${
                            word.sentiment === 'positive' ? 'bg-green-900/30 text-green-300' :
                            word.sentiment === 'negative' ? 'bg-red-900/30 text-red-300' :
                            'bg-gray-800 text-gray-300'
                          }`}
                        >
                          <span>{word.word}</span>
                          <span className="text-gray-500">×{word.usageCount}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* User Name */}
                {memory.vocabulary.userName && (
                  <div className="bg-purple-900/30 p-3 text-center">
                    <div className="text-[10px] text-gray-400">I call you</div>
                    <div className="text-sm text-purple-400">{memory.vocabulary.userName}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TalkModal;
