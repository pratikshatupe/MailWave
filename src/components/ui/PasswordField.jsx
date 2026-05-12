/**
 * PasswordField
 *
 * Toggle visibility correctly:
 *  - Hidden  -> shows the Eye (view) icon (click to view).
 *  - Visible -> shows the EyeOff (hide) icon (click to hide).
 */

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import InputField from './InputField.jsx';

export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);
  return (
    <InputField
      {...props}
      type={visible ? 'text' : 'password'}
      autoComplete={props.autoComplete || 'current-password'}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}
