import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
} from 'recharts';
import {
  Briefcase,
  MessageSquareReply,
  CalendarClock,
  TrendingUp,
  Timer,
  MapPin,
  Building2,
  Flame,
  Hourglass,
  Activity,
  Award,
} from 'lucide-react';
import {
  computeAnalytics,
  STATUS_COLORS,
  WORK_MODE_COLORS,
  LANGUAGE_COLORS,
} from '@/utils/analytics';

const AXIS = { fill: 'hsl(240 8% 62%)', fontSize: 12 };
const GRID = 'hsl(240 8% 18%)';

const tooltipStyle = {
  background: 'hsl(240 12% 8%)',
  border: '1px solid hsl(240 8% 18%)',
  borderRadius: 12,
  fontSize: 12,
  color: 'hsl(220 20% 96%)',
};

function KpiCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="glass flex items-center gap-4 rounded-2xl border border-border/70 p-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-bold tabular-nums leading-tight">{value}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div
      className={`glass flex flex-col rounded-2xl border border-border/70 p-5 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function FactRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 py-2.5 last:border-0">
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 text-primary/80" />
        {label}
      </span>
      <span className="truncate text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-muted-foreground">
      No data yet
    </div>
  );
}

export function Dashboard({ jobs }) {
  const a = useMemo(() => computeAnalytics(jobs), [jobs]);

  if (!jobs.length) {
    return (
      <div className="glass flex flex-col items-center gap-2 rounded-2xl border border-border/70 py-24 text-center">
        <p className="font-medium">Nothing to analyze yet</p>
        <p className="text-sm text-muted-foreground">
          Add applications to see your stats here.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          icon={Briefcase}
          label="Total"
          value={a.total}
          sub={`${a.applied} awaiting reply`}
          accent="bg-primary/15 text-primary ring-1 ring-primary/30"
        />
        <KpiCard
          icon={MessageSquareReply}
          label="Response rate"
          value={`${a.responseRate}%`}
          sub={`${a.rejected} rejected`}
          accent="bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30"
        />
        <KpiCard
          icon={TrendingUp}
          label="Interview rate"
          value={`${a.interviewRate}%`}
          sub={`${a.inProcess} in process`}
          accent="bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30"
        />
        <KpiCard
          icon={Award}
          label="Offers"
          value={a.offers}
          sub={`${a.facts.activeShare}% still active`}
          accent="bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-500/30"
        />
        <KpiCard
          icon={CalendarClock}
          label="This week"
          value={a.thisWeek}
          sub="applied in last 7 days"
          accent="bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
        />
        <KpiCard
          icon={Timer}
          label="Avg age"
          value={`${a.avgDays}d`}
          sub="since applying"
          accent="bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
        />
      </div>

      {/* Charts grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Applications over time"
          subtitle="Per week, with cumulative total"
          className="lg:col-span-2"
        >
          {a.timeline.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={a.timeline} margin={{ top: 8, right: 8, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="week" tick={AXIS} tickLine={false} axisLine={false} />
                <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'hsl(240 8% 16% / 0.4)' }}
                />
                <Bar
                  dataKey="count"
                  name="Applied"
                  fill="hsl(245 80% 66%)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative"
                  stroke="hsl(158 64% 52%)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard title="Status breakdown" subtitle="Where things stand">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={a.byStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={2}
                stroke="none"
              >
                {a.byStatus.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] || STATUS_COLORS.Unknown}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs">
            {a.byStatus.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: STATUS_COLORS[s.name] || STATUS_COLORS.Unknown }}
                />
                {s.name} <span className="text-muted-foreground">({s.value})</span>
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Top locations" subtitle="Where you're applying">
          {a.byLocation.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={a.byLocation}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={AXIS}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(240 8% 16% / 0.4)' }} />
                <Bar dataKey="value" fill="hsl(199 89% 60%)" radius={[0, 6, 6, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard title="Work mode" subtitle="Remote vs hybrid vs on-site">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={a.byWorkMode}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={92}
                paddingAngle={2}
                stroke="none"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {a.byWorkMode.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={WORK_MODE_COLORS[entry.name] || WORK_MODE_COLORS.Unknown}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="By job site" subtitle="Where you find roles">
          {a.byJobSite.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={a.byJobSite} margin={{ top: 8, left: -12, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="name" tick={AXIS} tickLine={false} axisLine={false} />
                <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(240 8% 16% / 0.4)' }} />
                <Bar dataKey="value" fill="hsl(258 90% 70%)" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard
          title="Application pipeline"
          subtitle="From applied to offer"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={a.funnel} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
              <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="stage"
                tick={AXIS}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(240 8% 16% / 0.4)' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={34}>
                {a.funnel.map((entry, i) => (
                  <Cell
                    key={entry.stage}
                    fill={['#6366f1', '#38bdf8', '#a78bfa', '#34d399'][i]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Language" subtitle="Role language">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={a.byLanguage}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={88}
                paddingAngle={2}
                stroke="none"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {a.byLanguage.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={LANGUAGE_COLORS[entry.name] || LANGUAGE_COLORS.Unknown}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Quick facts" subtitle="At a glance">
          <div className="flex flex-col">
            <FactRow
              icon={MapPin}
              label="Top location"
              value={
                a.facts.topLocation
                  ? `${a.facts.topLocation.name} (${a.facts.topLocation.value})`
                  : '—'
              }
            />
            <FactRow
              icon={Building2}
              label="Top job site"
              value={
                a.facts.topSite
                  ? `${a.facts.topSite.name} (${a.facts.topSite.value})`
                  : '—'
              }
            />
            <FactRow
              icon={Flame}
              label="Busiest week"
              value={
                a.facts.busiestWeek
                  ? `${a.facts.busiestWeek.week} (${a.facts.busiestWeek.count})`
                  : '—'
              }
            />
            <FactRow
              icon={Activity}
              label="Last applied"
              value={a.facts.latest}
            />
            <FactRow
              icon={Hourglass}
              label="Longest open"
              value={
                a.facts.oldestOpen
                  ? `${a.facts.oldestOpen.label} · ${a.facts.oldestOpen.days}d`
                  : '—'
              }
            />
          </div>
        </ChartCard>
      </div>
    </motion.div>
  );
}
