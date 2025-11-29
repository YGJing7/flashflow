import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Filter, Plus, Shuffle } from 'lucide-react';
import { Deck } from './components/Deck';
import { SettingsPanel } from './components/SettingsPanel';
import { AddCardModal } from './components/AddCardModal';
import { CardData, AppSettings, DEFAULT_SETTINGS } from './types';

// Storage Keys
const STORAGE_KEY_CARDS = 'flashflow_cards_v1';
const STORAGE_KEY_SETTINGS = 'flashflow_settings_v1';

// Sample initial data
const INITIAL_CARDS: CardData[] = [
  { id: '1', front: '你好', back: 'Hello (Nǐ hǎo)', tag: '中文', color: '#dbeafe' },
  { id: '2', front: 'ありがとう', back: 'Thank You (Arigatou)', tag: '日文', color: '#fce7f3' },
  { id: '3', front: 'Apple', back: '苹果', tag: '英文', color: '#dcfce7' },
  { id: '4', front: '向左滑动', back: '切换到下一张', tag: '教程' },
  { id: '5', front: '向右滑动', back: '切换到上一张', tag: '教程' },
  { id: '6', front: '向上滑动', back: '删除当前卡片', tag: '教程' },
  { id: '7', front: '向下滑动', back: '显示卡片背面', tag: '教程' },
  { id: '8', front: '长按卡片', back: '进入编辑模式', tag: '教程', color: '#f3f4f6' },
];

const App: React.FC = () => {
  // Initialize Cards from LocalStorage
  const [cards, setCards] = useState<CardData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CARDS);
      return saved ? JSON.parse(saved) : INITIAL_CARDS;
    } catch (error) {
      console.error('Failed to load cards from storage', error);
      return INITIAL_CARDS;
    }
  });

  // Initialize Settings from LocalStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      // Merge saved settings with default to ensure all keys exist (in case of updates)
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings from storage', error);
      return DEFAULT_SETTINGS;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'style' | 'import'>('style');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastAddedTag, setLastAddedTag] = useState<string>('');

  // Persist Cards whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
    } catch (error) {
      console.error('Failed to save cards to storage', error);
    }
  }, [cards]);

  // Persist Settings whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to storage', error);
    }
  }, [settings]);

  // Filter logic
  const availableTags = useMemo(() => {
    const tags = new Set(cards.map(c => c.tag).filter(Boolean));
    return ['All', ...Array.from(tags)];
  }, [cards]);

  const filteredCards = useMemo(() => {
    if (selectedTag === 'All') return cards;
    return cards.filter(c => c.tag === selectedTag);
  }, [cards, selectedTag]);

  // Sync currentIndex state when list shrinks, but use renderIndex for immediate safety
  useEffect(() => {
    if (filteredCards.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= filteredCards.length) {
      setCurrentIndex(Math.max(0, filteredCards.length - 1));
    }
  }, [filteredCards.length, selectedTag]);

  // Calculate a safe index for rendering.
  const renderIndex = useMemo(() => {
    if (filteredCards.length === 0) return 0;
    return Math.min(currentIndex, filteredCards.length - 1);
  }, [currentIndex, filteredCards.length]);

  // Actions
  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleDelete = (indexToDelete: number) => {
    if (indexToDelete < 0 || indexToDelete >= filteredCards.length) return;
    
    const cardToDelete = filteredCards[indexToDelete];
    const newCards = cards.filter(c => c.id !== cardToDelete.id);
    
    const currentFilteredLength = filteredCards.length;
    let newIndex = currentIndex;

    // If deleting the last visible card
    if (indexToDelete === currentFilteredLength - 1) {
        newIndex = Math.max(0, indexToDelete - 1);
    } 
    
    setCards(newCards);
    setCurrentIndex(newIndex);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleSaveCard = (cardData: Omit<CardData, 'id'>) => {
    if (editingCard) {
      // Update existing card
      setCards(prev => prev.map(c => c.id === editingCard.id ? { ...cardData, id: editingCard.id } : c));
      setEditingCard(null);
    } else {
      // Create new card
      const newCard: CardData = {
        ...cardData,
        id: `manual-${Date.now()}`
      };
      setCards(prev => [...prev, newCard]);
      setLastAddedTag(newCard.tag);
    }
    setIsAddModalOpen(false);
  };

  const handleEditCard = (card: CardData) => {
    setEditingCard(card);
    setIsAddModalOpen(true);
  };

  const openSettings = (tab: 'style' | 'import' = 'style') => {
    setSettingsInitialTab(tab);
    setIsSettingsOpen(true);
  };

  const openAddModal = () => {
    setEditingCard(null); // Ensure we are in add mode
    setIsAddModalOpen(true);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col relative font-sans">
      
      {/* Top Bar */}
      <header className="px-6 py-4 flex justify-between items-center z-10">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
          FlashFlow
        </h1>
        <div className="flex gap-3">
          {/* Shuffle Button */}
           <button 
            onClick={handleShuffle}
            className="p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-colors text-gray-600"
            title="随机排序"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Tag Filter Dropdown */}
          <div className="relative group">
            <button className="p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-colors text-gray-600">
               <Filter className="w-5 h-5" />
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => { setSelectedTag(tag); setCurrentIndex(0); }}
                    className={`block w-full text-left px-4 py-2 text-sm ${selectedTag === tag ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => openSettings('style')}
            className="p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-colors text-gray-600"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content - Deck Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <div className="w-full max-w-md h-[70vh] relative">
          <Deck 
            key={filteredCards.length === 0 ? 'empty-deck' : 'active-deck'}
            cards={filteredCards} 
            settings={settings}
            currentIndex={renderIndex}
            onNext={handleNext}
            onPrev={handlePrev}
            onDelete={handleDelete}
            onEdit={handleEditCard}
            onTriggerAdd={openAddModal}
            onTriggerImport={() => openSettings('import')}
          />
        </div>

        {/* Status Indicator (Only show if cards exist) */}
        {filteredCards.length > 0 && (
          <div className="mt-8 text-center transition-all duration-300">
              <p className="text-sm font-medium text-gray-500 bg-white/30 px-4 py-1 rounded-full backdrop-blur-sm shadow-sm inline-block">
                  卡片 {renderIndex + 1} / {filteredCards.length}
              </p>
               <p className="text-xs text-gray-400 mt-2">
                  {selectedTag !== 'All' ? `当前标签: ${selectedTag}` : '显示全部'}
              </p>
          </div>
        )}
      </main>

      {/* Floating Action Button for Adding Cards */}
      {filteredCards.length > 0 && (
        <button 
          className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-20"
          onClick={openAddModal}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modals */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
        setCards={setCards}
        initialTab={settingsInitialTab}
      />

      <AddCardModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveCard}
        availableTags={availableTags}
        defaultTag={lastAddedTag}
        editingCard={editingCard}
      />

    </div>
  );
};

export default App;