/**
 * mock/contact-activity.js
 *
 * Deterministic mock activity entries for the contact details page. The
 * service composes these into a per-contact timeline so every contact
 * appears to have a believable history.
 */

import { ACTIVITY_TYPES } from '../config/contact-fields.js';

function isoDate(daysAgo, hourOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hourOffset);
  return d.toISOString();
}

/**
 * Returns a templated set of activity events for a given contact.
 * The variety differs depending on the contact's status so the timeline
 * feels consistent (e.g. an unsubscribed contact has an Unsubscribed entry).
 */
export function buildActivityForContact(contact) {
  if (!contact) return [];
  const events = [];

  events.push({
    id: `act-${contact.id}-created`,
    type: ACTIVITY_TYPES.CONTACT_CREATED,
    description: `Contact was added via ${contact.source}.`,
    occurredAt: contact.createdAt || isoDate(60),
  });

  if (contact.source === 'CSV Import') {
    events.push({
      id: `act-${contact.id}-imported`,
      type: ACTIVITY_TYPES.CONTACT_IMPORTED,
      description: 'Imported as part of a CSV upload.',
      occurredAt: contact.createdAt || isoDate(59),
    });
  }

  (contact.tags || []).forEach((tag, idx) => {
    events.push({
      id: `act-${contact.id}-tag-${idx}`,
      type: ACTIVITY_TYPES.TAG_ADDED,
      description: `Tag "${tag}" was added.`,
      occurredAt: isoDate(40 - idx * 2, idx * 3),
    });
  });

  events.push({
    id: `act-${contact.id}-camp-1`,
    type: ACTIVITY_TYPES.CAMPAIGN_SENT,
    description: 'Campaign "Spring Sale 2026" sent.',
    occurredAt: isoDate(20),
  });

  if (contact.engagementScore > 30) {
    events.push({
      id: `act-${contact.id}-opened`,
      type: ACTIVITY_TYPES.EMAIL_OPENED,
      description: 'Opened "Spring Sale 2026" email.',
      occurredAt: isoDate(19),
    });
  }
  if (contact.engagementScore > 60) {
    events.push({
      id: `act-${contact.id}-clicked`,
      type: ACTIVITY_TYPES.EMAIL_CLICKED,
      description: 'Clicked pricing link inside the email.',
      occurredAt: isoDate(18),
    });
  }
  if (contact.status === 'bounced') {
    events.push({
      id: `act-${contact.id}-bounced`,
      type: ACTIVITY_TYPES.EMAIL_BOUNCED,
      description: 'Last campaign bounced (mailbox unavailable).',
      occurredAt: isoDate(17),
    });
  }
  if (contact.status === 'unsubscribed') {
    events.push({
      id: `act-${contact.id}-unsub`,
      type: ACTIVITY_TYPES.UNSUBSCRIBED,
      description: contact.unsubscribeReason
        ? `Unsubscribed. Reason: ${contact.unsubscribeReason}.`
        : 'Contact unsubscribed.',
      occurredAt: contact.unsubscribedAt || isoDate(10),
    });
  }
  if (contact.whatsappOptInStatus === 'opted_in') {
    events.push(
      {
        id: `act-${contact.id}-wa-delivered`,
        type: ACTIVITY_TYPES.WHATSAPP_DELIVERED,
        description: 'WhatsApp campaign delivered.',
        occurredAt: isoDate(5),
      },
      {
        id: `act-${contact.id}-wa-read`,
        type: ACTIVITY_TYPES.WHATSAPP_READ,
        description: 'WhatsApp message read.',
        occurredAt: isoDate(5, 2),
      },
    );
    if (contact.engagementScore > 70) {
      events.push({
        id: `act-${contact.id}-wa-replied`,
        type: ACTIVITY_TYPES.WHATSAPP_REPLIED,
        description: 'Replied to WhatsApp campaign.',
        occurredAt: isoDate(4),
      });
    }
  }

  return events.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
}

export default buildActivityForContact;
