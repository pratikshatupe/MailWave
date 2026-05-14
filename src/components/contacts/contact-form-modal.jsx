/**
 * contact-form-modal.jsx
 *
 * Add / Edit Contact modal for Mailwave Contact Management.
 *
 * Layout (top to bottom):
 *   1. Basic Details      — Full Name*, Email ID*, Contact Number
 *   2. Marketing Details  — Subscription Status*, Source, Tags, Segments,
 *                           Email Consent*
 *   3. WhatsApp Details   — Shown only when WhatsApp Campaigns module is
 *                           enabled. Contains WhatsApp Consent and WhatsApp
 *                           Opt-In Status.
 *   4. Additional Details — Collapsed accordion: Country, State, City,
 *                           Postal Code, Notes.
 *
 * Cross-field rules:
 *   - WhatsApp Consent unchecked: Opt-In Status is disabled and forced to
 *     "Pending".
 *   - WhatsApp Consent checked: Contact Number is required and must be a
 *     valid Contact Number.
 *
 * Validation uses the central validators and InputField allowOnly /
 * onValidate, per the project's central validation rules.
 */

import { useEffect, useMemo, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import InputField from '../ui/InputField.jsx';
import SelectField from '../ui/SelectField.jsx';
import TextAreaField from '../ui/TextAreaField.jsx';
import Button from '../ui/Button.jsx';
import CountryCodeSelect from '../common/CountryCodeSelect.jsx';
import {
  validateFullName,
  validateEmailId,
  validateContactNumber,
  validatePostalCode,
} from '../../utils/validators.js';
import {
  CONTACT_STATUS_OPTIONS,
  CONTACT_SOURCE_OPTIONS,
  WHATSAPP_OPT_IN_OPTIONS,
  WHATSAPP_OPT_IN_STATUSES,
  COUNTRIES,
  STATES_BY_COUNTRY,
  CITIES_BY_STATE,
} from '../../config/contact-fields.js';
import {
  DEFAULT_COUNTRY,
  buildFullPhone,
  getCountryByCode,
  getCountryByDial,
} from '../../config/country-codes.js';
import { isWhatsappCampaignsEnabled } from '../../config/modules.js';
import { existsEmail } from '../../services/contact-service.js';

/**
 * Normalise whatever was stored on the contact previously (ISO code,
 * dial code, or nothing) into an ISO country code for CountryCodeSelect.
 * Falls back to the project default when the value can't be resolved.
 */
function resolveCountryIso(stored) {
  if (!stored) return DEFAULT_COUNTRY;
  const raw = String(stored).trim();
  if (!raw) return DEFAULT_COUNTRY;
  // Dial code form: "+91", "91", "+1"
  if (raw.startsWith('+') || /^\d+$/.test(raw)) {
    const normalised = raw.startsWith('+') ? raw : `+${raw}`;
    return getCountryByDial(normalised)?.code || DEFAULT_COUNTRY;
  }
  // Assume ISO ("IN", "AE") — accept any casing.
  return getCountryByCode(raw.toUpperCase())?.code || DEFAULT_COUNTRY;
}

const DEFAULT_COUNTRY_META = getCountryByCode(DEFAULT_COUNTRY);

const EMPTY = {
  fullName: '',
  emailId: '',
  contactNumber: '',
  countryCode: DEFAULT_COUNTRY,
  timezone: DEFAULT_COUNTRY_META?.timezone || 'UTC',
  country: '',
  state: '',
  city: '',
  postalCode: '',
  source: 'Manual',
  tags: '',
  segments: '',
  status: 'subscribed',
  emailConsent: true,
  whatsappConsent: false,
  whatsappOptInStatus: WHATSAPP_OPT_IN_STATUSES.PENDING,
  notes: '',
};

function dedupeCsv(value) {
  if (!value) return [];
  const seen = new Set();
  const out = [];
  value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((t) => {
      const key = t.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(t);
    });
  return out;
}

function Section({ title, description, children }) {
  return (
    <section className="space-y-3">
      <header>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

function ConsentCheckbox({ name, checked, onChange, title, hint, disabled, required }) {
  return (
    <label
      className={`flex items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-sm dark:bg-slate-900 ${
        disabled
          ? 'cursor-not-allowed border-slate-200 opacity-70 dark:border-slate-700'
          : 'cursor-pointer border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
      }`}
    >
      <input
        type="checkbox"
        name={name}
        checked={!!checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
      />
      <span className="leading-snug">
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {title}
          {required && (
            <span className="required-marker text-rose-600 dark:text-rose-400">*</span>
          )}
        </span>
        {hint && (
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}

export default function ContactFormModal({
  open,
  mode = 'create',
  initial,
  tenantId,
  organisationName,
  onCancel,
  onSubmit,
}) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  const whatsappEnabled = isWhatsappCampaignsEnabled();

  useEffect(() => {
    if (!open) {
      setErrors({});
      setShowAdditional(false);
      return;
    }
    if (mode === 'edit' && initial) {
      const resolvedIso = resolveCountryIso(initial.countryCode);
      const resolvedCountry = getCountryByCode(resolvedIso);
      const next = {
        ...EMPTY,
        ...initial,
        countryCode: resolvedIso,
        // Prefer the explicit national number, otherwise the legacy
        // `contactNumber` value so old contacts edit without losing data.
        contactNumber: initial.phoneNumber || initial.phone || initial.contactNumber || '',
        timezone: initial.timezone || resolvedCountry?.timezone || EMPTY.timezone,
        tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : initial.tags || '',
        segments: Array.isArray(initial.segments)
          ? initial.segments.join(', ')
          : initial.segments || '',
      };
      setValues(next);
      // Auto-expand Additional Details when editing a record that already
      // has location or notes data — keeps existing values discoverable.
      setShowAdditional(
        Boolean(
          next.country || next.state || next.city || next.postalCode || next.notes
        )
      );
    } else {
      setValues(EMPTY);
      setShowAdditional(false);
    }
    setErrors({});
  }, [open, mode, initial]);

  const stateOptions = useMemo(
    () => (STATES_BY_COUNTRY[values.country] || []).map((s) => ({ value: s, label: s })),
    [values.country]
  );
  const cityOptions = useMemo(
    () => (CITIES_BY_STATE[values.state] || []).map((c) => ({ value: c, label: c })),
    [values.state]
  );

  if (!open) return null;

  function setField(name, value) {
    setValues((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function setError(name, msg) {
    setErrors((p) => ({ ...p, [name]: msg }));
  }

  function handleCountryChange(code, country) {
    setValues((p) => {
      const tzPool = country?.timezones || (country?.timezone ? [country.timezone] : []);
      const keepTz = tzPool.includes(p.timezone);
      return {
        ...p,
        countryCode: code,
        timezone: keepTz ? p.timezone : country?.timezone || p.timezone,
      };
    });
    // Re-validate the phone with the new country rules on next blur.
    setErrors((p) => ({ ...p, contactNumber: undefined }));
  }

  const selectedCountryMeta = useMemo(
    () => getCountryByCode(values.countryCode) || DEFAULT_COUNTRY_META,
    [values.countryCode]
  );
  const dialCode = selectedCountryMeta?.dial || '+91';
  const timezoneOptions = useMemo(() => {
    const pool = selectedCountryMeta?.timezones || [selectedCountryMeta?.timezone].filter(Boolean);
    return pool.map((tz) => ({ value: tz, label: tz }));
  }, [selectedCountryMeta]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'country') {
      setValues((p) => ({ ...p, country: value, state: '', city: '' }));
      setErrors((p) => ({ ...p, country: undefined, state: undefined, city: undefined }));
      return;
    }
    if (name === 'state') {
      setValues((p) => ({ ...p, state: value, city: '' }));
      setErrors((p) => ({ ...p, state: undefined, city: undefined }));
      return;
    }
    setField(name, value);
  }

  function handleCheck(e) {
    const { name, checked } = e.target;
    if (name === 'whatsappConsent') {
      // Toggling WhatsApp Consent off resets Opt-In Status to Pending so the
      // record stays consistent with the consent flag.
      setValues((p) => ({
        ...p,
        whatsappConsent: checked,
        whatsappOptInStatus: checked
          ? p.whatsappOptInStatus || WHATSAPP_OPT_IN_STATUSES.PENDING
          : WHATSAPP_OPT_IN_STATUSES.PENDING,
      }));
      setErrors((p) => ({ ...p, whatsappConsent: undefined, contactNumber: undefined }));
      return;
    }
    setField(name, checked);
  }

  function validateAll() {
    const next = {};
    next.fullName = validateFullName(values.fullName);
    next.emailId = validateEmailId(values.emailId);
    if (!next.emailId) {
      if (existsEmail(values.emailId, tenantId, mode === 'edit' ? initial?.id : null)) {
        next.emailId = 'This Email ID already exists.';
      }
    }
    // Contact Number is optional, but becomes required when WhatsApp Consent
    // is on. Either way the format must validate when something is entered.
    // The selected dial code drives which rule the central validator applies
    // (India: 10-digit 6-9; other: flexible 6-15).
    if (whatsappEnabled && values.whatsappConsent) {
      next.contactNumber = validateContactNumber(values.contactNumber, dialCode);
    } else if (values.contactNumber) {
      next.contactNumber = validateContactNumber(values.contactNumber, dialCode);
    }
    if (values.postalCode) {
      next.postalCode = validatePostalCode(values.postalCode);
    }
    if (!values.status) {
      next.status = 'Subscription Status is required.';
    }
    if (values.notes && values.notes.length > 500) {
      next.notes = 'Notes must be at most 500 characters.';
    }
    const filtered = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    setErrors(filtered);
    // If the only errors are inside the Additional Details accordion, open it
    // so the user can see what's wrong without hunting for it.
    const additionalKeys = ['postalCode', 'notes'];
    if (Object.keys(filtered).some((k) => additionalKeys.includes(k))) {
      setShowAdditional(true);
    }
    return Object.keys(filtered).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!validateAll()) return;
    setSubmitting(true);
    try {
      const nationalNumber = String(values.contactNumber || '').trim();
      const fullPhoneNumber = nationalNumber
        ? buildFullPhone(selectedCountryMeta, nationalNumber)
        : '';
      const payload = {
        ...values,
        tenantId,
        organisationName,
        tags: dedupeCsv(values.tags),
        segments: dedupeCsv(values.segments),
        countryCode: dialCode,
        phoneNumber: nationalNumber,
        phone: nationalNumber,
        contactNumber: nationalNumber,
        fullPhoneNumber,
        timezone: values.timezone,
        whatsappConsent: whatsappEnabled ? !!values.whatsappConsent : false,
        whatsappOptInStatus: whatsappEnabled
          ? values.whatsappConsent
            ? values.whatsappOptInStatus || WHATSAPP_OPT_IN_STATUSES.PENDING
            : WHATSAPP_OPT_IN_STATUSES.PENDING
          : WHATSAPP_OPT_IN_STATUSES.PENDING,
      };
      await onSubmit?.(payload);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900"
        style={{ maxHeight: 'min(90vh, 760px)' }}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {mode === 'edit' ? 'Edit Contact' : 'Add Contact'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'edit'
                ? 'Update contact details and save changes.'
                : 'Add a new contact to your audience.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <Section title="Basic Details">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  field="fullName"
                  value={values.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  validator={validateFullName}
                  onValidate={setError}
                />
                <InputField
                  field="emailId"
                  value={values.emailId}
                  onChange={handleChange}
                  error={errors.emailId}
                  validator={(v) => {
                    const base = validateEmailId(v);
                    if (base) return base;
                    if (existsEmail(v, tenantId, mode === 'edit' ? initial?.id : null)) {
                      return 'This Email ID already exists.';
                    }
                    return '';
                  }}
                  onValidate={setError}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Contact Number
                    {whatsappEnabled && values.whatsappConsent && (
                      <span className="required-marker text-rose-600 dark:text-rose-400">*</span>
                    )}
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <CountryCodeSelect
                      value={values.countryCode}
                      onChange={handleCountryChange}
                      className="sm:w-44"
                    />
                    <div className="flex-1">
                      <InputField
                        label=""
                        field="contactNumber"
                        required={whatsappEnabled && values.whatsappConsent}
                        value={values.contactNumber}
                        onChange={handleChange}
                        error={errors.contactNumber}
                        placeholder={
                          values.countryCode === 'IN'
                            ? '10-digit number starting 6-9'
                            : '6 to 15 digits'
                        }
                        validator={(v) => {
                          if (whatsappEnabled && values.whatsappConsent) {
                            return validateContactNumber(v, dialCode);
                          }
                          return v ? validateContactNumber(v, dialCode) : '';
                        }}
                        onValidate={setError}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Timezone
                  </label>
                  {timezoneOptions.length > 1 ? (
                    <SelectField
                      name="timezone"
                      label=""
                      value={values.timezone}
                      onChange={handleChange}
                      options={timezoneOptions}
                      placeholder="Select Timezone"
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                      <span className="inline-flex h-6 items-center rounded-full bg-white px-2 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                        Auto
                      </span>
                      <span className="truncate">{values.timezone || '—'}</span>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            <Section title="Marketing Details">
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  name="status"
                  label="Subscription Status"
                  required
                  placeholder="Select Status"
                  value={values.status}
                  onChange={handleChange}
                  options={CONTACT_STATUS_OPTIONS}
                  error={errors.status}
                />
                <SelectField
                  name="source"
                  label="Source"
                  placeholder="Select Source"
                  value={values.source}
                  onChange={handleChange}
                  options={CONTACT_SOURCE_OPTIONS}
                  error={errors.source}
                />
                <InputField
                  name="tags"
                  label="Tags"
                  placeholder="Comma separated, e.g. Customer, VIP"
                  value={values.tags}
                  onChange={handleChange}
                />
                <InputField
                  name="segments"
                  label="Segments"
                  placeholder="Comma separated"
                  value={values.segments}
                  onChange={handleChange}
                />
              </div>
              <ConsentCheckbox
                name="emailConsent"
                checked={values.emailConsent}
                onChange={handleCheck}
                title="Email Consent"
                required
                hint="Allow this contact to receive Email campaigns. Unchecking excludes them from email campaigns."
              />
            </Section>

            {whatsappEnabled && (
              <Section
                title="WhatsApp Details"
                description="Shown because the WhatsApp Campaigns module is enabled."
              >
                <ConsentCheckbox
                  name="whatsappConsent"
                  checked={values.whatsappConsent}
                  onChange={handleCheck}
                  title="WhatsApp Consent"
                  hint="Allow this contact to receive WhatsApp campaigns. Requires a valid Contact Number."
                />
                <SelectField
                  name="whatsappOptInStatus"
                  label="WhatsApp Opt-In Status"
                  placeholder="Select Status"
                  value={
                    values.whatsappConsent
                      ? values.whatsappOptInStatus
                      : WHATSAPP_OPT_IN_STATUSES.PENDING
                  }
                  onChange={handleChange}
                  options={WHATSAPP_OPT_IN_OPTIONS}
                  error={errors.whatsappOptInStatus}
                  disabled={!values.whatsappConsent}
                />
              </Section>
            )}

            <section className="rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowAdditional((v) => !v)}
                aria-expanded={showAdditional}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <span>
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Additional Details
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    Location and internal notes (optional).
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    showAdditional ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {showAdditional && (
                <div className="space-y-4 border-t border-slate-200 px-4 py-4 dark:border-slate-700">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                      name="country"
                      label="Country"
                      placeholder="Select Country"
                      value={values.country}
                      onChange={handleChange}
                      options={COUNTRIES}
                      error={errors.country}
                    />
                    <SelectField
                      name="state"
                      label="State"
                      placeholder="Select State"
                      value={values.state}
                      onChange={handleChange}
                      options={stateOptions}
                      error={errors.state}
                      disabled={!values.country}
                    />
                    <SelectField
                      name="city"
                      label="City"
                      placeholder="Select City"
                      value={values.city}
                      onChange={handleChange}
                      options={cityOptions}
                      error={errors.city}
                      disabled={!values.state}
                    />
                    <InputField
                      field="postalCode"
                      required={false}
                      value={values.postalCode}
                      onChange={handleChange}
                      error={errors.postalCode}
                      validator={(v) => (v ? validatePostalCode(v) : '')}
                      onValidate={setError}
                    />
                  </div>
                  <TextAreaField
                    name="notes"
                    label="Notes"
                    placeholder="Internal notes about this contact"
                    value={values.notes}
                    onChange={handleChange}
                    maxLength={500}
                    error={errors.notes}
                  />
                </div>
              )}
            </section>
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:justify-end dark:border-slate-800 dark:bg-slate-900">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : mode === 'edit' ? 'Update Contact' : 'Save Contact'}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
