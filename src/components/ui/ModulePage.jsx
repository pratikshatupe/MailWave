import { Plus, Download, Upload, Megaphone } from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import StatCard from './StatCard.jsx';
import DataTable from './DataTable.jsx';
import Button from './Button.jsx';
import Badge from './Badge.jsx';
import EmptyState from './EmptyState.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  can,
  ACTIONS,
  isReadOnly,
} from '../../config/permissions.js';

/**
 * Generic role-aware module page used for placeholder modules. Each module
 * just declares its title, description, KPIs, table columns and seed rows;
 * action buttons appear/disappear based on the role's permission matrix.
 *
 * Buttons rendered here are matrix-gated:
 *   - Export   → canExport
 *   - Import   → canImport
 *   - Create   → canCreate or canManage
 *   - Broadcast→ canBroadcast (e.g. announcements / notifications)
 *
 * The DataTable receives `module` so inline edit + per-row actions can
 * derive their own gating via isReadOnly() in the central table.
 */
export default function ModulePage({
  module,
  title,
  description,
  icon,
  eyebrow,
  stats = [],
  columns = [],
  rows = [],
  tableKey,
  mobileConfig,
  actions,
  actionHandlers,
  actionPermissions,
  createLabel = 'Create new',
  onCreate,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'When data is available it will appear here.',
  showExport = true,
  onExport,
  showImport = false,
  importLabel = 'Import',
  onImport,
  showBroadcast = false,
  broadcastLabel = 'Broadcast',
  onBroadcast,
  extraActions,
  children,
}) {
  const { role } = useAuth();
  const readOnly = isReadOnly(role, module);
  const canCreate = can(role, module, ACTIONS.CREATE) || can(role, module, ACTIONS.MANAGE);
  const canExport = can(role, module, ACTIONS.EXPORT);
  const canImport = can(role, module, ACTIONS.IMPORT);
  const canBroadcast = can(role, module, ACTIONS.BROADCAST);

  const headerActions = (
    <>
      {showExport && canExport && (
        <Button variant="ghost" onClick={onExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
      )}
      {showImport && canImport && (
        <Button variant="outline" onClick={onImport}>
          <Upload className="h-4 w-4" /> {importLabel}
        </Button>
      )}
      {showBroadcast && canBroadcast && (
        <Button variant="outline" onClick={onBroadcast}>
          <Megaphone className="h-4 w-4" /> {broadcastLabel}
        </Button>
      )}
      {canCreate && (
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4" /> {createLabel}
        </Button>
      )}
      {extraActions}
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        eyebrow={eyebrow || (readOnly ? 'Read only' : undefined)}
        actions={headerActions}
      />

      {readOnly && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <Badge tone="amber" className="mr-2">Read only</Badge>
          Your role can view and export data here but cannot create, edit or delete records.
        </div>
      )}

      {stats.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard
              key={s.label}
              Icon={s.icon}
              label={s.label}
              value={s.value}
              delta={s.delta}
              tone={s.tone}
              delay={i * 0.05}
              hint={s.hint}
            />
          ))}
        </div>
      )}

      {children}

      {columns.length > 0 && rows.length > 0 && (
        <DataTable
          columns={columns}
          rows={rows}
          tableKey={tableKey}
          mobileConfig={mobileConfig}
          actions={actions}
          actionHandlers={actionHandlers}
          actionPermissions={actionPermissions}
          role={role}
          module={module}
        />
      )}

      {columns.length > 0 && rows.length === 0 && (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={
            canCreate ? (
              <Button onClick={onCreate}>
                <Plus className="h-4 w-4" /> {createLabel}
              </Button>
            ) : null
          }
        />
      )}
    </div>
  );
}
