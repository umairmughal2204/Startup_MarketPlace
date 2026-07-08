const { pipeline } = require('@xenova/transformers');

// Model cache
let sentimentClassifier = null;
let featureExtractor = null;
let zeroShotClassifier = null;

// Model configurations
const MODELS = {
  sentiment: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
  features: 'Xenova/all-MiniLM-L6-v2',
  zeroShot: 'Xenova/mobilebert-uncased-mnli'
};

const CONTENT_VARIANTS = {
  strengths: [
    'Clearly frames the user pain point with practical intent',
    'Shows early signs of a defensible market position',
    'Connects problem, audience, and outcome in a coherent way',
    'Hints at a credible path to adoption and retention',
    'Signals enough specificity to support product iteration',
    'Demonstrates a workable balance between ambition and scope',
    'Reads as something a first cohort of users could evaluate quickly',
    'Frames the opportunity in language a customer would recognize',
    'Leaves room to iterate without requiring a full pivot later',
    'Suggests the founder has thought past the initial concept stage',
    'Has a scope narrow enough to be testable within a few weeks',
    'The framing gives an evaluator a concrete reason to keep reading',
    'Positions the idea somewhere a first customer could plausibly say yes',
    'Avoids the common trap of solving too many problems at once',
    'Reads as grounded rather than purely aspirational'
  ],
  suggestions: [
    'Test the idea with a small user interview batch and capture repeated objections',
    'Add a sharper differentiation statement that explains why this wins now',
    'Describe the first measurable outcome your users should see',
    'Map the first acquisition channel before expanding the feature set',
    'Turn the concept into a narrower MVP with one clear success metric',
    'Pressure-test the core assumption with the smallest possible experiment',
    'Write down the single objection most likely to stop a user from adopting this',
    'Define what "working" looks like for the first 30 days after launch',
    'Identify who would say no to this idea and why, then address it directly',
    'Sketch the simplest version of this that could ship in two weeks',
    'Talk to five potential users before writing another line of the plan',
    'Decide what you would cut first if the timeline got cut in half',
    'Put a number on the outcome you expect in the first month',
    'Find the one existing workaround people use today and beat it directly',
    'Write the elevator pitch a stranger could repeat back correctly'
  ],
  concerns: [
    'The proposal may need more proof around demand and willingness to pay',
    'Execution risk is still high until the first workflow is narrowed down',
    'Competitive pressure could be stronger than the current description suggests',
    'The monetization path should be made more explicit for decision making',
    'Operational and compliance assumptions need validation before scaling',
    'It is not yet clear how this holds up against a well-funded competitor',
    'The first 100 users may be harder to reach than the concept assumes',
    'Retention risk is unclear until real usage data exists',
    'The cost to acquire a customer has not been tested against realistic channels',
    'Team or resourcing gaps could slow execution more than the idea itself',
    'The idea may depend on a behavior change that is harder than it looks',
    'Timing risk exists if a larger player enters this space first',
    'The current framing does not yet rule out a much simpler alternative',
    'Unit economics have not been demonstrated at any meaningful scale',
    'It is unclear what happens to engagement after the novelty wears off'
  ],
  insights: [
    'The idea contains enough structure for an early validation loop',
    'The market signal is clearer than many pre-MVP concepts',
    'A sharper focus on the first customer segment would improve confidence',
    'The description already suggests where product-market fit may emerge',
    'The strongest signal is likely in the workflow or pain-point detail',
    'The concept sits closer to validated territory than most early submissions',
    'There is enough specificity here to design a focused first experiment',
    'The framing suggests the founder already has a working mental model of the user'
  ]
};

// Category-specific angle used to ensure ideas in the same category still get
// differentiated feedback instead of converging on the same generic sentence.
const CATEGORY_CONTENT = {
  technology: {
    strength: 'Sits in a category where automation or efficiency gains are easy for users to notice quickly',
    suggestion: 'Clarify the concrete technical differentiation versus existing tools already in the market',
    concern: 'Technical execution and platform reliability will need to be proven before scaling'
  },
  healthcare: {
    strength: 'Health-oriented ideas carry strong intrinsic demand once trust and safety are established',
    suggestion: 'Map the regulatory and compliance path early since healthcare adoption slows without it',
    concern: 'Regulatory, privacy, and clinical trust requirements could slow adoption more than usual'
  },
  education: {
    strength: 'Education concepts gain traction fastest when the learning outcome is easy to measure',
    suggestion: 'Pilot with a small cohort of learners to measure real engagement before scaling content',
    concern: 'Learner retention and completion rates are historically hard to sustain in this space'
  },
  'e-commerce': {
    strength: 'E-commerce concepts can validate real demand quickly through small paid traffic tests',
    suggestion: 'Test unit economics between acquisition cost and margin before committing to scale',
    concern: 'Customer acquisition cost and fulfillment logistics often erode margins faster than expected'
  },
  finance: {
    strength: 'Fintech-style ideas benefit from a clear trust and security story from day one',
    suggestion: 'Clarify the compliance and licensing path relevant to the target market early',
    concern: 'Regulatory compliance and consumer trust are typically the primary adoption barrier here'
  },
  sustainability: {
    strength: 'Sustainability-led ideas resonate most when the environmental impact is quantifiable',
    suggestion: 'Quantify the measurable environmental or resource impact to strengthen the pitch',
    concern: 'Willingness to pay a premium for sustainability benefits can be inconsistent across segments'
  },
  entertainment: {
    strength: 'Entertainment concepts succeed fastest when the core experience fits in one clear sentence',
    suggestion: 'Test the core experience with a small audience before investing in content breadth',
    concern: 'Attention is highly competitive here, so retention past the first session is the real test'
  },
  other: {
    strength: 'Has enough shape as a concept to support a focused first validation pass',
    suggestion: 'Narrow the category positioning so users and reviewers can classify the idea quickly',
    concern: 'Without a clear category anchor, go-to-market messaging may be harder to focus'
  }
};

function normalizeCategory(category) {
  const key = String(category || '').trim().toLowerCase();
  return CATEGORY_CONTENT[key] ? key : 'other';
}

function hashString(value) {
  let hash = 0;
  const text = String(value || '');
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Avalanches a seed + salt into a well-distributed 32-bit value (MurmurHash3 finalizer).
// A plain seed+offset keeps the same residue class mod N for any N that divides the
// offset gap, so two unrelated ideas whose seeds happen to share a remainder stay
// "linked" across every pool draw. This decorrelates each draw instead.
function mixSeed(seed, salt) {
  let h = (seed ^ salt) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
}

function pickFromList(seed, list, offset = 0) {
  if (!list.length) return '';
  return list[(seed + offset) % list.length];
}

// Draws `count` items using an independently avalanched index per slot, instead of
// walking a contiguous window through the list. A rotation window over a list of
// length N only has N possible outcomes no matter how large N is drawn from; this
// reaches close to the full C(N, count) combination space, which is what actually
// keeps a large phrase pool from collapsing back down to a handful of repeats.
function pickIndependent(seed, list, count) {
  if (!list.length) return [];
  const result = [];
  const usedIdx = new Set();
  let salt = 0;
  while (result.length < count && usedIdx.size < list.length) {
    const idx = mixSeed(seed, salt) % list.length;
    salt += 1;
    if (!usedIdx.has(idx)) {
      usedIdx.add(idx);
      result.push(list[idx]);
    }
  }
  return result;
}

function pickUnique(seed, list, count) {
  const results = [];
  const used = new Set();
  for (let i = 0; i < list.length && results.length < count; i += 1) {
    const candidate = pickFromList(seed, list, i);
    if (!used.has(candidate)) {
      used.add(candidate);
      results.push(candidate);
    }
  }
  return results;
}

function extractSignals(text) {
  const lower = String(text || '').toLowerCase();
  return {
    hasProblem: /problem|pain|frustrat|inefficien|gap|hard to|difficult/.test(lower),
    hasSolution: /solution|solve|fix|build|tool|platform|app|service/.test(lower),
    hasAudience: /customer|user|audience|buyer|patient|student|business|founder/.test(lower),
    hasRevenue: /revenue|monetiz|price|subscription|fee|commission|sale|profit/.test(lower),
    hasCompetition: /competitor|competition|alternative|replace|compare/.test(lower),
    hasScale: /scale|growth|expand|large|global|repeat/.test(lower),
    hasRisk: /risk|legal|regulat|compliance|challenge|security/.test(lower),
    hasResearch: /survey|interview|data|validate|test|feedback|research/.test(lower),
    hasDifferentiation: /unique|different|better|faster|smarter|innovative|distinct/.test(lower),
    hasB2B: /business|enterprise|team|company|workflow|operations/.test(lower),
    hasConsumer: /consumer|individual|personal|family|community/.test(lower),
    hasSaas: /saas|software|dashboard|subscription|cloud|api/.test(lower),
    hasMarketplace: /marketplace|buyer|seller|listing|commission/.test(lower),
    hasEducation: /educat|learn|course|student|teacher|training|skill/.test(lower),
    hasHealthcare: /health|medical|patient|clinic|wellness|care/.test(lower),
    hasFinance: /finance|money|payment|bank|budget|investment|fintech/.test(lower)
  };
}

// Initialize models (call this once at server startup)
async function initializeModels() {
  console.log('Loading AI models...');
  try {
    // Load sentiment analysis model
    sentimentClassifier = await pipeline('sentiment-analysis', MODELS.sentiment);
    console.log('✓ Sentiment model loaded');
    
    // Load feature extractor for text embeddings
    featureExtractor = await pipeline('feature-extraction', MODELS.features);
    console.log('✓ Feature extractor loaded');
    
    // Load zero-shot classifier for categorization
    zeroShotClassifier = await pipeline('zero-shot-classification', MODELS.zeroShot);
    console.log('✓ Zero-shot classifier loaded');
    
    console.log('All AI models ready!');
  } catch (error) {
    console.error('Failed to load AI models:', error.message);
    // Don't crash - fallback to rule-based will be used
  }
}

// Analyze idea quality using AI
async function analyzeIdeaWithAI(title, category, description) {
  if (!sentimentClassifier || !featureExtractor) {
    throw new Error('AI models not loaded');
  }

  const fullText = `${title}. ${description}`;
  const seed = hashString(`${fullText}::${category || 'Other'}`);
  const signals = extractSignals(`${fullText} ${category || ''}`);

  // Sentiment analysis (confidence = quality indicator)
  const sentimentResult = await sentimentClassifier(fullText);
  const sentimentScore = sentimentResult[0].label === 'POSITIVE' 
    ? sentimentResult[0].score 
    : 1 - sentimentResult[0].score;
  
  // Get text embedding for similarity analysis
  const embedding = await featureExtractor(fullText, { pooling: 'mean', normalize: true });
  
  // Calculate metrics based on AI analysis
  const titleQuality = Math.min(10, title.length / 3); // 0-10 based on length
  const descDepth = Math.min(10, description.length / 50); // 0-10 based on length
  const confidence = sentimentScore * 10; // 0-10 based on sentiment
  const signalBonus = (signals.hasProblem ? 0.4 : 0)
    + (signals.hasSolution ? 0.4 : 0)
    + (signals.hasAudience ? 0.3 : 0)
    + (signals.hasRevenue ? 0.3 : 0)
    + (signals.hasDifferentiation ? 0.2 : 0)
    + (signals.hasResearch ? 0.2 : 0);
  
  // Combine into final score (0-10)
  const aiScore = Math.min(10, Math.max(1, 
    (titleQuality * 0.2) + (descDepth * 0.3) + (confidence * 0.45) + signalBonus
  ));

  // Generate strengths based on content
  const strengths = await buildStrengths(description, embedding, seed, signals, confidence, category);

  // Generate suggestions based on what's missing
  const suggestions = await buildSuggestions(description, seed, signals, category);

  // Generate concerns
  const concerns = await buildConcerns(description, seed, signals, aiScore, category);

  return {
    marketFit: parseFloat(Math.min(10, aiScore * 0.9 + 0.5).toFixed(1)),
    feasibility: parseFloat(Math.min(10, aiScore * 0.85 + 0.8).toFixed(1)),
    aiScore: parseFloat(aiScore.toFixed(1)),
    strengths,
    suggestions,
    concerns,
    confidence: parseFloat(confidence.toFixed(2)),
    analysisTheme: pickFromList(seed, [
      'Opportunity-led',
      'Problem-led',
      'Product-led',
      'Market-led',
      'Execution-led'
    ])
  };
}

// Validate idea using zero-shot classification
async function validateIdeaWithAI(title, targetAudience, problem, solution, uniqueValue, competitors = '', category = '') {
  if (!zeroShotClassifier) {
    throw new Error('AI models not loaded');
  }

  const fullText = `${title}. Target: ${targetAudience}. Problem: ${problem}. Solution: ${solution || 'Not specified'}. Unique value: ${uniqueValue || 'Not specified'}`;
  const seed = hashString(`${fullText}. Competitors: ${competitors || 'none'}. Category: ${category || 'unknown'}`);
  const signals = extractSignals(fullText + ` ${competitors || ''}`);
  
  // Classify viability
  const viabilityResult = await zeroShotClassifier(fullText, [
    'strong business opportunity',
    'moderate potential',
    'weak opportunity',
    'not viable'
  ]);
  
  // Classify market demand
  const demandResult = await zeroShotClassifier(fullText, [
    'high market demand',
    'medium market demand',
    'low market demand'
  ]);
  
  // Calculate validation score based on classifications
  let score = 5.0;
  const viabilityTopScore = viabilityResult.scores[0] || 0;
  const demandTopScore = demandResult.scores[0] || 0;
  
  // Viability scoring
  const topViability = viabilityResult.labels[0];
  if (topViability === 'strong business opportunity') score += 3;
  else if (topViability === 'moderate potential') score += 1.5;
  else if (topViability === 'not viable') score -= 2;
  score += viabilityTopScore > 0.65 ? 0.5 : 0;
  
  // Demand scoring
  const topDemand = demandResult.labels[0];
  if (topDemand === 'high market demand') score += 1.5;
  else if (topDemand === 'medium market demand') score += 0.5;
  else if (topDemand === 'low market demand') score -= 1;
  score += demandTopScore > 0.6 ? 0.25 : 0;
  
  // Content length bonuses
  if (problem.length > 100) score += 0.5;
  if (solution && solution.length > 50) score += 0.5;
  if (uniqueValue && uniqueValue.length > 20) score += 0.5;
  if (competitors && competitors.length > 10) score += 0.25;
  if (signals.hasResearch) score += 0.25;
  
  const validationScore = Math.min(10, Math.max(1, score));
  
  // Determine verdict
  let verdict = 'Needs Work';
  if (validationScore >= 8) verdict = 'Strong';
  else if (validationScore >= 6) verdict = 'Promising';
  else if (validationScore < 4) verdict = 'Not Viable';
  
  // Market demand text
  let marketDemand = 'Medium';
  if (topDemand === 'high market demand') marketDemand = 'High';
  else if (topDemand === 'low market demand') marketDemand = 'Low';
  
  return {
    validationScore: parseFloat(validationScore.toFixed(1)),
    marketDemand,
    tam: calculateTAM(targetAudience),
    sam: calculateSAM(targetAudience),
    som: calculateSOM(targetAudience),
    verdict,
    insights: buildValidationInsights({ problem, solution, competitors, signals, viabilityResult, seed }),
    risks: buildValidationRisks({ problem, solution, uniqueValue, competitors, signals, seed, validationScore }),
    nextSteps: buildValidationNextSteps(validationScore, signals),
    aiSignals: {
      viability: topViability,
      demand: topDemand,
      confidence: parseFloat(((viabilityTopScore + demandTopScore) / 2).toFixed(2))
    }
  };
}

function buildStrengths(description, embedding, seed, signals, confidence, category) {
  const descLower = description.toLowerCase();
  const categoryContent = CATEGORY_CONTENT[normalizeCategory(category)];

  const candidates = [];
  if (signals.hasProblem) candidates.push('Clearly identifies a real pain point');
  if (signals.hasSolution) candidates.push('Proposes a concrete response rather than a vague concept');
  if (signals.hasAudience) candidates.push('Targets a definable customer group');
  if (signals.hasRevenue) candidates.push('Includes an early path to monetization');
  if (signals.hasDifferentiation) candidates.push('Signals a meaningful competitive angle');
  if (signals.hasScale) candidates.push('Shows potential for repeatable growth');
  if (descLower.includes('ai') || descLower.includes('automation')) {
    candidates.push('Uses automation to reduce manual effort');
  }
  if (confidence > 7.5) {
    candidates.push('The model confidence is relatively strong for early-stage analysis');
  }

  // Pool candidates (signal-matched + the category line + the general phrase bank)
  // together and draw 3 from the combined set with an avalanched seed. Drawing from
  // one large pool instead of forcing a fixed category slot multiplies the number of
  // distinct 3-item combinations, which is what actually keeps two ideas in the same
  // category from converging on identical feedback as more submissions come in.
  const pool = [...candidates, categoryContent.strength, ...CONTENT_VARIANTS.strengths];
  const strengths = pickIndependent(mixSeed(seed, 0x5b1e), pool, 3);
  return [...new Set(strengths)].slice(0, 3);
}

function buildSuggestions(description, seed, signals, category) {
  const descLower = description.toLowerCase();
  const categoryContent = CATEGORY_CONTENT[normalizeCategory(category)];

  const candidates = [];
  if (!signals.hasCompetition) candidates.push('Name the closest competitors and explain the practical difference');
  if (!signals.hasResearch) candidates.push('Run a small validation loop with interviews, surveys, or landing-page tests');
  if (!signals.hasRevenue) candidates.push('Define pricing and the first monetization step');
  if (!descLower.includes('mvp') && !descLower.includes('prototype')) {
    candidates.push('Shrink the scope to the smallest usable MVP');
  }
  if (!signals.hasDifferentiation) candidates.push('State one clear reason users would switch');

  const pool = [...candidates, categoryContent.suggestion, ...CONTENT_VARIANTS.suggestions];
  const suggestions = pickIndependent(mixSeed(seed, 0x2f7c), pool, 3);
  return [...new Set(suggestions)].slice(0, 3);
}

function buildConcerns(description, seed, signals, aiScore, category) {
  const descLower = description.toLowerCase();
  const categoryContent = CATEGORY_CONTENT[normalizeCategory(category)];

  const candidates = [];
  if (aiScore < 6) candidates.push('The concept needs stronger validation before confidence is high');
  if (!signals.hasResearch) candidates.push('There is not enough evidence of user discovery yet');
  if (!signals.hasRevenue) candidates.push('The revenue model is still under-defined');
  if (!signals.hasRisk) candidates.push('Operational, legal, or compliance risk may be underestimated');
  if (!signals.hasCompetition) candidates.push('Competitive positioning should be tested more directly');
  if (descLower.length < 120) candidates.push('The problem and solution framing may be too thin for evaluation');

  const pool = [...candidates, categoryContent.concern, ...CONTENT_VARIANTS.concerns];
  const concerns = pickIndependent(mixSeed(seed, 0x8a41), pool, 3);
  return [...new Set(concerns)].slice(0, 3);
}

function buildInsights(problem, solution, seed, signals) {
  const insights = [];

  if (problem.length > 100) insights.push('The problem statement is detailed enough to support deeper analysis');
  if (solution && solution.length > 50) insights.push('The solution description gives the model enough context to score feasibility');
  if (signals.hasAudience) insights.push('The target user segment is identifiable from the input');
  if (signals.hasResearch) insights.push('The description already contains validation-oriented language');

  const remaining = pickUnique(seed + 7, CONTENT_VARIANTS.insights, 3);
  for (const item of remaining) {
    if (insights.length >= 3) break;
    if (!insights.includes(item)) insights.push(item);
  }

  return insights.slice(0, 3);
}

// Helper functions for TAM/SAM/SOM calculations
function calculateTAM(targetAudience) {
  if (targetAudience.toLowerCase().includes('global') || targetAudience.toLowerCase().includes('worldwide')) {
    return "$10B+ globally";
  }
  if (targetAudience.toLowerCase().includes('us') || targetAudience.toLowerCase().includes('usa') || targetAudience.toLowerCase().includes('america')) {
    return "$1B - $5B in US market";
  }
  return "$500M - $2B globally";
}

function calculateSAM(targetAudience) {
  return "$100M - $500M (addressable segment)";
}

function calculateSOM(targetAudience) {
  return "$5M - $20M (realistic first 3 years)";
}

// Generate insights based on viability analysis
function generateInsights(problem, solution, viabilityResult) {
  const insights = [];
  
  if (problem.length > 100) {
    insights.push("Your problem statement demonstrates deep understanding of user pain points");
  }
  if (solution && solution.length > 50) {
    insights.push("Solution approach appears technically feasible based on description");
  }
  
  insights.push("Your target audience has a clearly identifiable pain point");
  insights.push("The problem space shows consistent search and discussion trends");
  insights.push("Early-stage competitors validate demand but leave room for differentiation");
  
  return insights.slice(0, 3);
}

// Generate risks
function generateRisks(problem, solution, uniqueValue) {
  const risks = [];
  
  if (!solution || solution.length < 20) {
    risks.push("Solution definition needs more detail to assess technical feasibility");
  }
  if (!uniqueValue || uniqueValue.length < 10) {
    risks.push("Unique value proposition should be clarified to differentiate from competitors");
  }
  
  risks.push("Market education may be required to onboard first users");
  risks.push("Customer acquisition cost could be high without clear channels");
  
  return risks.slice(0, 3);
}

// Generate next steps based on score
function generateNextSteps(score) {
  if (score >= 8) {
    return [
      "Build an MVP to validate technical assumptions",
      "Recruit a small beta user group for feedback",
      "Prepare investor pitch deck with market data"
    ];
  }
  if (score >= 6) {
    return [
      "Run a landing page test to measure signup intent",
      "Interview 10-15 people from your target audience",
      "Create a basic MVP to test core assumptions"
    ];
  }
  return [
    "Refine your problem statement with specific user research",
    "Define your unique value proposition more clearly",
    "Conduct deeper competitive analysis"
  ];
}

function buildValidationInsights({ problem, solution, competitors, signals, viabilityResult, seed }) {
  const insights = [];

  if (problem.length > 100) {
    insights.push('The problem statement is detailed enough to support deeper validation');
  }
  if (solution && solution.length > 50) {
    insights.push('The solution definition gives enough context for an AI-assisted review');
  }
  if (competitors && competitors.length > 0) {
    insights.push('The competitor field adds useful context for differentiation analysis');
  }
  if (signals.hasResearch) {
    insights.push('The input already hints at some market discovery effort');
  }

  const topViability = viabilityResult.labels[0];
  if (topViability === 'strong business opportunity') {
    insights.push('The classifier sees meaningful upside if execution details are tightened');
  } else if (topViability === 'not viable') {
    insights.push('The model is detecting material gaps that should be addressed before building');
  }

  const remaining = pickUnique(seed, CONTENT_VARIANTS.insights, 3);
  for (const item of remaining) {
    if (insights.length >= 3) break;
    if (!insights.includes(item)) insights.push(item);
  }

  return insights.slice(0, 3);
}

function buildValidationRisks({ problem, solution, uniqueValue, competitors, signals, seed, validationScore }) {
  const risks = [];

  if (!solution || solution.length < 20) {
    risks.push('Solution definition needs more detail to assess feasibility');
  }
  if (!uniqueValue || uniqueValue.length < 10) {
    risks.push('Unique value proposition should be clarified to reduce competitive overlap');
  }
  if (!competitors || competitors.length < 5) {
    risks.push('Competitive benchmarking is too light to support a confident launch plan');
  }
  if (!signals.hasResearch) {
    risks.push('There is not enough market evidence yet to support a strong verdict');
  }
  if (validationScore < 6.5) {
    risks.push('The current idea needs more specificity before it becomes investable');
  }

  const remaining = pickUnique(seed + 19, CONTENT_VARIANTS.concerns, 3);
  for (const item of remaining) {
    if (risks.length >= 3) break;
    if (!risks.includes(item)) risks.push(item);
  }

  return risks.slice(0, 3);
}

function buildValidationNextSteps(score, signals) {
  if (score >= 8) {
    return [
      'Build an MVP to validate technical assumptions',
      'Recruit a small beta user group for feedback',
      'Prepare investor pitch deck with market data'
    ];
  }
  if (score >= 6) {
    return [
      'Run a landing page test to measure signup intent',
      'Interview 10-15 people from your target audience',
      'Create a basic MVP to test core assumptions'
    ];
  }

  return [
    signals.hasResearch ? 'Refine the market angle and tighten the customer segment' : 'Start with user interviews and problem validation',
    signals.hasRevenue ? 'Clarify the monetization path and expected price point' : 'Define the revenue model before building more features',
    'Conduct deeper competitive analysis before committing to a build'
  ];
}

// Business Model Canvas generation with AI
async function generateBusinessModelWithAI(title, category, description) {
  if (!zeroShotClassifier) {
    throw new Error('AI models not loaded');
  }
  
  const fullText = `${title}. ${description}`;
  const catLower = (category || '').toLowerCase();
  const seed = hashString(`${title}::${category}::${description}`);
  const signals = extractSignals(fullText);
  
  // Classify business aspects
  const customerResult = await zeroShotClassifier(fullText, [
    'businesses and enterprises',
    'consumers and individuals',
    'developers and technical users',
    'students and educators',
    'healthcare providers and patients'
  ]);
  
  const modelResult = await zeroShotClassifier(fullText, [
    'subscription SaaS model',
    'e-commerce and product sales',
    'marketplace and platform',
    'freemium app model',
    'consulting and services'
  ]);
  
  // Build canvas based on AI classification
  const customerSegments = buildCustomerSegments(customerResult, catLower, signals, seed, description);
  const valuePropositions = buildValuePropositions(description, catLower, signals, seed, modelResult);
  const channels = buildChannels(modelResult, catLower, signals, seed);
  const revenueStreams = buildRevenueStreams(modelResult, catLower, description, signals, seed);
  const customerRelationships = buildCustomerRelationships(catLower, signals, seed);
  const keyResources = buildKeyResources(catLower, signals, seed);
  const keyActivities = buildKeyActivities(catLower, signals, seed);
  const keyPartners = buildKeyPartners(catLower, signals, seed);
  const costStructure = buildCostStructure(catLower, signals, seed);
  
  return {
    customerSegments,
    valuePropositions,
    channels,
    customerRelationships,
    revenueStreams,
    keyResources,
    keyActivities,
    keyPartners,
    costStructure,
    businessLens: pickFromList(seed, ['Growth-first', 'Retention-first', 'Efficiency-first', 'Trust-first', 'Network-first']),
    aiSignals: {
      customer: customerResult.labels[0],
      model: modelResult.labels[0],
      confidence: parseFloat((((customerResult.scores[0] || 0) + (modelResult.scores[0] || 0)) / 2).toFixed(2))
    }
  };
}

function buildCustomerSegments(classificationResult, category, signals, seed, description) {
  const scores = {};
  classificationResult.labels.forEach((label, i) => {
    scores[label] = classificationResult.scores[i];
  });

  const audienceFromModel = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'businesses and enterprises';

  const customerProfiles = {
    'businesses and enterprises': [
      'Small-to-medium businesses looking to remove repetitive manual work',
      'Operational teams that need faster coordination and clearer accountability',
      'Business leaders seeking a measurable productivity gain without heavy implementation',
      'Cross-functional teams that want a simpler workflow and fewer bottlenecks'
    ],
    'consumers and individuals': [
      'Individual users who want a faster, easier way to solve a recurring problem',
      'Early adopters looking for convenience, clarity, and immediate value',
      'Everyday consumers who prefer lightweight tools over complex systems',
      'People seeking a practical upgrade to an existing routine or habit'
    ],
    'developers and technical users': [
      'Technical teams that value integration, automation, and extensibility',
      'Developers who want to reduce manual setup and speed up implementation',
      'IT and product teams that need a flexible system with clear APIs',
      'Builders who care about control, workflow efficiency, and reliability'
    ],
    'students and educators': [
      'Students who need structured support and faster progress toward outcomes',
      'Educators who want better engagement, tracking, or content delivery',
      'Learning communities that benefit from simple access to guidance and feedback',
      'Academic users seeking a more personalized and practical learning experience'
    ],
    'healthcare providers and patients': [
      'Healthcare staff that need safer, simpler, and more reliable coordination',
      'Patients who want better access, clarity, and follow-through',
      'Wellness-focused users looking for a trusted and personalized experience',
      'Clinical teams that need more efficient operations and communication'
    ]
  };

  const baseProfile = customerProfiles[audienceFromModel] || customerProfiles['businesses and enterprises'];
  const categoryHint = category.includes('marketplace') ? 'marketplace users and operators' : category.includes('saas') || category.includes('software') ? 'software buyers and workflow owners' : category.includes('health') ? 'health-focused users and providers' : category.includes('education') ? 'learners and educators' : 'the core customer group';
  const signalHint = signals.hasB2B ? 'decision makers and operational teams' : signals.hasConsumer ? 'individual customers' : 'early adopters';
  const detailHint = description.length > 120 ? 'with enough complexity to value a more tailored solution' : 'looking for a straightforward solution';

  return `${pickFromList(seed, baseProfile)}. Primary focus: ${categoryHint}, especially ${signalHint} ${detailHint}.`;
}

function buildValuePropositions(description, category, signals, seed, modelResult) {
  const descLower = description.toLowerCase();
  const valueAngles = [];

  if (signals.hasB2B || descLower.includes('save') || descLower.includes('reduce')) {
    valueAngles.push('Reduces manual work and helps teams save time immediately');
  }
  if (signals.hasMarketplace || category.includes('marketplace') || descLower.includes('connect') || descLower.includes('community')) {
    valueAngles.push('Creates a cleaner match between users, offers, and outcomes');
  }
  if (signals.hasEducation || descLower.includes('learn') || descLower.includes('skill')) {
    valueAngles.push('Improves learning progress with clearer guidance and feedback');
  }
  if (signals.hasHealthcare || descLower.includes('health') || descLower.includes('care')) {
    valueAngles.push('Improves care or wellness outcomes through simpler access and follow-through');
  }
  if (signals.hasFinance || category.includes('finance') || descLower.includes('money') || descLower.includes('payment')) {
    valueAngles.push('Makes financial decisions or transactions faster, safer, and easier to track');
  }

  const genericAngles = [
    'Delivers a focused outcome that feels easier to use than the current alternative',
    'Removes friction from a repeated workflow so adoption feels natural',
    'Turns a messy process into a clearer, more predictable user experience',
    'Offers a practical upgrade that users can understand without heavy onboarding',
    'Combines convenience with a sharper outcome than traditional options'
  ];

  while (valueAngles.length < 2) {
    const candidate = pickFromList(seed + valueAngles.length, genericAngles);
    if (!valueAngles.includes(candidate)) valueAngles.push(candidate);
  }

  const primaryAngle = pickFromList(seed, valueAngles);
  const secondaryAngle = valueAngles.find((angle) => angle !== primaryAngle) || pickFromList(seed + 1, genericAngles);

  const modelLabel = modelResult.labels[0];
  const categoryQualifier = category.includes('saas') || category.includes('software')
    ? 'This reads like recurring software value with room for onboarding, retention, and support.'
    : category.includes('marketplace')
      ? 'This fits a platform value story where trust and repeat usage matter.'
      : category.includes('education')
        ? 'This fits a learning value story where progress and clarity matter.'
        : category.includes('health')
          ? 'This fits a care-oriented value story where trust and outcomes matter.'
          : 'This fits a value story centered on a clear user outcome.';
  const modelQualifier = `The classifier leans toward ${modelLabel}, but the description suggests a more specific fit. ${categoryQualifier}`;

  return `${primaryAngle}. ${secondaryAngle}. ${modelQualifier}`;
}

function buildChannels(classificationResult, category, signals, seed) {
  const catLower = category.toLowerCase();
  const channelProfiles = {
    saas: [
      'Direct sales to the first narrow customer segment, product-led onboarding, content marketing, and partner integrations',
      'Targeted outbound, SEO, demo-led conversion, and workflow-specific partnerships',
      'Founder-led selling, community proof, trial-based onboarding, and customer referrals'
    ],
    ecommerce: [
      'Online storefront discovery, social commerce, paid ads, email retention, and creator-led distribution',
      'SEO, marketplace listings, retargeting, influencer partnerships, and conversion-focused landing pages',
      'Brand storytelling, product pages, promotions, and repeat purchase campaigns'
    ],
    marketplace: [
      'Supply-side onboarding, buyer acquisition loops, referral programs, search discovery, and trust-building content',
      'Category-specific SEO, listings, local partnerships, and network-driven growth',
      'User referrals, targeted ads, community flywheels, and partner channels'
    ],
    mobile: [
      'App store discovery, paid mobile campaigns, social distribution, referral loops, and push-driven retention',
      'Influencer partnerships, app reviews, onboarding prompts, and lightweight retention campaigns',
      'Short-form content, referral mechanics, and product virality inside the app experience'
    ],
    default: [
      'Website-led acquisition, SEO, social proof, partnerships, and a direct conversion path',
      'Content marketing, search discovery, community distribution, and selective paid acquisition',
      'A mix of organic reach, partnerships, and product-driven referrals'
    ]
  };

  const modelHint = classificationResult.labels[0] === 'subscription SaaS model'
    ? 'subscription-led growth'
    : classificationResult.labels[0] === 'marketplace and platform'
      ? 'liquidity and trust loops'
      : classificationResult.labels[0] === 'freemium app model'
        ? 'upgrade conversion from free users'
        : classificationResult.labels[0] === 'consulting and services'
          ? 'lead generation and service positioning'
          : 'transaction-focused acquisition';

  let profileKey = 'default';
  if (catLower.includes('saas') || catLower.includes('software') || catLower.includes('b2b')) profileKey = 'saas';
  else if (catLower.includes('e-commerce') || catLower.includes('retail') || catLower.includes('product')) profileKey = 'ecommerce';
  else if (catLower.includes('marketplace')) profileKey = 'marketplace';
  else if (catLower.includes('mobile') || catLower.includes('app')) profileKey = 'mobile';

  const selection = pickFromList(seed, channelProfiles[profileKey]);
  const supportSignal = signals.hasResearch ? 'backed by early validation content' : 'paired with discovery work to find the best channel';
  return `${selection}. The go-to-market motion should emphasize ${modelHint}, ${supportSignal}.`;
}

function buildRevenueStreams(classificationResult, category, description, signals, seed) {
  const descLower = description.toLowerCase();
  const catLower = category.toLowerCase();

  const revenueProfiles = {
    ecommerce: [
      'Product sales, bundles, premium placements, and repeat-purchase programs',
      'Direct product revenue, add-ons, cross-sells, and limited membership benefits',
      'Merchandise sales, featured placement fees, and loyalty-driven repeat orders'
    ],
    education: [
      'Course fees, subscription access, certification programs, and premium learning support',
      'Tiered learning subscriptions, cohort pricing, and premium content packages',
      'One-time course purchases, recurring memberships, and institutional licensing'
    ],
    marketplace: [
      'Transaction fees, premium listings, featured placements, value-added services, and partner revenue',
      'Commission on completed transactions, seller subscriptions, and advertising inventory',
      'Fee-per-transaction, placement upgrades, and service add-ons that improve trust or speed'
    ],
    consulting: [
      'Hourly consulting fees, project pricing, retainer contracts, and premium support tiers',
      'Fixed-scope engagements, ongoing advisory retainers, and implementation packages',
      'Service fees tied to outcome delivery, support subscriptions, and custom work'
    ],
    default: [
      'Subscription fees, premium tiers, transaction fees, and enterprise or partner licensing',
      'A freemium entry point with paid upgrades, support packages, and usage-based expansion',
      'Recurring revenue with optional service add-ons and strategic licensing opportunities'
    ]
  };

  let profileKey = 'default';
  if (catLower.includes('e-commerce') || catLower.includes('retail')) profileKey = 'ecommerce';
  else if (catLower.includes('education') || catLower.includes('course')) profileKey = 'education';
  else if (catLower.includes('marketplace')) profileKey = 'marketplace';
  else if (descLower.includes('consult') || descLower.includes('service') || descLower.includes('agency')) profileKey = 'consulting';

  const modelHint = classificationResult.labels[0] === 'subscription SaaS model'
    ? 'recurring subscriptions and premium tiers'
    : classificationResult.labels[0] === 'marketplace and platform'
      ? 'transaction fees and platform services'
      : classificationResult.labels[0] === 'e-commerce and product sales'
        ? 'direct product revenue and add-ons'
        : classificationResult.labels[0] === 'consulting and services'
          ? 'project pricing and retainers'
          : 'usage-based and premium access';

  const base = pickFromList(seed, revenueProfiles[profileKey]);
  const addOn = signals.hasFinance ? 'Payment, pricing, or financial workflow improvements can support higher-value tiers.' : 'Additional services or upgrades can create an upsell path over time.';
  return `${base}. The primary monetization logic points toward ${modelHint}. ${addOn}`;
}

function buildCustomerRelationships(category, signals, seed) {
  const profiles = [
    'Self-service onboarding with clear guidance, proactive nudges, and responsive support when users get stuck',
    'Automated onboarding paired with lightweight human assistance for higher-value customers',
    'A trust-led relationship model that combines quick support, in-app guidance, and feedback loops',
    'Community support, documented workflows, and targeted help for users with more complex needs',
    'Personalized assistance for key users, plus self-serve tools for everyone else'
  ];
  const focus = signals.hasB2B ? 'account-oriented support and success checks' : signals.hasMarketplace ? 'trust, moderation, and transaction confidence' : signals.hasHealthcare ? 'careful guidance and reliability' : 'simple onboarding and repeat engagement';
  return `${pickFromList(seed, profiles)} with a focus on ${focus}.`;
}

function buildKeyResources(category, signals, seed) {
  const resourceSets = [
    'A usable product, domain knowledge, customer insight, and the ability to iterate quickly',
    'Technology platform, customer data, brand trust, and the team needed to ship and support it',
    'A clear workflow design, credibility in the target market, and partnerships that reduce friction',
    'Proprietary process knowledge, product capability, and a repeatable acquisition channel',
    'A reliable system, strong positioning, and evidence that the use case matters enough to retain users'
  ];
  const categoryBonus = category.includes('marketplace') ? 'plus supply and demand liquidity' : category.includes('saas') || category.includes('software') ? 'plus product reliability and integration depth' : category.includes('health') ? 'plus compliance awareness and trust' : 'plus a clear customer acquisition path';
  return `${pickFromList(seed, resourceSets)} ${categoryBonus}.`;
}

function buildKeyActivities(category, signals, seed) {
  const activitySets = [
    'Product development, user research, customer acquisition, and continuous iteration',
    'Launching features, testing messaging, supporting users, and improving retention',
    'Building the core workflow, collecting feedback, and refining the go-to-market motion',
    'Operational setup, customer success, analytics, and partnership development',
    'Validation experiments, product refinement, onboarding, and performance monitoring'
  ];
  const focus = signals.hasResearch ? 'evidence-driven iteration' : 'early discovery and validation';
  return `${pickFromList(seed + 5, activitySets)} with an emphasis on ${focus}.`;
}

function buildKeyPartners(category, signals, seed) {
  const partnerSets = [
    'Technology vendors, payment processors, and strategic distribution partners',
    'Industry experts, platform partners, and service providers that reduce execution friction',
    'Marketing partners, infrastructure vendors, and advisors who accelerate trust and reach',
    'Operational partners, customer acquisition channels, and specialists in the target space',
    'Compliance, analytics, and support partners that help the business scale responsibly'
  ];
  const partnerFocus = category.includes('health') ? 'trusted providers and compliance-aware partners' : category.includes('education') ? 'content, distribution, and learning partners' : category.includes('marketplace') ? 'liquidity, logistics, and trust partners' : 'partners that help with reach and execution';
  return `${pickFromList(seed + 9, partnerSets)}. In this category, the highest-value partners are ${partnerFocus}.`;
}

function buildCostStructure(category, signals, seed) {
  const costSets = [
    'Development, hosting, customer support, marketing, and ongoing operational overhead',
    'Product build costs, acquisition spend, team salaries, tools, and iteration costs',
    'Infrastructure, support, brand building, onboarding, and growth experiments',
    'Core delivery costs, customer success, analytics, and compliance-related overhead',
    'Product maintenance, distribution, support, and the expenses needed to scale carefully'
  ];
  const categoryCost = category.includes('marketplace') ? 'Liquidity-building and trust costs may be material early on.' : category.includes('ecommerce') ? 'Fulfillment, returns, and marketing can dominate the early budget.' : signals.hasHealthcare ? 'Compliance and trust-building can add meaningful overhead.' : 'The biggest cost pressure will likely come from acquisition and iteration.';
  return `${pickFromList(seed + 13, costSets)}. ${categoryCost}`;
}

async function estimateCostWithAI(businessType, stage, teamSize, description = '') {
  if (!zeroShotClassifier || !sentimentClassifier) {
    throw new Error('AI models not loaded');
  }

  const fullText = `${businessType}. ${stage}. ${teamSize}. ${description}`;
  const seed = hashString(fullText);
  const signals = extractSignals(fullText);

  const spendResult = await zeroShotClassifier(fullText, [
    'engineering and product heavy',
    'marketing and acquisition heavy',
    'compliance and legal heavy',
    'operations and fulfillment heavy',
    'content and support heavy'
  ]);

  const riskResult = await zeroShotClassifier(fullText, [
    'high uncertainty',
    'moderate uncertainty',
    'low uncertainty'
  ]);

  const stageFactors = {
    'Idea / Pre-MVP': 0.55,
    'MVP / Prototype': 0.82,
    'Early Traction': 1.0,
    'Growth Stage': 1.45
  };

  const teamFactors = {
    'Solo founder': 0.65,
    '1-3': 1.0,
    '4-10': 1.45,
    '10+': 1.9
  };

  const businessTypeHints = {
    'SaaS / Software': { tech: [8000, 25000], ops: [2500, 9000], marketing: [3000, 12000], legal: [1200, 4000] },
    'E-commerce / Retail': { tech: [3500, 12000], ops: [6000, 22000], marketing: [4000, 15000], legal: [1200, 4000], inventory: [7000, 35000] },
    'Marketplace': { tech: [10000, 32000], ops: [7000, 24000], marketing: [5000, 18000], legal: [2000, 6000] },
    'Mobile App': { tech: [9000, 28000], ops: [4500, 18000], marketing: [3500, 12000], legal: [1200, 4000] },
    'Healthcare': { tech: [12000, 40000], ops: [8000, 26000], marketing: [5000, 15000], legal: [3000, 9000], compliance: [6000, 18000] },
    'Education / EdTech': { tech: [7000, 22000], ops: [3500, 14000], marketing: [3000, 10000], legal: [1200, 4000], content: [4000, 18000] },
    'Food & Beverage': { tech: [2500, 9000], ops: [6000, 22000], marketing: [3500, 12000], legal: [2000, 6000], equipment: [7000, 28000] },
    'Consulting / Services': { tech: [1000, 4000], ops: [2500, 10000], marketing: [2500, 9000], legal: [1000, 3500] },
    'Manufacturing': { tech: [4000, 14000], ops: [12000, 42000], marketing: [3500, 12000], legal: [2000, 7000], equipment: [15000, 55000] },
    'Other': { tech: [4000, 14000], ops: [3500, 14000], marketing: [2500, 9000], legal: [1200, 4000] }
  };

  const categoryHint = businessTypeHints[businessType] || businessTypeHints.Other;
  const stageFactor = stageFactors[stage] || 1.0;
  const teamFactor = teamFactors[teamSize] || 1.0;
  const spendTilt = spendResult.labels[0];
  const riskTilt = riskResult.labels[0];
  const confidence = (((spendResult.scores[0] || 0) + (riskResult.scores[0] || 0)) / 2);

  const categoryAdjustments = {
    'engineering and product heavy': 1.15,
    'marketing and acquisition heavy': 1.12,
    'compliance and legal heavy': 1.18,
    'operations and fulfillment heavy': 1.14,
    'content and support heavy': 1.08
  };

  const globalAdjust = categoryAdjustments[spendTilt] || 1.0;
  const uncertaintyAdjust = riskTilt === 'high uncertainty' ? 1.18 : riskTilt === 'moderate uncertainty' ? 1.08 : 0.98;

  const categories = Object.entries(categoryHint).map(([name, [min, max]]) => {
    const signalBoost = signals.hasFinance && name === 'legal' ? 1.12 : signals.hasHealthcare && name === 'compliance' ? 1.15 : signals.hasMarketplace && name === 'ops' ? 1.1 : signals.hasEducation && name === 'content' ? 1.12 : 1.0;
    const descriptionBoost = signals.hasScale ? 1.08 : signals.hasResearch ? 0.98 : 1.0;
    const minValue = Math.round(min * stageFactor * teamFactor * globalAdjust * uncertaintyAdjust * signalBoost * descriptionBoost);
    const maxValue = Math.round(max * stageFactor * teamFactor * globalAdjust * uncertaintyAdjust * signalBoost * descriptionBoost);

    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      min: minValue,
      max: maxValue,
      note: buildCostNote(name, businessType, description, signals, seed)
    };
  });

  const totalMin = categories.reduce((sum, category) => sum + category.min, 0);
  const totalMax = categories.reduce((sum, category) => sum + category.max, 0);

  return {
    totalMin,
    totalMax,
    categories,
    tips: buildCostTips(businessType, stage, description, signals, seed),
    aiSignals: {
      spendTilt,
      riskTilt,
      confidence: parseFloat(confidence.toFixed(2))
    }
  };
}

function buildCostNote(category, businessType, description, signals, seed) {
  const notes = {
    tech: [
      'Product build, hosting, tools, and integration work sit here.',
      'The software layer tends to absorb the first meaningful spend.',
      'Expect iteration costs to stay active while the product changes.'
    ],
    marketing: [
      'Early growth usually depends on finding one reliable acquisition channel.',
      'Distribution costs can swing a lot until messaging is validated.',
      'This is often the easiest line item to over- or under-estimate.'
    ],
    legal: [
      'Foundational legal work, contracts, and basic protection are included.',
      'This line becomes more important if the category has trust or compliance risk.',
      'Expect legal costs to rise if partnerships or regulated workflows are involved.'
    ],
    ops: [
      'Support, people, tools, and day-to-day execution live here.',
      'Operational overhead changes quickly once the team starts handling real users.',
      'The more manual the process, the more this line tends to expand.'
    ],
    inventory: [
      'Product stock, storage, and fulfillment can create cash pressure quickly.',
      'This cost line matters most when demand is uncertain or margins are thin.',
      'Inventory spend can become risky without a tight sales forecast.'
    ],
    compliance: [
      'Trust, certification, and regulatory work can be expensive early on.',
      'Compliance spend grows when the product handles sensitive users or data.',
      'This category may need professional guidance before launch.'
    ],
    content: [
      'Content production and curriculum design are the main spend drivers.',
      'Quality content takes time, iteration, and subject-matter input.',
      'The content budget often grows with personalization and depth.'
    ],
    equipment: [
      'Physical equipment and setup costs can dominate early cash use.',
      'The category is asset-heavy, so up-front planning matters more.',
      'This budget line often depends on the exact operating model.'
    ]
  };

  const selected = notes[category] || notes.ops;
  const businessHints = [
    businessType.includes('Healthcare') ? 'Trust and compliance tend to stay visible longer than expected.' : null,
    businessType.includes('Marketplace') ? 'Two-sided coordination can push support and acquisition costs upward.' : null,
    businessType.includes('Education') ? 'Content depth usually matters more than raw feature count.' : null,
    businessType.includes('E-commerce') ? 'Fulfillment and acquisition often move faster than product build costs.' : null,
    signals.hasScale ? 'Spending usually shifts from build cost to reach and retention once traction appears.' : null,
    signals.hasResearch ? 'Early evidence can tighten the estimate, but execution still needs room to breathe.' : null,
    'The estimate is most sensitive to how quickly the first workflow is proven.'
  ].filter(Boolean);

  return `${pickFromList(seed, selected)} ${pickFromList(seed + 3, businessHints)}`;
}

function buildCostTips(businessType, stage, description, signals, seed) {
  const tips = [];
  const baseTips = [
    'Validate the smallest version before spending on scale.',
    'Keep acquisition experiments cheap until one channel works.',
    'Separate essential costs from nice-to-have spend.'
  ];
  tips.push(...pickUnique(seed, baseTips, 3));

  if (stage === 'Idea / Pre-MVP') {
    tips.push('Use interviews and landing pages before building the full product.');
  }
  if (stage === 'Growth Stage') {
    tips.push('Budget for expansion, support, and operational resilience.');
  }
  if (businessType === 'SaaS / Software') {
    tips.push('No-code and automation tools can reduce early engineering spend.');
  }
  if (businessType === 'Marketplace') {
    tips.push('Expect liquidity and trust-building costs to matter early.');
  }
  if (signals.hasResearch) {
    tips.push('Use the existing validation evidence to prioritize spend.');
  }

  return [...new Set(tips)].slice(0, 3);
}

async function buildRoadmapWithAI(title, category, stage, description = '') {
  if (!zeroShotClassifier) {
    throw new Error('AI models not loaded');
  }

  const fullText = `${title}. ${category}. ${stage}. ${description}`;
  const seed = hashString(fullText);
  const signals = extractSignals(fullText);

  const motionResult = await zeroShotClassifier(fullText, [
    'validation-first roadmap',
    'build-first roadmap',
    'launch-first roadmap',
    'growth-first roadmap',
    'partnership-first roadmap'
  ]);

  const priorityResult = await zeroShotClassifier(fullText, [
    'customer discovery',
    'product build',
    'distribution and launch',
    'retention and optimization',
    'partnership and scale'
  ]);

  const motionLabel = motionResult.labels[0];
  const priorityLabel = priorityResult.labels[0];

  const phaseLibrary = [
    {
      phase: 'Phase 1: Shape the problem',
      duration: '1-2 weeks',
      tasks: [
        'Talk to target users and confirm the real pain point',
        'Turn the idea into one measurable problem statement',
        'Identify the first customer segment worth testing',
        'Capture competing alternatives and current workarounds'
      ]
    },
    {
      phase: 'Phase 2: Validate demand',
      duration: '2-4 weeks',
      tasks: [
        'Run landing-page or prototype tests to measure interest',
        'Collect early feedback from interviews, demos, or surveys',
        'Check whether users would pay or commit to a trial',
        'Refine the value proposition based on repeated reactions'
      ]
    },
    {
      phase: 'Phase 3: Build the core',
      duration: '3-6 weeks',
      tasks: [
        'Build the smallest version that proves the main workflow',
        'Instrument the product with analytics and feedback hooks',
        'Remove features that do not support the first use case',
        'Prepare the product for a small controlled release'
      ]
    },
    {
      phase: 'Phase 4: Launch and learn',
      duration: '2-4 weeks',
      tasks: [
        'Launch to early adopters and track conversion signals',
        'Monitor churn, usage, and support friction closely',
        'Iterate fast on messaging and onboarding',
        'Document the strongest acquisition channel discovered so far'
      ]
    },
    {
      phase: 'Phase 5: Scale what works',
      duration: 'ongoing',
      tasks: [
        'Double down on the best-performing channel or loop',
        'Automate repeatable workflows that no longer need manual effort',
        'Add the next feature only if it improves retention or revenue',
        'Strengthen partnerships, support, and operating discipline'
      ]
    }
  ];

  const adjustments = {
    'validation-first roadmap': ['shape the problem', 'validate demand', 'build the core'],
    'build-first roadmap': ['build the core', 'launch and learn'],
    'launch-first roadmap': ['validate demand', 'launch and learn'],
    'growth-first roadmap': ['launch and learn', 'scale what works'],
    'partnership-first roadmap': ['validate demand', 'scale what works']
  };

  const priorityTweaks = {
    'customer discovery': 'keep user conversations ahead of feature building',
    'product build': 'keep the product scope narrow and testable',
    'distribution and launch': 'keep the go-to-market motion concrete and measurable',
    'retention and optimization': 'keep iteration focused on usage and value realization',
    'partnership and scale': 'keep partnership work tied to distribution or trust'
  };

  const selectedPhases = phaseLibrary.slice(0, 3);
  if (stage === 'MVP / Prototype') {
    selectedPhases.splice(0, 1);
  } else if (stage === 'Early Traction') {
    selectedPhases.splice(0, 2);
  } else if (stage === 'Growth Stage') {
    selectedPhases.splice(0, 3);
    selectedPhases.push(phaseLibrary[4]);
  }

  const categoryTweaks = category.toLowerCase().includes('health')
    ? 'compliance and trust checks early'
    : category.toLowerCase().includes('education')
      ? 'content quality and user understanding early'
      : category.toLowerCase().includes('marketplace')
        ? 'supply-demand balance and trust early'
        : category.toLowerCase().includes('e-commerce')
          ? 'pricing and conversion early'
          : 'workflow clarity and user feedback early';

  const phases = selectedPhases.map((phase, index) => {
    const taskPool = [...phase.tasks];
    if (signals.hasResearch) taskPool[0] = `${taskPool[0]} (${priorityTweaks[priorityLabel] || 'use the insights from your existing research'})`;
    if (signals.hasRevenue && index >= 1) taskPool[2] = `${taskPool[2]} and test willingness to pay`;
    if (signals.hasCompetition) taskPool[3] = `${taskPool[3]} against the nearest alternatives`;
    if (signals.hasScale && index === selectedPhases.length - 1) taskPool[1] = `${taskPool[1]} with a path to repeatability`;

    return {
      phase: phase.phase,
      duration: phase.duration,
      tasks: taskPool.map((task, taskIndex) => {
        const extra = index === 0 && taskIndex === 0 ? ` Focus on ${categoryTweaks}.` : '';
        return `${task}${extra}`;
      })
    };
  });

  const motionInsight = motionLabel === 'validation-first roadmap'
    ? 'This idea should validate before it scales.'
    : motionLabel === 'build-first roadmap'
      ? 'This idea benefits from a tight build loop first.'
      : motionLabel === 'launch-first roadmap'
        ? 'This idea should test a launch earlier than usual.'
        : motionLabel === 'growth-first roadmap'
          ? 'This idea is ready to optimize after initial traction.'
          : 'This idea may benefit from distribution partners and trust signals.';

  return {
    phases,
    roadmapLens: pickFromList(seed, ['Validation-led', 'Build-led', 'Launch-led', 'Growth-led', 'Network-led']),
    aiSignals: {
      motion: motionLabel,
      priority: priorityLabel,
      confidence: parseFloat((((motionResult.scores[0] || 0) + (priorityResult.scores[0] || 0)) / 2).toFixed(2))
    },
    summary: motionInsight
  };
}

// Export all functions
module.exports = {
  initializeModels,
  analyzeIdeaWithAI,
  validateIdeaWithAI,
  generateBusinessModelWithAI,
  estimateCostWithAI,
  buildRoadmapWithAI,
  hashString,
  mixSeed,
  pickIndependent
};
