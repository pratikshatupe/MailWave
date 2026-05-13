/**
 * contact-details.jsx
 *
 * Drill-down page for a single contact.
 *  - Header card with identity, status, consent.
 *  - Tabs: Overview, Activity, Campaigns, Automations, WhatsApp, Notes.
 *  - Mock campaigns/automations/whatsapp lists driven by the activity feed.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  UserMinus,
  UserPlus,
  Mail,
  Workflow,
  MessageCircle,
  Activity,
  StickyNote,
  Star,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import Toast from '../../components/ui/Toast.jsx';
import ContactProfileCard from '../../components/contacts/contact-profile-card.jsx';
import ContactActivityTimeline from '../../components/contacts/contact-activity-timeline.jsx';
import ContactFormModal from '../../components/contacts/contact-form-modal.jsx';
import {
  getContactById,
  getContactActivity,
  updateContact,
  deleteContact,
  unsubscribeContacts,
  resubscribeContact,
} from '../../services/contact-service.js';
import { ACTIVITY_TYPES } from '../../config/contact-fields.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import {
  canEdit,
  canDelete,
  canSeeAllOrganisations,
  canResubscribe,
} from '../../config/contact-permissions.js';

const TABS = [
  { key: 'overview', label: 'Overview', icon: Star },
  { key: 'activity', label: 'Activity', icon: Activity },
  { key: 'campaigns', label: 'Campaigns', icon: Mail },
  { key: 'automations', label: 'Automations', icon: Workflow },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { key: 'notes', label: 'Notes', icon: StickyNote },
];

const CONTACT_PERMISSIONS = { delete: false, resubscribe: false };

export default function ContactDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [tick, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showUnsub, setShowUnsub] = useState(false);
  const [showResub, setShowResub] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [toast, setToast] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contact = useMemo(() => getContactById(id), [id, tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activity = useMemo(() => getContactActivity(id), [id, tick]);

  useEffect(() => {
    if (contact) setNoteDraft(contact.notes || '');
  }, [contact?.id, contact?.notes]); // eslint-disable-line react-hooks/exhaustive-deps

  function refresh() {
    setTick((t) => t + 1);
  }
  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  if (!contact) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/app/contacts')}>
          <ArrowLeft className="h-4 w-4" /> Back to Contacts
        </Button>
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Contact not found.
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            This contact may have been deleted or you may not have access to it.
          </p>
        </div>
      </div>
    );
  }

  // Tenant guard: non Super Admin cannot view other tenants.
  if (role !== ROLES.SUPER_ADMIN && contact.tenantId !== user?.tenantId) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/app/contacts')}>
          <ArrowLeft className="h-4 w-4" /> Back to Contacts
        </Button>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          You are not authorised to view this contact.
        </div>
      </div>
    );
  }

  const isViewer = role === ROLES.VIEWER;
  const allowEdit = canEdit(role) && !isViewer;
  const allowDelete = canDelete(role, undefined, CONTACT_PERMISSIONS) && !isViewer;
  const showOrganisation = canSeeAllOrganisations(role);
  const allowResubscribe = canResubscribe(role, CONTACT_PERMISSIONS);

  function handleEditSubmit(payload) {
    updateContact(contact.id, payload);
    setEditing(false);
    refresh();
    showToast('success', 'Contact updated successfully.');
  }

  function handleDelete() {
    deleteContact(contact.id);
    setShowDelete(false);
    showToast('success', 'Contact deleted successfully.');
    window.setTimeout(() => navigate('/app/contacts'), 600);
  }

  function handleUnsub() {
    unsubscribeContacts([contact.id], 'Unsubscribed by admin');
    setShowUnsub(false);
    refresh();
    showToast('success', 'Contact unsubscribed successfully.');
  }

  function handleResub() {
    resubscribeContact(contact.id);
    setShowResub(false);
    refresh();
    showToast('success', 'Contact resubscribed successfully.');
  }

  function handleSaveNote() {
    updateContact(contact.id, { notes: noteDraft });
    refresh();
    showToast('success', 'Notes saved successfully.');
  }

  const campaignActivity = activity.filter((a) =>
    [
      ACTIVITY_TYPES.CAMPAIGN_SENT,
      ACTIVITY_TYPES.EMAIL_OPENED,
      ACTIVITY_TYPES.EMAIL_CLICKED,
      ACTIVITY_TYPES.EMAIL_BOUNCED,
    ].includes(a.type)
  );
  const whatsappActivity = activity.filter((a) =>
    [
      ACTIVITY_TYPES.WHATSAPP_DELIVERED,
      ACTIVITY_TYPES.WHATSAPP_READ,
      ACTIVITY_TYPES.WHATSAPP_REPLIED,
    ].includes(a.type)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => navigate('/app/contacts')}>
          <ArrowLeft className="h-4 w-4" /> Back to Contacts
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {allowEdit && (
            <Button variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          )}
          {!isViewer && contact.status !== 'unsubscribed' && (
            <Button variant="ghost" onClick={() => setShowUnsub(true)}>
              <UserMinus className="h-4 w-4" /> Unsubscribe
            </Button>
          )}
          {allowResubscribe && contact.status === 'unsubscribed' && (
            <Button variant="outline" onClick={() => setShowResub(true)}>
              <UserPlus className="h-4 w-4" /> Resubscribe
            </Button>
          )}
          {allowDelete && (
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <ContactProfileCard contact={contact} showOrganisation={showOrganisation} />

      <div className="overflow-x-auto">
        <nav className="inline-flex min-w-full gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                activeTab === key
                  ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Recent Activity
            </h3>
            <div className="mt-3">
              <ContactActivityTimeline activities={activity.slice(0, 5)} />
            </div>
          </div>
        </section>
      )}

      {activeTab === 'activity' && (
        <section className="space-y-3">
          <ContactActivityTimeline activities={activity} />
        </section>
      )}

      {activeTab === 'campaigns' && (
        <section>
          {campaignActivity.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              No campaigns sent to this contact yet.
            </div>
          ) : (
            <ContactActivityTimeline activities={campaignActivity} />
          )}
        </section>
      )}

      {activeTab === 'automations' && (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          No automations triggered for this contact yet.
        </section>
      )}

      {activeTab === 'whatsapp' && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <Badge tone={contact.whatsappOptInStatus === 'opted_in' ? 'emerald' : contact.whatsappOptInStatus === 'opted_out' ? 'rose' : 'amber'}>
              {contact.whatsappOptInStatus === 'opted_in'
                ? 'Opted In'
                : contact.whatsappOptInStatus === 'opted_out'
                ? 'Opted Out'
                : 'Pending'}
            </Badge>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {contact.whatsappConsent
                ? 'Contact granted WhatsApp consent.'
                : 'Contact has not granted WhatsApp consent.'}
            </span>
          </div>
          {whatsappActivity.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              No WhatsApp activity yet.
            </div>
          ) : (
            <ContactActivityTimeline activities={whatsappActivity} />
          )}
        </section>
      )}

      {activeTab === 'notes' && (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Internal Notes
            </span>
            <textarea
              rows={6}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              disabled={!allowEdit}
              maxLength={500}
              placeholder="Add private notes about this contact"
              className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <div className="mt-1 text-right text-xs text-slate-400 dark:text-slate-500">
              {noteDraft.length}/500
            </div>
          </label>
          {allowEdit && (
            <div className="flex justify-end">
              <Button onClick={handleSaveNote}>Save Notes</Button>
            </div>
          )}
        </section>
      )}

      <ContactFormModal
        open={editing}
        mode="edit"
        initial={contact}
        tenantId={contact.tenantId}
        organisationName={contact.organisationName}
        onCancel={() => setEditing(false)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmModal
        open={showDelete}
        title="Delete contact"
        description={`Are you sure you want to delete contact ${contact.fullName}?`}
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />

      <ConfirmModal
        open={showUnsub}
        title="Unsubscribe contact"
        description={`Are you sure you want to unsubscribe ${contact.fullName}?`}
        confirmLabel="Unsubscribe"
        variant="danger"
        onCancel={() => setShowUnsub(false)}
        onConfirm={handleUnsub}
      />

      <ConfirmModal
        open={showResub}
        title="Resubscribe contact"
        description={`Are you sure you want to resubscribe ${contact.fullName}?`}
        confirmLabel="Resubscribe"
        onCancel={() => setShowResub(false)}
        onConfirm={handleResub}
      />
    </div>
  );
}
