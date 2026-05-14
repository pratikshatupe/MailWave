import ConfirmModal from '../ui/ConfirmModal.jsx';

/**
 * Thin wrapper around the existing ConfirmModal that standardises the
 * bulk-delete copy across modules.
 */
export default function ConfirmBulkDeleteModal({
  open,
  count = 0,
  entity = 'records',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <ConfirmModal
      open={open}
      title={`Delete ${count} ${entity}`}
      description={`Are you sure you want to delete ${count} selected ${entity}? This action cannot be undone.`}
      confirmLabel="Delete"
      variant="danger"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
