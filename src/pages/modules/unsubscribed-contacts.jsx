/**
 * unsubscribed-contacts.jsx
 *
 * Read-only-by-default page showing every contact with status
 * "unsubscribed". Authorised roles (Super Admin, Business Admin,
 * Individual; Marketing Manager when contactPermissions.resubscribe is
 * enabled) can resubscribe contacts here via a confirmation modal.
 */

import { useMemo, useState } from 'react';
import { UserMinus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import AppTable from '../../components/ui/app-table.jsx';
import { LABELS } from '../../config/labels.js';
import { COLUMN_PRIORITY } from '../../config/table-responsive-config.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import {
  canResubscribe,
  filterByTenant,
  canSeeAllOrganisations,
} from '../../config/contact-permissions.js';
import {
  getContacts,
  resubscribeContact,
} from '../../services/contact-service.js';
import { CONTACT_STATUSES } from '../../config/contact-fields.js';

const CONTACT_PERMISSIONS = { resubscribe: false };

export default function UnsubscribedContacts() {
  const { user, role } = useAuth();
  const [tick, setTick] = useState(0);
  const [target, setTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const allowResubscribe = canResubscribe(role, CONTACT_PERMISSIONS);
  const showOrganisation = canSeeAllOrganisations(role);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const all = useMemo(() => getContacts({}), [tick]);
  const list = useMemo(() => {
    const scope = filterByTenant(role, all, user?.tenantId);
    return scope.filter((c) => c.status === CONTACT_STATUSES.UNSUBSCRIBED);
  }, [role, all, user?.tenantId]);

  const tableRows = useMemo(() => list, [list]);

  const columns = useMemo(() => {
    const cols = [];
    if (showOrganisation) {
      cols.push({
        key: 'organisationName',
        label: LABELS.organisation,
        priority: COLUMN_PRIORITY.MEDIUM,
        truncate: true,
      });
    }
    cols.push(
      {
        key: 'fullName',
        label: LABELS.fullName,
        priority: COLUMN_PRIORITY.CRITICAL,
        searchable: true,
        truncate: true,
      },
      {
        key: 'emailId',
        label: LABELS.emailId,
        priority: COLUMN_PRIORITY.CRITICAL,
        searchable: true,
        truncate: true,
        tooltip: true,
      },
      {
        key: 'unsubscribedAt',
        label: 'Unsubscribed At',
        type: 'date',
        priority: COLUMN_PRIORITY.MEDIUM,
        width: '140px',
      },
      {
        key: 'unsubscribeReason',
        label: 'Reason',
        priority: COLUMN_PRIORITY.LOW,
        truncate: true,
      },
      {
        key: 'status',
        label: LABELS.status,
        priority: COLUMN_PRIORITY.HIGH,
        render: () => <Badge tone="rose">Unsubscribed</Badge>,
      }
    );
    return cols;
  }, [showOrganisation]);

  const mobileConfig = useMemo(
    () => ({
      mobileTitleKey: 'fullName',
      mobileSubtitleKey: 'emailId',
      mobileBadgeKey: 'status',
      mobileDetailKeys: [
        ...(showOrganisation ? ['organisationName'] : []),
        'unsubscribedAt',
        'unsubscribeReason',
      ],
      mobileActionKeys: allowResubscribe ? ['resubscribe'] : [],
    }),
    [showOrganisation, allowResubscribe]
  );

  function refresh() {
    setTick((t) => t + 1);
  }
  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function handleResubscribe() {
    if (!target) return;
    resubscribeContact(target.id);
    setTarget(null);
    refresh();
    showToast('success', 'Contact resubscribed successfully.');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unsubscribed Contacts"
        description="Contacts who have opted out of email campaigns. They will not receive future sends."
        icon={UserMinus}
        eyebrow={role === ROLES.VIEWER ? 'Read only' : undefined}
      />

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
        Campaigns will never be delivered to unsubscribed contacts.
      </div>

      <AppTable
        tableKey="unsubscribedContacts"
        rows={tableRows}
        rowKey="id"
        role={role}
        showSerial
        columns={columns}
        mobileConfig={mobileConfig}
        actions={allowResubscribe ? ['resubscribe'] : []}
        actionHandlers={{ resubscribe: (row) => setTarget(row) }}
        empty="No unsubscribed contacts."
      />

      <ConfirmModal
        open={Boolean(target)}
        title="Resubscribe contact"
        description={
          target
            ? `Are you sure you want to resubscribe ${target.fullName}?`
            : ''
        }
        confirmLabel="Resubscribe"
        onCancel={() => setTarget(null)}
        onConfirm={handleResubscribe}
      />
    </div>
  );
}
