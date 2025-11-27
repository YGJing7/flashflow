import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { CardData } from '../types';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<CardData, 'id'>) => void;
  availableTags: string[];
  defaultTag?: string;
  editingCard?: CardData | null;
}

const PRESET_COLORS = ['#ffffff', '#fef3c7', '#dcfce7', '#dbeafe', '#fce7f3', '#f3f4f6', '#1f2937'];

export const AddCardModal: React.FC<AddCardModalProps> = ({ 
  isOpen, onClose, onSave, availableTags, defaultTag, editingCard 
}) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tag, setTag] = useState('');
  const [color, setColor] = useState('#ffffff');

  // Initialize fields
  useEffect(() => {
    if (isOpen) {
      if (editingCard) {
        // Edit Mode
        setFront(editingCard.front);
        setBack(editingCard.back);
        setTag(editingCard.tag);
        setColor(editingCard.color || '#ffffff');
      } else {
        // Add Mode
        setFront('');
        setBack('');
        setTag(defaultTag || '');
        setColor('#ffffff');
      }
    }
  }, [isOpen, editingCard, defaultTag]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front || !back) return;
    
    onSave({
      front,
      back,
      tag: tag || 'Custom',
      color
    });
    
    // Clear state only if adding (optional, since useEffect handles reset on open)
    if (!editingCard) {
        setFront('');
        setBack('');
    }
    // onClose is called by parent wrapper usually, but here we trigger close logic if needed by parent
    // The handleSave in App.tsx calls close, so we don't strictly need to close here, 
    // but the button type is submit which triggers this.
  };

  const handleTagClick = (t: string) => {
    setTag(t);
  };

  const uniqueTags = availableTags.filter(t => t !== 'All');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl animate-scale-up p-6 relative flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full text-gray-500"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-gray-800 mb-6 shrink-0">
          {editingCard ? '编辑卡片' : '添加新卡片'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">正面内容</label>
            <textarea 
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20 bg-gray-50"
              placeholder="输入问题或单词..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">背面内容</label>
            <textarea 
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20 bg-gray-50"
              placeholder="输入答案或解释..."
              required
            />
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">标签</label>
            <input 
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              list="tag-options"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
              placeholder="输入或选择标签"
            />
            <datalist id="tag-options">
              {uniqueTags.map(t => (
                <option key={t} value={t} />
              ))}
            </datalist>
            
            {uniqueTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {uniqueTags.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTagClick(t)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      tag === t 
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Colors Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">颜色</label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full shadow-sm transition-transform hover:scale-110 flex items-center justify-center ${color === c ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {color === c && c === '#1f2937' && <Check size={14} className="text-white" />}
                  {color === c && c !== '#1f2937' && <Check size={14} className="text-gray-800" />}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mt-6"
          >
            <Check size={18} /> 
            {editingCard ? '保存修改' : '完成添加'}
          </button>
        </form>
      </div>
    </div>
  );
};