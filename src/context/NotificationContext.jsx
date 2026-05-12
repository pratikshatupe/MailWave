import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Gauge,
  Gift,
  Megaphone,
} from 'lucide-react';
import { ROLES } from '../config/roles.js';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext(null);
const STORAGE_KEY = 'mailwave-notifications';

const SAMPLE_BY_ROLE = {
  [ROLES.SUPER_ADMIN]: [
    { type: 'payment-failed', icon: CreditCard, tone: 'rose', title: 'Payment failed for tenant Acme Inc.', meta: '2 minutes ago' },
    { type: 'announcement', icon: Megaphone, tone: 'indigo', title: 'You published an announcement to All Users', meta: '1 hour ago' },
    { type: 'usage-limit', icon: Gauge, tone: 'amber', title: 'Tenant "Northwind" reached 95% email quota', meta: 'Today, 09:14' },
    { type: 'campaign-sent', icon: CheckCircle2, tone: 'emerald', title: 'Global campaign digest delivered', meta: 'Yesterday' },
  ],
  [ROLES.BUSINESS_ADMIN]: [
    { type: 'approval-pending', icon: ClipboardCheck, tone: 'amber', title: '2 campaigns awaiting your approval', meta: '5 minutes ago' },
    { type: 'campaign-sent', icon: CheckCircle2, tone: 'emerald', title: 'Spring Sale campaign sent to 24,580 contacts', meta: '1 hour ago' },
    { type: 'usage-limit', icon: Gauge, tone: 'indigo', title: 'You\'ve used 78% of monthly email quota', meta: 'Today' },
    { type: 'announcement', icon: Megaphone, tone: 'fuchsia', title: 'Platform maintenance scheduled this Sunday', meta: 'Yesterday' },
  ],
  [ROLES.MARKETING_MANAGER]: [
    { type: 'campaign-sent', icon: CheckCircle2, tone: 'emerald', title: 'Welcome series automation completed for 312 contacts', meta: '20 minutes ago' },
    { type: 'approval-pending', icon: ClipboardCheck, tone: 'amber', title: 'Your "Black Friday Drop" campaign is awaiting approval', meta: '2 hours ago' },
    { type: 'announcement', icon: Megaphone, tone: 'indigo', title: 'New template library released — Spring 2026', meta: 'Yesterday' },
  ],
  [ROLES.VIEWER]: [
    { type: 'campaign-sent', icon: CheckCircle2, tone: 'emerald', title: 'Weekly performance digest is ready to view', meta: '15 minutes ago' },
    { type: 'announcement', icon: Megaphone, tone: 'indigo', title: 'New analytics filters are now available', meta: 'Yesterday' },
  ],
  [ROLES.INDIVIDUAL]: [
    { type: 'campaign-sent', icon: CheckCircle2, tone: 'emerald', title: 'Your "Newsletter #18" was sent successfully', meta: '10 minutes ago' },
    { type: 'referral', icon: Gift, tone: 'fuchsia', title: 'You earned a $20 referral reward', meta: '1 day ago' },
    { type: 'usage-limit', icon: Gauge, tone: 'amber', title: 'You\'ve used 60% of your Starter plan quota', meta: 'Today' },
    { type: 'announcement', icon: Megaphone, tone: 'indigo', title: 'Mailwave 2.4 — automation triggers redesigned', meta: '3 days ago' },
  ],
};

function seedFor(role) {
  const items = (SAMPLE_BY_ROLE[role] || []).map((n, i) => ({
    id: `${role}-${i}`,
    title: n.title,
    meta: n.meta,
    type: n.type,
    tone: n.tone,
    iconKey: n.iconKey || iconNameFor(n.icon),
    read: false,
  }));
  return items;
}

function iconNameFor(Icon) {
  if (Icon === CheckCircle2) return 'CheckCircle2';
  if (Icon === ClipboardCheck) return 'ClipboardCheck';
  if (Icon === CreditCard) return 'CreditCard';
  if (Icon === Gauge) return 'Gauge';
  if (Icon === Gift) return 'Gift';
  if (Icon === Megaphone) return 'Megaphone';
  return 'Bell';
}

export function iconFor(name) {
  switch (name) {
    case 'CheckCircle2': return CheckCircle2;
    case 'ClipboardCheck': return ClipboardCheck;
    case 'CreditCard': return CreditCard;
    case 'Gauge': return Gauge;
    case 'Gift': return Gift;
    case 'Megaphone': return Megaphone;
    default: return Bell;
  }
}

function loadStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(map) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const role = user?.role;
  const [byRole, setByRole] = useState(() => loadStored() || {});

  // Seed once per role on first login.
  useEffect(() => {
    if (!role) return;
    setByRole((prev) => {
      if (prev[role]) return prev;
      const next = { ...prev, [role]: seedFor(role) };
      return next;
    });
  }, [role]);

  useEffect(() => {
    persist(byRole);
  }, [byRole]);

  const items = role ? byRole[role] || [] : [];
  const unreadCount = items.filter((n) => !n.read).length;

  const markAsRead = useCallback(
    (id) => {
      if (!role) return;
      setByRole((prev) => ({
        ...prev,
        [role]: (prev[role] || []).map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
    },
    [role]
  );

  const markAllAsRead = useCallback(() => {
    if (!role) return;
    setByRole((prev) => ({
      ...prev,
      [role]: (prev[role] || []).map((n) => ({ ...n, read: true })),
    }));
  }, [role]);

  const clearAll = useCallback(() => {
    if (!role) return;
    setByRole((prev) => ({ ...prev, [role]: [] }));
  }, [role]);

  const value = useMemo(
    () => ({ items, unreadCount, markAsRead, markAllAsRead, clearAll }),
    [items, unreadCount, markAsRead, markAllAsRead, clearAll]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
}
