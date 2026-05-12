import { useState, useCallback } from "react";

const LABELS = {
  maturity:    { early: "Under 50 units", growth: "50–200 units", mature: "200+ units" },
  vertical:    { food_qsr: "Food/QSR", home_services: "Home services", health_wellness: "Health & wellness", b2b: "B2B/commercial", senior_care: "Senior care", fitness: "Fitness", other: "Other" },
  fc_usage:    { basic: "Basic (contact database)", moderate: "Moderate (pipeline + some automation)", advanced: "Advanced (sequences, scoring, reporting)" },
  pain_point:  { speed: "Slow speed-to-contact", qualification: "Wasting time on unqualified leads", nurture: "Losing 'not yet' leads", visibility: "No pipeline visibility", dd_conversion: "Low Discovery Day conversion", all: "All of the above" },
  team_size:   { founder_led: "0–1 FSEs (founder-led)", small_team: "2–3 FSEs", full_team: "4+ FSEs" },
  lead_source: { broker_heavy: "Mostly broker/consultant referrals", portal_heavy: "Mostly portals", organic: "Mostly organic/brand", mixed: "Fairly mixed across sources" },
  scoring:     { none: "No scoring model", informal: "Informal — FSEs judge it manually", configured: "Configured in FranConnect", other_tool: "Tracked outside FranConnect" },
};

const BLUEPRINTS = {
  "speed-to-contact":           { name: "Speed-to-Contact Blueprint",            url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQAnvZScv57XQIOywFuaLaYRAd0oCgMSIqXh6NvHGGkJXwk?e=kGxgF3" },
  "lead-routing":               { name: "Lead Routing Blueprint",                url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQAioIAI8NMQQqmiQC6QAZeuAfovadiuRc434uQtyOYjgKw?e=Xtz8EL" },
  "heat-meter-configuration":   { name: "Heat Meter Configuration Blueprint",    url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQBrNR9rmGBnTJuor6Jf8awCATvavZRVMfG6WaWp_3j35jE?e=FU1bLi" },
  "interest-form-design":       { name: "Interest Form Design Blueprint",        url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQAioIAI8NMQQqmiQC6QAZeuAfovadiuRc434uQtyOYjgKw?e=DLErY2" },
  "candidate-prequalification": { name: "Candidate Pre-Qualification Blueprint", url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQCspP5GrKWoQJr7T4k_B1cdAfUk18uWvORO_egD9sJigfc?e=bmtOlm" },
  "new-lead-welcome":           { name: "New Lead Welcome Blueprint",            url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQA8fIVP1k3vSrQzC0MplU3NAdwoKhzTSDhxhMnH-Mn48Jg?e=Zh52QE" },
  "dormant-lead-revival":       { name: "Dormant Lead Revival Blueprint",        url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQACIV-4lcy-QIeEEk0lj1diAdR8p4IvZtQMose24znC3zs?e=2t9GdQ" },
  "pipeline-health":            { name: "Pipeline Health Blueprint",             url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQDkxSi74556ToByXHxe6UmgATSpCVFiJIU_0pe2_IGAE_c?e=KfdnO1" },
  "fdd-delivery":               { name: "FDD Delivery Blueprint",                url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQASjTyfup3gS6WeKQ3aKWINATonzlqDwiBzE9qgMfo6tZk?e=wR3bXc" },
  "discovery-day":              { name: "Discovery Day Blueprint",               url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQCb7p3wFS23R7mLlbl4QOHyAa-1TRCm6RWmzeeAXrtiGkc?e=L0vhlA" },
  "email-reengagement":         { name: "Email Re-engagement Blueprint",         url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQB7VLmzmC5RRpGK5e2QJwXtAST__1hofxQSTCk6U2cxz9w?e=7D0rzE" },
  "click-engagement":           { name: "Click Engagement Blueprint",            url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQCHYyg5R89dQaVUViLp3NIkAeunHSU4ycnFc6B-xSDzvvE?e=ebaBgj" },
  "lost-lead-analysis":         { name: "Lost Lead Analysis Blueprint",          url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQA8fIVP1k3vSrQzC0MplU3NAdwoKhzTSDhxhMnH-Mn48Jg?e=Zh52QE" },
  "sms-configuration":          { name: "SMS Configuration Blueprint",           url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQDIsNGSnGIrQ7mUirb0hHlLAc6FotARpr-S7lZ5js18kZs?e=sD9LKR" },
  "pipeline-reporting":         { name: "Pipeline Reporting Blueprint",          url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQCJ55gToLWOTqBjUz9AQVphAYGJT39-xkoUZDdfk53z1R8?e=ynQyiW" },
  "sales-team-productivity":    { name: "Sales Team Productivity Blueprint",     url: "https://francon1062.sharepoint.com/:w:/s/franconnectuniversity/IQA-jUR_r3LzTbJnfcmdPpdgAU41k_UpYKZWmKNSsNIZSH0?e=I4laeV" },
};

const STEPS = [
  { key: null, label: "Before we begin", title: "What's your name and email?", type: "contact" },
  { key: "maturity", label: "System size", title: "How many franchise units does your system currently have?", options: [
    { val: "early",  label: "Under 50 units",  sub: "Early stage — still finding your ICP and process" },
    { val: "growth", label: "50–200 units",    sub: "Growth stage — scaling what works" },
    { val: "mature", label: "200+ units",      sub: "Mature — managing volume and brand pull" },
  ]},
  { key: "vertical", label: "Vertical", title: "What's your primary franchise vertical?", options: [
    { val: "food_qsr",        label: "Food / QSR" },
    { val: "home_services",   label: "Home services" },
    { val: "health_wellness", label: "Health & wellness" },
    { val: "b2b",             label: "B2B / commercial services" },
    { val: "senior_care",     label: "Senior care" },
    { val: "fitness",         label: "Fitness" },
    { val: "other",           label: "Other" },
  ]},
  { key: "fc_usage", label: "FC usage", title: "How would you describe your current FranConnect usage?", options: [
    { val: "basic",    label: "Basic — mostly using it as a contact database",           sub: "Lead records, some notes, maybe email logging" },
    { val: "moderate", label: "Moderate — pipeline stages and some automation in place", sub: "Stage gates configured, a few workflows running" },
    { val: "advanced", label: "Advanced — sequences, scoring, and reporting active",     sub: "Nurture flows, lead scoring, performance dashboards" },
  ]},
  { key: "pain_point", label: "Pain point", title: "Where is your biggest pain point right now?", options: [
    { val: "speed",         label: "Slow speed-to-contact — leads go cold before we reach them" },
    { val: "qualification", label: "Wasting FSE time on unqualified leads" },
    { val: "nurture",       label: "Losing \"not yet\" leads — no consistent follow-up" },
    { val: "visibility",    label: "No visibility into pipeline — can't tell what's working" },
    { val: "dd_conversion", label: "Discovery Day conversion is lower than it should be" },
    { val: "all",           label: "All of the above honestly" },
  ]},
  { key: "team_size", label: "Team size", title: "How many dedicated franchise sales executives (FSEs) do you have?", options: [
    { val: "founder_led", label: "0–1 — founder or single rep handling all sales" },
    { val: "small_team",  label: "2–3 FSEs" },
    { val: "full_team",   label: "4+ FSEs or a structured sales team" },
  ]},
  { key: "lead_source", label: "Lead sources", title: "Where do most of your leads come from?", options: [
    { val: "broker_heavy", label: "Mostly broker / consultant referrals", sub: "FranChoice, FBA, independent consultants" },
    { val: "portal_heavy", label: "Mostly portals",                       sub: "Franchise Gator, Franchise Business Review, etc." },
    { val: "organic",      label: "Mostly organic / brand",               sub: "Website, PR, social, word of mouth" },
    { val: "mixed",        label: "Fairly mixed across sources" },
  ]},
  { key: "scoring", label: "Lead scoring", title: "Do you have a lead scoring or qualification model?", options: [
    { val: "none",       label: "No — qualification is ad hoc",                                  sub: "FSEs decide what to pursue based on feel" },
    { val: "informal",   label: "Informal — we know the criteria but it lives in people's heads" },
    { val: "configured", label: "Configured in FranConnect",                                      sub: "Scoring fields or qualification stages are set up" },
    { val: "other_tool", label: "Tracked outside FranConnect",                                    sub: "Spreadsheet, separate CRM, or another tool" },
  ]},
];

const NAVY   = "#134564";
const ORANGE = "#e07300";
const FONT   = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const priorityStyle = {
  high:   { bg: "#FAECE7", color: "#993C1D" },
  medium: { bg: "#FAEEDA", color: "#854F0B" },
  low:    { bg: "#EAF3DE", color: "#3B6D11" },
};

function ProgressBar({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 5, marginBottom: "2rem" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 3, flex: 1, borderRadius: 2,
          background: i < current ? ORANGE : i === current ? "#f5c080" : "#e5e5e5",
          transition: "background 0.3s",
        }} />
      ))}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "11px 14px", borderRadius: 8,
  border: "1.5px solid #ddd", fontSize: 14, fontFamily: FONT,
  background: "#fff", color: "#111", marginTop: 5, outline: "none",
  boxSizing: "border-box",
};

function ContactStep({ answers, onChange, onNext }) {
  const [name,  setName]  = useState(answers.name  || "");
  const [email, setEmail] = useState(answers.email || "");
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canNext = name.trim().length > 1 && emailValid;
  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT }}>Full name</label>
        <input style={inputStyle} placeholder="Jane Smith" value={name}
          onChange={e => { setName(e.target.value); onChange("name", e.target.value); }} />
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT }}>Work email</label>
        <input style={inputStyle} type="email" placeholder="jane@yourfranchise.com" value={email}
          onChange={e => { setEmail(e.target.value); onChange("email", e.target.value); }} />
        {email.length > 4 && !emailValid && (
          <p style={{ fontSize: 12, color: "#c0392b", marginTop: 4, fontFamily: FONT }}>Please enter a valid email address.</p>
        )}
      </div>
      <p style={{ fontSize: 12, color: "#bbb", margin: "10px 0 1.75rem", fontFamily: FONT }}>
        Your Blueprint report will be generated instantly. Our team will also receive a copy.
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onNext} disabled={!canNext} style={btnStyle(!canNext)}>Next →</button>
      </div>
    </div>
  );
}

function OptionStep({ step, stepIndex, totalSteps, selected, onSelect, onNext, onBack }) {
  return (
    <div>
      <div style={{ display: "grid", gap: 8, marginBottom: "1.5rem" }}>
        {step.options.map(opt => {
          const sel = selected === opt.val;
          return (
            <button key={opt.val} onClick={() => onSelect(opt.val)} style={{
              background: sel ? "#EBF4EF" : "#fff",
              border: sel ? `2px solid ${NAVY}` : "1.5px solid #e0e0e0",
              borderRadius: 10, padding: "12px 16px", cursor: "pointer",
              textAlign: "left", fontSize: 14, color: sel ? NAVY : "#222",
              fontFamily: FONT, transition: "all 0.15s",
            }}>
              <div style={{ fontWeight: sel ? 600 : 400 }}>{opt.label}</div>
              {opt.sub && <div style={{ fontSize: 12, color: sel ? "#2a6a54" : "#999", marginTop: 3 }}>{opt.sub}</div>}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBack} style={backBtnStyle}>← Back</button>
        <span style={{ fontSize: 11, color: "#ccc", fontWeight: 600, fontFamily: FONT }}>{stepIndex} of {totalSteps}</span>
        <button onClick={onNext} disabled={!selected} style={btnStyle(!selected)}>
          {stepIndex === totalSteps ? "Get my Blueprint →" : "Next →"}
        </button>
      </div>
    </div>
  );
}

function RecItem({ rec }) {
  const [open, setOpen] = useState(false);
  const ps = priorityStyle[rec.priority] || priorityStyle.low;
  const blueprint = rec.guide_anchor ? BLUEPRINTS[rec.guide_anchor] : null;
  const blueprintName = blueprint ? blueprint.name : null;
  const guideUrl = blueprint ? blueprint.url : null;
  return (
    <div onClick={() => setOpen(o => !o)} style={{
      background: "#fff", border: "1.5px solid #ebebeb", borderRadius: 10,
      padding: "1rem 1.2rem", marginBottom: 8, cursor: "pointer",
      boxShadow: open ? "0 2px 10px rgba(0,0,0,0.06)" : "none",
      transition: "box-shadow 0.15s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{
          fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 4,
          background: ps.bg, color: ps.color, whiteSpace: "nowrap",
          marginTop: 3, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: FONT,
        }}>{rec.priority}</span>
        <span style={{ fontSize: 14, fontWeight: 500, flex: 1, color: "#111", lineHeight: 1.45, fontFamily: FONT }}>{rec.title}</span>
        <span style={{
          color: "#ccc", fontSize: 13, marginTop: 2, flexShrink: 0,
          display: "inline-block",
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 0.2s",
        }}>▾</span>
      </div>
      {open && (
        <div style={{ marginTop: 12, borderTop: "1px solid #f2f2f2", paddingTop: 12 }}>
          <p style={{ fontSize: 13, color: "#555", lineHeight: 1.75, margin: "0 0 12px", fontFamily: FONT }}>{rec.body}</p>
          {blueprintName && guideUrl && (
            <a href={guideUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 600, color: ORANGE,
                textDecoration: "none", padding: "6px 12px",
                background: "#FDF3E7", borderRadius: 6,
                border: "1px solid #f5d4a8", fontFamily: FONT,
              }}>
              📄 {blueprintName} →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function btnStyle(disabled) {
  return {
    background: disabled ? "#c8dfe9" : NAVY,
    border: "none", color: "#fff", fontWeight: 600,
    padding: "10px 22px", borderRadius: 8, fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: FONT, transition: "background 0.2s",
  };
}

const backBtnStyle = {
  background: "transparent", border: "1.5px solid #e0e0e0",
  color: "#aaa", padding: "10px 20px", borderRadius: 8,
  fontSize: 13, cursor: "pointer", fontFamily: FONT,
};

export default function App() {
  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [report,  setReport]  = useState(null);
  const [error,   setError]   = useState(null);

  const totalSteps = STEPS.length;
  const setAnswer  = useCallback((key, val) => setAnswers(a => ({ ...a, [key]: val })), []);
  const next = () => { if (step < totalSteps - 1) setStep(s => s + 1); else generate(); };
  const back = () => setStep(s => s - 1);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maturity:    answers.maturity,
          vertical:    answers.vertical,
          fc_usage:    answers.fc_usage,
          pain_point:  answers.pain_point,
          team_size:   answers.team_size,
          lead_source: answers.lead_source,
          scoring:     answers.scoring,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      setReport(data);
    } catch (e) {
      setError(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function restart() { setStep(0); setAnswers({}); setReport(null); setError(null); }

  const currentStepDef = STEPS[step];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "1.75rem 1rem", fontFamily: FONT }}>

      {/* Logo + series label */}
      <div style={{ marginBottom: "1.75rem" }}>
        <svg height="30" viewBox="0 0 1867 446.19" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", marginBottom: 10 }}>
          <defs><style>{`.fc1{fill:#717171}.fc2{fill:#e07300}.fc3{fill:#cfcdc9}.fc4{fill:#134564}`}</style></defs>
          <path className="fc1" d="M159.55,276.89,342.84,171.56l116.05,60.29L329.43,297.19c-50.91,25.7-115.15,20.58-159.73-12.72Z"/>
          <path className="fc2" d="M458.89,231.85V168.63a53.73,53.73,0,0,0-32.47-49.35L149.67,0l.06,1.05c3,51.27,36.27,97.64,88.1,122.93Z"/>
          <path className="fc3" d="M299.34,169.3,116.05,274.62,0,214.33,129.46,149c50.91-25.69,115.15-20.57,159.74,12.73Z"/>
          <path className="fc4" d="M0,214.33v50.1A73.68,73.68,0,0,0,44.52,332.1l264.7,114.09-.06-1.06c-3-51.26-36.27-97.63-88.09-122.92Z"/>
          <path className="fc4" d="M546.2,343.53V238L535,236.26a13.17,13.17,0,0,1-5.84-2.57,6.43,6.43,0,0,1-2.2-5.22V215.79H546.2v-9.55a55.76,55.76,0,0,1,3.33-19.85A40.25,40.25,0,0,1,574.21,162a58.37,58.37,0,0,1,20.1-3.26,55.83,55.83,0,0,1,16.58,2.38l-.63,15.58a4.93,4.93,0,0,1-1,2.83,5.61,5.61,0,0,1-2.33,1.63,12.56,12.56,0,0,1-3.33.75,39,39,0,0,1-4,.19,37.06,37.06,0,0,0-9.87,1.2,16.63,16.63,0,0,0-7.35,4.14,19,19,0,0,0-4.58,7.78,39.31,39.31,0,0,0-1.57,12v8.54h33.54v22.1H577.22V343.53Z"/>
          <path className="fc4" d="M656.48,237q6-11.55,14.32-18.15a30.57,30.57,0,0,1,19.6-6.59q8.91,0,14.32,3.89l-2,23.24a6,6,0,0,1-1.81,3.2,5,5,0,0,1-3.21,1,36.22,36.22,0,0,1-5.58-.63,43.28,43.28,0,0,0-7.23-.63,25.9,25.9,0,0,0-9.17,1.51,23.08,23.08,0,0,0-7.22,4.33,29.48,29.48,0,0,0-5.65,6.85,65.67,65.67,0,0,0-4.59,9.16v79.39h-31V214.66h18.22q4.77,0,6.66,1.69t2.51,6.09Z"/>
          <path className="fc4" d="M716.27,232.62q22.25-20.35,53.52-20.35A52.32,52.32,0,0,1,790,216a42.66,42.66,0,0,1,15.07,10.29A44.14,44.14,0,0,1,814.44,242a60.42,60.42,0,0,1,3.2,20.09v81.4H803.58a14.21,14.21,0,0,1-6.79-1.32c-1.59-.88-2.85-2.65-3.77-5.33l-2.76-9.3a113,113,0,0,1-9.55,7.73,56.29,56.29,0,0,1-9.67,5.58,52.1,52.1,0,0,1-10.74,3.46,62.28,62.28,0,0,1-12.62,1.19,49.68,49.68,0,0,1-15.08-2.2,33.08,33.08,0,0,1-11.93-6.59,29.53,29.53,0,0,1-7.79-10.93,38.79,38.79,0,0,1-2.76-15.2,30.53,30.53,0,0,1,1.63-9.74,28.47,28.47,0,0,1,5.34-9.22,44.5,44.5,0,0,1,9.61-8.3,62.88,62.88,0,0,1,14.51-6.78,124.51,124.51,0,0,1,20-4.71,202.4,202.4,0,0,1,26.13-2.2v-7.54q0-12.93-5.53-19.15t-16-6.22a37.87,37.87,0,0,0-12.49,1.76,50.86,50.86,0,0,0-8.74,4q-3.76,2.19-6.85,4a13.43,13.43,0,0,1-6.84,1.76,9,9,0,0,1-5.53-1.69,14.07,14.07,0,0,1-3.64-4Zm71.1,55.89a171.43,171.43,0,0,0-22.61,2.33,60.35,60.35,0,0,0-14.7,4.33q-5.52,2.64-7.91,6.16a13.37,13.37,0,0,0-2.39,7.66q0,8.16,4.84,11.68t12.63,3.52a36.71,36.71,0,0,0,16.51-3.46,49.13,49.13,0,0,0,13.63-10.48Z"/>
          <path className="fc4" d="M875.8,230.48a84,84,0,0,1,8.23-7.22,51.05,51.05,0,0,1,19.53-9.3,51.82,51.82,0,0,1,12.06-1.32,46.2,46.2,0,0,1,18.72,3.59,37,37,0,0,1,13.63,10,44.09,44.09,0,0,1,8.28,15.45,65.49,65.49,0,0,1,2.83,19.79v82h-31v-82q0-11.81-5.41-18.28t-16.46-6.47a32.3,32.3,0,0,0-15.07,3.64,54,54,0,0,0-13.31,9.93v93.2h-31V214.66h19q6,0,7.91,5.65Z"/>
          <path className="fc1" d="M1080.79,241.91a14.89,14.89,0,0,1-2.7,2.77,6.2,6.2,0,0,1-3.83,1,8.46,8.46,0,0,1-4.64-1.45c-1.51-1-3.31-2-5.41-3.26a41,41,0,0,0-7.47-3.27,34.43,34.43,0,0,0-10.73-1.44,32.92,32.92,0,0,0-14.33,3,27.23,27.23,0,0,0-10.24,8.48,38.24,38.24,0,0,0-6.09,13.38,71.88,71.88,0,0,0-2,17.77,69.5,69.5,0,0,0,2.19,18.34,39.31,39.31,0,0,0,6.34,13.5,27.33,27.33,0,0,0,10.05,8.3,30.52,30.52,0,0,0,13.32,2.82,33.18,33.18,0,0,0,12-1.82,38.21,38.21,0,0,0,7.72-4q3.13-2.19,5.46-4a8.27,8.27,0,0,1,5.21-1.82,6.29,6.29,0,0,1,5.66,2.89l8.92,11.3A56.25,56.25,0,0,1,1079,334.43a60.44,60.44,0,0,1-12.5,6.53,63.64,63.64,0,0,1-13.32,3.45,93.59,93.59,0,0,1-13.62,1,57.21,57.21,0,0,1-22.49-4.46,53.1,53.1,0,0,1-18.46-13A62,62,0,0,1,986.15,307a80.7,80.7,0,0,1-4.59-28.2,81.71,81.71,0,0,1,4.09-26.31,59.57,59.57,0,0,1,12-21,54.88,54.88,0,0,1,19.6-13.88q11.67-5,26.88-5,14.45,0,25.31,4.65A62,62,0,0,1,1089,230.6Z"/>
          <path className="fc1" d="M1164.34,212.64a70.18,70.18,0,0,1,26.05,4.65,57,57,0,0,1,20.1,13.19,57.87,57.87,0,0,1,12.88,20.85,86.37,86.37,0,0,1,0,55.15,59.08,59.08,0,0,1-12.88,21,56.12,56.12,0,0,1-20.1,13.32,70.18,70.18,0,0,1-26.05,4.65,71.08,71.08,0,0,1-26.26-4.65,56.19,56.19,0,0,1-20.16-13.32,59.93,59.93,0,0,1-12.94-21,85.3,85.3,0,0,1,0-55.15,58.69,58.69,0,0,1,12.94-20.85,57.09,57.09,0,0,1,20.16-13.19A71.08,71.08,0,0,1,1164.34,212.64Zm0,108.91q16.07,0,23.8-10.8t7.72-31.66q0-20.83-7.72-31.77t-23.8-10.93q-16.33,0-24.19,11t-7.85,31.71q0,20.73,7.85,31.59T1164.34,321.55Z"/>
          <path className="fc1" d="M1280.65,230.48a84,84,0,0,1,8.23-7.22,51.05,51.05,0,0,1,19.53-9.3,51.82,51.82,0,0,1,12.06-1.32,46.2,46.2,0,0,1,18.72,3.59,37,37,0,0,1,13.63,10,44.09,44.09,0,0,1,8.28,15.45,65.49,65.49,0,0,1,2.83,19.79v82h-31v-82q0-11.81-5.41-18.28T1311,236.76A32.3,32.3,0,0,0,1296,240.4a54,54,0,0,0-13.31,9.93v93.2h-31V214.66h19q6,0,7.91,5.65Z"/>
          <path className="fc1" d="M1422.34,230.48a82.88,82.88,0,0,1,8.23-7.22,51.05,51.05,0,0,1,19.53-9.3,51.82,51.82,0,0,1,12.06-1.32,46.12,46.12,0,0,1,18.71,3.59,36.84,36.84,0,0,1,13.63,10,44.1,44.1,0,0,1,8.29,15.45,65.49,65.49,0,0,1,2.83,19.79v82h-31v-82q0-11.81-5.4-18.28t-16.46-6.47a32.3,32.3,0,0,0-15.07,3.64,53.86,53.86,0,0,0-13.31,9.93v93.2h-31V214.66h19q6,0,7.91,5.65Z"/>
          <path className="fc1" d="M1558.88,283a61.17,61.17,0,0,0,3.51,17.15,35,35,0,0,0,7.29,11.92,28.45,28.45,0,0,0,10.74,7,39,39,0,0,0,13.76,2.33,42.32,42.32,0,0,0,13-1.77,60.78,60.78,0,0,0,9.55-3.89q4.08-2.13,7.16-3.89a12,12,0,0,1,6-1.76,6.43,6.43,0,0,1,5.78,2.89l8.91,11.3A51.61,51.61,0,0,1,1633,334.43a64.92,64.92,0,0,1-13.38,6.53,73.42,73.42,0,0,1-14.19,3.45,101.78,101.78,0,0,1-14,1,68.85,68.85,0,0,1-25-4.46,55.84,55.84,0,0,1-20.1-13.19,61.93,61.93,0,0,1-13.45-21.61q-4.89-12.87-4.9-29.83a71.32,71.32,0,0,1,4.28-24.81,59.47,59.47,0,0,1,12.24-20.22A57.6,57.6,0,0,1,1564,217.67a64.08,64.08,0,0,1,25.93-5,63,63,0,0,1,22.48,3.9,48.93,48.93,0,0,1,17.72,11.36,52.79,52.79,0,0,1,11.62,18.35,68.4,68.4,0,0,1,4.21,24.8c0,4.69-.51,7.86-1.51,9.49s-2.93,2.45-5.78,2.45ZM1618,264.27a37.37,37.37,0,0,0-1.7-11.37,26.83,26.83,0,0,0-5.09-9.35,23.61,23.61,0,0,0-8.6-6.35,29.48,29.48,0,0,0-12.12-2.32q-13.44,0-21.17,7.66t-9.86,21.73Z"/>
          <path className="fc1" d="M1761.48,241.91a15.21,15.21,0,0,1-2.7,2.77,6.24,6.24,0,0,1-3.83,1,8.5,8.5,0,0,1-4.65-1.45c-1.5-1-3.3-2-5.4-3.26a41,41,0,0,0-7.47-3.27,34.45,34.45,0,0,0-10.74-1.44,32.85,32.85,0,0,0-14.32,3,27.23,27.23,0,0,0-10.24,8.48,38.24,38.24,0,0,0-6.09,13.38,71.86,71.86,0,0,0-2,17.77,69.48,69.48,0,0,0,2.2,18.34,39.13,39.13,0,0,0,6.34,13.5,27.25,27.25,0,0,0,10,8.3,30.49,30.49,0,0,0,13.32,2.82,33.09,33.09,0,0,0,12-1.82,38,38,0,0,0,7.73-4q3.13-2.19,5.46-4a8.27,8.27,0,0,1,5.21-1.82A6.3,6.3,0,0,1,1762,313l8.92,11.3a56.25,56.25,0,0,1-11.18,10.12,60.44,60.44,0,0,1-12.5,6.53,63.8,63.8,0,0,1-13.32,3.45,93.62,93.62,0,0,1-13.63,1A57.19,57.19,0,0,1,1697.8,341a53.1,53.1,0,0,1-18.46-13,62,62,0,0,1-12.5-20.92,80.7,80.7,0,0,1-4.59-28.2,82,82,0,0,1,4.08-26.31,59.74,59.74,0,0,1,12-21,54.79,54.79,0,0,1,19.6-13.88q11.67-5,26.88-5,14.45,0,25.31,4.65a62,62,0,0,1,19.53,13.31Z"/>
          <path className="fc1" d="M1833.21,345.54q-16.83,0-25.81-9.48t-9-26.19v-72h-13.18a6,6,0,0,1-4.27-1.63,6.38,6.38,0,0,1-1.76-4.9V219.05l20.73-3.39,6.53-35.17a6.84,6.84,0,0,1,2.39-3.9,7.13,7.13,0,0,1,4.51-1.38h16.08v40.58h34.42v22.1h-34.42v69.85q0,6,3,9.41a10.2,10.2,0,0,0,8.11,3.4,14.4,14.4,0,0,0,4.84-.7,25.61,25.61,0,0,0,3.38-1.44c1-.5,1.83-1,2.58-1.45a4.4,4.4,0,0,1,2.26-.69,3.6,3.6,0,0,1,2.26.69,10.77,10.77,0,0,1,1.89,2.08l9.29,15.07a46.9,46.9,0,0,1-15.57,8.54A57.94,57.94,0,0,1,1833.21,345.54Z"/>
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 14, background: ORANGE, borderRadius: 2 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.09em" }}>
            Best Practice Blueprints  ·  Lead Funnel
          </span>
        </div>
      </div>

      {/* Questionnaire */}
      {!report && !loading && (
        <>
          <ProgressBar current={step} total={totalSteps} />
          <p style={{ fontSize: 11, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
            Step {step + 1} of {totalSteps} — {currentStepDef.label}
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 600, color: "#111", marginBottom: "1.4rem", lineHeight: 1.4 }}>
            {currentStepDef.title}
          </h2>
          {currentStepDef.type === "contact"
            ? <ContactStep answers={answers} onChange={setAnswer} onNext={next} />
            : <OptionStep step={currentStepDef} stepIndex={step + 1} totalSteps={totalSteps}
                selected={answers[currentStepDef.key]}
                onSelect={val => setAnswer(currentStepDef.key, val)}
                onNext={next} onBack={back} />
          }
        </>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
          <div style={{
            width: 30, height: 30, border: "2.5px solid #eee",
            borderTopColor: ORANGE, borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 1.25rem",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 14, color: "#aaa" }}>Building your Lead Funnel Blueprint…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "#c0392b", marginBottom: "1rem" }}>{error}</p>
          <button onClick={generate} style={btnStyle(false)}>Try again</button>
        </div>
      )}

      {/* Report */}
      {report && (
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
            Your Lead Funnel Blueprint
          </h1>
          <p style={{ fontSize: 13, color: "#999", marginBottom: "1.75rem", fontStyle: "italic" }}>
            {report.profile_line}
          </p>
          <div style={{ background: "#F3F7FA", borderRadius: 10, padding: "1.2rem 1.4rem", marginBottom: "1rem", borderLeft: `4px solid ${NAVY}` }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Summary</p>
            <p style={{ fontSize: 14, color: "#444", lineHeight: 1.75, margin: 0 }}>{report.summary}</p>
          </div>
          <div style={{ background: "#FEF9EC", border: "1px solid #FAC775", borderRadius: 10, padding: "11px 15px", marginBottom: "1.5rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: 12, color: "#633806", lineHeight: 1.65, margin: 0 }}>
              Before you build anything new — check <strong>Campaign Center &gt; Workflows &gt; Inactive</strong>. Some of these may already exist and just need to be switched on.
            </p>
          </div>
          <p style={{ fontSize: 10, fontWeight: 800, color: "#ccc", textTransform: "uppercase", letterSpacing: "0.08em", margin: "1.5rem 0 0.75rem" }}>
            Recommended improvements — pick what fits
          </p>
          {report.recommendations.map((rec, i) => <RecItem key={i} rec={rec} />)}
          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #ebebeb" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
              <button onClick={() => window.print()} style={{ background: NAVY, border: "none", color: "#fff", fontWeight: 600, padding: "10px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>⬇ Download / Print</button>
              <button onClick={restart} style={backBtnStyle}>Start over</button>
            </div>
            <p style={{ fontSize: 12, color: "#aaa", margin: 0, lineHeight: 1.65 }}>
              Need help building any of this?{" "}
              <span style={{ color: ORANGE, fontWeight: 600 }}>Contact your FranConnect Customer Success Manager</span>
              {" "}— they can build these workflows with you.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
