import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Plus, Palette } from 'lucide-react';
import type { CustomItem } from '@/types/pet';

interface ItemImportProps {
  onImport: (item: CustomItem) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c',
];

const PRESET_ITEMS: Omit<CustomItem, 'id' | 'unlocked' | 'useCount'>[] = [
  { name: 'Golden Apple', type: 'food', pixelData: '', color: '#ffd700', effect: { hunger: 50, happiness: 20 } },
  { name: 'Magic Potion', type: 'food', pixelData: '', color: '#a855f7', effect: { health: 50, energy: 30 } },
  { name: 'Pixel Ball', type: 'toy', pixelData: '', color: '#ef4444', effect: { happiness: 40, energy: -10 } },
  { name: 'Crown', type: 'accessory', pixelData: '', color: '#ffd700', effect: { happiness: 30 } },
  { name: 'Sunglasses', type: 'accessory', pixelData: '', color: '#1f2937', effect: { happiness: 15 } },
  { name: 'Rainbow Background', type: 'background', pixelData: '', color: '#ff6b9d', effect: { happiness: 25 } },
];

export const ItemImport: React.FC<ItemImportProps> = ({ onImport, onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<CustomItem['type']>('food');
  const [color, setColor] = useState('#ef4444');
  const [pixelData, setPixelData] = useState<string | null>(null);
  const [effect, setEffect] = useState({ hunger: 0, happiness: 0, health: 0, energy: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to resize and pixelate the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize to 16x16 for pixel art
        canvas.width = 16;
        canvas.height = 16;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, 16, 16);

        // Get pixel data and convert to data URL
        const dataUrl = canvas.toDataURL('image/png');
        setPixelData(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) return;

    const newItem: CustomItem = {
      id: `item_${Date.now()}`,
      name: name.trim(),
      type,
      pixelData: pixelData || '',
      color,
      effect: {
        hunger: effect.hunger || undefined,
        happiness: effect.happiness || undefined,
        health: effect.health || undefined,
        energy: effect.energy || undefined,
      },
      unlocked: true,
      useCount: 0,
    };

    onImport(newItem);
    onClose();
  }, [name, type, color, pixelData, effect, onImport, onClose]);

  const handlePresetSelect = useCallback((preset: typeof PRESET_ITEMS[0]) => {
    const newItem: CustomItem = {
      id: `item_${Date.now()}`,
      name: preset.name,
      type: preset.type,
      pixelData: preset.pixelData,
      color: preset.color,
      effect: preset.effect,
      unlocked: true,
      useCount: 0,
    };
    onImport(newItem);
    onClose();
  }, [onImport, onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-purple-500 max-w-md w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-sm text-purple-400 uppercase tracking-wider">
            Import Custom Item
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Preset Items */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_ITEMS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(preset)}
                  className="p-2 bg-gray-800 border border-gray-700 hover:border-purple-500 
                           transition-colors flex flex-col items-center gap-1"
                >
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="text-[8px] text-gray-300 text-center leading-tight">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-2">
              Or Create Custom
            </label>
          </div>

          {/* Name Input */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
              Item Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              placeholder="Enter item name..."
              className="w-full bg-gray-800 border border-gray-700 p-2 text-xs text-white
                       focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
              Item Type
            </label>
            <div className="grid grid-cols-4 gap-1">
              {(['food', 'toy', 'accessory', 'background'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`p-2 text-[9px] uppercase border transition-colors
                    ${type === t 
                      ? 'bg-purple-600 border-purple-500 text-white' 
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
              <Palette size={10} className="inline mr-1" />
              Color
            </label>
            <div className="flex flex-wrap gap-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 border-2 transition-all
                    ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Effects */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-2">
              Effects
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'hunger', label: 'Hunger', color: '#fbbf24' },
                { key: 'happiness', label: 'Happy', color: '#f472b6' },
                { key: 'health', label: 'Health', color: '#ef4444' },
                { key: 'energy', label: 'Energy', color: '#3b82f6' },
              ].map(({ key, label, color: c }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[9px] text-gray-400 w-14">{label}</span>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={effect[key as keyof typeof effect]}
                    onChange={(e) => setEffect(prev => ({ 
                      ...prev, 
                      [key]: parseInt(e.target.value) 
                    }))}
                    className="flex-1 h-1 bg-gray-700 rounded-none appearance-none"
                    style={{ accentColor: c }}
                  />
                  <span className="text-[9px] w-8 text-right" style={{ color: c }}>
                    {effect[key as keyof typeof effect] > 0 ? '+' : ''}
                    {effect[key as keyof typeof effect]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
              <Upload size={10} className="inline mr-1" />
              Pixel Art (Optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3 bg-gray-800 border border-dashed border-gray-600
                       hover:border-purple-500 transition-colors flex flex-col items-center gap-2"
            >
              {pixelData ? (
                <img 
                  src={pixelData} 
                  alt="Preview" 
                  className="w-12 h-12 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <>
                  <Plus size={20} className="text-gray-500" />
                  <span className="text-[9px] text-gray-500">
                    Click to upload 16x16 pixel art
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full p-3 bg-purple-600 text-white text-xs uppercase tracking-wider
                     hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500
                     disabled:cursor-not-allowed transition-colors"
          >
            Import Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemImport;
