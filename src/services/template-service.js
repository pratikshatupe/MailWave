/**
 * services/template-service.js
 *
 * Frontend service layer for the Templates module. Mirrors the contact
 * service pattern — all reads / writes persist to localStorage so the
 * module is fully usable with no backend. The function signatures match
 * the documented REST endpoints, so swapping to an axios implementation
 * is a single-file change.
 *
 * If `import.meta.env.VITE_API_BASE_URL` is set we make a best-effort REST
 * call first and fall back to local storage on failure, keeping the demo
 * resilient when the API is offline.
 *
 * Storage keys:
 *   mailwave-templates           → template records (user + gallery)
 *
 * Public API:
 *   getTemplates(params)
 *   getTemplateById(id)
 *   createTemplate(payload)
 *   updateTemplate(id, payload)
 *   deleteTemplate(id)
 *   duplicateTemplate(id)
 *   previewTemplate(id, sampleData)
 *   publishTemplate(id)
 *   archiveTemplate(id)
 *   uploadTemplateImage(file)
 *   resetTemplateStorage()
 */

import {
  renderBlocksToHtml,
  renderBlocksToText,
  extractMergeTags,
  replaceMergeTags,
  DEFAULT_SAMPLE_DATA,
} from '../utils/template-renderer.js';

const STORAGE_KEY = 'mailwave-templates';

export const TEMPLATE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const TEMPLATE_CATEGORIES = [
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'drip', label: 'Drip' },
  { value: 'custom', label: 'Custom' },
];

export const EDITOR_MODES = [
  { value: 'drag_drop', label: 'Drag and Drop' },
  { value: 'html', label: 'HTML' },
];

export const STATUS_OPTIONS = [
  { value: TEMPLATE_STATUS.DRAFT, label: 'Draft' },
  { value: TEMPLATE_STATUS.PUBLISHED, label: 'Published' },
  { value: TEMPLATE_STATUS.ARCHIVED, label: 'Archived' },
];

export const SUPPORTED_BLOCK_TYPES = [
  'text',
  'image',
  'button',
  'divider',
  'spacer',
  'columns',
  'header',
  'footer',
  'social',
];

export const MERGE_TAGS = [
  { tag: 'name', label: 'Full name', sample: 'Rahul Sharma' },
  { tag: 'first_name', label: 'First name', sample: 'Rahul' },
  { tag: 'last_name', label: 'Last name', sample: 'Sharma' },
  { tag: 'email', label: 'Email ID', sample: 'rahul@example.com' },
  { tag: 'company', label: 'Company', sample: 'MailWave' },
  { tag: 'unsubscribe_url', label: 'Unsubscribe link', sample: '#unsubscribe' },
];

/* ------------------------------ helpers ------------------------------ */

function isBrowser() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function read(fallback) {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function write(value) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix = 'tpl') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function newBlockId() {
  return `block_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function getApiBaseUrl() {
  try {
    return (
      (typeof import.meta !== 'undefined' &&
        import.meta.env &&
        import.meta.env.VITE_API_BASE_URL) ||
      ''
    );
  } catch {
    return '';
  }
}

function getAuthToken() {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem('mailwave-auth');
    if (!raw) return null;
    return JSON.parse(raw)?.token || null;
  } catch {
    return null;
  }
}

async function apiCall(path, options = {}) {
  const base = getApiBaseUrl();
  if (!base) throw new Error('NO_API');
  const token = getAuthToken();
  const headers = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${base.replace(/\/$/, '')}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    const err = new Error(errBody || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

/* ------------------------------- Seed -------------------------------- */

function defaultBlocksForCategory(category) {
  switch (category) {
    case 'welcome':
      return seedWelcome();
    case 'promotional':
      return seedPromotional();
    case 'transactional':
      return seedTransactional();
    case 'newsletter':
      return seedNewsletter();
    default:
      return seedNewsletter();
  }
}

function blk(type, content = {}, styles = {}) {
  return {
    id: newBlockId(),
    type,
    content,
    styles,
    order: 0,
  };
}

function withOrder(blocks) {
  return blocks.map((b, i) => ({ ...b, order: i + 1 }));
}

function seedWelcome() {
  return withOrder([
    blk(
      'header',
      { heading: 'Welcome to MailWave', logoUrl: '' },
      { backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'center', padding: '28px' }
    ),
    blk('text', {
      text:
        'Hi {{first_name}},\n\nThanks for joining us. We are excited to help you build campaigns your audience actually wants to open.',
    }),
    blk('button', { text: 'Open Dashboard', url: '#dashboard' }),
    blk('footer', {
      text: 'MailWave',
      address: 'Mumbai, India',
      unsubscribeUrl: '{{unsubscribe_url}}',
    }),
  ]);
}

function seedPromotional() {
  return withOrder([
    blk('header', { heading: 'Black Friday — 40% off' }, { backgroundColor: '#1e1b4b', color: '#ffffff', padding: '28px', textAlign: 'center' }),
    blk('text', { text: 'Hi {{name}}, our biggest sale of the year starts now. Use code BF40 at checkout.' }),
    blk('button', { text: 'Shop Now', url: '#shop' }, { backgroundColor: '#ef4444' }),
    blk('divider', {}),
    blk('text', { text: 'Offer ends Sunday. Terms apply.' }, { fontSize: '12px', color: '#64748b' }),
    blk('footer', { text: 'MailWave', address: '', unsubscribeUrl: '{{unsubscribe_url}}' }),
  ]);
}

function seedTransactional() {
  return withOrder([
    blk('header', { heading: 'Your receipt' }, { backgroundColor: '#f1f5f9', color: '#0f172a', padding: '20px', textAlign: 'left' }),
    blk('text', { text: 'Hi {{name}},\n\nThanks for your order. Your invoice is attached.' }),
    blk('footer', { text: 'MailWave Inc.', address: 'GSTIN — 27AAAAA0000A1Z5', unsubscribeUrl: '{{unsubscribe_url}}' }),
  ]);
}

function seedNewsletter() {
  return withOrder([
    blk('header', { heading: 'MailWave Weekly' }, { backgroundColor: '#0ea5e9', color: '#ffffff', padding: '24px', textAlign: 'center' }),
    blk('text', { text: 'Hi {{first_name}}, here are this week\'s top reads.' }),
    blk('columns', { left: 'Article one — short description goes here.', right: 'Article two — short description goes here.' }),
    blk('button', { text: 'Read more', url: '#blog' }),
    blk('footer', { text: 'MailWave', address: '', unsubscribeUrl: '{{unsubscribe_url}}' }),
  ]);
}

const SEED_TEMPLATES = [
  {
    id: 'tpl-seed-welcome',
    name: 'Welcome — Friendly',
    description: 'Friendly welcome message for new sign-ups.',
    category: 'welcome',
    subject: 'Welcome to {{company}}, {{first_name}}!',
    previewText: 'A quick hello and a few helpful links to get you started.',
    editorMode: 'drag_drop',
    status: TEMPLATE_STATUS.PUBLISHED,
    blocks: seedWelcome(),
    htmlContent: '',
    textContent: '',
    mergeTags: [],
    thumbnailUrl: '',
    isGalleryTemplate: true,
    isShared: true,
    createdAt: '2026-03-12T09:00:00.000Z',
    updatedAt: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'tpl-seed-promo',
    name: 'Black Friday Drop',
    description: 'Promotional template with a hero CTA.',
    category: 'promotional',
    subject: 'Black Friday — 40% off everything',
    previewText: 'Two days only. Don\'t miss the biggest sale of the year.',
    editorMode: 'drag_drop',
    status: TEMPLATE_STATUS.DRAFT,
    blocks: seedPromotional(),
    htmlContent: '',
    textContent: '',
    mergeTags: [],
    thumbnailUrl: '',
    isGalleryTemplate: true,
    isShared: false,
    createdAt: '2026-04-18T09:00:00.000Z',
    updatedAt: '2026-05-02T10:00:00.000Z',
  },
  {
    id: 'tpl-seed-receipt',
    name: 'Receipt — Minimal',
    description: 'Lightweight transactional receipt template.',
    category: 'transactional',
    subject: 'Your receipt from MailWave',
    previewText: 'Order confirmation and invoice attached.',
    editorMode: 'drag_drop',
    status: TEMPLATE_STATUS.PUBLISHED,
    blocks: seedTransactional(),
    htmlContent: '',
    textContent: '',
    mergeTags: [],
    thumbnailUrl: '',
    isGalleryTemplate: true,
    isShared: true,
    createdAt: '2026-02-06T09:00:00.000Z',
    updatedAt: '2026-05-06T10:00:00.000Z',
  },
  {
    id: 'tpl-seed-news',
    name: 'Weekly Newsletter',
    description: 'Two-column newsletter with curated stories.',
    category: 'newsletter',
    subject: 'MailWave Weekly — top reads',
    previewText: 'Three things worth your time this week.',
    editorMode: 'drag_drop',
    status: TEMPLATE_STATUS.PUBLISHED,
    blocks: seedNewsletter(),
    htmlContent: '',
    textContent: '',
    mergeTags: [],
    thumbnailUrl: '',
    isGalleryTemplate: false,
    isShared: false,
    createdAt: '2026-05-02T09:00:00.000Z',
    updatedAt: '2026-05-02T09:00:00.000Z',
  },
  {
    id: 'tpl-seed-html',
    name: 'Raw HTML — Holiday',
    description: 'Hand-crafted HTML template for holiday greetings.',
    category: 'custom',
    subject: 'Happy holidays, {{first_name}}',
    previewText: 'Wishing you and yours a wonderful season.',
    editorMode: 'html',
    status: TEMPLATE_STATUS.DRAFT,
    blocks: [],
    htmlContent:
      '<!doctype html><html><body style="font-family:Arial;background:#fdf6e3;padding:24px;"><h1>Happy holidays, {{first_name}}!</h1><p>Wishing you a wonderful season from the {{company}} team.</p><p><a href="{{unsubscribe_url}}">Unsubscribe</a></p></body></html>',
    textContent:
      'Happy holidays, {{first_name}}! Wishing you a wonderful season from the {{company}} team.',
    mergeTags: ['first_name', 'company', 'unsubscribe_url'],
    thumbnailUrl: '',
    isGalleryTemplate: true,
    isShared: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-12T09:00:00.000Z',
  },
];

function seed() {
  if (!isBrowser()) return;
  if (!window.localStorage.getItem(STORAGE_KEY)) {
    write(
      SEED_TEMPLATES.map((t) => ({
        ...t,
        mergeTags: collectMergeTags(t),
      }))
    );
  }
}

function rawTemplates() {
  seed();
  return read([]);
}

function collectMergeTags(template) {
  const sources = [
    template.subject,
    template.previewText,
    template.htmlContent,
    template.textContent,
    JSON.stringify(template.blocks || []),
  ];
  const set = new Set();
  sources.forEach((s) => extractMergeTags(s).forEach((t) => set.add(t)));
  return Array.from(set);
}

/**
 * Ensure derived fields (htmlContent, textContent, mergeTags) reflect the
 * payload's editor mode and blocks. We always regenerate htmlContent for
 * drag-drop templates so the backend store stays in sync; for raw HTML
 * templates we trust the user's htmlContent and just extract tags from it.
 */
function normalisePayload(payload, existing = null) {
  const editorMode = payload.editorMode || existing?.editorMode || 'drag_drop';
  let blocks = payload.blocks ?? existing?.blocks ?? [];
  let htmlContent = payload.htmlContent ?? existing?.htmlContent ?? '';
  let textContent = payload.textContent ?? existing?.textContent ?? '';

  if (editorMode === 'drag_drop') {
    blocks = withOrder(Array.isArray(blocks) ? blocks : []);
    htmlContent = renderBlocksToHtml(blocks, {
      title: payload.name || existing?.name || 'Email',
    });
    textContent = renderBlocksToText(blocks);
  } else {
    blocks = [];
    htmlContent = String(htmlContent || '');
    if (!textContent) {
      textContent = htmlContent
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }

  const merged = {
    ...(existing || {}),
    ...payload,
    editorMode,
    blocks,
    htmlContent,
    textContent,
  };
  merged.mergeTags = collectMergeTags(merged);
  return merged;
}

/* ------------------------------ Local helpers ------------------------------ */

function applyFilters(list, params = {}) {
  let next = list.slice();
  if (params.status) next = next.filter((t) => t.status === params.status);
  if (params.category) next = next.filter((t) => t.category === params.category);
  if (params.editorMode) next = next.filter((t) => t.editorMode === params.editorMode);
  if (typeof params.gallery === 'boolean') {
    next = next.filter((t) => Boolean(t.isGalleryTemplate) === params.gallery);
  }
  if (params.q) {
    const q = String(params.q).toLowerCase();
    next = next.filter((t) =>
      [t.name, t.subject, t.previewText, t.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }
  return next;
}

function sortByUpdated(list) {
  return list
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime()
    );
}

/* ------------------------------ Public API ------------------------------ */

export async function getTemplates(params = {}) {
  try {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') search.set(k, String(v));
    });
    const data = await apiCall(`/api/templates${search.toString() ? `?${search}` : ''}`);
    if (Array.isArray(data)) return sortByUpdated(data);
    if (data && Array.isArray(data.items)) return sortByUpdated(data.items);
  } catch {
    /* fall back to local */
  }
  return sortByUpdated(applyFilters(rawTemplates(), params));
}

export async function getTemplateById(id) {
  try {
    return await apiCall(`/api/templates/${encodeURIComponent(id)}`);
  } catch {
    return rawTemplates().find((t) => t.id === id) || null;
  }
}

export async function createTemplate(payload) {
  const normalised = normalisePayload({
    ...payload,
    status: payload.status || TEMPLATE_STATUS.DRAFT,
  });
  try {
    return await apiCall('/api/templates', {
      method: 'POST',
      body: JSON.stringify(normalised),
    });
  } catch {
    const list = rawTemplates();
    const record = {
      id: newId('tpl'),
      name: '',
      description: '',
      category: 'custom',
      subject: '',
      previewText: '',
      editorMode: 'drag_drop',
      status: TEMPLATE_STATUS.DRAFT,
      blocks: [],
      htmlContent: '',
      textContent: '',
      mergeTags: [],
      thumbnailUrl: '',
      isGalleryTemplate: false,
      isShared: false,
      ...normalised,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    list.push(record);
    write(list);
    return record;
  }
}

export async function updateTemplate(id, payload) {
  try {
    return await apiCall(`/api/templates/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  } catch {
    const list = rawTemplates();
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const next = normalisePayload(payload, list[idx]);
    list[idx] = { ...next, id, updatedAt: nowIso() };
    write(list);
    return list[idx];
  }
}

export async function deleteTemplate(id) {
  try {
    await apiCall(`/api/templates/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return true;
  } catch {
    const list = rawTemplates();
    const next = list.filter((t) => t.id !== id);
    write(next);
    return next.length !== list.length;
  }
}

export async function duplicateTemplate(id) {
  try {
    return await apiCall(
      `/api/templates/${encodeURIComponent(id)}/duplicate`,
      { method: 'POST' }
    );
  } catch {
    const list = rawTemplates();
    const original = list.find((t) => t.id === id);
    if (!original) return null;
    const copy = {
      ...original,
      id: newId('tpl'),
      name: `${original.name} (copy)`,
      blocks: (original.blocks || []).map((b) => ({ ...b, id: newBlockId() })),
      status: TEMPLATE_STATUS.DRAFT,
      isGalleryTemplate: false,
      isShared: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    list.push(copy);
    write(list);
    return copy;
  }
}

export async function previewTemplate(id, sampleData = DEFAULT_SAMPLE_DATA) {
  try {
    const result = await apiCall(
      `/api/templates/${encodeURIComponent(id)}/preview`,
      {
        method: 'POST',
        body: JSON.stringify({ sampleData }),
      }
    );
    if (result && (result.html || result.text)) return result;
  } catch {
    /* fall through to local render */
  }
  const template = rawTemplates().find((t) => t.id === id);
  if (!template) return null;
  return localPreview(template, sampleData);
}

export function localPreview(template, sampleData = DEFAULT_SAMPLE_DATA) {
  const html =
    template.editorMode === 'html'
      ? template.htmlContent || ''
      : renderBlocksToHtml(template.blocks || [], { title: template.name });
  const text =
    template.editorMode === 'html'
      ? template.textContent || ''
      : renderBlocksToText(template.blocks || []);
  return {
    subject: replaceMergeTags(template.subject || '', sampleData),
    previewText: replaceMergeTags(template.previewText || '', sampleData),
    html: replaceMergeTags(html, sampleData),
    text: replaceMergeTags(text, sampleData),
    rawHtml: html,
  };
}

export async function publishTemplate(id) {
  try {
    return await apiCall(
      `/api/templates/${encodeURIComponent(id)}/publish`,
      { method: 'PATCH' }
    );
  } catch {
    return updateTemplate(id, { status: TEMPLATE_STATUS.PUBLISHED });
  }
}

export async function archiveTemplate(id) {
  try {
    return await apiCall(`/api/templates/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ status: TEMPLATE_STATUS.ARCHIVED }),
    });
  } catch {
    return updateTemplate(id, { status: TEMPLATE_STATUS.ARCHIVED });
  }
}

export async function uploadTemplateImage(file) {
  if (!file) return null;
  try {
    const form = new FormData();
    form.append('file', file);
    const res = await apiCall('/api/templates/upload-image', {
      method: 'POST',
      body: form,
    });
    if (res && (res.url || res.location)) return res.url || res.location;
  } catch {
    /* fall back to data URL */
  }
  return readFileAsDataUrl(file);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function makeEmptyBlock(type) {
  switch (type) {
    case 'text':
      return blk(
        'text',
        { text: 'Hello {{first_name}}, welcome to our newsletter.' },
        {
          fontSize: '16px',
          color: '#111827',
          textAlign: 'left',
          padding: '16px',
          backgroundColor: 'transparent',
          fontWeight: '400',
        }
      );
    case 'image':
      return blk(
        'image',
        { url: '', alt: '', link: '' },
        { width: '100%', borderRadius: '12px', padding: '16px' }
      );
    case 'button':
      return blk(
        'button',
        { text: 'Shop Now', url: '#' },
        {
          backgroundColor: '#2563eb',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '12px 20px',
          textAlign: 'center',
        }
      );
    case 'divider':
      return blk(
        'divider',
        {},
        { color: '#e2e8f0', height: '1px', margin: '12px 16px' }
      );
    case 'spacer':
      return blk('spacer', {}, { height: '24px' });
    case 'columns':
      return blk(
        'columns',
        { left: 'Left column copy', right: 'Right column copy' },
        { gap: '16px', padding: '16px', stackOnMobile: true }
      );
    case 'header':
      return blk(
        'header',
        { heading: 'Your headline', logoUrl: '' },
        {
          backgroundColor: '#0f172a',
          color: '#ffffff',
          textAlign: 'center',
          padding: '24px',
          fontSize: '22px',
          fontWeight: '700',
        }
      );
    case 'footer':
      return blk(
        'footer',
        {
          text: 'MailWave',
          address: '',
          unsubscribeUrl: '{{unsubscribe_url}}',
        },
        {
          backgroundColor: '#f8fafc',
          color: '#475569',
          textAlign: 'center',
          padding: '20px',
          fontSize: '12px',
        }
      );
    case 'social':
      return blk(
        'social',
        {
          facebookUrl: '',
          instagramUrl: '',
          linkedinUrl: '',
          twitterUrl: '',
          youtubeUrl: '',
        },
        { padding: '16px', textAlign: 'center' }
      );
    default:
      return blk('text', { text: '' });
  }
}

export function makeBlockId() {
  return newBlockId();
}

export function defaultBlocksForNewTemplate(category) {
  return defaultBlocksForCategory(category);
}

export function resetTemplateStorage() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  seed();
}

export default {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  previewTemplate,
  publishTemplate,
  archiveTemplate,
  uploadTemplateImage,
  makeEmptyBlock,
  makeBlockId,
  defaultBlocksForNewTemplate,
  localPreview,
  resetTemplateStorage,
  TEMPLATE_STATUS,
  TEMPLATE_CATEGORIES,
  EDITOR_MODES,
  STATUS_OPTIONS,
  SUPPORTED_BLOCK_TYPES,
  MERGE_TAGS,
};
