export interface CardData {
  id: string;
  front: string;
  back: string;
  tag: string;
  color?: string;
  isFlipped?: boolean;
}

export interface AppSettings {
  fontFamily: string; // 'yahei', 'times', 'simsun', etc.
  fontSize: number; // in px
  panelColor: string; // hex
  panelOpacity: number; // 0 to 1
  textColor: string;
}

export enum SwipeDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  UP = 'UP',
  DOWN = 'DOWN',
  NONE = 'NONE'
}

export const AVAILABLE_FONTS = [
  { label: '微软雅黑 (YaHei)', value: 'Microsoft YaHei, sans-serif' },
  { label: '宋体 (SimSun)', value: 'SimSun, serif' },
  { label: '黑体 (SimHei)', value: 'SimHei, sans-serif' },
  { label: '楷书 (KaiTi)', value: 'KaiTi, serif' },
  { label: '华为行楷 (Xingkai)', value: 'STXingkai, cursive' },
  { label: '隶书 (LiSu)', value: 'LiSu, cursive' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Noto Sans SC', value: "'Noto Sans SC', sans-serif" },
  { label: 'Noto Serif SC', value: "'Noto Serif SC', serif" },
];

export const DEFAULT_SETTINGS: AppSettings = {
  fontFamily: 'Microsoft YaHei, sans-serif',
  fontSize: 24,
  panelColor: '#ffffff',
  panelOpacity: 0.9,
  textColor: '#1f2937',
};
