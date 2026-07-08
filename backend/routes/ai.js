const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");
const { hashString, mixSeed, pickIndependent } = aiService;

const FALLBACK_STRENGTHS_POOL = [
  "Clear concept with identifiable value proposition",
  "Targets a defined audience segment",
  "Potential for scalable growth in the chosen category",
  "Reads as specific enough to test with a first cohort of users",
  "Frames a concrete outcome rather than a vague ambition",
  "Leaves room to iterate without a full pivot later",
  "Shows early signs of a defensible market position",
  "Grounded enough in the category to be evaluated quickly"
];
const FALLBACK_SUGGESTIONS_POOL = [
  "Conduct primary market research to validate demand",
  "Define a clear go-to-market strategy",
  "Identify 2-3 direct competitors and your differentiation",
  "Outline your revenue model and pricing strategy",
  "Build an MVP to test core assumptions quickly",
  "Talk to five potential users before writing another line of the plan",
  "Put a number on the outcome you expect in the first month",
  "Write the elevator pitch a stranger could repeat back correctly"
];
const FALLBACK_CONCERNS_POOL = [
  "Market competition level needs deeper analysis",
  "Initial funding requirements should be mapped out",
  "Regulatory considerations may apply depending on region",
  "Risk mitigation strategies should be documented",
  "Customer acquisition cost has not been tested against real channels",
  "Retention past the first session or use is still unproven",
  "Unit economics have not been demonstrated at meaningful scale"
];

// Track AI model status
let aiModelsLoaded = false;

// Initialize AI models on startup
(async () => {
  try {
    await aiService.initializeModels();
    aiModelsLoaded = true;
    console.log("✅ AI models ready for enhanced analysis");
  } catch (error) {
    console.log("⚠️ AI models not loaded - using rule-based fallback:", error.message);
    aiModelsLoaded = false;
  }
})();

// Smart scoring algorithm based on content quality (fallback when AI not available)
function analyzeIdeaScore(title, category, description) {
  let score = 5.0;
  
  // Title quality
  if (title.length > 10) score += 0.5;
  if (title.length > 20) score += 0.3;
  if (title.length > 30) score += 0.2;
  
  // Description depth
  if (description.length > 100) score += 0.5;
  if (description.length > 300) score += 0.5;
  if (description.length > 600) score += 0.5;
  
  // Category-specific terms
  const categoryTerms = {
    'Technology': ['software', 'app', 'platform', 'tech', 'digital', 'automation', 'ai', 'ml'],
    'Healthcare': ['health', 'medical', 'patient', 'care', 'wellness', 'treatment'],
    'E-commerce': ['shop', 'store', 'retail', 'product', 'shipping', 'delivery'],
    'Education': ['learn', 'course', 'student', 'teach', 'training', 'skill'],
    'Finance': ['money', 'payment', 'invest', 'bank', 'finance', 'budget'],
  };
  
  const terms = categoryTerms[category] || ["market","customer","revenue","growth","solution","problem","target","value","innovation","scalable","unique","demand"];
  const dl = description.toLowerCase();
  terms.forEach((t) => { if (dl.includes(t)) score += 0.2; });
  
  return Math.min(10, Math.max(1, parseFloat(score.toFixed(1))));
}

// Each getX() below draws from a pool (signal-matched phrases + a general bank) using
// an independently-avalanched index per slot (see aiService.pickIndependent), instead
// of always falling back to the same 3 hardcoded defaults. That fixed-default pattern
// is what caused every idea lacking specific keywords to get identical feedback.
function getStrengths(category, description) {
  const dl = description.toLowerCase();
  const seed = hashString(`${category}::${description}`);

  const candidates = [];
  if (dl.includes('problem') || dl.includes('pain')) candidates.push("Clearly identifies a market pain point");
  if (dl.includes('solution') || dl.includes('fix')) candidates.push("Proposes a specific solution approach");
  if (dl.includes('market') || dl.includes('customer')) candidates.push("Demonstrates understanding of target market");
  if (dl.includes('revenue') || dl.includes('monetiz')) candidates.push("Has a clear path to monetization");
  if (dl.includes('scalable') || dl.includes('scale')) candidates.push("Shows potential for rapid scaling");
  if (dl.includes('unique') || dl.includes('different')) candidates.push("Positions against existing alternatives");

  const pool = [...candidates, ...FALLBACK_STRENGTHS_POOL];
  return pickIndependent(mixSeed(seed, 0x5b1e), pool, 3);
}

function getSuggestions(category, description) {
  const dl = description.toLowerCase();
  const seed = hashString(`${category}::${description}`);

  const candidates = [];
  if (!dl.includes('competitor')) candidates.push("Identify 2-3 direct competitors and your differentiation");
  if (!dl.includes('market research') && !dl.includes('interview')) candidates.push("Conduct primary market research to validate demand");
  if (!dl.includes('go-to-market') && !dl.includes('launch')) candidates.push("Define a clear go-to-market strategy");
  if (!dl.includes('revenue') && !dl.includes('monetiz')) candidates.push("Outline your revenue model and pricing strategy");
  if (!dl.includes('mvp') && !dl.includes('prototype')) candidates.push("Build an MVP to test core assumptions quickly");

  const pool = [...candidates, ...FALLBACK_SUGGESTIONS_POOL];
  return pickIndependent(mixSeed(seed, 0x2f7c), pool, 3);
}

function getConcerns(category, description) {
  const dl = description.toLowerCase();
  const seed = hashString(`${category}::${description}`);

  const candidates = [];
  if (!dl.includes('regulatory') && !dl.includes('compliance')) candidates.push("Regulatory considerations may apply depending on region");
  if (!dl.includes('funding') && !dl.includes('capital')) candidates.push("Initial funding requirements should be mapped out");
  if (!dl.includes('competition') && !dl.includes('competitor')) candidates.push("Market competition level needs deeper analysis");
  if (!dl.includes('risk') && !dl.includes('challenge')) candidates.push("Risk mitigation strategies should be documented");

  const pool = [...candidates, ...FALLBACK_CONCERNS_POOL];
  return pickIndependent(mixSeed(seed, 0x8a41), pool, 3);
}

// POST /api/ai/analyze-idea
router.post("/analyze-idea", async (req, res) => {
  const { title, category, description } = req.body || {};
  if (!title || !category || !description) {
    return res.status(400).json({ message: "title, category, and description are required" });
  }

  try {
    // Use AI models if available, otherwise fallback to rule-based
    if (aiModelsLoaded) {
      const aiResult = await aiService.analyzeIdeaWithAI(title, category, description);
      res.json({
        ...aiResult,
        model: 'transformer-ai'
      });
    } else {
      // Fallback to rule-based scoring
      const score = analyzeIdeaScore(title, category, description);
      res.json({
        marketFit: score,
        feasibility: Math.min(10, Math.max(1, parseFloat((score * 0.92 + 0.3).toFixed(1)))),
        aiScore: score,
        strengths: getStrengths(category, description),
        suggestions: getSuggestions(category, description),
        concerns: getConcerns(category, description),
        model: 'rule-based'
      });
    }
  } catch (error) {
    console.error("AI analysis error:", error.message);
    // Fallback on error
    const score = analyzeIdeaScore(title, category, description);
    res.json({
      marketFit: score,
      feasibility: Math.min(10, Math.max(1, parseFloat((score * 0.92 + 0.3).toFixed(1)))),
      aiScore: score,
      strengths: getStrengths(category, description),
      suggestions: getSuggestions(category, description),
      concerns: getConcerns(category, description),
      model: 'rule-based-fallback'
    });
  }
});

// POST /api/ai/estimate-cost
router.post("/estimate-cost", async (req, res) => {
  const { businessType, stage, teamSize, description } = req.body || {};
  if (!businessType || !stage) {
    return res.status(400).json({ message: "businessType and stage are required" });
  }

  try {
    if (aiModelsLoaded) {
      const aiResult = await aiService.estimateCostWithAI(businessType, stage, teamSize, description);
      return res.json({
        ...aiResult,
        model: 'transformer-ai'
      });
    }

    // Fallback: deterministic cost estimation if the AI models are unavailable.
    const baseCosts = {
      'SaaS / Software': { tech: [5000, 20000], marketing: [2000, 8000], legal: [1000, 3000], ops: [3000, 15000] },
      'E-commerce / Retail': { tech: [3000, 10000], marketing: [3000, 10000], legal: [1000, 3000], ops: [5000, 20000], inventory: [5000, 30000] },
      'Marketplace': { tech: [8000, 30000], marketing: [5000, 15000], legal: [2000, 5000], ops: [8000, 25000] },
      'Mobile App': { tech: [8000, 30000], marketing: [3000, 10000], legal: [1000, 3000], ops: [5000, 20000] },
      'Healthcare': { tech: [10000, 40000], marketing: [5000, 15000], legal: [3000, 8000], ops: [8000, 25000], compliance: [5000, 15000] },
      'Education / EdTech': { tech: [5000, 20000], marketing: [3000, 8000], legal: [1000, 3000], ops: [3000, 12000], content: [3000, 15000] },
      'Food & Beverage': { tech: [2000, 8000], marketing: [3000, 10000], legal: [2000, 5000], ops: [5000, 20000], equipment: [5000, 25000] },
      'Consulting / Services': { tech: [500, 2000], marketing: [2000, 8000], legal: [500, 2000], ops: [2000, 8000] },
      'Manufacturing': { tech: [3000, 12000], marketing: [3000, 10000], legal: [2000, 5000], ops: [10000, 40000], equipment: [10000, 50000] },
      'Other': { tech: [3000, 12000], marketing: [2000, 8000], legal: [1000, 3000], ops: [3000, 15000] },
    };

    const stageMultipliers = {
      'Idea / Pre-MVP': 0.5,
      'MVP / Prototype': 0.8,
      'Early Traction': 1.0,
      'Growth Stage': 1.5,
    };

    const teamMultipliers = {
      'Solo founder': 0.6,
      '1-3': 1.0,
      '4-10': 1.5,
      '10+': 2.0,
    };

    const costs = baseCosts[businessType] || baseCosts['Other'];
    const stageMult = stageMultipliers[stage] || 1.0;
    const teamMult = teamMultipliers[teamSize] || 1.0;

    const categories = Object.entries(costs).map(([name, [min, max]]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      min: Math.round(min * stageMult * teamMult),
      max: Math.round(max * stageMult * teamMult),
      note: getCostNote(name),
    }));

    const totalMin = categories.reduce((sum, c) => sum + c.min, 0);
    const totalMax = categories.reduce((sum, c) => sum + c.max, 0);

    const tips = getCostTips(businessType, stage);

    res.json({ totalMin, totalMax, categories, tips, model: 'rule-based' });
  } catch (error) {
    console.error('AI cost estimation error:', error.message);
    const baseCosts = {
      'SaaS / Software': { tech: [5000, 20000], marketing: [2000, 8000], legal: [1000, 3000], ops: [3000, 15000] },
      'E-commerce / Retail': { tech: [3000, 10000], marketing: [3000, 10000], legal: [1000, 3000], ops: [5000, 20000], inventory: [5000, 30000] },
      'Marketplace': { tech: [8000, 30000], marketing: [5000, 15000], legal: [2000, 5000], ops: [8000, 25000] },
      'Mobile App': { tech: [8000, 30000], marketing: [3000, 10000], legal: [1000, 3000], ops: [5000, 20000] },
      'Healthcare': { tech: [10000, 40000], marketing: [5000, 15000], legal: [3000, 8000], ops: [8000, 25000], compliance: [5000, 15000] },
      'Education / EdTech': { tech: [5000, 20000], marketing: [3000, 8000], legal: [1000, 3000], ops: [3000, 12000], content: [3000, 15000] },
      'Food & Beverage': { tech: [2000, 8000], marketing: [3000, 10000], legal: [2000, 5000], ops: [5000, 20000], equipment: [5000, 25000] },
      'Consulting / Services': { tech: [500, 2000], marketing: [2000, 8000], legal: [500, 2000], ops: [2000, 8000] },
      'Manufacturing': { tech: [3000, 12000], marketing: [3000, 10000], legal: [2000, 5000], ops: [10000, 40000], equipment: [10000, 50000] },
      'Other': { tech: [3000, 12000], marketing: [2000, 8000], legal: [1000, 3000], ops: [3000, 15000] },
    };

    const stageMultipliers = {
      'Idea / Pre-MVP': 0.5,
      'MVP / Prototype': 0.8,
      'Early Traction': 1.0,
      'Growth Stage': 1.5,
    };

    const teamMultipliers = {
      'Solo founder': 0.6,
      '1-3': 1.0,
      '4-10': 1.5,
      '10+': 2.0,
    };

    const costs = baseCosts[businessType] || baseCosts['Other'];
    const stageMult = stageMultipliers[stage] || 1.0;
    const teamMult = teamMultipliers[teamSize] || 1.0;

    const categories = Object.entries(costs).map(([name, [min, max]]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      min: Math.round(min * stageMult * teamMult),
      max: Math.round(max * stageMult * teamMult),
      note: getCostNote(name),
    }));

    const totalMin = categories.reduce((sum, c) => sum + c.min, 0);
    const totalMax = categories.reduce((sum, c) => sum + c.max, 0);

    const tips = getCostTips(businessType, stage);

    res.json({ totalMin, totalMax, categories, tips, model: 'rule-based-fallback' });
  }
});

function getCostNote(category) {
  const notes = {
    tech: "Website, app development, hosting, tools",
    marketing: "Social media, ads, branding, content",
    legal: "Registration, contracts, IP protection",
    ops: "Salaries, rent, utilities, freelancers",
    inventory: "Initial stock, warehousing, logistics",
    compliance: "Regulatory compliance, certifications",
    content: "Course creation, curriculum development",
    equipment: "Machinery, kitchen equipment, hardware",
  };
  return notes[category] || "Essential business expenses";
}

function getCostTips(businessType, stage) {
  const tips = [
    "Start lean — validate before scaling spend",
    "Use free/low-cost tools in early stage (Notion, Canva, Firebase)",
    "Consider bootstrapping or grants before investor funding",
  ];

  if (stage === 'Idea / Pre-MVP') {
    tips.push("Focus on customer interviews before building anything");
  }
  if (businessType === 'SaaS / Software') {
    tips.push("Use no-code tools to validate before custom development");
  }
  if (businessType === 'E-commerce / Retail') {
    tips.push("Start with dropshipping to test demand without inventory risk");
  }

  return tips.slice(0, 3);
}

// Smart validation scoring
function calculateValidationScore(title, targetAudience, problem, solution, competitors, uniqueValue) {
  let score = 6.0;
  const problemLower = problem.toLowerCase();
  const solutionLower = (solution || '').toLowerCase();
  
  // Problem clarity
  if (problem.length > 50) score += 0.5;
  if (problem.length > 150) score += 0.5;
  if (problemLower.includes('pain') || problemLower.includes('frustrat')) score += 0.5;
  
  // Solution quality
  if (solution && solution.length > 30) score += 0.5;
  if (solutionLower.includes('solve') || solutionLower.includes('fix')) score += 0.3;
  
  // Market research
  if (competitors && competitors.length > 5) score += 0.5;
  if (uniqueValue && uniqueValue.length > 10) score += 0.5;
  
  // Target audience clarity
  if (targetAudience.length > 10) score += 0.5;
  if (targetAudience.includes('(') || targetAudience.includes('-')) score += 0.3;
  
  return Math.min(10, Math.max(1, parseFloat(score.toFixed(1))));
}

function getVerdict(score) {
  if (score >= 8) return "Strong";
  if (score >= 6.5) return "Promising";
  if (score >= 4) return "Needs Work";
  return "Not Viable";
}

function getMarketDemand(score) {
  if (score >= 8) return "High";
  if (score >= 6) return "Medium-High";
  if (score >= 4) return "Medium";
  return "Low";
}

function getTAM(category) {
  const tams = {
    'Technology': "$500B+ globally (software market)",
    'Healthcare': "$4T+ globally (healthcare services)",
    'E-commerce': "$6T+ globally (e-commerce market)",
    'Education': "$350B+ globally (EdTech market)",
    'Finance': "$300B+ globally (fintech market)",
  };
  return tams[category] || "$1B+ globally (addressable market)";
}

function getValidationInsights(problem, solution, competitors) {
  const insights = [];
  
  if (problem.length > 100) {
    insights.push("Your problem statement demonstrates deep understanding of user pain points");
  }
  if (competitors && competitors.length > 5) {
    insights.push("Competitive awareness shows you've researched the market landscape");
  }
  if (solution && solution.length > 50) {
    insights.push("Solution approach appears technically feasible based on description");
  }
  
  // Default insights
  if (insights.length < 3) {
    insights.push("Your target audience has a clearly identifiable pain point");
    insights.push("The problem space shows consistent search and discussion trends");
    insights.push("Early-stage competitors validate demand but leave room for differentiation");
  }
  
  return insights.slice(0, 3);
}

function getValidationRisks(solution, uniqueValue) {
  const risks = [];
  
  if (!solution || solution.length < 20) {
    risks.push("Solution definition needs more detail to assess technical feasibility");
  }
  if (!uniqueValue || uniqueValue.length < 10) {
    risks.push("Unique value proposition should be clarified to differentiate from competitors");
  }
  
  // Default risks
  if (risks.length < 2) {
    risks.push("Market education may be required to onboard first users");
    risks.push("Customer acquisition cost could be high without clear channels");
  }
  
  return risks.slice(0, 3);
}

function getNextSteps(score) {
  if (score >= 8) {
    return [
      "Build an MVP to validate technical assumptions",
      "Recruit a small beta user group for feedback",
      "Prepare investor pitch deck with market data",
    ];
  }
  if (score >= 6) {
    return [
      "Run a landing page test to measure signup intent",
      "Interview 10-15 people from your target audience",
      "Create a basic MVP to test core assumptions",
    ];
  }
  return [
    "Refine your problem statement with specific user research",
    "Define your unique value proposition more clearly",
    "Conduct deeper competitive analysis",
  ];
}

// POST /api/ai/validate-idea
router.post("/validate-idea", async (req, res) => {
  const { title, targetAudience, problem, solution, competitors, uniqueValue, category } = req.body || {};
  if (!title || !targetAudience || !problem) {
    return res.status(400).json({ message: "title, targetAudience, and problem are required" });
  }

  try {
    // Use AI models if available, otherwise fallback to rule-based
    if (aiModelsLoaded) {
      const aiResult = await aiService.validateIdeaWithAI(title, targetAudience, problem, solution, uniqueValue, competitors, category);
      res.json({
        ...aiResult,
        model: 'transformer-ai'
      });
    } else {
      // Fallback to rule-based scoring
      const score = calculateValidationScore(title, targetAudience, problem, solution, competitors, uniqueValue);
      res.json({
        validationScore: score,
        marketDemand: getMarketDemand(score),
        tam: getTAM(category),
        sam: "$100M - $500M (addressable segment)",
        som: "$5M - $20M (realistic first 3 years)",
        verdict: getVerdict(score),
        insights: getValidationInsights(problem, solution, competitors),
        risks: getValidationRisks(solution, uniqueValue),
        nextSteps: getNextSteps(score),
        model: 'rule-based'
      });
    }
  } catch (error) {
    console.error("AI validation error:", error.message);
    // Fallback on error
    const score = calculateValidationScore(title, targetAudience, problem, solution, competitors, uniqueValue);
    res.json({
      validationScore: score,
      marketDemand: getMarketDemand(score),
      tam: getTAM(category),
      sam: "$100M - $500M (addressable segment)",
      som: "$5M - $20M (realistic first 3 years)",
      verdict: getVerdict(score),
      insights: getValidationInsights(problem, solution, competitors),
      risks: getValidationRisks(solution, uniqueValue),
      nextSteps: getNextSteps(score),
      model: 'rule-based-fallback'
    });
  }
});

// Smart Business Model Canvas generator
function generateBusinessModel(title, category, description) {
  const descLower = description.toLowerCase();
  const catLower = (category || '').toLowerCase();
  
  // Detect customer segments from description
  let customerSegments = "Early adopters and tech-savvy individuals looking for innovative solutions";
  if (catLower.includes('health')) {
    customerSegments = "Patients, healthcare providers, and wellness-conscious consumers";
  } else if (catLower.includes('education') || catLower.includes('edtech')) {
    customerSegments = "Students, educators, and lifelong learners seeking skill development";
  } else if (catLower.includes('e-commerce') || catLower.includes('retail')) {
    customerSegments = "Online shoppers seeking convenience, competitive pricing, and variety";
  } else if (catLower.includes('finance') || catLower.includes('fintech')) {
    customerSegments = "Individuals and small businesses seeking better financial management tools";
  }
  
  // Detect value propositions
  let valuePropositions = "Saves time and reduces costs through automation and streamlined processes";
  if (descLower.includes('save') || descLower.includes('reduce')) {
    valuePropositions = "Delivers significant cost savings and efficiency improvements";
  } else if (descLower.includes('connect') || descLower.includes('network')) {
    valuePropositions = "Connects users with valuable opportunities and resources";
  } else if (descLower.includes('learn') || descLower.includes('educat')) {
    valuePropositions = "Provides accessible, high-quality learning experiences";
  }
  
  // Detect channels
  let channels = "Website, mobile app, social media marketing, and partnerships";
  if (catLower.includes('saas') || catLower.includes('software')) {
    channels = "Direct sales, product-led growth, content marketing, and partner integrations";
  } else if (catLower.includes('e-commerce')) {
    channels = "Online marketplace, social commerce, SEO, and paid advertising";
  }
  
  // Detect revenue streams
  let revenueStreams = "Subscription fees, freemium model with premium features, and transaction fees";
  if (catLower.includes('e-commerce') || catLower.includes('retail')) {
    revenueStreams = "Product sales, commissions, and premium seller services";
  } else if (catLower.includes('education')) {
    revenueStreams = "Course fees, subscription access, and certification programs";
  } else if (descLower.includes('consult') || descLower.includes('service')) {
    revenueStreams = "Hourly consulting fees, project-based pricing, and retainer contracts";
  }
  
  return {
    customerSegments,
    valuePropositions,
    channels,
    customerRelationships: "Self-service platform with automated onboarding, community support, and personalized assistance",
    revenueStreams,
    keyResources: "Technology platform, development team, brand reputation, customer data, and partnerships",
    keyActivities: "Product development, customer acquisition, user support, and continuous improvement",
    keyPartners: "Technology vendors, payment processors, marketing partners, and strategic allies",
    costStructure: "Development costs, hosting/infrastructure, marketing spend, team salaries, and operational expenses",
  };
}

// POST /api/ai/business-model
router.post("/business-model", async (req, res) => {
  const { title, category, description } = req.body || {};
  if (!title || !description) {
    return res.status(400).json({ message: "title and description are required" });
  }

  try {
    // Use AI models if available, otherwise fallback to rule-based
    if (aiModelsLoaded) {
      const aiResult = await aiService.generateBusinessModelWithAI(title, category, description);
      res.json({
        ...aiResult,
        model: 'transformer-ai'
      });
    } else {
      // Fallback to rule-based generation
      res.json({
        ...generateBusinessModel(title, category, description),
        model: 'rule-based'
      });
    }
  } catch (error) {
    console.error("AI business model error:", error.message);
    // Fallback on error
    res.json({
      ...generateBusinessModel(title, category, description),
      model: 'rule-based-fallback'
    });
  }
});

// Smart roadmap generator
function generateRoadmap(title, category, stage, description = '') {
  const catLower = (category || '').toLowerCase();
  const basePhases = [
    { 
      phase: "Phase 1: Validate", 
      duration: "1-2 months", 
      tasks: ["Define your target customer persona", "Conduct 10+ user interviews", "Build a landing page to test interest", "Analyze competitor landscape"] 
    },
    { 
      phase: "Phase 2: Build MVP", 
      duration: "2-4 months", 
      tasks: ["Define core features for MVP", "Build minimum viable product", "Set up analytics tracking", "Recruit beta testers"] 
    },
    { 
      phase: "Phase 3: Launch", 
      duration: "1-2 months", 
      tasks: ["Launch to beta users", "Collect feedback systematically", "Fix critical bugs and UX issues", "Create launch marketing campaign"] 
    },
    { 
      phase: "Phase 4: Grow", 
      duration: "3-6 months", 
      tasks: ["Scale marketing channels", "Optimize conversion funnel", "Build customer success process", "Seek seed funding if needed"] 
    },
    { 
      phase: "Phase 5: Scale", 
      duration: "6-12 months", 
      tasks: ["Hire key team members", "Expand to new markets", "Raise Series A if applicable", "Build strategic partnerships"] 
    },
  ];
  
  // Category-specific customizations
  if (catLower.includes('saas') || catLower.includes('software')) {
    basePhases[1].tasks = ["Define core user flows", "Build prototype with key integrations", "Set up CI/CD pipeline", "Create technical documentation"];
    basePhases[2].tasks = ["Deploy to production", "Monitor system performance", "Implement user feedback loop", "Launch on Product Hunt"];
  } else if (catLower.includes('e-commerce') || catLower.includes('retail')) {
    basePhases[0].tasks = ["Validate product-market fit with 20+ customer interviews", "Source initial suppliers", "Set up basic storefront", "Test pricing strategies"];
    basePhases[1].tasks = ["Build e-commerce platform", "Set up inventory management", "Establish shipping partnerships", "Create product listings"];
  } else if (catLower.includes('mobile') || catLower.includes('app')) {
    basePhases[1].tasks = ["Design mobile UI/UX", "Develop iOS/Android apps", "Set up push notifications", "Create app store assets"];
    basePhases[2].tasks = ["Submit to App Store and Play Store", "Run beta testing program", "Optimize app performance", "Launch influencer campaign"];
  }
  
  // Adjust based on current stage
  if (stage === 'MVP / Prototype') {
    return { phases: basePhases.slice(1) };
  } else if (stage === 'Early Traction') {
    return { phases: basePhases.slice(2) };
  } else if (stage === 'Growth Stage') {
    return { phases: basePhases.slice(3) };
  }
  
  return { phases: basePhases };
}

// POST /api/ai/roadmap
router.post("/roadmap", async (req, res) => {
  const { title, category, stage, description } = req.body || {};
  if (!title) {
    return res.status(400).json({ message: "title is required" });
  }

  try {
    if (aiModelsLoaded) {
      const aiResult = await aiService.buildRoadmapWithAI(title, category, stage, description);
      return res.json({
        ...aiResult,
        model: 'transformer-ai'
      });
    }

    res.json({
      ...generateRoadmap(title, category, stage, description),
      model: 'rule-based'
    });
  } catch (error) {
    console.error("AI roadmap error:", error.message);
    res.json({
      ...generateRoadmap(title, category, stage, description),
      model: 'rule-based-fallback'
    });
  }
});

module.exports = router;
