/**
 * contact-import.jsx
 *
 * Dedicated page that hosts the CSV importer. Accessible via
 * /app/contacts/import for users who want a deep-link to the importer
 * (the same modal also opens from the Contacts page top bar).
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Toast from '../../components/ui/Toast.jsx';
import ImportContactsModal from '../../components/contacts/import-contacts-modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { canImport } from '../../config/contact-permissions.js';

export default function ContactImport() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [open, setOpen] = useState(true);
  const [toast, setToast] = useState(null);

  if (!canImport(role)) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/app/contacts')}>
          <ArrowLeft className="h-4 w-4" /> Back to Contacts
        </Button>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          You are not authorised to import contacts.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Contacts"
        description="Upload a CSV, map columns, validate rows and import in one flow."
        icon={Upload}
        actions={
          <Button variant="ghost" onClick={() => navigate('/app/contacts')}>
            <ArrowLeft className="h-4 w-4" /> Back to Contacts
          </Button>
        }
      />

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {!open && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Import complete.
          </p>
          <div className="mt-4">
            <Button onClick={() => setOpen(true)}>
              <Upload className="h-4 w-4" /> Start another import
            </Button>
          </div>
        </div>
      )}

      <ImportContactsModal
        open={open}
        tenantId={user?.tenantId}
        organisationName={user?.tenantId === 'platform' ? 'Platform' : ''}
        onCancel={() => navigate('/app/contacts')}
        onCompleted={() => {
          setOpen(false);
          setToast({ type: 'success', message: 'Contacts imported successfully.' });
        }}
      />
    </div>
  );
}
