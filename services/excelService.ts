import * as XLSX from 'xlsx';
import { CardData } from '../types';

export const parseExcelFile = (file: File): Promise<CardData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON, flexible header
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        
        const cards: CardData[] = [];
        
        jsonData.forEach((row, index) => {
          // Skip empty rows
          if (!row || row.length < 2) return;
          
          const front = String(row[0] || '').trim();
          const back = String(row[1] || '').trim();

          if (front && back) {
            cards.push({
              id: `imported-${Date.now()}-${index}`,
              front,
              back,
              tag: 'Imported',
              color: undefined
            });
          }
        });

        resolve(cards);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
