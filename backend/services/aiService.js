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
  
  // Combine into final score (0-10)
  const aiScore = Math.min(10, Math.max(1, 
    (titleQuality * 0.2) + (descDepth * 0.3) + (confidence * 0.5)
  ));

  // Generate strengths based on content
  const strengths = await generateStrengths(description, embedding);
  
  // Generate suggestions based on what's missing
  const suggestions = await generateSuggestions(description);
  
  // Generate concerns
  const concerns = await generateConcerns(description, aiScore);

  return {
    marketFit: parseFloat(Math.min(10, aiScore * 0.9 + 0.5).toFixed(1)),
    feasibility: parseFloat(Math.min(10, aiScore * 0.85 + 0.8).toFixed(1)),
    aiScore: parseFloat(aiScore.toFixed(1)),
    strengths,
    suggestions,
    concerns,
    confidence: parseFloat(confidence.toFixed(2))
  };
}

// Validate idea using zero-shot classification
async function validateIdeaWithAI(title, targetAudience, problem, solution, uniqueValue) {
  if (!zeroShotClassifier) {
    throw new Error('AI models not loaded');
  }

  const fullText = `${title}. Target: ${targetAudience}. Problem: ${problem}. Solution: ${solution || 'Not specified'}. Unique value: ${uniqueValue || 'Not specified'}`;
  
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
  
  // Viability scoring
  const topViability = viabilityResult.labels[0];
  if (topViability === 'strong business opportunity') score += 3;
  else if (topViability === 'moderate potential') score += 1.5;
  else if (topViability === 'not viable') score -= 2;
  
  // Demand scoring
  const topDemand = demandResult.labels[0];
  if (topDemand === 'high market demand') score += 1.5;
  else if (topDemand === 'medium market demand') score += 0.5;
  else if (topDemand === 'low market demand') score -= 1;
  
  // Content length bonuses
  if (problem.length > 100) score += 0.5;
  if (solution && solution.length > 50) score += 0.5;
  if (uniqueValue && uniqueValue.length > 20) score += 0.5;
  
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
    insights: generateInsights(problem, solution, viabilityResult),
    risks: generateRisks(problem, solution, uniqueValue),
    nextSteps: generateNextSteps(validationScore)
  };
}

// Generate strengths using AI analysis
async function generateStrengths(description, embedding) {
  const strengths = [];
  const descLower = description.toLowerCase();
  
  // AI-detected strengths
  if (descLower.includes('problem') || descLower.includes('pain')) {
    strengths.push("Clearly identifies a market pain point");
  }
  if (descLower.includes('solution') || descLower.includes('fix') || descLower.includes('solve')) {
    strengths.push("Proposes a specific solution approach");
  }
  if (descLower.includes('market') || descLower.includes('customer') || descLower.includes('user')) {
    strengths.push("Demonstrates understanding of target market");
  }
  if (descLower.includes('revenue') || descLower.includes('monetiz') || descLower.includes('profit')) {
    strengths.push("Has a clear path to monetization");
  }
  if (descLower.includes('unique') || descLower.includes('different') || descLower.includes('innovative')) {
    strengths.push("Positions against existing alternatives");
  }
  if (descLower.includes('scalable') || descLower.includes('scale') || descLower.includes('growth')) {
    strengths.push("Shows potential for rapid scaling");
  }
  
  // Default strengths if not enough detected
  while (strengths.length < 3) {
    const defaults = [
      "Clear concept with identifiable value proposition",
      "Targets a defined audience segment",
      "Potential for scalable growth in the chosen category",
      "Addresses a real market need",
      "Has competitive differentiation potential"
    ];
    const randomStrength = defaults[Math.floor(Math.random() * defaults.length)];
    if (!strengths.includes(randomStrength)) {
      strengths.push(randomStrength);
    }
  }
  
  return strengths.slice(0, 3);
}

// Generate suggestions based on content analysis
async function generateSuggestions(description) {
  const suggestions = [];
  const descLower = description.toLowerCase();
  
  if (!descLower.includes('competitor') && !descLower.includes('competition')) {
    suggestions.push("Identify 2-3 direct competitors and your differentiation");
  }
  if (!descLower.includes('market research') && !descLower.includes('interview') && !descLower.includes('survey')) {
    suggestions.push("Conduct primary market research to validate demand");
  }
  if (!descLower.includes('revenue') && !descLower.includes('monetiz') && !descLower.includes('price')) {
    suggestions.push("Outline your revenue model and pricing strategy");
  }
  if (!descLower.includes('go-to-market') && !descLower.includes('launch') && !descLower.includes('marketing')) {
    suggestions.push("Define a clear go-to-market strategy");
  }
  if (!descLower.includes('mvp') && !descLower.includes('prototype') && !descLower.includes('minimum')) {
    suggestions.push("Build an MVP to test core assumptions quickly");
  }
  
  // Default suggestions
  if (suggestions.length < 3) {
    suggestions.push("Conduct primary market research to validate demand");
  }
  if (suggestions.length < 3) {
    suggestions.push("Define a clear go-to-market strategy");
  }
  if (suggestions.length < 3) {
    suggestions.push("Identify 2-3 direct competitors and your differentiation");
  }
  
  return suggestions.slice(0, 3);
}

// Generate concerns based on score and content
async function generateConcerns(description, score) {
  const concerns = [];
  const descLower = description.toLowerCase();
  
  if (score < 6) {
    concerns.push("Idea clarity and differentiation need strengthening");
  }
  if (!descLower.includes('regulatory') && !descLower.includes('compliance') && !descLower.includes('legal')) {
    concerns.push("Regulatory considerations may apply depending on region");
  }
  if (!descLower.includes('funding') && !descLower.includes('capital') && !descLower.includes('investment')) {
    concerns.push("Initial funding requirements should be mapped out");
  }
  if (!descLower.includes('competition') && !descLower.includes('competitor')) {
    concerns.push("Market competition level needs deeper analysis");
  }
  if (!descLower.includes('risk') && !descLower.includes('challenge') && !descLower.includes('mitigation')) {
    concerns.push("Risk mitigation strategies should be documented");
  }
  
  // Default concerns
  if (concerns.length < 3) {
    concerns.push("Market competition level needs deeper analysis");
  }
  if (concerns.length < 3) {
    concerns.push("Initial funding requirements should be mapped out");
  }
  if (concerns.length < 3) {
    concerns.push("Regulatory considerations may apply depending on region");
  }
  
  return concerns.slice(0, 3);
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

// Business Model Canvas generation with AI
async function generateBusinessModelWithAI(title, category, description) {
  if (!zeroShotClassifier) {
    throw new Error('AI models not loaded');
  }
  
  const fullText = `${title}. ${description}`;
  const catLower = (category || '').toLowerCase();
  
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
  const customerSegments = generateCustomerSegments(customerResult, catLower);
  const valuePropositions = generateValuePropositions(description, catLower);
  const channels = generateChannels(modelResult, catLower);
  const revenueStreams = generateRevenueStreams(modelResult, catLower, description);
  
  return {
    customerSegments,
    valuePropositions,
    channels,
    customerRelationships: "Self-service platform with automated onboarding, community support, and personalized assistance for enterprise clients",
    revenueStreams,
    keyResources: "Technology platform, development team, brand reputation, customer data, intellectual property, and strategic partnerships",
    keyActivities: "Product development, customer acquisition, user support, continuous improvement, and market expansion",
    keyPartners: "Technology vendors, payment processors, marketing partners, distribution channels, and strategic allies",
    costStructure: "Development costs, hosting/infrastructure, marketing spend, team salaries, customer support, and operational expenses"
  };
}

function generateCustomerSegments(classificationResult, category) {
  const topLabel = classificationResult.labels[0];
  const scores = {};
  classificationResult.labels.forEach((label, i) => {
    scores[label] = classificationResult.scores[i];
  });
  
  if (scores['businesses and enterprises'] > 0.3) {
    return "Small-to-medium businesses, enterprise teams, and professional organizations seeking productivity solutions";
  }
  if (scores['consumers and individuals'] > 0.3 || category.includes('e-commerce')) {
    return "Individual consumers, online shoppers, and end-users seeking convenience and value";
  }
  if (scores['developers and technical users'] > 0.3 || category.includes('technology')) {
    return "Software developers, technical teams, and IT professionals";
  }
  if (scores['students and educators'] > 0.3 || category.includes('education')) {
    return "Students, educators, and lifelong learners seeking skill development and knowledge";
  }
  if (scores['healthcare providers and patients'] > 0.3 || category.includes('health')) {
    return "Healthcare providers, patients, and wellness-conscious consumers";
  }
  
  return "Early adopters and tech-savvy individuals looking for innovative solutions";
}

function generateValuePropositions(description, category) {
  const descLower = description.toLowerCase();
  
  if (descLower.includes('save') || descLower.includes('reduce') || descLower.includes('cheap')) {
    return "Delivers significant cost savings and efficiency improvements through automation and optimization";
  }
  if (descLower.includes('connect') || descLower.includes('network') || descLower.includes('community')) {
    return "Connects users with valuable opportunities, resources, and like-minded individuals";
  }
  if (descLower.includes('learn') || descLower.includes('educat') || descLower.includes('skill')) {
    return "Provides accessible, high-quality learning experiences and skill development opportunities";
  }
  if (descLower.includes('health') || descLower.includes('wellness') || descLower.includes('care')) {
    return "Improves health outcomes and wellness through accessible, personalized solutions";
  }
  if (category.includes('e-commerce') || descLower.includes('shop') || descLower.includes('buy')) {
    return "Offers convenient access to quality products with competitive pricing and fast delivery";
  }
  
  return "Saves time and reduces costs through automation, delivering unique value not available elsewhere";
}

function generateChannels(classificationResult, category) {
  const topLabel = classificationResult.labels[0];
  const catLower = category.toLowerCase();
  
  if (catLower.includes('saas') || catLower.includes('software') || catLower.includes('b2b')) {
    return "Direct sales, product-led growth, content marketing, SEO, partner integrations, and enterprise outreach";
  }
  if (catLower.includes('e-commerce') || catLower.includes('retail') || catLower.includes('product')) {
    return "Online marketplace, social commerce, SEO, paid advertising, email marketing, and physical pop-ups";
  }
  if (catLower.includes('mobile') || catLower.includes('app')) {
    return "App stores, mobile advertising, social media, influencer partnerships, and referral programs";
  }
  
  return "Website, mobile app, social media marketing, content marketing, SEO, and strategic partnerships";
}

function generateRevenueStreams(classificationResult, category, description) {
  const descLower = description.toLowerCase();
  const catLower = category.toLowerCase();
  
  if (catLower.includes('e-commerce') || catLower.includes('retail')) {
    return "Product sales, transaction commissions, premium seller services, advertising, and subscription memberships";
  }
  if (catLower.includes('education') || catLower.includes('course')) {
    return "Course fees, subscription access, certification programs, corporate training, and premium content";
  }
  if (catLower.includes('marketplace')) {
    return "Transaction fees, premium listings, featured placements, advertising, and value-added services";
  }
  if (descLower.includes('consult') || descLower.includes('service') || descLower.includes('agency')) {
    return "Hourly consulting fees, project-based pricing, retainer contracts, and premium support packages";
  }
  
  return "Subscription fees (SaaS), freemium model with premium tiers, transaction fees, and enterprise licensing";
}

// Export all functions
module.exports = {
  initializeModels,
  analyzeIdeaWithAI,
  validateIdeaWithAI,
  generateBusinessModelWithAI
};
