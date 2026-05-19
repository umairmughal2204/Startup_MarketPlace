const express = require("express");
const router = express.Router();

const getOpenAI = () => {
  const { OpenAI } = require("openai");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// POST /api/ai/analyze-idea
router.post("/analyze-idea", async (req, res) => {
  const { title, category, description } = req.body || {};
  if (!title || !category || !description) {
    return res.status(400).json({ message: "title, category, and description are required" });
  }

  if (!process.env.OPENAI_API_KEY) {
    // Fallback: deterministic scoring when no API key
    let score = 5.0;
    if (title.length > 10) score += 0.5;
    if (title.length > 20) score += 0.3;
    if (description.length > 100) score += 0.5;
    if (description.length > 300) score += 0.5;
    if (description.length > 600) score += 0.5;
    const terms = ["market","customer","revenue","growth","solution","problem","target","value","innovation","scalable","unique","demand"];
    const dl = description.toLowerCase();
    terms.forEach((t) => { if (dl.includes(t)) score += 0.2; });
    score = Math.min(10, Math.max(1, parseFloat(score.toFixed(1))));
    return res.json({
      marketFit: score,
      feasibility: Math.min(10, Math.max(1, parseFloat((score * 0.92 + 0.3).toFixed(1)))),
      strengths: [
        "Clear concept with identifiable value proposition",
        "Targets a defined audience segment",
        "Potential for scalable growth in the chosen category",
      ],
      suggestions: [
        "Conduct primary market research to validate demand",
        "Define a clear go-to-market strategy",
        "Identify 2-3 direct competitors and your differentiation",
      ],
      concerns: [
        "Market competition level needs deeper analysis",
        "Initial funding requirements should be mapped out",
        "Regulatory considerations may apply depending on region",
      ],
      aiScore: score,
    });
  }

  try {
    const openai = getOpenAI();
    const prompt = `You are a startup analyst. Evaluate the following business idea and respond ONLY with valid JSON.

Idea Title: ${title}
Category: ${category}
Description: ${description}

Return JSON with exactly these fields:
{
  "marketFit": <number 1-10>,
  "feasibility": <number 1-10>,
  "aiScore": <overall score 1-10>,
  "strengths": [<3 specific strengths as strings>],
  "suggestions": [<3 actionable suggestions as strings>],
  "concerns": [<3 realistic concerns as strings>]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 600,
      temperature: 0.7,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);
  } catch (error) {
    console.error("AI analyze-idea error:", error.message);
    res.status(500).json({ message: "AI analysis failed. Please try again." });
  }
});

// POST /api/ai/estimate-cost
router.post("/estimate-cost", async (req, res) => {
  const { businessType, stage, teamSize, description } = req.body || {};
  if (!businessType || !stage) {
    return res.status(400).json({ message: "businessType and stage are required" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.json({
      totalMin: 15000,
      totalMax: 45000,
      categories: [
        { name: "Technology & Development", min: 5000, max: 20000, note: "Website, app, tools" },
        { name: "Marketing & Branding", min: 2000, max: 8000, note: "Social media, ads, logo" },
        { name: "Legal & Compliance", min: 1000, max: 4000, note: "Registration, contracts" },
        { name: "Team & Operations", min: 3000, max: 10000, note: "Salaries, freelancers" },
        { name: "Miscellaneous", min: 1000, max: 3000, note: "Unexpected costs buffer" },
      ],
      tips: [
        "Start lean — validate before scaling spend",
        "Use free/low-cost tools in early stage (Notion, Canva, Firebase)",
        "Consider bootstrapping or grants before investor funding",
      ],
    });
  }

  try {
    const openai = getOpenAI();
    const prompt = `You are a startup financial advisor. Estimate realistic startup costs for:

Business Type: ${businessType}
Stage: ${stage}
Team Size: ${teamSize || "1-3"}
Description: ${description || "Not provided"}

Respond ONLY with valid JSON:
{
  "totalMin": <number in USD>,
  "totalMax": <number in USD>,
  "categories": [
    { "name": "<category>", "min": <number>, "max": <number>, "note": "<short explanation>" }
  ],
  "tips": [<3 cost-saving tips as strings>]
}
Include 5-6 cost categories relevant to this specific business type.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 700,
      temperature: 0.5,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);
  } catch (error) {
    console.error("AI estimate-cost error:", error.message);
    res.status(500).json({ message: "AI cost estimation failed." });
  }
});

// POST /api/ai/validate-idea
router.post("/validate-idea", async (req, res) => {
  const { title, targetAudience, problem, solution, competitors, uniqueValue } = req.body || {};
  if (!title || !targetAudience || !problem) {
    return res.status(400).json({ message: "title, targetAudience, and problem are required" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.json({
      validationScore: 7.2,
      marketDemand: "Medium-High",
      tam: "$2B - $5B globally",
      sam: "$200M - $500M (addressable segment)",
      som: "$5M - $20M (realistic first 3 years)",
      verdict: "Promising",
      insights: [
        "Your target audience has a clearly identifiable pain point",
        "The problem space shows consistent search and discussion trends",
        "Early-stage competitors validate demand but leave room for differentiation",
      ],
      risks: [
        "Market education may be required to onboard first users",
        "Customer acquisition cost could be high without clear channels",
      ],
      nextSteps: [
        "Run a landing page test to measure signup intent",
        "Interview 10-15 people from your target audience",
        "Create a basic MVP to test core assumptions",
      ],
    });
  }

  try {
    const openai = getOpenAI();
    const prompt = `You are a market validation expert. Analyze this startup idea:

Title: ${title}
Target Audience: ${targetAudience}
Problem Being Solved: ${problem}
Proposed Solution: ${solution || "Not specified"}
Known Competitors: ${competitors || "None mentioned"}
Unique Value: ${uniqueValue || "Not specified"}

Respond ONLY with valid JSON:
{
  "validationScore": <number 1-10>,
  "marketDemand": "<Low|Medium|Medium-High|High>",
  "tam": "<Total Addressable Market estimate>",
  "sam": "<Serviceable Addressable Market estimate>",
  "som": "<Serviceable Obtainable Market estimate>",
  "verdict": "<Not Viable|Needs Work|Promising|Strong>",
  "insights": [<3 market insights as strings>],
  "risks": [<2-3 key risks as strings>],
  "nextSteps": [<3 validation next steps as strings>]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 700,
      temperature: 0.6,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);
  } catch (error) {
    console.error("AI validate-idea error:", error.message);
    res.status(500).json({ message: "AI validation failed." });
  }
});

// POST /api/ai/business-model
router.post("/business-model", async (req, res) => {
  const { title, category, description } = req.body || {};
  if (!title || !description) {
    return res.status(400).json({ message: "title and description are required" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.json({
      customerSegments: "Early adopters, small-to-medium businesses, tech-savvy individuals",
      valuePropositions: "Saves time, reduces costs, provides a unique experience not available elsewhere",
      channels: "Website, social media, App Store, word of mouth, partnerships",
      customerRelationships: "Self-service platform, automated onboarding, community forum",
      revenueStreams: "Subscription (SaaS), freemium with premium tiers, transaction fees",
      keyResources: "Software platform, development team, brand, customer data",
      keyActivities: "Platform development, marketing, customer support, partnerships",
      keyPartners: "Technology vendors, distribution partners, payment processors",
      costStructure: "Development costs, hosting/infrastructure, marketing, team salaries",
    });
  }

  try {
    const openai = getOpenAI();
    const prompt = `You are a business strategy consultant. Fill out a Business Model Canvas for:

Business Title: ${title}
Category: ${category || "General"}
Description: ${description}

Respond ONLY with valid JSON with exactly these 9 fields of the Business Model Canvas:
{
  "customerSegments": "<who are the customers>",
  "valuePropositions": "<what value is delivered>",
  "channels": "<how to reach customers>",
  "customerRelationships": "<type of relationship with customers>",
  "revenueStreams": "<how money is made>",
  "keyResources": "<assets required>",
  "keyActivities": "<most important actions>",
  "keyPartners": "<key partners and suppliers>",
  "costStructure": "<most important costs>"
}
Keep each field to 1-2 concise sentences.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.6,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);
  } catch (error) {
    console.error("AI business-model error:", error.message);
    res.status(500).json({ message: "AI business model generation failed." });
  }
});

// POST /api/ai/roadmap
router.post("/roadmap", async (req, res) => {
  const { title, category, stage } = req.body || {};
  if (!title) {
    return res.status(400).json({ message: "title is required" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.json({
      phases: [
        { phase: "Phase 1: Validate", duration: "1-2 months", tasks: ["Define your target customer", "Conduct 10+ user interviews", "Build a landing page to test interest", "Analyze competitor landscape"] },
        { phase: "Phase 2: Build MVP", duration: "2-4 months", tasks: ["Define core features only", "Build minimum viable product", "Set up analytics tracking", "Recruit beta testers"] },
        { phase: "Phase 3: Launch", duration: "1-2 months", tasks: ["Launch to beta users", "Collect feedback systematically", "Fix critical bugs and UX issues", "Create launch marketing campaign"] },
        { phase: "Phase 4: Grow", duration: "3-6 months", tasks: ["Scale marketing channels", "Optimize conversion funnel", "Build customer success process", "Seek seed funding if needed"] },
        { phase: "Phase 5: Scale", duration: "6-12 months", tasks: ["Hire key team members", "Expand to new markets", "Raise Series A if applicable", "Build strategic partnerships"] },
      ],
    });
  }

  try {
    const openai = getOpenAI();
    const prompt = `You are a startup advisor. Create a personalized startup roadmap for:

Business: ${title}
Category: ${category || "General"}
Current Stage: ${stage || "Idea"}

Respond ONLY with valid JSON:
{
  "phases": [
    {
      "phase": "<Phase name>",
      "duration": "<time estimate>",
      "tasks": [<4-5 specific tasks as strings>]
    }
  ]
}
Return exactly 5 phases from idea to scale, customized for this specific business type.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 900,
      temperature: 0.6,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);
  } catch (error) {
    console.error("AI roadmap error:", error.message);
    res.status(500).json({ message: "AI roadmap generation failed." });
  }
});

module.exports = router;
