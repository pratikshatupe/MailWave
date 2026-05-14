/**
 * block-library.jsx
 *
 * Left-panel palette inside the template builder. Each tile adds the
 * matching block to the canvas via `onAdd(type)`. Tiles can also be
 * dragged into the canvas — the builder reads the `data-block-type`
 * dataTransfer payload to insert at the drop point.
 */

import {
  Type,
  Image as ImageIcon,
  MousePointerClick,
  Minus,
  Move,
  Columns2,
  PanelTop,
  PanelBottom,
  Share2,
} from 'lucide-react';

const BLOCKS = [
  { type: 'text', label: 'Text', icon: Type, description: 'Paragraphs, headings' },
  { type: 'image', label: 'Image', icon: ImageIcon, description: 'Hero or inline image' },
  { type: 'button', label: 'Button', icon: MousePointerClick, description: 'Call to action' },
  { type: 'divider', label: 'Divider', icon: Minus, description: 'Horizontal rule' },
  { type: 'spacer', label: 'Spacer', icon: Move, description: 'Vertical spacing' },
  { type: 'columns', label: 'Columns', icon: Columns2, description: 'Two columns' },
  { type: 'header', label: 'Header', icon: PanelTop, description: 'Logo + heading' },
  { type: 'footer', label: 'Footer', icon: PanelBottom, description: 'Address + unsubscribe' },
  { type: 'social', label: 'Social', icon: Share2, description: 'Social links' },
];

export default function BlockLibrary({ onAdd, disabled = false }) {
  function handleDragStart(e, type) {
    if (disabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/x-block-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Blocks
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {BLOCKS.map((b) => {
          const Icon = b.icon;
          return (
            <button
              key={b.type}
              type="button"
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, b.type)}
              onClick={() => !disabled && onAdd?.(b.type)}
              disabled={disabled}
              className={`flex flex-col items-start gap-1.5 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition dark:border-slate-700 dark:bg-slate-900 ${
                disabled
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-grab hover:border-indigo-300 hover:bg-indigo-50/40 active:cursor-grabbing dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10'
              }`}
              title={disabled ? 'Read only' : `Drag or click to add ${b.label}`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {b.label}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {b.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
