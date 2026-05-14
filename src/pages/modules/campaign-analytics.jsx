/**
 * campaign-analytics.jsx
 *
 * Per-campaign analytics view. Reads precomputed metrics from the
 * service so the local Reports / Analytics modules can re-use the
 * same numbers. Renders cards + a delivery vs open vs click bar chart,
 * a 7-bucket engagement trend and a top-clicked-links list.
 *
 * When the campaign has not been sent yet we render the spec-required
 * "Analytics will appear after the campaign is sent." placeholder.
 */

import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, Mail } from 'lucide-react';

import PageHeader from '../../components/ui/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import CampaignStatusBadge from '../../components/campaigns/campaign-status-badge.jsx';
import CampaignMetrics from '../../components/campaigns/campaign-metrics.jsx';

import { CAMPAIGN_STATUSES, AUDIENCE_TYPE_LABELS } from '../../config/campaign-status.js';
import { getCampaignAnalytics } from '../../services/campaign-service.js';

function MaxBar({ label, value, max, tone = 'from-indigo-500 to-fuchsia-500' }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-200">
        <span>{label}</span>
        <span>{Number(value || 0).toLocaleString()}</span>
      </div>
      <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function CampaignAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();

  const data = useMemo(() => getCampaignAnalytics(id), [id]);

  useEffect(() => {
    if (!data) navigate('/app/campaigns', { replace: true });
  }, [data, navigate]);

  if (!data) return null;

  const { campaign, metrics, deliveryVsOpenVsClick, engagementTrend, topLinks } = data;
  const hasMetrics =
    campaign.status === CAMPAIGN_STATUSES.SENT && (metrics.sent || 0) > 0;

  const maxBar = Math.max(1, ...deliveryVsOpenVsClick.map((b) => b.value));
  const maxTrend = Math.max(
    1,
    ...engagementTrend.map((p) => Math.max(p.opens, p.clicks))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
        >
          <ArrowLeft className="h-4 w-4" /> Back to campaign
        </button>
      </div>

      <PageHeader
        title={`Analytics — ${campaign.campaignName}`}
        description={campaign.subjectLine}
        icon={BarChart3}
      />

      <div className="flex flex-wrap items-center gap-2">
        <CampaignStatusBadge status={campaign.status} />
        <Badge tone="indigo">{campaign.campaignType}</Badge>
        <Badge tone="slate">
          <Mail className="h-3 w-3" /> {AUDIENCE_TYPE_LABELS[campaign.audienceType]}
        </Badge>
      </div>

      {!hasMetrics ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Analytics will appear after the campaign is sent.
        </div>
      ) : (
        <>
          <CampaignMetrics metrics={metrics} />

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                Delivery vs Open vs Click
              </div>
              <div className="space-y-3">
                {deliveryVsOpenVsClick.map((b, i) => (
                  <MaxBar
                    key={b.label}
                    label={b.label}
                    value={b.value}
                    max={maxBar}
                    tone={
                      i === 0
                        ? 'from-emerald-500 to-teal-500'
                        : i === 1
                        ? 'from-fuchsia-500 to-pink-500'
                        : 'from-cyan-500 to-blue-500'
                    }
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                Engagement trend
              </div>
              <div className="flex items-end gap-2">
                {engagementTrend.map((p) => {
                  const oh = Math.max(4, Math.round((p.opens / maxTrend) * 100));
                  const ch = Math.max(4, Math.round((p.clicks / maxTrend) * 100));
                  return (
                    <div key={p.label} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex h-32 items-end gap-1">
                        <div
                          className="w-3 rounded-md bg-gradient-to-t from-indigo-500 to-fuchsia-500"
                          style={{ height: `${oh}%` }}
                          title={`Opens: ${p.opens}`}
                        />
                        <div
                          className="w-3 rounded-md bg-gradient-to-t from-cyan-500 to-blue-500"
                          style={{ height: `${ch}%` }}
                          title={`Clicks: ${p.clicks}`}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {p.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="h-2 w-3 rounded bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
                  Opens
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="h-2 w-3 rounded bg-gradient-to-r from-cyan-500 to-blue-500" />
                  Clicks
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                Top clicked links
              </div>
              {topLinks.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No click data available yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {topLinks.map((l) => (
                    <li
                      key={l.url}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <span className="truncate text-xs text-slate-700 dark:text-slate-200">
                        {l.url}
                      </span>
                      <Badge tone="indigo">{Number(l.clicks).toLocaleString()}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                Audience summary
              </div>
              <div className="grid gap-3 text-sm">
                <Row label="Audience" value={AUDIENCE_TYPE_LABELS[campaign.audienceType]} />
                {campaign.selectedSegmentName && (
                  <Row label="Segment" value={campaign.selectedSegmentName} />
                )}
                <Row label="Recipients" value={(campaign.recipientCount || 0).toLocaleString()} />
                <Row label="Template" value={campaign.templateName} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="col-span-2 text-sm text-slate-800 dark:text-slate-200">
        {value || <span className="text-slate-400 dark:text-slate-500">—</span>}
      </span>
    </div>
  );
}
