import { useState } from 'react';
import { User as UserIcon, Save } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import InputField from '../../components/ui/InputField.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_BADGES, getRoleLabel } from '../../config/roles.js';
import { LABELS } from '../../config/labels.js';
import { SUCCESS_MESSAGES } from '../../config/messages.js';
import {
  validateFullName,
  validateEmailId,
  validateContactNumber,
} from '../../utils/validators.js';

const TIMEZONES = ['UTC', 'Asia/Kolkata', 'America/New_York', 'Europe/London'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.name || '',
    emailId: user?.email || '',
    contactNumber: '',
    timezone: 'UTC',
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const badge = user ? ROLE_BADGES[user.role] : null;

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  }

  function validateField(name, value) {
    switch (name) {
      case 'fullName':
        return validateFullName(value);
      case 'emailId':
        return validateEmailId(value);
      case 'contactNumber':
        if (!value) return '';
        return validateContactNumber(value, '+91');
      default:
        return '';
    }
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
    updateUser({ name: form.fullName });
    setToast({ type: 'success', message: SUCCESS_MESSAGES.profileUpdated });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Update your personal information and preferences."
        icon={UserIcon}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <span className="inline-grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 text-xl font-bold text-white shadow-glow">
            {user?.avatarInitials || 'U'}
          </span>
          <div className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            {user?.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
          <div className="mt-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              badge?.className || 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            }`}>
              {badge?.label || getRoleLabel(user?.role)}
            </span>
          </div>
          {user?.tenantId && (
            <div className="mt-4 inline-flex">
              <Badge tone="indigo">Tenant: {user.tenantId}</Badge>
            </div>
          )}
        </div>

        <form
          onSubmit={save}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:col-span-2"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              field="fullName"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              onBlur={(e) => handleBlur('fullName', e.target.value)}
              error={errors.fullName}
            />
            <InputField
              field="emailId"
              value={form.emailId}
              onChange={(e) => update('emailId', e.target.value)}
              onBlur={(e) => handleBlur('emailId', e.target.value)}
              error={errors.emailId}
              disabled
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              field="contactNumber"
              label={`${LABELS.contactNumber} (Optional)`}
              required={false}
              value={form.contactNumber}
              onChange={(e) => update('contactNumber', e.target.value)}
              onBlur={(e) => handleBlur('contactNumber', e.target.value)}
              error={errors.contactNumber}
            />
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Timezone
              </label>
              <select
                value={form.timezone}
                onChange={(e) => update('timezone', e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
          {toast && (
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          )}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit"><Save className="h-4 w-4" /> {LABELS.save} changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
