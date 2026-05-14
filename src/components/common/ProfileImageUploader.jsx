import { useRef, useState } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';

/**
 * ProfileImageUploader
 *
 * Local image picker for the user / tenant avatar. Validates type and
 * size, shows a live preview, and emits a data: URL via onChange so the
 * parent can persist it (AuthContext.updateUser stores it in
 * localStorage, so it survives refresh and is read by Sidebar / Topbar
 * immediately).
 *
 * NOTE: no backend in this repo — the persistence layer is localStorage.
 * When the backend ships, replace the onChange wiring in the parent
 * with an upload call and store the returned URL.
 */
const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export default function ProfileImageUploader({
  value,
  initials = 'U',
  onChange,
  onError,
  size = 'lg',
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const dim = size === 'lg' ? 'h-24 w-24 text-2xl' : 'h-16 w-16 text-lg';

  function pick() {
    inputRef.current?.click();
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      onError?.('Only JPG, PNG and WEBP images are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_BYTES) {
      onError?.('Image must be 2 MB or smaller.');
      e.target.value = '';
      return;
    }
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange?.(reader.result);
      setBusy(false);
    };
    reader.onerror = () => {
      onError?.('Could not read this file.');
      setBusy(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function clear() {
    onChange?.(null);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative inline-grid place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 font-bold text-white shadow-glow ${dim}`}
      >
        {value ? (
          <img
            src={value}
            alt="Profile"
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <span>{initials}</span>
        )}
        <button
          type="button"
          onClick={pick}
          disabled={busy}
          className="absolute bottom-1 right-1 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-slate-900/70 text-white transition hover:bg-slate-900 disabled:opacity-60"
          aria-label="Change photo"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={pick}
          disabled={busy}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <Upload className="h-3.5 w-3.5" /> {value ? 'Replace' : 'Upload'}
        </button>
        {value && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
        JPG, PNG, WEBP &middot; up to 2 MB
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
