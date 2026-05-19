const express = require("express");
const router = express.Router();

// Static mentors data (no DB needed — admin-curated list)
const mentors = [
  { id: "m1", name: "Sarah Chen", expertise: "Product Strategy", industry: "Technology", experience: "12 years", bio: "Former VP Product at two successful SaaS startups. Helped 30+ founders go from idea to Series A.", availability: "Weekends", rating: 4.9, sessions: 120, image: "" },
  { id: "m2", name: "James Okafor", expertise: "Fundraising & VC", industry: "Finance", experience: "15 years", bio: "Ex-partner at a top VC firm. Raised $50M+ across portfolio companies. Expert in pitch decks.", availability: "Weekdays", rating: 4.8, sessions: 95, image: "" },
  { id: "m3", name: "Priya Sharma", expertise: "Marketing & Growth", industry: "E-commerce", experience: "10 years", bio: "Built marketing engines for D2C brands. Specialist in 0-to-1 customer acquisition strategies.", availability: "Flexible", rating: 4.7, sessions: 80, image: "" },
  { id: "m4", name: "Marcus Webb", expertise: "Operations & Scaling", industry: "Logistics", experience: "18 years", bio: "COO experience at 3 companies. Expert in building repeatable processes and scaling teams.", availability: "Weekdays", rating: 4.9, sessions: 140, image: "" },
  { id: "m5", name: "Aisha Patel", expertise: "Legal & Compliance", industry: "Healthcare", experience: "14 years", bio: "Startup lawyer specializing in IP, incorporation, and regulatory compliance for early-stage startups.", availability: "Weekends", rating: 4.6, sessions: 65, image: "" },
  { id: "m6", name: "David Kim", expertise: "Tech Architecture", industry: "Technology", experience: "11 years", bio: "CTO turned mentor. Helps founders make smart technical decisions without over-engineering.", availability: "Flexible", rating: 4.8, sessions: 88, image: "" },
];

// Static webinars data
const webinars = [
  { id: "w1", title: "From Idea to MVP in 30 Days", instructor: "Sarah Chen", category: "Product", duration: "90 min", level: "Beginner", enrolled: 1240, rating: 4.8, description: "A step-by-step guide to building your first MVP without wasting time or money.", tags: ["MVP", "Product", "Lean Startup"], upcoming: false, recordingUrl: "#" },
  { id: "w2", title: "Pitching to Investors: What VCs Actually Want", instructor: "James Okafor", category: "Fundraising", duration: "75 min", level: "Intermediate", enrolled: 980, rating: 4.9, description: "Inside look at what investors evaluate. Learn to craft a compelling narrative and financials.", tags: ["Pitch", "Fundraising", "VC"], upcoming: true, date: "2026-06-05", recordingUrl: "" },
  { id: "w3", title: "Zero to 1000 Customers: Growth Playbook", instructor: "Priya Sharma", category: "Marketing", duration: "60 min", level: "Beginner", enrolled: 1560, rating: 4.7, description: "Proven tactics to acquire your first 1000 customers with limited budget.", tags: ["Growth", "Marketing", "Customer Acquisition"], upcoming: false, recordingUrl: "#" },
  { id: "w4", title: "Legal Essentials for Startups", instructor: "Aisha Patel", category: "Legal", duration: "45 min", level: "Beginner", enrolled: 720, rating: 4.6, description: "Everything founders need to know: incorporation, equity, IP protection, contracts.", tags: ["Legal", "Compliance", "Equity"], upcoming: false, recordingUrl: "#" },
  { id: "w5", title: "Building a Scalable Tech Stack", instructor: "David Kim", category: "Technology", duration: "80 min", level: "Intermediate", enrolled: 850, rating: 4.8, description: "Avoid expensive tech mistakes. Learn how to choose the right tools for each growth stage.", tags: ["Tech", "Architecture", "Scaling"], upcoming: true, date: "2026-06-12", recordingUrl: "" },
  { id: "w6", title: "Hiring Your First 10 Employees", instructor: "Marcus Webb", category: "Operations", duration: "55 min", level: "Intermediate", enrolled: 640, rating: 4.7, description: "Build a strong foundation with the right early hires. Culture, equity, and compensation guide.", tags: ["Hiring", "Team", "Operations"], upcoming: false, recordingUrl: "#" },
  { id: "w7", title: "Financial Modeling for Non-Finance Founders", instructor: "James Okafor", category: "Finance", duration: "70 min", level: "Beginner", enrolled: 1100, rating: 4.8, description: "Build a financial model from scratch. Revenue projections, burn rate, runway explained simply.", tags: ["Finance", "Modeling", "Runway"], upcoming: false, recordingUrl: "#" },
  { id: "w8", title: "Product-Market Fit: How to Know When You Have It", instructor: "Sarah Chen", category: "Product", duration: "65 min", level: "Intermediate", enrolled: 1380, rating: 4.9, description: "Signs of PMF, how to measure it, and what to do once you find it.", tags: ["PMF", "Product", "Metrics"], upcoming: true, date: "2026-06-20", recordingUrl: "" },
];

// Static resources/guides data
const resources = [
  { id: "r1", title: "The Lean Startup Methodology", type: "Guide", category: "Strategy", description: "A comprehensive guide to the Build-Measure-Learn loop and how to apply it to your startup.", readTime: "15 min", downloadUrl: "#", tags: ["Lean", "MVP", "Methodology"] },
  { id: "r2", title: "Business Model Canvas Template", type: "Template", category: "Planning", description: "The classic 9-block Business Model Canvas in editable format. Fill in as you plan.", readTime: "5 min", downloadUrl: "#", tags: ["Business Model", "Template", "Canvas"] },
  { id: "r3", title: "Startup Financial Projections Template", type: "Template", category: "Finance", description: "Excel/Google Sheets template for 3-year financial projections including revenue, costs, and runway.", readTime: "10 min", downloadUrl: "#", tags: ["Finance", "Template", "Projections"] },
  { id: "r4", title: "How Airbnb Found Product-Market Fit", type: "Case Study", category: "Product", description: "Deep-dive case study on how Airbnb iterated from a failing idea to billion-dollar PMF.", readTime: "20 min", downloadUrl: "#", tags: ["Case Study", "PMF", "Airbnb"] },
  { id: "r5", title: "Cold Email Templates for B2B Sales", type: "Template", category: "Sales", description: "10 proven cold email templates with subject lines and follow-up sequences.", readTime: "8 min", downloadUrl: "#", tags: ["Sales", "Email", "B2B"] },
  { id: "r6", title: "Investor Pitch Deck Template", type: "Template", category: "Fundraising", description: "12-slide pitch deck structure used by successful startups. Includes design guidance.", readTime: "12 min", downloadUrl: "#", tags: ["Pitch", "Fundraising", "Template"] },
  { id: "r7", title: "Dropbox's Growth Hacking Story", type: "Case Study", category: "Growth", description: "How Dropbox grew from 100K to 4M users in 15 months using referral loops.", readTime: "18 min", downloadUrl: "#", tags: ["Case Study", "Growth", "Referral"] },
  { id: "r8", title: "Startup Legal Checklist", type: "Guide", category: "Legal", description: "Step-by-step checklist covering incorporation, IP, employment agreements, and investor docs.", readTime: "10 min", downloadUrl: "#", tags: ["Legal", "Checklist", "Compliance"] },
  { id: "r9", title: "OKR Framework for Startups", type: "Guide", category: "Operations", description: "How to set Objectives and Key Results to align your team and track progress effectively.", readTime: "12 min", downloadUrl: "#", tags: ["OKR", "Goals", "Operations"] },
  { id: "r10", title: "Customer Interview Script", type: "Template", category: "Research", description: "A structured script for running customer discovery interviews. Includes question bank.", readTime: "7 min", downloadUrl: "#", tags: ["Research", "Customer", "Interviews"] },
];

// GET /api/resources/mentors
router.get("/mentors", (req, res) => {
  res.json(mentors);
});

// GET /api/resources/webinars
router.get("/webinars", (req, res) => {
  res.json(webinars);
});

// GET /api/resources/library
router.get("/library", (req, res) => {
  res.json(resources);
});

module.exports = router;
