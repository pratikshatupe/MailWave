/**
 * campaign-details-step.jsx
 *
 * Step 1 of the campaign wizard: Campaign Details. All form inputs use
 * the central InputField / SelectField components and the central
 * validators — no per-page regex.
 *
 * Main form fields:
 *   Campaign Name*, Campaign Type*, Subject Line*, Preview Text,
 *   Sender Name*, Sender Email ID*
 *
 * Reply To Email ID lives inside a collapsed "Advanced Settings"
 * accordion so the main form stays short.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import InputField from '../ui/InputField.jsx';
import SelectField from '../ui/SelectField.jsx';
import { CAMPAIGN_FIELDS } from '../../config/campaign-fields.js';
import { CAMPAIGN_TYPE_LIST } from '../../config/campaign-status.js';
import {
  validateField,
  validateEmailId,
} from '../../utils/validators.js';

const TYPE_OPTIONS = CAMPAIGN_TYPE_LIST.map((value) => ({ value, label: value }));

export default function CampaignDetailsStep({ values, errors, onChange, onValidate }) {
  // Auto-open the accordion when the user is editing a campaign that
  // already has a Reply-To value, otherwise the existing value would be
  // hidden behind the collapsed header.
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(values?.replyToEmailId) || Boolean(errors?.replyToEmailId)
  );

  function handleChange(e) {
    onChange?.(e.target.name, e.target.value);
  }

  function handleEmailValidate(name, value) {
    if (!value) {
      onValidate?.(name, name === 'replyToEmailId' ? '' : 'Sender Email ID is required.');
      return;
    }
    const err = validateEmailId(value);
    onValidate?.(name, err || '');
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <InputField
            field="campaignName"
            name="campaignName"
            value={values.campaignName}
            onChange={handleChange}
            onValidate={onValidate}
            validator={(v) => validateField('campaignName', v, CAMPAIGN_FIELDS.campaignName, values)}
            error={errors.campaignName}
            label="Campaign Name"
            required
          />
        </div>

        <SelectField
          name="campaignType"
          label="Campaign Type"
          required
          value={values.campaignType}
          options={TYPE_OPTIONS}
          onChange={handleChange}
          validator={(v) => (!v ? 'Campaign Type is required.' : '')}
          onValidate={onValidate}
          error={errors.campaignType}
          placeholder="Select Campaign Type"
        />

        <div />

        <div className="md:col-span-2">
          <InputField
            field="subjectLine"
            name="subjectLine"
            value={values.subjectLine}
            onChange={handleChange}
            onValidate={onValidate}
            validator={(v) => validateField('subjectLine', v, CAMPAIGN_FIELDS.subjectLine, values)}
            error={errors.subjectLine}
            label="Subject Line"
            required
          />
        </div>

        <div className="md:col-span-2">
          <InputField
            field="previewText"
            name="previewText"
            value={values.previewText}
            onChange={handleChange}
            onValidate={onValidate}
            error={errors.previewText}
            label="Preview Text"
          />
        </div>

        <InputField
          field="senderName"
          name="senderName"
          value={values.senderName}
          onChange={handleChange}
          onValidate={onValidate}
          validator={(v) => validateField('senderName', v, CAMPAIGN_FIELDS.senderName, values)}
          error={errors.senderName}
          label="Sender Name"
          required
        />

        <InputField
          field="senderEmailId"
          name="senderEmailId"
          value={values.senderEmailId}
          onChange={handleChange}
          onValidate={(name, value) => handleEmailValidate(name, value ?? values.senderEmailId)}
          validator={(v) => validateEmailId(v)}
          error={errors.senderEmailId}
          label="Sender Email ID"
          required
        />
      </div>

      <section className="rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
          className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
        >
          <span>
            <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
              Advanced Settings
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Optional sender overrides (Reply To Email ID).
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              showAdvanced ? 'rotate-180' : ''
            }`}
          />
        </button>
        {showAdvanced && (
          <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-700">
            <InputField
              field="replyToEmailId"
              name="replyToEmailId"
              value={values.replyToEmailId}
              onChange={handleChange}
              onValidate={onValidate}
              validator={(v) => (!v ? '' : validateEmailId(v))}
              error={errors.replyToEmailId}
              label="Reply To Email ID"
            />
          </div>
        )}
      </section>
    </div>
  );
}
