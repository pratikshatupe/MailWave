/**
 * campaign-wizard.jsx
 *
 * Multi-step campaign wizard. Owns the form state, drives validation
 * through the central validators, and dispatches the final action
 * (draft / send / schedule / submit for approval).
 *
 * Steps:
 *   1 Campaign Details
 *   2 Audience
 *   3 Template
 *   4 Schedule
 *   5 Review
 */

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Save, Send, CalendarClock, ClipboardCheck } from 'lucide-react';
import Button from '../ui/Button.jsx';
import CampaignDetailsStep from './campaign-details-step.jsx';
import CampaignAudienceStep from './campaign-audience-step.jsx';
import CampaignTemplateStep from './campaign-template-step.jsx';
import CampaignScheduleStep from './campaign-schedule-step.jsx';
import CampaignReviewStep from './campaign-review-step.jsx';
import {
  AUDIENCE_TYPES,
  SCHEDULE_OPTIONS,
  CAMPAIGN_TYPES,
} from '../../config/campaign-status.js';
import { CAMPAIGN_FIELDS } from '../../config/campaign-fields.js';
import { validateField, validateEmailId } from '../../utils/validators.js';
import { getEligibleRecipients } from '../../services/campaign-service.js';
import { ROLES } from '../../config/roles.js';

const STEP_TITLES = [
  'Campaign Details',
  'Audience',
  'Template',
  'Schedule',
  'Review',
];

const DEFAULT_VALUES = {
  campaignName: '',
  campaignType: CAMPAIGN_TYPES.REGULAR,
  subjectLine: '',
  previewText: '',
  senderName: '',
  senderEmailId: '',
  replyToEmailId: '',
  audienceType: AUDIENCE_TYPES.ALL_CONTACTS,
  selectedSegmentId: null,
  selectedSegmentName: '',
  selectedContactIds: [],
  excludedContactIds: [],
  templateId: null,
  templateName: '',
  scheduleOption: SCHEDULE_OPTIONS.DRAFT,
  scheduledAt: '',
};

function validateStep1(values) {
  const errors = {};
  ['campaignName', 'subjectLine', 'senderName'].forEach((name) => {
    const err = validateField(name, values[name], CAMPAIGN_FIELDS[name], values);
    if (err) errors[name] = err;
  });
  if (!values.campaignType) errors.campaignType = 'Campaign Type is required.';
  const senderEmail = validateEmailId(values.senderEmailId);
  if (senderEmail) errors.senderEmailId = senderEmail;
  if (values.replyToEmailId && validateEmailId(values.replyToEmailId)) {
    errors.replyToEmailId = validateEmailId(values.replyToEmailId);
  }
  return errors;
}

function validateStep2(values, tenantId) {
  const errors = {};
  if (!values.audienceType) {
    errors.audienceType = 'Audience is required.';
    return errors;
  }
  if (values.audienceType === AUDIENCE_TYPES.SEGMENT && !values.selectedSegmentId) {
    errors.selectedSegmentId = 'Segment is required.';
    return errors;
  }
  if (
    values.audienceType === AUDIENCE_TYPES.SELECTED_CONTACTS &&
    (values.selectedContactIds || []).length === 0
  ) {
    errors.audienceType = 'Pick at least one contact.';
    return errors;
  }
  const counts = getEligibleRecipients({
    tenantId,
    audienceType: values.audienceType,
    selectedSegmentId: values.selectedSegmentId,
    selectedContactIds: values.selectedContactIds,
    excludedContactIds: values.excludedContactIds,
  });
  if (counts.finalRecipients <= 0) {
    errors.audienceType = 'At least one eligible recipient is required.';
  }
  return errors;
}

function validateStep3(values) {
  const errors = {};
  if (!values.templateId) errors.templateId = 'Template is required.';
  return errors;
}

function validateStep4(values) {
  const errors = {};
  if (values.scheduleOption === SCHEDULE_OPTIONS.SCHEDULE_LATER) {
    if (!values.scheduledAt) {
      errors.scheduledAt = 'Schedule date and time are required.';
    } else {
      const t = new Date(values.scheduledAt).getTime();
      if (Number.isNaN(t)) errors.scheduledAt = 'Enter a valid date and time.';
      else if (t <= Date.now()) errors.scheduledAt = 'Schedule date must be in the future.';
    }
  }
  return errors;
}

export default function CampaignWizard({
  initial,
  tenantId,
  role,
  approvalWorkflowEnabled = false,
  onSaveDraft,
  onSendNow,
  onSchedule,
  onSubmitForApproval,
  onCancel,
  saving = false,
}) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(() => ({ ...DEFAULT_VALUES, ...(initial || {}) }));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setValues((v) => ({ ...DEFAULT_VALUES, ...v, ...initial }));
    }
  }, [initial]);

  const recipientCount = useMemo(
    () =>
      getEligibleRecipients({
        tenantId,
        audienceType: values.audienceType,
        selectedSegmentId: values.selectedSegmentId,
        selectedContactIds: values.selectedContactIds,
        excludedContactIds: values.excludedContactIds,
      }).finalRecipients,
    [
      tenantId,
      values.audienceType,
      values.selectedSegmentId,
      values.selectedContactIds,
      values.excludedContactIds,
    ]
  );

  const isMarketingManager = role === ROLES.MARKETING_MANAGER;
  const showApprovalOption = approvalWorkflowEnabled && isMarketingManager;
  const approvalRequired =
    showApprovalOption &&
    (values.scheduleOption === SCHEDULE_OPTIONS.SUBMIT_FOR_APPROVAL ||
      values.scheduleOption === SCHEDULE_OPTIONS.SEND_NOW ||
      values.scheduleOption === SCHEDULE_OPTIONS.SCHEDULE_LATER);

  function setValue(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function setFieldError(name, error) {
    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
  }

  function validateCurrentStep() {
    let stepErrors = {};
    if (step === 1) stepErrors = validateStep1(values);
    if (step === 2) stepErrors = validateStep2(values, tenantId);
    if (step === 3) stepErrors = validateStep3(values);
    if (step === 4) stepErrors = validateStep4(values);
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  }

  function handleNext() {
    if (!validateCurrentStep()) return;
    setStep((s) => Math.min(5, s + 1));
  }
  function handleBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  function submit(action) {
    // Validate everything before any final action.
    const e1 = validateStep1(values);
    const e2 = validateStep2(values, tenantId);
    const e3 = validateStep3(values);
    const e4 = validateStep4(values);
    const combined = { ...e1, ...e2, ...e3, ...e4 };
    setErrors(combined);
    if (Object.keys(combined).length > 0) {
      // Jump to the earliest failing step so the user sees the error.
      if (Object.keys(e1).length > 0) setStep(1);
      else if (Object.keys(e2).length > 0) setStep(2);
      else if (Object.keys(e3).length > 0) setStep(3);
      else if (Object.keys(e4).length > 0) setStep(4);
      return;
    }
    if (action === 'draft') onSaveDraft?.(values);
    if (action === 'send') onSendNow?.(values);
    if (action === 'schedule') onSchedule?.(values);
    if (action === 'approval') onSubmitForApproval?.(values);
  }

  return (
    <div className="space-y-6">
      <Steps current={step} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        {step === 1 && (
          <CampaignDetailsStep
            values={values}
            errors={errors}
            onChange={setValue}
            onValidate={setFieldError}
          />
        )}
        {step === 2 && (
          <CampaignAudienceStep
            values={values}
            errors={errors}
            tenantId={tenantId}
            onChange={setValue}
            onValidate={setFieldError}
          />
        )}
        {step === 3 && (
          <CampaignTemplateStep
            values={values}
            errors={errors}
            tenantId={tenantId}
            onChange={setValue}
            onValidate={setFieldError}
          />
        )}
        {step === 4 && (
          <CampaignScheduleStep
            values={values}
            errors={errors}
            showApproval={showApprovalOption}
            onChange={setValue}
            onValidate={setFieldError}
          />
        )}
        {step === 5 && (
          <CampaignReviewStep
            values={values}
            recipientCount={recipientCount}
            approvalRequired={approvalRequired}
          />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onCancel} type="button">
            Cancel
          </Button>
          {step > 1 && (
            <Button variant="ghost" onClick={handleBack} type="button">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          )}
        </div>

        {step < 5 && (
          <Button onClick={handleNext} type="button">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {step === 5 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={() => submit('draft')} disabled={saving} type="button">
              <Save className="h-4 w-4" /> Save as Draft
            </Button>
            {showApprovalOption ? (
              <Button onClick={() => submit('approval')} disabled={saving} type="button">
                <ClipboardCheck className="h-4 w-4" /> Submit for Approval
              </Button>
            ) : (
              <>
                {values.scheduleOption === SCHEDULE_OPTIONS.SCHEDULE_LATER ? (
                  <Button onClick={() => submit('schedule')} disabled={saving} type="button">
                    <CalendarClock className="h-4 w-4" /> Schedule Campaign
                  </Button>
                ) : (
                  <Button onClick={() => submit('send')} disabled={saving} type="button">
                    <Send className="h-4 w-4" /> Send Now
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Steps({ current }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 sm:gap-3">
      {STEP_TITLES.map((title, idx) => {
        const num = idx + 1;
        const active = num === current;
        const done = num < current;
        return (
          <li key={title} className="flex items-center gap-2 sm:gap-3">
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                active
                  ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-glow'
                  : done
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {num}
            </span>
            <span
              className={`text-xs font-semibold ${
                active
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {title}
            </span>
            {num < STEP_TITLES.length && (
              <span className="hidden h-px w-6 bg-slate-200 dark:bg-slate-700 sm:inline-block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
