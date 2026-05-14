/**
 * campaign-review-step.jsx
 *
 * Step 5: read-only summary the user confirms before the campaign is
 * saved / sent / scheduled. The wizard owns the action buttons; this
 * component just renders the summary card.
 */

import {
  AUDIENCE_TYPE_LABELS,
  SCHEDULE_OPTIONS,
} from '../../config/campaign-status.js';
import { formatDateForDisplay } from './campaign-schedule-step.jsx';

function Row({ label, value }) {
  return (
    <div className="grid gap-1 sm:grid-cols-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="sm:col-span-2 text-sm text-slate-800 dark:text-slate-200">
        {value || <span className="text-slate-400 dark:text-slate-500">—</span>}
      </div>
    </div>
  );
}

const SCHEDULE_LABEL = {
  [SCHEDULE_OPTIONS.DRAFT]: 'Save as Draft',
  [SCHEDULE_OPTIONS.SEND_NOW]: 'Send Now',
  [SCHEDULE_OPTIONS.SCHEDULE_LATER]: 'Schedule Later',
  [SCHEDULE_OPTIONS.SUBMIT_FOR_APPROVAL]: 'Submit for Approval',
};

export default function CampaignReviewStep({ values, recipientCount, approvalRequired }) {
  const audienceLabel = AUDIENCE_TYPE_LABELS[values.audienceType] || '—';
  const scheduleLabel = SCHEDULE_LABEL[values.scheduleOption] || 'Save as Draft';
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          Campaign summary
        </div>
        <div className="space-y-3">
          <Row label="Campaign Name" value={values.campaignName} />
          <Row label="Campaign Type" value={values.campaignType} />
          <Row label="Subject Line" value={values.subjectLine} />
          <Row label="Sender Name" value={values.senderName} />
          <Row label="Sender Email ID" value={values.senderEmailId} />
          {values.replyToEmailId && (
            <Row label="Reply To Email ID" value={values.replyToEmailId} />
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          Audience and template
        </div>
        <div className="space-y-3">
          <Row label="Audience Type" value={audienceLabel} />
          {values.selectedSegmentName && (
            <Row label="Segment" value={values.selectedSegmentName} />
          )}
          <Row label="Recipient Count" value={Number(recipientCount || 0).toLocaleString()} />
          <Row label="Selected Template" value={values.templateName} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          Schedule
        </div>
        <div className="space-y-3">
          <Row label="Schedule Option" value={scheduleLabel} />
          {values.scheduleOption === SCHEDULE_OPTIONS.SCHEDULE_LATER && (
            <Row label="Scheduled At" value={formatDateForDisplay(values.scheduledAt)} />
          )}
          <Row
            label="Approval Required"
            value={approvalRequired ? 'Yes — will be sent for approval' : 'No'}
          />
        </div>
      </div>
    </div>
  );
}
