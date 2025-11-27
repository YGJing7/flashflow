import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardData, AppSettings } from '../types';

interface CardProps {
  data: CardData;
  settings: AppSettings;
  isFront: boolean;
}

export const Card: React.FC<CardProps> = ({ data, settings, isFront }) => {
  return (
    <div
      className="w-full h-full rounded-3xl shadow-xl flex items-center justify-center p-8 relative overflow-hidden backdrop-blur-md border border-white/20 transition-colors duration-300"
      style={{
        backgroundColor: data.color 
          ? `${data.color}${Math.round(settings.panelOpacity * 255).toString(16).padStart(2, '0')}` 
          : `${settings.panelColor}${Math.round(settings.panelOpacity * 255).toString(16).padStart(2, '0')}`,
        fontFamily: settings.fontFamily,
        color: settings.textColor,
      }}
    >
      <div className="absolute top-4 right-4 px-3 py-1 bg-black/10 rounded-full text-xs font-medium opacity-50">
        {data.tag}
      </div>

      <div className="w-full relative h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div 
            key={isFront ? 'front' : 'back'}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="text-center w-full break-words whitespace-pre-wrap leading-relaxed select-none absolute"
            style={{ fontSize: `${settings.fontSize}px` }}
          >
            {isFront ? data.front : data.back}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 text-xs opacity-30 font-sans tracking-widest uppercase">
        {isFront ? 'Front' : 'Back'}
      </div>
    </div>
  );
};