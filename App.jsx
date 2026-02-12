import { useState, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";

const COLORS = {
  navy: "#0f1b2d",
  navyLight: "#1a2d47",
  navyMid: "#243b5c",
  blue: "#3b82f6",
  blueLight: "#60a5fa",
  blueMuted: "#2563eb",
  orange: "#f59e0b",
  orangeWarm: "#d97706",
  green: "#10b981",
  greenDark: "#059669",
  red: "#ef4444",
  redSoft: "#f87171",
  purple: "#8b5cf6",
  slate: "#94a3b8",
  slateLight: "#cbd5e1",
  slateDark: "#475569",
  bg: "#0a1120",
  cardBg: "#111827",
  cardBorder: "#1e293b",
  inputBg: "#1e293b",
  textPrimary: "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  accent: "#38bdf8",
};

const LICENSE_COST = 20;

const DEFAULT_AGENTS = [
  { id: 1, name: "Information Retrieval Agent", turns: 1, costPerTurn: 0.12, color: COLORS.blue },
  { id: 2, name: "Task Agent", turns: 4, costPerTurn: 0.25, color: COLORS.orange },
  { id: 3, name: "Analyst Agent", turns: 8, costPerTurn: 0.50, color: COLORS.green },
  { id: 4, name: "Strategy Agent", turns: 3, costPerTurn: 0.90, color: COLORS.purple },
];

const DEFAULT_GROUPS = [
  { id: 1, name: "FLW", headcount: 1, sessions: 15, mix: [80, 20, 0, 0] },
  { id: 2, name: "Information Worker", headcount: 1, sessions: 40, mix: [30, 50, 10, 10] },
  { id: 3, name: "Manager", headcount: 1, sessions: 80, mix: [15, 45, 30, 10] },
  { id: 4, name: "Executive", headcount: 1, sessions: 120, mix: [5, 5, 50, 40] },
];

const Slider = ({ label, value, onChange, min, max, step, format, sublabel, color = COLORS.blue }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: 500, letterSpacing: "0.02em" }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}>
        {format ? format(value) : value}
      </span>
    </div>
    {sublabel && <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 4 }}>{sublabel}</div>}
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{
        width: "100%", height: 6, borderRadius: 3, outline: "none", cursor: "pointer",
        appearance: "none", WebkitAppearance: "none",
        background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, ${COLORS.inputBg} ${((value - min) / (max - min)) * 100}%, ${COLORS.inputBg} 100%)`,
      }}
    />
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>
      <span>{format ? format(min) : min}</span>
      <span>{format ? format(max) : max}</span>
    </div>
  </div>
);

const MixSlider = ({ agentName, value, onChange, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
    <span style={{ fontSize: 11, color: COLORS.textSecondary, width: 120, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agentName}</span>
    <input
      type="range" min={0} max={100} step={5} value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      style={{
        flex: 1, height: 4, borderRadius: 2, outline: "none", cursor: "pointer",
        appearance: "none", WebkitAppearance: "none",
        background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, ${COLORS.inputBg} ${value}%, ${COLORS.inputBg} 100%)`,
      }}
    />
    <span style={{ fontSize: 13, fontWeight: 600, color, width: 36, textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{value}%</span>
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: 12, padding: 24, ...style,
  }}>{children}</div>
);

const SectionLabel = ({ icon, text, color }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px",
    borderRadius: 20, background: `${color}18`, border: `1px solid ${color}30`,
    marginBottom: 16,
  }}>
    <span style={{ fontSize: 14 }}>{icon}</span>
    <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{text}</span>
  </div>
);

const MetricBox = ({ label, value, subtext, color = COLORS.accent }) => (
  <div style={{
    background: `${color}08`, border: `1px solid ${color}25`, borderRadius: 10,
    padding: "14px 18px", textAlign: "center", flex: 1, minWidth: 120,
  }}>
    <div style={{ fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.03em" }}>{value}</div>
    {subtext && <div style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 2 }}>{subtext}</div>}
  </div>
);

const TabButton = ({ active, onClick, children, icon }) => (
  <button onClick={onClick} style={{
    padding: "10px 20px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
    borderRadius: 8, transition: "all 0.2s",
    background: active ? COLORS.blue : "transparent",
    color: active ? "#fff" : COLORS.textSecondary,
    letterSpacing: "0.01em",
  }}>{icon} {children}</button>
);

const fmt = (v) => `$${v.toFixed(2)}`;
const fmtK = (v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`;
const fmtPct = (v) => `${(v * 100).toFixed(0)}%`;

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [agents, setAgents] = useState(DEFAULT_AGENTS);
  const [groups, setGroups] = useState(DEFAULT_GROUPS);
  const [license, setLicense] = useState(LICENSE_COST);

  // Quick scenario sliders (Dashboard)
  const [qCadence, setQCadence] = useState(40);
  const [qConversation, setQConversation] = useState(5);
  const [qComputation, setQComputation] = useState(0.12);
  const [visibleGroups, setVisibleGroups] = useState(() => DEFAULT_GROUPS.map((g) => g.id));

  const resetAll = useCallback(() => {
    setAgents(DEFAULT_AGENTS);
    setGroups(DEFAULT_GROUPS);
    setLicense(LICENSE_COST);
    setQCadence(40);
    setQConversation(5);
    setQComputation(0.12);
    setVisibleGroups(DEFAULT_GROUPS.map((g) => g.id));
  }, []);

  const quickCost = qCadence * qConversation * qComputation;

  const updateAgent = useCallback((id, field, value) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }, []);

  const updateGroup = useCallback((id, field, value) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  }, []);

  const updateMix = useCallback((groupId, agentIdx, value) => {
    setGroups((prev) => prev.map((g) => {
      if (g.id !== groupId) return g;
      const newMix = [...g.mix];
      newMix[agentIdx] = value;
      return { ...g, mix: newMix };
    }));
  }, []);

  const calculations = useMemo(() => {
    return groups.map((g) => {
      const agentCosts = agents.map((a, i) => {
        const pct = g.mix[i] / 100;
        const sessionsForAgent = g.sessions * pct;
        const costPerSession = a.turns * a.costPerTurn;
        return { agent: a.name, cost: sessionsForAgent * costPerSession, sessions: sessionsForAgent, color: a.color };
      });
      const totalPerUser = agentCosts.reduce((s, c) => s + c.cost, 0);
      const totalGroup = totalPerUser * g.headcount;
      const licenseCost = license * g.headcount;
      return { group: g.name, headcount: g.headcount, agentCosts, totalPerUser, totalGroup, licenseCost, savings: licenseCost - totalGroup };
    });
  }, [agents, groups, license]);

  const orgTotal = calculations.reduce((s, c) => s + c.totalGroup, 0);
  const orgLicense = calculations.reduce((s, c) => s + c.licenseCost, 0);
  const orgHeadcount = groups.reduce((s, g) => s + g.headcount, 0);
  const orgSavings = orgLicense - orgTotal;

  const sensitivityData = useMemo(() => {
    const points = [];
    for (let s = 0; s <= 250; s += 1) {
      points.push({
        sessions: s,
        yourConfig: s * qConversation * qComputation,
      });
    }
    return points;
  }, [qConversation, qComputation]);

  const compChartData = calculations.map((c) => ({
    name: c.group,
    ...Object.fromEntries(c.agentCosts.map((ac) => [ac.agent, ac.cost])),
    total: c.totalPerUser,
    license,
  }));

  const beYours = Math.floor(license / (qConversation * qComputation));
  const overBe = qCadence > beYours;

  const renderDashboard = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* HEADLINE COST BANNER — full width */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.navyLight}, ${COLORS.navyMid})`,
        border: `1px solid ${quickCost > license ? COLORS.red : COLORS.green}30`,
        borderRadius: 14, padding: "18px 28px",
        display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr auto 1fr", alignItems: "center", gap: 0,
      }}>
        {/* Cadence */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Cadence</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.green, fontFamily: "'JetBrains Mono', monospace" }}>{qCadence}</div>
          <div style={{ fontSize: 10, color: COLORS.textSecondary }}>sessions/mo</div>
        </div>
        <div style={{ fontSize: 20, color: COLORS.textMuted, fontWeight: 300, padding: "0 8px" }}>×</div>
        {/* Conversation */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Conversation</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.blue, fontFamily: "'JetBrains Mono', monospace" }}>{qConversation}</div>
          <div style={{ fontSize: 10, color: COLORS.textSecondary }}>turns/session</div>
        </div>
        <div style={{ fontSize: 20, color: COLORS.textMuted, fontWeight: 300, padding: "0 8px" }}>×</div>
        {/* Computation */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Computation</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.orange, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(qComputation)}</div>
          <div style={{ fontSize: 10, color: COLORS.textSecondary }}>cost/turn</div>
        </div>
        <div style={{ fontSize: 20, color: COLORS.textMuted, fontWeight: 300, padding: "0 8px" }}>=</div>
        {/* Monthly Cost */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Monthly Cost</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: quickCost > license ? COLORS.red : COLORS.green, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.03em" }}>{fmt(quickCost)}</div>
          <div style={{ fontSize: 10, color: COLORS.textSecondary }}>{(qCadence * qConversation).toLocaleString()} total turns</div>
        </div>
        {/* Divider */}
        <div style={{ width: 1, height: 50, background: `${COLORS.textMuted}30`, margin: "0 12px" }} />
        {/* vs License */}
        <div style={{ textAlign: "center", minWidth: 140 }}>
          <div style={{ fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>vs License</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.red, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(license)}</div>
          <div style={{
            marginTop: 4, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10, display: "inline-block",
            background: quickCost > license ? `${COLORS.red}20` : `${COLORS.green}20`,
            color: quickCost > license ? COLORS.red : COLORS.green,
          }}>
            {quickCost > license ? `License saves ${fmt(quickCost - license)}` : `PAYGO saves ${fmt(license - quickCost)}`}
          </div>
        </div>
      </div>

      {/* Two-column layout below */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24 }}>
        {/* Left: 4C Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionLabel icon="📅" text="Cadence" color={COLORS.green} />
            <Slider label="Sessions / Month" value={qCadence} onChange={setQCadence}
              min={1} max={250} step={1} color={COLORS.green}
              sublabel="How often do users engage?" />
          </Card>
          <Card>
            <SectionLabel icon="🗣️" text="Conversation" color={COLORS.blue} />
            <Slider label="Turns / Session" value={qConversation} onChange={setQConversation}
              min={1} max={25} step={1} color={COLORS.blue}
              sublabel="How deep does the dialogue go?" />
          </Card>
          <Card>
            <SectionLabel icon="⚙️" text="Computation" color={COLORS.orange} />
            <Slider label="Cost / Turn" value={qComputation} onChange={setQComputation}
              min={0.01} max={1.50} step={0.01} format={fmt} color={COLORS.orange}
              sublabel="How much backend work per turn?" />
          </Card>
        </div>

        {/* Right: Visualizations */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Sensitivity Chart */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 4 }}>
            Cost Curve: All 3 Sliders Drive This Chart
          </div>
          <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 12 }}>
            Cyan line = your current config ({qConversation} turns × {fmt(qComputation)}/turn). Vertical line = your cadence ({qCadence} sessions/mo). Red dashed = license.
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sensitivityData}>
              <defs>
                <linearGradient id="gYours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.cardBorder} />
              <XAxis dataKey="sessions" type="number" domain={[0, 250]} ticks={[0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250]} stroke={COLORS.textMuted} fontSize={10} label={{ value: "Sessions / Month (Cadence)", position: "insideBottom", offset: -2, fill: COLORS.textMuted, fontSize: 10 }} />
              <YAxis stroke={COLORS.textMuted} fontSize={10} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: COLORS.textPrimary }}
                labelFormatter={(v) => `${v} sessions/mo`}
                formatter={(v, name) => [fmt(v), name]}
              />
              <Area type="monotone" dataKey="yourConfig" name={`Your Config (${fmt(qComputation)}/turn)`} stroke={COLORS.accent} fill="url(#gYours)" strokeWidth={3} dot={false} />
              <ReferenceLine y={license} stroke={COLORS.red} strokeDasharray="10 5" strokeWidth={2.5}
                label={{ value: `License $${license}/mo`, fill: COLORS.red, fontSize: 11, fontWeight: 700, position: "right" }}
                ifOverflow="extendDomain" />
              <ReferenceLine x={qCadence} stroke={COLORS.green} strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `${qCadence} sess`, fill: COLORS.green, fontSize: 10, position: "top" }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* 4C Formula + Break-even + License */}
        <Card style={{ background: `linear-gradient(135deg, ${COLORS.navyLight}, ${COLORS.navyMid})`, border: `1px solid ${COLORS.accent}25` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 20, alignItems: "center" }}>
            {/* Left: 4C Formula */}
            <div>
              <SectionLabel icon="📐" text="The 4C Formula" color={COLORS.accent} />
              <div style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.8, marginTop: 8 }}>
                <span style={{ color: COLORS.green, fontWeight: 700 }}>Cadence</span> × <span style={{ color: COLORS.blue, fontWeight: 700 }}>Conversation</span> × <span style={{ color: COLORS.orange, fontWeight: 700 }}>Computation</span>
                <br />
                <span style={{ color: COLORS.textMuted }}>across a</span> <span style={{ color: COLORS.purple, fontWeight: 700 }}>Composition</span> <span style={{ color: COLORS.textMuted }}>of agents</span>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: COLORS.textMuted, lineHeight: 1.5 }}>
                Monthly Cost = Sessions × Turns × Cost/Turn
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 80, background: `${COLORS.textMuted}25` }} />

            {/* Center: Break-even */}
            <div>
              <SectionLabel icon="⚖️" text="Break-Even" color={COLORS.accent} />
              {(() => {
                const be = (qConversation * qComputation) > 0 ? Math.floor(license / (qConversation * qComputation)) : Infinity;
                const over = qCadence > be;
                return (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 8 }}>
                      At {qConversation} turns × {fmt(qComputation)}/turn, PAYGO stays cheaper up to:
                    </div>
                    <div style={{
                      display: "inline-flex", alignItems: "baseline", gap: 8, padding: "10px 16px", borderRadius: 10,
                      background: `${COLORS.accent}12`, border: `2px solid ${COLORS.accent}`,
                      boxShadow: `0 0 16px ${COLORS.accent}20`,
                    }}>
                      <span style={{ fontSize: 28, fontWeight: 800, color: COLORS.accent, fontFamily: "'JetBrains Mono', monospace" }}>{be === Infinity ? "∞" : be}</span>
                      <span style={{ fontSize: 11, color: COLORS.textSecondary }}>sessions/mo</span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: over ? COLORS.red : COLORS.green }}>
                      {be === Infinity
                        ? "✅ PAYGO is always cheaper (license is $0)"
                        : over
                          ? `⚠️ You're at ${qCadence} sessions — ${qCadence - be} over the break-even`
                          : `✅ You're at ${qCadence} sessions — ${be - qCadence} under the break-even`}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 80, background: `${COLORS.textMuted}25` }} />

            {/* Right: License Control */}
            <div>
              <SectionLabel icon="💰" text="License Cost" color={COLORS.red} />
              <Slider label="Per User / Month" value={license} onChange={setLicense}
                min={0} max={30} step={0.01} format={fmt} color={COLORS.red} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: COLORS.textSecondary }}>Exact:</span>
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <span style={{ position: "absolute", left: 10, fontSize: 13, color: COLORS.textMuted, pointerEvents: "none" }}>$</span>
                  <input
                    type="number" min={0} max={30} step={0.01}
                    value={license}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v >= 0 && v <= 30) setLicense(v);
                    }}
                    style={{
                      width: 90, padding: "6px 10px 6px 22px", borderRadius: 6, border: `1px solid ${COLORS.cardBorder}`,
                      background: COLORS.inputBg, color: COLORS.red, fontSize: 13, fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace", outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </div>
  );

  const renderComposition = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* TOP: License + Metrics + Chart — full width */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        {/* License control + org metrics stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <SectionLabel icon="💰" text="License" color={COLORS.red} />
            <Slider label="License Cost / User / Month" value={license} onChange={setLicense}
              min={0} max={30} step={0.01} format={fmt} color={COLORS.red} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 11, color: COLORS.textSecondary }}>Enter exact value:</span>
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: 10, fontSize: 13, color: COLORS.textMuted, pointerEvents: "none" }}>$</span>
                <input
                  type="number" min={0} max={30} step={0.01}
                  value={license}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v >= 0 && v <= 30) setLicense(v);
                  }}
                  style={{
                    width: 90, padding: "6px 10px 6px 22px", borderRadius: 6, border: `1px solid ${COLORS.cardBorder}`,
                    background: COLORS.inputBg, color: COLORS.red, fontSize: 13, fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace", outline: "none",
                  }}
                />
              </div>
            </div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MetricBox label="Org PAYGO / Mo" value={fmtK(orgTotal)} color={COLORS.blue} />
            <MetricBox label="Org License / Mo" value={fmtK(orgLicense)} color={COLORS.red} />
            <MetricBox label={orgSavings >= 0 ? "PAYGO Savings" : "License Savings"} value={fmtK(Math.abs(orgSavings))} subtext={fmtPct(Math.abs(orgSavings) / orgLicense)} color={orgSavings >= 0 ? COLORS.green : COLORS.red} />
            <MetricBox label="Total Users" value={orgHeadcount} color={COLORS.slate} />
          </div>
        </div>

        {/* Stacked bar chart */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>Per-User Cost Breakdown by Group (Composition View)</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {groups.map((g) => {
                const checked = visibleGroups.includes(g.id);
                return (
                  <label key={g.id} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 11, color: checked ? COLORS.textPrimary : COLORS.textMuted }}>
                    <input
                      type="checkbox" checked={checked}
                      onChange={() => setVisibleGroups((prev) => checked ? prev.filter((id) => id !== g.id) : [...prev, g.id])}
                      style={{ accentColor: COLORS.green, cursor: "pointer", width: 14, height: 14 }}
                    />
                    {g.name}
                  </label>
                );
              })}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={compChartData.filter((d) => visibleGroups.includes(groups.find((g) => g.name === d.name)?.id))} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.cardBorder} />
              <XAxis dataKey="name" stroke={COLORS.textMuted} fontSize={11} />
              <YAxis stroke={COLORS.textMuted} fontSize={10} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 8, fontSize: 11 }} formatter={(v) => fmt(v)} />
              {agents.map((a) => (
                <Bar key={a.id} dataKey={a.name} stackId="a" fill={a.color} radius={a.id === 4 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
              ))}
              <ReferenceLine y={license} stroke={COLORS.red} strokeDasharray="10 5" strokeWidth={2.5} label={{ value: `License $${license}/mo`, fill: COLORS.red, fontSize: 11, fontWeight: 700, position: "insideTopLeft" }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* BOTTOM: Agent definitions + Group cards — two column */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24 }}>
        {/* Left: Agent definitions */}
        <Card>
          <SectionLabel icon="🤖" text="Agent Definitions" color={COLORS.blue} />
          {agents.map((a) => (
            <div key={a.id} style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: `${a.color}08`, border: `1px solid ${a.color}20` }}>
              <input value={a.name} onChange={(e) => updateAgent(a.id, "name", e.target.value)}
                style={{ background: "transparent", border: "none", color: a.color, fontWeight: 700, fontSize: 13, width: "100%", outline: "none", marginBottom: 8 }} />
              <Slider label="Turns / Session" value={a.turns} onChange={(v) => updateAgent(a.id, "turns", v)}
                min={1} max={25} step={1} color={a.color} />
              <Slider label="Cost / Turn" value={a.costPerTurn} onChange={(v) => updateAgent(a.id, "costPerTurn", v)}
                min={0.01} max={1.50} step={0.01} format={fmt} color={a.color} />
              <div style={{ fontSize: 10, color: COLORS.textMuted, textAlign: "right" }}>
                Cost/Session: <span style={{ color: a.color, fontWeight: 700 }}>{fmt(a.turns * a.costPerTurn)}</span>
              </div>
            </div>
          ))}
        </Card>

        {/* Right: User Group definitions — mirrors Agent Definitions card */}
        <Card>
          <SectionLabel icon="👥" text="User Group Definitions" color={COLORS.green} />
          {groups.map((g, gi) => {
            const calc = calculations[gi];
            const mixTotal = g.mix.reduce((s, v) => s + v, 0);
            return (
              <div key={g.id} style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: `${COLORS.green}08`, border: `1px solid ${COLORS.green}20` }}>
                <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 180px", gap: 16, alignItems: "start" }}>
                  {/* Group settings */}
                  <div>
                    <input value={g.name} onChange={(e) => updateGroup(g.id, "name", e.target.value)}
                      style={{ background: "transparent", border: "none", color: COLORS.green, fontWeight: 700, fontSize: 13, width: "100%", outline: "none", marginBottom: 8 }} />
                    <Slider label="Sessions / Month" value={g.sessions} onChange={(v) => updateGroup(g.id, "sessions", v)}
                      min={1} max={400} step={1} color={COLORS.green} />
                    <Slider label="Headcount" value={g.headcount} onChange={(v) => updateGroup(g.id, "headcount", v)}
                      min={1} max={500} step={1} color={COLORS.slate} />
                  </div>

                  {/* Composition sliders */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.purple, letterSpacing: "0.04em" }}>🎨 COMPOSITION</span>
                      <span style={{ fontSize: 10, color: mixTotal === 100 ? COLORS.green : COLORS.red, fontWeight: 600 }}>
                        {mixTotal === 100 ? "✓ 100%" : `${mixTotal}% — ${mixTotal < 100 ? "under" : "over"} allocated`}
                      </span>
                    </div>
                    {agents.map((a, ai) => (
                      <MixSlider key={a.id} agentName={a.name} value={g.mix[ai]}
                        onChange={(v) => updateMix(g.id, ai, v)} color={a.color} />
                    ))}
                  </div>

                  {/* Results */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 4 }}>PAYGO / User / Mo</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: calc.totalPerUser > license ? COLORS.red : COLORS.green, fontFamily: "'JetBrains Mono', monospace" }}>
                      {fmt(calc.totalPerUser)}
                    </div>
                    <div style={{ fontSize: 10, color: COLORS.textMuted, margin: "4px 0" }}>vs {fmt(license)} license</div>
                    <div style={{
                      fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 12, display: "inline-block", marginTop: 4,
                      background: calc.savings >= 0 ? `${COLORS.green}20` : `${COLORS.red}20`,
                      color: calc.savings >= 0 ? COLORS.green : COLORS.red,
                    }}>
                      {calc.savings >= 0 ? "✅ PAYGO wins" : "🔴 License wins"}
                    </div>
                    <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 6 }}>
                      Group total: <span style={{ fontWeight: 700, color: COLORS.textSecondary }}>{fmtK(calc.totalGroup)}</span>/mo
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg, color: COLORS.textPrimary,
      fontFamily: "'Segoe UI', -apple-system, sans-serif", padding: "24px 32px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 16px; height: 16px; border-radius: 50%;
          background: #fff; cursor: pointer; border: 2px solid #3b82f6;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%;
          background: #fff; cursor: pointer; border: 2px solid #3b82f6;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.navyMid}; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.purple})`, fontSize: 18,
          }}>⚡</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: COLORS.textPrimary }}>
              The 4C Model
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: COLORS.textSecondary }}>
              <span style={{ color: COLORS.green }}>Cadence</span> × <span style={{ color: COLORS.blue }}>Conversation</span> × <span style={{ color: COLORS.orange }}>Computation</span> × <span style={{ color: COLORS.purple }}>Composition</span> = True Cost of AI Agents
            </p>
          </div>
        </div>
      </div>

      {/* Tabs + Reset */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 4, background: COLORS.cardBg, padding: 4, borderRadius: 10, width: "fit-content" }}>
          <TabButton active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon="📊">Explorer</TabButton>
          <TabButton active={tab === "composition"} onClick={() => setTab("composition")} icon="🎨">Composition Builder</TabButton>
        </div>
        <button onClick={resetAll} style={{
          padding: "8px 16px", border: `1px solid ${COLORS.cardBorder}`, cursor: "pointer",
          fontSize: 12, fontWeight: 600, borderRadius: 8, transition: "all 0.2s",
          background: COLORS.cardBg, color: COLORS.textSecondary, letterSpacing: "0.01em",
          display: "flex", alignItems: "center", gap: 6,
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.color = COLORS.red; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.cardBorder; e.currentTarget.style.color = COLORS.textSecondary; }}
        >
          ↺ Reset to Defaults
        </button>
      </div>

      {tab === "dashboard" && renderDashboard()}
      {tab === "composition" && renderComposition()}

      {/* Footer */}
      <div style={{ marginTop: 32, padding: "16px 0", borderTop: `1px solid ${COLORS.cardBorder}`, fontSize: 10, color: COLORS.textMuted, textAlign: "center" }}>
        4C Model: AI Agent Pricing Framework — All values are illustrative. Adjust inputs to reflect your organization's actual usage patterns and pricing.
      </div>
    </div>
  );
}
