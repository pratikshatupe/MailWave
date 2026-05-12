import { Plus, Search, Filter, Download } from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import StatCard from './StatCard.jsx';
import DataTable from './DataTable.jsx';
import Button from './Button.jsx';
import Badge from './Badge.jsx';
import EmptyState from './EmptyState.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { can, ACTIONS, isReadOnly } from '../../config/permissions.js';

/**
 * Generic role-aware module page used for placeholder modules. Each module
 * just declares its title, description, KPIs, table columns and seed rows;
 * action buttons appear/disappear based on the role's permission matrix.
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
  createLabel = 'Create new',
  onCreate,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'When data is available it will appear here.',
  showSearch = true,
  showFilter = true,
  showExport = true,
  extraActions,
  children,
}) {
  const { role } = useAuth();
  const readOnly = isReadOnly(role, module);
  const canCreate = can(role, module, ACTIONS.CREATE) || can(role, module, ACTIONS.MANAGE);
  const canExport = can(role, module, ACTIONS.EXPORT);

  const headerActions = (
    <>
      {showExport && canExport && (
        <Button variant="ghost"><Download className="h-4 w-4" /> Export</Button>
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

      {(showSearch || showFilter) && (
        <div className="flex flex-wrap items-center gap-2">
          {showSearch && (
            <div className="relative flex-1 min-w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder={`Search ${title.toLowerCase()}…`}
                className="input-base !py-2.5 pl-10"
              />
            </div>
          )}
          {showFilter && (
            <Button variant="ghost">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          )}
        </div>
      )}

      {children}

      {columns.length > 0 && rows.length > 0 && (
        <DataTable columns={columns} rows={rows} />
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
