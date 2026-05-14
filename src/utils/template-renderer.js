/**
 * utils/template-renderer.js
 *
 * Render drag-and-drop email-template blocks into HTML and plain text.
 * The output uses a simple table layout capped at 600px wide so the email
 * renders consistently across major mail clients while remaining responsive
 * on mobile in the in-app preview iframe.
 *
 * Public surface:
 *   renderBlocksToHtml(blocks, { title } = {}) -> string
 *   renderBlocksToText(blocks) -> string
 *   extractMergeTags(html) -> string[]
 *   replaceMergeTags(html, sampleData) -> string
 */

const DEFAULT_STYLES = {
  text: {
    fontSize: '16px',
    color: '#111827',
    textAlign: 'left',
    padding: '16px',
    backgroundColor: 'transparent',
    fontWeight: '400',
  },
  header: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    textAlign: 'center',
    padding: '24px',
    fontSize: '22px',
    fontWeight: '700',
  },
  footer: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    textAlign: 'center',
    padding: '20px',
    fontSize: '12px',
  },
  button: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '12px 20px',
    textAlign: 'center',
    fontWeight: '600',
  },
  image: {
    width: '100%',
    borderRadius: '12px',
    padding: '16px',
  },
  divider: {
    color: '#e2e8f0',
    height: '1px',
    margin: '12px 16px',
  },
  spacer: {
    height: '24px',
  },
  columns: {
    gap: '16px',
    padding: '16px',
    stackOnMobile: true,
  },
  social: {
    padding: '16px',
    textAlign: 'center',
  },
};

function styleObject(base = {}, overrides = {}) {
  return { ...base, ...(overrides || {}) };
}

function styleString(styleObj) {
  return Object.entries(styleObj || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${camelToKebab(k)}:${v}`)
    .join(';');
}

function camelToKebab(s) {
  return s.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/\n/g, ' ');
}

/* ------------------------------ Renderers ------------------------------ */

function renderText(block) {
  const styles = styleObject(DEFAULT_STYLES.text, block.styles);
  return `
    <tr>
      <td style="${styleString(styles)};font-family:Arial,Helvetica,sans-serif;line-height:1.6;word-break:break-word;">
        ${nl2br(escapeHtml(block.content?.text || ''))}
      </td>
    </tr>`;
}

function renderHeader(block) {
  const styles = styleObject(DEFAULT_STYLES.header, block.styles);
  const logoUrl = block.content?.logoUrl;
  const heading = block.content?.heading || '';
  return `
    <tr>
      <td style="${styleString(styles)};font-family:Arial,Helvetica,sans-serif;">
        ${
          logoUrl
            ? `<img src="${escapeAttr(logoUrl)}" alt="Logo" style="max-height:48px;display:block;margin:0 auto 12px;" />`
            : ''
        }
        ${heading ? `<div style="font-size:inherit;font-weight:inherit;">${escapeHtml(heading)}</div>` : ''}
      </td>
    </tr>`;
}

function renderFooter(block) {
  const styles = styleObject(DEFAULT_STYLES.footer, block.styles);
  const text = block.content?.text || '';
  const address = block.content?.address || '';
  const unsubscribeUrl =
    block.content?.unsubscribeUrl || '{{unsubscribe_url}}';
  return `
    <tr>
      <td style="${styleString(styles)};font-family:Arial,Helvetica,sans-serif;line-height:1.6;">
        ${text ? `<div style="margin-bottom:8px;">${escapeHtml(text)}</div>` : ''}
        ${address ? `<div style="margin-bottom:8px;">${escapeHtml(address)}</div>` : ''}
        <div><a href="${escapeAttr(unsubscribeUrl)}" style="color:inherit;text-decoration:underline;">Unsubscribe</a></div>
      </td>
    </tr>`;
}

function renderImage(block) {
  const styles = styleObject(DEFAULT_STYLES.image, block.styles);
  const url = block.content?.url;
  const alt = block.content?.alt || '';
  const link = block.content?.link;
  if (!url) {
    return `
      <tr>
        <td style="padding:16px;font-family:Arial,Helvetica,sans-serif;color:#94a3b8;text-align:center;font-size:13px;">
          [Image placeholder]
        </td>
      </tr>`;
  }
  const imgStyle = styleString({
    display: 'block',
    maxWidth: '100%',
    width: styles.width,
    borderRadius: styles.borderRadius,
    margin: '0 auto',
  });
  const img = `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" style="${imgStyle}" />`;
  const wrapped = link
    ? `<a href="${escapeAttr(link)}" style="text-decoration:none;">${img}</a>`
    : img;
  return `
    <tr>
      <td style="padding:${styles.padding};">
        ${wrapped}
      </td>
    </tr>`;
}

function renderButton(block) {
  const styles = styleObject(DEFAULT_STYLES.button, block.styles);
  const text = block.content?.text || 'Click here';
  const url = block.content?.url || '#';
  const align = styles.textAlign || 'center';
  const cellPadding = block.styles?.outerPadding || '12px 16px';
  const btnStyle = styleString({
    backgroundColor: styles.backgroundColor,
    color: styles.color,
    borderRadius: styles.borderRadius,
    padding: styles.padding,
    fontWeight: styles.fontWeight,
    textDecoration: 'none',
    display: 'inline-block',
    fontFamily: 'Arial,Helvetica,sans-serif',
  });
  return `
    <tr>
      <td align="${align}" style="padding:${cellPadding};text-align:${align};">
        <a href="${escapeAttr(url)}" style="${btnStyle}">${escapeHtml(text)}</a>
      </td>
    </tr>`;
}

function renderDivider(block) {
  const styles = styleObject(DEFAULT_STYLES.divider, block.styles);
  return `
    <tr>
      <td style="padding:0;">
        <div style="border-top:${styles.height || '1px'} solid ${styles.color || '#e2e8f0'};margin:${styles.margin || '12px 16px'};"></div>
      </td>
    </tr>`;
}

function renderSpacer(block) {
  const styles = styleObject(DEFAULT_STYLES.spacer, block.styles);
  return `
    <tr>
      <td style="font-size:0;line-height:0;height:${styles.height};">&nbsp;</td>
    </tr>`;
}

function renderColumns(block) {
  const styles = styleObject(DEFAULT_STYLES.columns, block.styles);
  const left = block.content?.left || '';
  const right = block.content?.right || '';
  const gap = styles.gap || '16px';
  const stack = styles.stackOnMobile !== false;
  // Use a percentage table so we can target sm screens with a small media
  // query embedded in the head (kept in the email document below).
  return `
    <tr>
      <td style="padding:${styles.padding};">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
          <tr>
            <td class="mw-col" valign="top" style="width:50%;padding-right:${stack ? '0' : gap};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;line-height:1.6;vertical-align:top;">
              ${nl2br(escapeHtml(left))}
            </td>
            <td class="mw-col" valign="top" style="width:50%;padding-left:${stack ? '0' : gap};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;line-height:1.6;vertical-align:top;">
              ${nl2br(escapeHtml(right))}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function renderSocial(block) {
  const styles = styleObject(DEFAULT_STYLES.social, block.styles);
  const items = [
    ['facebook', 'Facebook', block.content?.facebookUrl],
    ['instagram', 'Instagram', block.content?.instagramUrl],
    ['linkedin', 'LinkedIn', block.content?.linkedinUrl],
    ['twitter', 'X', block.content?.twitterUrl],
    ['youtube', 'YouTube', block.content?.youtubeUrl],
  ].filter(([, , url]) => Boolean(url));
  if (items.length === 0) {
    return `
      <tr>
        <td style="padding:${styles.padding};text-align:${styles.textAlign};font-family:Arial,Helvetica,sans-serif;color:#94a3b8;font-size:13px;">
          [Add social links]
        </td>
      </tr>`;
  }
  const links = items
    .map(
      ([, label, url]) =>
        `<a href="${escapeAttr(url)}" style="margin:0 8px;color:#2563eb;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:13px;">${escapeHtml(label)}</a>`
    )
    .join('');
  return `
    <tr>
      <td style="padding:${styles.padding};text-align:${styles.textAlign};">
        ${links}
      </td>
    </tr>`;
}

function nl2br(s) {
  return String(s ?? '').replace(/\n/g, '<br />');
}

const RENDERERS = {
  text: renderText,
  header: renderHeader,
  footer: renderFooter,
  image: renderImage,
  button: renderButton,
  divider: renderDivider,
  spacer: renderSpacer,
  columns: renderColumns,
  social: renderSocial,
};

export function renderBlocksToHtml(blocks = [], { title = 'Email' } = {}) {
  const ordered = [...(blocks || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const rows = ordered
    .map((block) => {
      const fn = RENDERERS[block.type];
      return fn ? fn(block) : '';
    })
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  body { margin:0; padding:0; background:#f1f5f9; }
  table { border-collapse:collapse; }
  img { border:0; outline:none; text-decoration:none; }
  @media only screen and (max-width: 480px) {
    .mw-container { width:100% !important; max-width:100% !important; }
    .mw-col { display:block !important; width:100% !important; padding:8px 0 !important; }
  }
</style>
</head>
<body>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f1f5f9;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="mw-container" style="width:600px;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,0.06);">
          ${rows}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderBlocksToText(blocks = []) {
  const ordered = [...(blocks || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const parts = ordered.map((block) => {
    switch (block.type) {
      case 'text':
        return (block.content?.text || '').trim();
      case 'header':
        return (block.content?.heading || '').trim();
      case 'footer': {
        const t = (block.content?.text || '').trim();
        const a = (block.content?.address || '').trim();
        return [t, a, 'Unsubscribe: {{unsubscribe_url}}']
          .filter(Boolean)
          .join('\n');
      }
      case 'button': {
        const text = (block.content?.text || '').trim();
        const url = (block.content?.url || '').trim();
        return text ? `${text}${url ? ` (${url})` : ''}` : '';
      }
      case 'image':
        return block.content?.alt
          ? `[Image: ${block.content.alt}]`
          : '[Image]';
      case 'divider':
        return '------------------------------';
      case 'spacer':
        return '';
      case 'columns': {
        const left = (block.content?.left || '').trim();
        const right = (block.content?.right || '').trim();
        return [left, right].filter(Boolean).join('\n');
      }
      case 'social': {
        const items = [
          ['Facebook', block.content?.facebookUrl],
          ['Instagram', block.content?.instagramUrl],
          ['LinkedIn', block.content?.linkedinUrl],
          ['X', block.content?.twitterUrl],
          ['YouTube', block.content?.youtubeUrl],
        ].filter(([, url]) => Boolean(url));
        return items.map(([label, url]) => `${label}: ${url}`).join('\n');
      }
      default:
        return '';
    }
  });
  return parts.filter(Boolean).join('\n\n');
}

const MERGE_TAG_RE = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

export function extractMergeTags(input) {
  if (!input) return [];
  const text = typeof input === 'string' ? input : JSON.stringify(input);
  const set = new Set();
  let m;
  while ((m = MERGE_TAG_RE.exec(text)) !== null) {
    set.add(m[1]);
  }
  return Array.from(set);
}

export function replaceMergeTags(input, sampleData = {}) {
  if (input == null) return '';
  return String(input).replace(MERGE_TAG_RE, (_, key) => {
    const value = sampleData[key];
    if (value === undefined || value === null) return `{{${key}}}`;
    return String(value);
  });
}

export const DEFAULT_SAMPLE_DATA = {
  name: 'Rahul',
  first_name: 'Rahul',
  last_name: 'Sharma',
  email: 'rahul@example.com',
  company: 'MailWave',
  unsubscribe_url: '#unsubscribe',
};

export default {
  renderBlocksToHtml,
  renderBlocksToText,
  extractMergeTags,
  replaceMergeTags,
  DEFAULT_SAMPLE_DATA,
};
