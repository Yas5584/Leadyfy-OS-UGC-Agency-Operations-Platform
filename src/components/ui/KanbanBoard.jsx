import React from 'react';
import { MoreVertical } from 'lucide-react';

export default function KanbanBoard({ columns, items = [], renderCard, onMoveItem, onCardClick, onCardMove }) {
  const getColumnCards = (col) => {
    if (col.cards) return col.cards;
    return items.filter(item => item.status === col.id);
  };

  const handleMove = (cardId, targetColumnId) => {
    if (onCardMove) {
      onCardMove(cardId, targetColumnId);
    } else if (onMoveItem) {
      onMoveItem(cardId, targetColumnId);
    }
  };

  const DefaultCard = ({ card }) => {
    return (
      <div 
        className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
        onClick={() => onCardClick && onCardClick(card)}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm text-gray-900 leading-tight">{card.title}</h4>
          {(onCardMove || onMoveItem) && (
            <div className="relative">
              <select 
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                value=""
                onChange={(e) => {
                  e.stopPropagation();
                  if (e.target.value) {
                    handleMove(card.id, e.target.value);
                  }
                }}
                onClick={e => e.stopPropagation()}
              >
                <option value="" disabled>Move to...</option>
                {columns.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <button 
                className="text-gray-400 hover:text-gray-600 p-0.5 rounded focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        {card.description && (
          <p className="text-xs text-gray-500 mb-3 whitespace-pre-wrap">{card.description}</p>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          {card.badge && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              {card.badge}
            </span>
          )}
          {card.dueDate && (
            <span className="text-[10px] font-medium text-gray-500">
              {new Date(card.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full overflow-x-auto pb-4 gap-6 scrollbar-hide">
      {columns.map((col) => {
        const colCards = getColumnCards(col);
        const isTailwindColor = col.color && col.color.startsWith('bg-');
        
        return (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col bg-gray-50/50 rounded-xl">
            <div className="p-3 flex items-center justify-between border-b border-gray-200">
              <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                <span 
                  className={`w-2.5 h-2.5 rounded-full ${isTailwindColor ? col.color : ''}`} 
                  style={!isTailwindColor ? { backgroundColor: col.color || '#F59E0B' } : {}}
                />
                {col.title}
              </h3>
              <span className="bg-gray-200 text-gray-700 text-xs py-0.5 px-2 rounded-full font-medium">
                {colCards.length}
              </span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[200px]">
              {colCards.map((card) => (
                <div key={card.id}>
                  {renderCard ? renderCard(card) : <DefaultCard card={card} />}
                </div>
              ))}
              {colCards.length === 0 && (
                <div className="h-full min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm p-4 text-center">
                  No scripts in this stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
