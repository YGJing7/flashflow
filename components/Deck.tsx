import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { CardData, AppSettings } from '../types';
import { Card } from './Card';
import { Trash2, RotateCcw, Plus, Upload } from 'lucide-react';

interface DeckProps {
  cards: CardData[];
  settings: AppSettings;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onDelete: (index: number) => void;
  onTriggerAdd: () => void;
  onTriggerImport: () => void;
  onEdit: (card: CardData) => void;
}

export const Deck: React.FC<DeckProps> = ({ 
  cards, settings, currentIndex, onNext, onPrev, onDelete, onTriggerAdd, onTriggerImport, onEdit 
}) => {
  // Always call hooks at top level
  const [isFlipped, setIsFlipped] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Visual cues
  const rotateIconScale = useTransform(y, [50, 150], [0.5, 1.2]);
  const deleteIconScale = useTransform(y, [-50, -150], [0.5, 1.2]);
  const nextIconOpacity = useTransform(x, [-50, -100], [0, 1]);
  const prevIconOpacity = useTransform(x, [50, 100], [0, 1]);

  // Long press refs
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);

  // Safe access to active card
  const activeCard = (cards && cards.length > 0 && cards[currentIndex]) ? cards[currentIndex] : null;

  // Reset flip when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex, cards]);

  // Long Press Logic
  const handlePointerDown = () => {
    if (!activeCard) return;
    isDragging.current = false;
    longPressTimer.current = setTimeout(() => {
      if (!isDragging.current) {
        // Trigger Edit
        onEdit(activeCard);
        // Add vibration feedback if supported
        if (navigator.vibrate) navigator.vibrate(50);
      }
    }, 600); // 600ms for long press
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleDragStart = () => {
    isDragging.current = true;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 80;
    const { offset } = info;

    // Reset dragging state
    isDragging.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);

    // Vertical Swipes (Priority)
    if (Math.abs(offset.y) > Math.abs(offset.x)) {
      if (offset.y < -swipeThreshold) {
        // Swipe UP: Delete
        onDelete(currentIndex);
        resetPosition();
      } else if (offset.y > swipeThreshold) {
        // Swipe DOWN: Toggle Back/Front View
        setIsFlipped(!isFlipped);
        resetPosition();
      } else {
        resetPosition();
      }
    } 
    // Horizontal Swipes
    else {
      if (offset.x < -swipeThreshold) {
        // Swipe LEFT: Next
        onNext();
        resetPosition();
      } else if (offset.x > swipeThreshold) {
        // Swipe RIGHT: Previous
        onPrev();
        resetPosition();
      } else {
        resetPosition();
      }
    }
  };

  const resetPosition = () => {
    x.set(0);
    y.set(0);
  };

  // Determine if we are in Empty State
  const showEmptyState = !activeCard || cards.length === 0;

  // Calculate next card index for the stack effect (Looping)
  const safeLength = cards.length || 1;
  const nextIndex = (currentIndex + 1) % safeLength;
  const nextCard = (!showEmptyState && cards.length > 1) ? cards[nextIndex] : null;

  return (
    <div className="relative w-full max-w-md h-[70vh] perspective-1000">
      
      {showEmptyState ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-6 animate-pulse">
          <div className="text-xl font-bold text-gray-700">暂无卡片</div>
          <p className="text-sm opacity-70 mb-4">请添加卡片以开始学习</p>
          
          <div className="flex flex-col gap-3 w-48">
            <button 
              onClick={onTriggerAdd}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Plus size={20} />
              新建卡片
            </button>
            
            <button 
              onClick={onTriggerImport}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Upload size={20} />
              导入 Excel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            {/* Visual Cues Overlay */}
            <motion.div style={{ scale: deleteIconScale, opacity: useTransform(y, [-50, -100], [0, 1]) }} className="absolute top-10 p-4 bg-red-500 rounded-full text-white shadow-lg">
              <Trash2 size={32} />
            </motion.div>
            <motion.div style={{ scale: rotateIconScale, opacity: useTransform(y, [50, 100], [0, 1]) }} className="absolute bottom-10 p-4 bg-blue-500 rounded-full text-white shadow-lg">
              <RotateCcw size={32} />
            </motion.div>
            
            <motion.div style={{ opacity: nextIconOpacity }} className="absolute right-4 p-2 bg-green-500/20 text-green-700 rounded-full">
              <span className="font-bold text-lg">NEXT</span>
            </motion.div>
            <motion.div style={{ opacity: prevIconOpacity }} className="absolute left-4 p-2 bg-yellow-500/20 text-yellow-700 rounded-full">
              <span className="font-bold text-lg">PREV</span>
            </motion.div>
          </div>

          <AnimatePresence mode="popLayout">
            {activeCard && (
                <motion.div
                key={activeCard.id}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                style={{ x, y, rotate, opacity }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onPointerCancel={handlePointerUp}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                >
                <div className="w-full h-full relative">
                    <Card data={activeCard} settings={settings} isFront={!isFlipped} />
                </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Background Card */}
          {nextCard && (
            <div 
            className="absolute inset-0 z-[-1] transform scale-95 translate-y-4 opacity-40 pointer-events-none"
          >
            <Card data={nextCard} settings={settings} isFront={true} />
          </div>
          )}
        </>
      )}
    </div>
  );
};