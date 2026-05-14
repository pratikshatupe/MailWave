import Badge from '../ui/Badge.jsx';
import { getStatusTone } from '../../config/campaign-status.js';

export default function CampaignStatusBadge({ status, className = '' }) {
  if (!status) return null;
  return (
    <Badge tone={getStatusTone(status)} className={className}>
      {status}
    </Badge>
  );
}
