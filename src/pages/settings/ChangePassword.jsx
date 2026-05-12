import { useState } from 'react';
import { KeyRound, Save } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import PasswordField from '../../components/ui/PasswordField.jsx';
import Button from '../../components/ui/Button.jsx';
import Toast from '../../components/ui/Toast.jsx';

import { LABELS } from '../../config/labels.js';
import { SUCCESS_MESSAGES } from '../../config/messages.js';
import {
  validateRequired,
  validateNewPassword,
  validateConfirmPassword,
} from '../../utils/validators.js';

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  }

  function validateField(name, value) {
    if (name === 'currentPassword') return validateRequired(value, LABELS.currentPassword);
    if (name === 'newPassword') return validateNewPassword(form.currentPassword, value);
    if (name === 'confirmPassword') return validateConfirmPassword(form.newPassword, value);
    return '';
  }

  function handleBlur(name, value) {
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }

  function save(e) {
    e.preventDefault();
    const next = {};
    Object.keys(form).forEach((name) => {
      const err = validateField(name, form[name]);
      if (err) next[name] = err;
    });

    setErrors(next);
    if (Object.keys(next).length > 0) {
      setToast(null);
      return;
    }

    setToast({ type: 'success', message: SUCCESS_MESSAGES.passwordChanged });
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={LABELS.changePassword}
        description="Use a strong password you don’t use anywhere else."
        icon={KeyRound}
      />

      <form
        onSubmit={save}
        className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900"
        noValidate
      >
        <PasswordField
          field="currentPassword"
          value={form.currentPassword}
          onChange={(e) => update('currentPassword', e.target.value)}
          onBlur={(e) => handleBlur('currentPassword', e.target.value)}
          error={errors.currentPassword}
        />
        <PasswordField
          field="newPassword"
          value={form.newPassword}
          onChange={(e) => update('newPassword', e.target.value)}
          onBlur={(e) => handleBlur('newPassword', e.target.value)}
          error={errors.newPassword}
        />
        <PasswordField
          field="confirmPassword"
          value={form.confirmPassword}
          onChange={(e) => update('confirmPassword', e.target.value)}
          onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
        />
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
        <Button type="submit">
          <Save className="h-4 w-4" /> {LABELS.update} {LABELS.password}
        </Button>
      </form>
    </div>
  );
}
