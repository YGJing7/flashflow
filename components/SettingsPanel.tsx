import React, { useState, useEffect } from 'react';
import { X, Upload, Settings, Type, Palette, Layers, Download } from 'lucide-react';
import { AppSettings, CardData, AVAILABLE_FONTS } from '../types';
import { parseExcelFile } from '../services/excelService';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  setCards: React.Dispatch<React.SetStateAction<CardData[]>>;
  initialTab?: 'style' | 'import';
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, onClose, settings, setSettings, setCards, initialTab = 'style'
}) => {
  const [activeTab, setActiveTab] = useState<'style' | 'import'>(initialTab);

  // Reset tab when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const newCards = await parseExcelFile(e.target.files[0]);
        setCards(prev => [...prev, ...newCards]);
        alert(`成功导入 ${newCards.length} 张卡片!`);
      } catch (error) {
        alert('导入失败，请确保文件格式正确。');
        console.error(error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5" /> 设置 (Settings)
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === 'style' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            样式与字体
          </button>
          <button 
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === 'import' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            导入
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeTab === 'style' && (
            <div className="space-y-6">
              {/* Font Settings */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Type className="w-4 h-4" /> 字体选择
                </label>
                <select 
                  value={settings.fontFamily}
                  onChange={(e) => setSettings({...settings, fontFamily: e.target.value})}
                  className="w-full p-3 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-primary outline-none"
                >
                  {AVAILABLE_FONTS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Type className="w-4 h-4" /> 字体大小 ({settings.fontSize}px)
                </label>
                <input 
                  type="range" 
                  min="12" 
                  max="64" 
                  value={settings.fontSize}
                  onChange={(e) => setSettings({...settings, fontSize: Number(e.target.value)})}
                  className="w-full accent-primary"
                />
              </div>

              {/* Panel Appearance */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> 卡片颜色
                </label>
                <div className="flex gap-3 overflow-x-auto py-2">
                  {['#ffffff', '#fef3c7', '#dcfce7', '#dbeafe', '#fce7f3', '#f3f4f6', '#1f2937'].map(color => (
                    <button
                      key={color}
                      onClick={() => setSettings({...settings, panelColor: color, textColor: color === '#1f2937' ? '#ffffff' : '#1f2937' })}
                      className={`w-10 h-10 rounded-full border-2 shadow-sm flex-shrink-0 ${settings.panelColor === color ? 'border-primary scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> 背景透明度 ({Math.round(settings.panelOpacity * 100)}%)
                </label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.05"
                  value={settings.panelOpacity}
                  onChange={(e) => setSettings({...settings, panelOpacity: Number(e.target.value)})}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-8">
              {/* Excel Import */}
              <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-green-600" /> Excel 批量导入
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  上传 .xlsx 文件，格式要求：<br/>
                  第一列：正面内容 | 第二列：背面内容
                </p>
                <label className="flex items-center justify-center w-full py-3 px-4 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                  <Upload className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">选择文件</span>
                  <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

               {/* Template Download */}
               <div className="pt-4 border-t">
                  <a 
                    href="#" 
                    onClick={(e) => {
                        e.preventDefault();
                        alert("此功能将下载标准 Excel 模板文件。");
                    }}
                    className="text-xs text-blue-500 flex items-center gap-1 hover:underline"
                  >
                    <Download className="w-3 h-3" /> 下载 Excel 模板
                  </a>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};