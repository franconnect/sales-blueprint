export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { maturity, vertical, fc_usage, pain_point, team_size, lead_source, scoring } = req.body;

  const LABELS = {
    maturity:    { early: "Under 50 units", growth: "50–200 units", mature: "200+ units" },
    vertical:    { food_qsr: "Food/QSR", home_services: "Home services", health_wellness: "Health & wellness", b2b: "B2B/commercial", senior_care: "Senior care", fitness: "Fitness", other: "Other" },
    fc_usage:    { basic: "Basic (contact database)", moderate: "Moderate (pipeline + some automation)", advanced: "Advanced (sequences, scoring, reporting)" },
    pain_point:  { speed: "Slow speed-to-contact", qualification: "Wasting time on unqualified leads", nurture: "Losing 'not yet' leads", visibility: "No pipeline visibility", dd_conversion: "Low Discovery Day conversion", all: "All of the above" },
    team_size:   { founder_led: "0–1 FSEs (founder-led)", small_team: "2–3 FSEs", full_team: "4+ FSEs" },
    lead_source: { broker_heavy: "Mostly broker/consultant referrals", portal_heavy: "Mostly portals", organic: "Mostly organic/brand", mixed: "Fairly mixed across sources" },
    scoring:     { none: "No scoring model", informal: "Informal — FSEs judge it manually", configured: "Configured in FranConnect", other_tool: "Tracked outside FranConnect" },
  };

  const prompt = `You are a franchise sales veteran talking directly to a fellow franchise professional. You have fixed lead funnel problems at dozens of systems. You do not waste words.

Franchisor profile:
- System maturity: ${LABELS.maturity[maturity]}
- Vertical: ${LABELS.vertical[vertical]}
- Current FranConnect usage: ${LABELS.fc_usage[fc_usage]}
- Biggest pain point: ${LABELS.pain_point[pain_point]}
- Sales team size: ${LABELS.team_size[team_size]}
- Primary lead sources: ${LABELS.lead_source[lead_source]}
- Lead scoring model: ${LABELS.scoring[scoring]}

Write a lead funnel optimization report. Speak directly to the reader in second person — use "your team", "your pipeline", "your leads" throughout. Never refer to the reader by name or in the third person. Respond ONLY with valid JSON — no preamble, no markdown, no backticks.

{
  "profile_line": "One sentence. What kind of system this is and what your team needs most right now.",
  "summary": "3–4 sentences. What is broken, what it is costing your team, what to fix first. Active voice. No filler.",
  "recommendations": [
    {
      "title": "Short imperative command",
      "priority": "high|medium|low",
      "guide_anchor": "one slug from the list below",
      "body": "2–3 sentences. Problem, action, outcome. Second person throughout."
    }
  ]
}

Valid guide_anchor slugs:
speed-to-contact | lead-routing | heat-meter-configuration | interest-form-design |
candidate-prequalification | new-lead-welcome | dormant-lead-revival | pipeline-health |
fdd-delivery | discovery-day | email-reengagement | click-engagement |
lost-lead-analysis | sms-configuration | pipeline-reporting | sales-team-productivity

Rules:
- 4–6 recommendations, high priority first
- Every recommendation ties to close rate, FSE time, or pipeline visibility
- Maturity: early=process first; growth=systematize; mature=filter volume
- Vertical: Food/QSR=qualify fast; Home=surface financials early; Health=mission first; B2B=nurture is the close; Senior care=trust over automation; Fitness=differentiate in 48hrs
- FC usage: basic=quick wins first; moderate=audit what's running; advanced=use the data you have
- Lead source: broker=speed matters most; portal=automate first touches and qualify hard; organic=nurture carefully; mixed=segment by source
- Scoring: none=define scorecard first; informal=get criteria into system; configured=validate vs close data; other tool=consolidate data
- Do NOT reference specific software features or product names`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || "API error" });

    const text = data.content.map(i => i.text || "").join("").replace(/```json|```/g, "").trim();
    return res.status(200).json(JSON.parse(text));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
