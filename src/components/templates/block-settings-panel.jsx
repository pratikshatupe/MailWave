/**
 * block-settings-panel.jsx
 *
 * Right-side block configuration panel. Renders a different set of fields
 * per block type, all writing back through `onUpdate(nextBlock)`.
 *
 * For brand consistency, structural inputs (label / placeholder / dark
 * mode classes) are taken from the central UI components - InputField,
 * SelectField, TextAreaField - so the panel always matches the rest of
 * the product.
 */

import { useRef } from 'react';
import { Upload, Trash2, ImagePlus, ArrowUp, ArrowDown, Copy } from 'lucide-react';
import InputField from '../ui/InputField.jsx';
import SelectField from '../ui/SelectField.jsx';
import TextAreaField from '../ui/TextAreaField.jsx';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import { uploadTemplateImage } from '../../services/template-service.js';

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const FONT_WEIGHTS = [
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
];

function ColorField({ label, value, onChange }) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-10 cursor-pointer rounded border border-slate-200 bg-transparent dark:border-slate-700"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
        />
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, suffix = 'px', min = 0, step = 1 }) {
  const raw = String(value || '').replace(suffix, '').trim();
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        {label}
      </label>
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
        <input
          type="number"
          value={raw}
          min={min}
          step={step}
          onChange={(e) => onChange(e.target.value ? `${e.target.value}${suffix}` : '')}
          className="flex-1 bg-transparent text-sm text-slate-800 outline-none dark:text-slate-100"
        />
        <span className="text-xs text-slate-400 dark:text-slate-500">{suffix}</span>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </h5>
      {children}
    </div>
  );
}

export default function BlockSettingsPanel({
  block,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  readOnly = false,
}) {
  const fileInputRef = useRef(null);

  if (!block) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        Select a block to edit its settings.
      </div>
    );
  }

  function patchContent(patch) {
    onUpdate?.({
      ...block,
      content: { ...(block.content || {}), ...patch },
    });
  }

  function patchStyles(patch) {
    onUpdate?.({
      ...block,
      styles: { ...(block.styles || {}), ...patch },
    });
  }

  async function handleUploadImage(file) {
    if (!file) return;
    const url = await uploadTemplateImage(file);
    if (url) patchContent({ url });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Badge tone="indigo">{block.type}</Badge>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Block settings
          </p>
        </div>
        {!readOnly && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Move up"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Move down"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Duplicate"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {block.type === 'text' && (
        <>
          <Section title="Content">
            <TextAreaField
              name="text"
              label="Text content"
              value={block.content?.text || ''}
              onChange={(e) => patchContent({ text: e.target.value })}
              rows={4}
              maxLength={2000}
              disabled={readOnly}
            />
          </Section>
          <Section title="Style">
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Font size"
                value={block.styles?.fontSize || '16px'}
                onChange={(v) => patchStyles({ fontSize: v })}
              />
              <SelectField
                name="fontWeight"
                label="Weight"
                value={block.styles?.fontWeight || '400'}
                onChange={(e) => patchStyles({ fontWeight: e.target.value })}
                options={FONT_WEIGHTS}
                disabled={readOnly}
              />
              <SelectField
                name="textAlign"
                label="Alignment"
                value={block.styles?.textAlign || 'left'}
                onChange={(e) => patchStyles({ textAlign: e.target.value })}
                options={ALIGN_OPTIONS}
                disabled={readOnly}
              />
              <NumberInput
                label="Padding"
                value={block.styles?.padding || '16px'}
                onChange={(v) => patchStyles({ padding: v })}
              />
              <ColorField
                label="Text color"
                value={block.styles?.color}
                onChange={(v) => patchStyles({ color: v })}
              />
              <ColorField
                label="Background"
                value={block.styles?.backgroundColor}
                onChange={(v) => patchStyles({ backgroundColor: v })}
              />
            </div>
          </Section>
        </>
      )}

      {block.type === 'image' && (
        <>
          <Section title="Image source">
            <InputField
              name="url"
              label="Image URL"
              value={block.content?.url || ''}
              onChange={(e) => patchContent({ url: e.target.value })}
              placeholder="https://..."
              disabled={readOnly}
            />
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleUploadImage(e.target.files?.[0])}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={readOnly}
                className="w-full"
              >
                <Upload className="h-4 w-4" /> Upload image
              </Button>
            </div>
            {block.content?.url && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/50">
                <img
                  src={block.content.url}
                  alt={block.content?.alt || 'Preview'}
                  className="mx-auto max-h-32 rounded-lg object-contain"
                />
              </div>
            )}
          </Section>
          <Section title="Details">
            <InputField
              name="alt"
              label="Alt text"
              value={block.content?.alt || ''}
              onChange={(e) => patchContent({ alt: e.target.value })}
              placeholder="Describe the image"
              disabled={readOnly}
            />
            <InputField
              name="link"
              label="Click-through URL"
              value={block.content?.link || ''}
              onChange={(e) => patchContent({ link: e.target.value })}
              placeholder="https://... (optional)"
              disabled={readOnly}
            />
          </Section>
          <Section title="Style">
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Width"
                suffix="%"
                value={(block.styles?.width || '100%').replace('px', '')}
                onChange={(v) =>
                  patchStyles({
                    width: v.endsWith('%') ? v : `${parseInt(v, 10) || 100}%`,
                  })
                }
              />
              <NumberInput
                label="Border radius"
                value={block.styles?.borderRadius || '12px'}
                onChange={(v) => patchStyles({ borderRadius: v })}
              />
              <NumberInput
                label="Padding"
                value={block.styles?.padding || '16px'}
                onChange={(v) => patchStyles({ padding: v })}
              />
            </div>
          </Section>
        </>
      )}

      {block.type === 'button' && (
        <>
          <Section title="Content">
            <InputField
              name="text"
              label="Button text"
              value={block.content?.text || ''}
              onChange={(e) => patchContent({ text: e.target.value })}
              placeholder="Shop Now"
              disabled={readOnly}
            />
            <InputField
              name="url"
              label="Button URL"
              value={block.content?.url || ''}
              onChange={(e) => patchContent({ url: e.target.value })}
              placeholder="https://..."
              disabled={readOnly}
            />
          </Section>
          <Section title="Style">
            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Background"
                value={block.styles?.backgroundColor}
                onChange={(v) => patchStyles({ backgroundColor: v })}
              />
              <ColorField
                label="Text color"
                value={block.styles?.color}
                onChange={(v) => patchStyles({ color: v })}
              />
              <NumberInput
                label="Radius"
                value={block.styles?.borderRadius || '8px'}
                onChange={(v) => patchStyles({ borderRadius: v })}
              />
              <SelectField
                name="textAlign"
                label="Alignment"
                value={block.styles?.textAlign || 'center'}
                onChange={(e) => patchStyles({ textAlign: e.target.value })}
                options={ALIGN_OPTIONS}
                disabled={readOnly}
              />
              <InputField
                name="padding"
                label="Padding"
                value={block.styles?.padding || '12px 20px'}
                onChange={(e) => patchStyles({ padding: e.target.value })}
                placeholder="12px 20px"
                disabled={readOnly}
              />
            </div>
          </Section>
        </>
      )}

      {block.type === 'divider' && (
        <Section title="Style">
          <div className="grid grid-cols-2 gap-3">
            <ColorField
              label="Line color"
              value={block.styles?.color}
              onChange={(v) => patchStyles({ color: v })}
            />
            <NumberInput
              label="Line height"
              value={block.styles?.height || '1px'}
              onChange={(v) => patchStyles({ height: v })}
            />
            <InputField
              name="margin"
              label="Margin"
              value={block.styles?.margin || '12px 16px'}
              onChange={(e) => patchStyles({ margin: e.target.value })}
              placeholder="12px 16px"
              disabled={readOnly}
            />
          </div>
        </Section>
      )}

      {block.type === 'spacer' && (
        <Section title="Style">
          <NumberInput
            label="Height"
            value={block.styles?.height || '24px'}
            onChange={(v) => patchStyles({ height: v })}
          />
        </Section>
      )}

      {block.type === 'columns' && (
        <>
          <Section title="Content">
            <TextAreaField
              name="left"
              label="Left column"
              value={block.content?.left || ''}
              onChange={(e) => patchContent({ left: e.target.value })}
              rows={3}
              maxLength={1000}
              disabled={readOnly}
            />
            <TextAreaField
              name="right"
              label="Right column"
              value={block.content?.right || ''}
              onChange={(e) => patchContent({ right: e.target.value })}
              rows={3}
              maxLength={1000}
              disabled={readOnly}
            />
          </Section>
          <Section title="Style">
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Gap"
                value={block.styles?.gap || '16px'}
                onChange={(v) => patchStyles({ gap: v })}
              />
              <NumberInput
                label="Padding"
                value={block.styles?.padding || '16px'}
                onChange={(v) => patchStyles({ padding: v })}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={block.styles?.stackOnMobile !== false}
                onChange={(e) => patchStyles({ stackOnMobile: e.target.checked })}
                disabled={readOnly}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Stack columns on mobile
            </label>
          </Section>
        </>
      )}

      {block.type === 'header' && (
        <>
          <Section title="Content">
            <InputField
              name="heading"
              label="Heading text"
              value={block.content?.heading || ''}
              onChange={(e) => patchContent({ heading: e.target.value })}
              placeholder="Your headline"
              disabled={readOnly}
            />
            <InputField
              name="logoUrl"
              label="Logo image URL"
              value={block.content?.logoUrl || ''}
              onChange={(e) => patchContent({ logoUrl: e.target.value })}
              placeholder="https://..."
              disabled={readOnly}
              icon={ImagePlus}
            />
          </Section>
          <Section title="Style">
            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Background"
                value={block.styles?.backgroundColor}
                onChange={(v) => patchStyles({ backgroundColor: v })}
              />
              <ColorField
                label="Text color"
                value={block.styles?.color}
                onChange={(v) => patchStyles({ color: v })}
              />
              <SelectField
                name="textAlign"
                label="Alignment"
                value={block.styles?.textAlign || 'center'}
                onChange={(e) => patchStyles({ textAlign: e.target.value })}
                options={ALIGN_OPTIONS}
                disabled={readOnly}
              />
              <NumberInput
                label="Padding"
                value={block.styles?.padding || '24px'}
                onChange={(v) => patchStyles({ padding: v })}
              />
            </div>
          </Section>
        </>
      )}

      {block.type === 'footer' && (
        <>
          <Section title="Content">
            <InputField
              name="text"
              label="Footer text"
              value={block.content?.text || ''}
              onChange={(e) => patchContent({ text: e.target.value })}
              placeholder="MailWave Inc."
              disabled={readOnly}
            />
            <TextAreaField
              name="address"
              label="Address"
              value={block.content?.address || ''}
              onChange={(e) => patchContent({ address: e.target.value })}
              rows={2}
              maxLength={300}
              disabled={readOnly}
            />
            <InputField
              name="unsubscribeUrl"
              label="Unsubscribe link"
              value={block.content?.unsubscribeUrl || '{{unsubscribe_url}}'}
              onChange={(e) => patchContent({ unsubscribeUrl: e.target.value })}
              placeholder="{{unsubscribe_url}}"
              disabled={readOnly}
            />
          </Section>
          <Section title="Style">
            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Background"
                value={block.styles?.backgroundColor}
                onChange={(v) => patchStyles({ backgroundColor: v })}
              />
              <ColorField
                label="Text color"
                value={block.styles?.color}
                onChange={(v) => patchStyles({ color: v })}
              />
              <SelectField
                name="textAlign"
                label="Alignment"
                value={block.styles?.textAlign || 'center'}
                onChange={(e) => patchStyles({ textAlign: e.target.value })}
                options={ALIGN_OPTIONS}
                disabled={readOnly}
              />
              <NumberInput
                label="Padding"
                value={block.styles?.padding || '20px'}
                onChange={(v) => patchStyles({ padding: v })}
              />
            </div>
          </Section>
        </>
      )}

      {block.type === 'social' && (
        <Section title="Social URLs">
          <InputField
            name="facebookUrl"
            label="Facebook URL"
            value={block.content?.facebookUrl || ''}
            onChange={(e) => patchContent({ facebookUrl: e.target.value })}
            placeholder="https://facebook.com/..."
            disabled={readOnly}
          />
          <InputField
            name="instagramUrl"
            label="Instagram URL"
            value={block.content?.instagramUrl || ''}
            onChange={(e) => patchContent({ instagramUrl: e.target.value })}
            placeholder="https://instagram.com/..."
            disabled={readOnly}
          />
          <InputField
            name="linkedinUrl"
            label="LinkedIn URL"
            value={block.content?.linkedinUrl || ''}
            onChange={(e) => patchContent({ linkedinUrl: e.target.value })}
            placeholder="https://linkedin.com/..."
            disabled={readOnly}
          />
          <InputField
            name="twitterUrl"
            label="X / Twitter URL"
            value={block.content?.twitterUrl || ''}
            onChange={(e) => patchContent({ twitterUrl: e.target.value })}
            placeholder="https://x.com/..."
            disabled={readOnly}
          />
          <InputField
            name="youtubeUrl"
            label="YouTube URL"
            value={block.content?.youtubeUrl || ''}
            onChange={(e) => patchContent({ youtubeUrl: e.target.value })}
            placeholder="https://youtube.com/..."
            disabled={readOnly}
          />
        </Section>
      )}
    </div>
  );
}

