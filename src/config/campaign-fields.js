/**
 * campaign-fields.js
 *
 * Field definitions for the campaign wizard. Each entry is shaped like an
 * entry in formFields.js so InputField / SelectField can hydrate from it.
 *
 * Validation is delegated to utils/validators.js — we never duplicate the
 * email / name / required logic here.
 */

import { Mail, Tag, Type, User as UserIcon } from 'lucide-react';
import { LABELS } from './labels.js';
import { RULES } from './validationRules.js';
import { CAMPAIGN_TYPE_LIST } from './campaign-status.js';

export const CAMPAIGN_FIELDS = {
  campaignName: {
    name: 'campaignName',
    label: LABELS.campaignName,
    placeholder: `Enter ${LABELS.campaignName}`,
    type: 'text',
    required: true,
    minLength: RULES.campaignName.minLength,
    maxLength: 100,
    validationRule: 'campaignName',
    icon: Tag,
    trimOnBlur: true,
    defaultValue: '',
  },
  campaignType: {
    name: 'campaignType',
    label: 'Campaign Type',
    placeholder: 'Select Campaign Type',
    type: 'select',
    required: true,
    options: CAMPAIGN_TYPE_LIST.map((value) => ({ value, label: value })),
    defaultValue: 'Regular',
  },
  subjectLine: {
    name: 'subjectLine',
    label: LABELS.subjectLine,
    placeholder: `Enter ${LABELS.subjectLine}`,
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 150,
    validationRule: 'subjectLine',
    icon: Type,
    trimOnBlur: true,
    defaultValue: '',
  },
  previewText: {
    name: 'previewText',
    label: 'Preview Text',
    placeholder: 'Enter Preview Text',
    type: 'text',
    required: false,
    maxLength: 200,
    icon: Type,
    defaultValue: '',
  },
  senderName: {
    name: 'senderName',
    label: LABELS.senderName,
    placeholder: `Enter ${LABELS.senderName}`,
    type: 'text',
    required: true,
    minLength: 2,
    maxLength: 60,
    validationRule: 'senderName',
    icon: UserIcon,
    allowOnly: 'lettersSpaces',
    trimOnBlur: true,
    defaultValue: '',
  },
  senderEmailId: {
    name: 'senderEmailId',
    label: LABELS.senderEmailId,
    placeholder: `Enter ${LABELS.senderEmailId}`,
    type: 'email',
    required: true,
    validationRule: 'senderEmailId',
    icon: Mail,
    trimOnBlur: true,
    defaultValue: '',
  },
  replyToEmailId: {
    name: 'replyToEmailId',
    label: 'Reply To Email ID',
    placeholder: 'Enter Reply To Email ID',
    type: 'email',
    required: false,
    validationRule: 'replyToEmailId',
    icon: Mail,
    trimOnBlur: true,
    defaultValue: '',
  },
};

export const STEP_FIELDS = {
  1: ['campaignName', 'campaignType', 'subjectLine', 'previewText', 'senderName', 'senderEmailId', 'replyToEmailId'],
  2: ['audienceType'],
  3: ['templateId'],
  4: ['scheduleOption', 'scheduledAt'],
  5: [],
};

export default CAMPAIGN_FIELDS;
