// src/lib/mappers/dashboard-mapper.ts
// Backend -> Frontend mapping helpers for Dashboard.tsx

export type KpiCards = {
  totalEngagers: { value: string; spark?: number[] };
  highIntentPct: { value: string; spark?: number[] };
  leads: { value: string; spark?: number[] };
  dms: { value: string; spark?: number[] };
  avgScore: { value: string; spark?: number[] };
  confidence: { value: string; spark?: number[] };
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function shortDateLabel(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}`;
}

// -------- KPIs --------
// backend: KpisResponse
export function mapDashboardKpisToCards(kpis: any): KpiCards {
  const total = Number(kpis?.totalEngagersAnalyzed ?? 0);
  const highPct = Number(kpis?.highIntentUsersPercent ?? 0);
  const leads = Number(kpis?.leadsGenerated ?? 0);
  const dms = Number(kpis?.dmsSent ?? 0);
  const avgScore = Number(kpis?.avgConversionScore ?? 0);
  const confRaw = Number(kpis?.avgAiConfidenceScore ?? 0);
  const confPct = confRaw > 1 ? Math.round(clamp(confRaw, 0, 100)) : Math.round(clamp(confRaw, 0, 1) * 100);

  return {
    totalEngagers: { value: String(total) },
    highIntentPct: { value: `${Math.round(clamp(highPct, 0, 100))}%` },
    leads: { value: String(leads) },
    dms: { value: String(dms) },
    avgScore: { value: String(Math.round(clamp(avgScore, 0, 100))) },
    confidence: { value: `${confPct}%` },
  };
}

// -------- Engagement trend line --------
// backend: EngagementQualityTrendResponse { data: [{date, high, medium, low}] }
export function mapTrendToLine(trend: any): Array<{ date: string; score: number }> {
  const rows = Array.isArray(trend?.data) ? trend.data : [];

  return rows.map((p: any) => {
    const high = Number(p?.high ?? 0);
    const med = Number(p?.medium ?? 0);
    const low = Number(p?.low ?? 0);
    const total = high + med + low;

    // Weighted score -> 0..100
    const score = total > 0 ? (high * 100 + med * 60 + low * 20) / total : 0;

    const d = p?.date ? new Date(p.date) : null;
    const label = d && !Number.isNaN(d.getTime()) ? shortDateLabel(d) : '—';

    return { date: label, score: Math.round(clamp(score, 0, 100)) };
  });
}

// -------- Intent distribution bars --------
// backend: IntentDistributionResponse { data: [{label, value, percentage}] }
export function mapIntentToBars(intent: any): Array<{ name: string; value: number; fill?: string }> {
  const rows = Array.isArray(intent?.data) ? intent.data : [];
  const fillMap: Record<string, string> = {
    High: '#6366f1',
    Medium: '#a78bfa',
    Low: '#cbd5e1',
  };

  return rows.map((r: any) => {
    const label = String(r?.label ?? 'Other');
    const value = Number(r?.value ?? 0);
    return { name: label, value, fill: fillMap[label] };
  });
}

// -------- Persona breakdown pie --------
// backend: PersonaBreakdownResponse { data: [{label, value, percentage}] }
export function mapPersonaToPie(persona: any): Array<{ name: string; value: number; fill?: string }> {
  const rows = Array.isArray(persona?.data) ? persona.data : [];
  const palette = ['#6366f1', '#a78bfa', '#fb7185', '#22c55e', '#f59e0b', '#06b6d4', '#94a3b8'];

  return rows.map((r: any, idx: number) => {
    const label = String(r?.label ?? 'Other');
    const pct = Number(r?.percentage ?? 0);
    return { name: label, value: Math.round(clamp(pct, 0, 100)), fill: palette[idx % palette.length] };
  });
}