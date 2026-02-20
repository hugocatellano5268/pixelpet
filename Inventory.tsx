import React from 'react';
import { Package, X } from 'lucide-react';
import type { CustomItem } from '@/types/pet';

interface InventoryProps {
  items: CustomItem[];
  onUseItem: (itemId: string) => void;
  onClose: () => void;
}

const getTypeIcon = (type: CustomItem['type']) => {
  switch (type) {
    case 'food': return '🍖';
    case 'toy': return '🎮';
    case 'accessory': return '👑';
    case 'background': return '🖼️';
    case 'decoration': return '🎀';
    default: return '📦';
  }
};

const getEffectDescription = (effect: CustomItem['effect']) => {
  const parts: string[] = [];
  if (effect.hunger) parts.push(`${effect.hunger > 0 ? '+' : ''}${effect.hunger} Hunger`);
  if (effect.happiness) parts.push(`${effect.happiness > 0 ? '+' : ''}${effect.happiness} Happy`);
  if (effect.health) parts.push(`${effect.health > 0 ? '+' : ''}${effect.health} Health`);
  if (effect.energy) parts.push(`${effect.energy > 0 ? '+' : ''}${effect.energy} Energy`);
  return parts.join(', ') || 'No effect';
};

export const Inventory: React.FC<InventoryProps> = ({ items, onUseItem, onClose }) => {
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<CustomItem['type'], CustomItem[]>);

  const typeOrder: CustomItem['type'][] = ['food', 'toy', 'accessory', 'background', 'decoration'];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-blue-500 max-w-md w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-sm text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <Package size={16} />
            Inventory ({items.length})
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Package size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-xs">Your inventory is empty</p>
              <p className="text-gray-600 text-[10px] mt-1">
                Import custom items to see them here!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {typeOrder.map((type) => {
                const typeItems = groupedItems[type];
                if (!typeItems || typeItems.length === 0) return null;

                return (
                  <div key={type}>
                    <h3 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span>{getTypeIcon(type)}</span>
                      {type}s ({typeItems.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {typeItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onUseItem(item.id)}
                          className="p-3 bg-gray-800 border border-gray-700 hover:border-blue-500
                                   hover:bg-gray-750 transition-all text-left group"
                        >
                          <div className="flex items-start gap-2">
                            {/* Item Icon */}
                            <div 
                              className="w-8 h-8 flex-shrink-0 border border-gray-600
                                       flex items-center justify-center"
                              style={{ backgroundColor: `${item.color}20` }}
                            >
                              {item.pixelData ? (
                                <img 
                                  src={item.pixelData} 
                                  alt={item.name}
                                  className="w-6 h-6 object-contain"
                                  style={{ imageRendering: 'pixelated' }}
                                />
                              ) : (
                                <span className="text-lg">{getTypeIcon(item.type)}</span>
                              )}
                            </div>

                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-white truncate group-hover:text-blue-400">
                                {item.name}
                              </p>
                              <p className="text-[8px] text-gray-500 mt-0.5">
                                {getEffectDescription(item.effect)}
                              </p>
                              {item.useCount > 0 && (
                                <p className="text-[8px] text-gray-600 mt-0.5">
                                  Used {item.useCount} time{item.useCount !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Use indicator */}
                          <div className="mt-2 text-[8px] text-blue-400 uppercase tracking-wider
                                        opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to Use
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <p className="text-[9px] text-gray-500 text-center">
            Items are saved with your pet data
          </p>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
