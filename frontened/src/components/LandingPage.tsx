import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, ShoppingBag, MessageSquare, Shield, Check, Star, ArrowRight, Zap, Award, Target, Menu, X, ChevronDown, Mail, Phone, MapPin, Send, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Fixed Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-lg py-3' : 'bg-transparent py-4'
        }`}
      >
        <nav className="container mx-auto px-6 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="text-3xl font-bold bg-linear-to-r from-[#0066cc] to-[#008b8b] bg-clip-text text-transparent">
              SL
            </div>
            <span className={`text-2xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              Startup LaunchPad
            </span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('features')}
              className={`font-semibold transition ${
                scrolled ? 'text-gray-700 hover:text-[#0066cc]' : 'text-white hover:text-blue-100'
              }`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`font-semibold transition ${
                scrolled ? 'text-gray-700 hover:text-[#0066cc]' : 'text-white hover:text-blue-100'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('roles')}
              className={`font-semibold transition ${
                scrolled ? 'text-gray-700 hover:text-[#0066cc]' : 'text-white hover:text-blue-100'
              }`}
            >
              Roles
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className={`px-6 py-2.5 rounded-lg font-semibold transition shadow-lg ${
                scrolled
                  ? 'bg-[#0066cc] text-white hover:bg-[#004080]'
                  : 'bg-white text-[#0066cc] hover:bg-gray-100'
              }`}
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden ${scrolled ? 'text-gray-900' : 'text-white'}`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white shadow-lg mt-2 rounded-b-lg"
          >
            <div className="px-6 py-4 space-y-4">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left font-semibold text-gray-700 hover:text-[#0066cc]"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="block w-full text-left font-semibold text-gray-700 hover:text-[#0066cc]"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('roles')}
                className="block w-full text-left font-semibold text-gray-700 hover:text-[#0066cc]"
              >
                Roles
              </button>
              <button
                onClick={onGetStarted}
                className="w-full bg-[#0066cc] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#004080]"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0066cc] via-[#0077dd] to-[#008b8b] overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-teal-400 rounded-full opacity-20 blur-3xl"
          />
        </div>

        <div className="container mx-auto px-6 pt-20 pb-32 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-8">
                Transform Ideas Into Reality
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight"
            >
              Unified Ecosystem for
              <br />
              <span className="text-white">
                Startup Success
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed"
            >
              Connect Entrepreneurs, Suppliers, and Investors in one powerful platform.
              AI-powered insights, verified marketplace, and real-time collaboration.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="bg-white text-[#0066cc] px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition shadow-2xl flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('how-it-works')}
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-white/20 transition border-2 border-white/30"
              >
                Learn More
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-blue-200 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">200+</div>
                <div className="text-blue-200 text-sm">Products Listed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">150+</div>
                <div className="text-blue-200 text-sm">Ideas Funded</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-white opacity-50" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20" id="features">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-center mb-4">Platform Features</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16">
            Everything you need to launch, grow, and scale your startup ecosystem
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Target className="w-12 h-12 text-[#0066cc]" />,
              title: "For Entrepreneurs",
              description: "Submit your ideas, get AI-powered feedback, and access a marketplace of products to bring your vision to life.",
              delay: 0.1
            },
            {
              icon: <ShoppingBag className="w-12 h-12 text-[#008b8b]" />,
              title: "For Suppliers",
              description: "List your products, manage orders, and connect with innovative entrepreneurs building the future.",
              delay: 0.2
            },
            {
              icon: <TrendingUp className="w-12 h-12 text-[#0066cc]" />,
              title: "For Investors",
              description: "Discover promising startups, provide feedback, and identify investment opportunities early.",
              delay: 0.3
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: feature.delay }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </motion.div>
          ))}
        </div>

        {/* Key Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid md:grid-cols-4 gap-6"
        >
          {[
            { icon: <Zap className="w-6 h-6" />, title: "AI-Powered Insights", color: "bg-blue-50 text-[#0066cc]" },
            { icon: <Shield className="w-6 h-6" />, title: "Verified Users", color: "bg-teal-50 text-[#008b8b]" },
            { icon: <MessageSquare className="w-6 h-6" />, title: "Real-time Chat", color: "bg-blue-50 text-[#0066cc]" },
            { icon: <Award className="w-6 h-6" />, title: "Trusted Platform", color: "bg-teal-50 text-[#008b8b]" },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
            >
              <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <h4 className="font-bold text-gray-900">{item.title}</h4>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="bg-[#e6f2ff] py-20" id="how-it-works">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-center mb-4">How It Works</h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16">
              Simple steps to get started and grow your business
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "1",
                title: "Choose Your Role",
                description: "Sign up as an Entrepreneur, Supplier, or Investor based on your goals.",
                delay: 0.1
              },
              {
                number: "2",
                title: "Engage & Collaborate",
                description: "Submit ideas, list products, or review startups using our intuitive dashboards.",
                delay: 0.2
              },
              {
                number: "3",
                title: "Grow Together",
                description: "Build connections through real-time chat and notifications to scale your success.",
                delay: 0.3
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: step.delay }}
              >
                <StepCard
                  number={step.number}
                  title={step.title}
                  description={step.description}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="container mx-auto px-6 py-20" id="roles">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-center mb-4">Join as...</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16">
            Choose the role that matches your goals and start your journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Target className="w-16 h-16 text-white" />,
              title: "Entrepreneur",
              features: ["Submit innovative ideas", "Get AI feedback", "Access marketplace", "Connect with investors"],
              gradient: "from-[#0066cc] to-[#0088dd]",
              delay: 0.1
            },
            {
              icon: <ShoppingBag className="w-16 h-16 text-white" />,
              title: "Supplier",
              features: ["List software products", "Manage orders", "Track analytics", "Grow customer base"],
              gradient: "from-[#008b8b] to-[#00a3a3]",
              delay: 0.2
            },
            {
              icon: <TrendingUp className="w-16 h-16 text-white" />,
              title: "Investor",
              features: ["Browse startup ideas", "Provide feedback", "Access documents", "Find opportunities"],
              gradient: "from-[#0066cc] to-[#008b8b]",
              delay: 0.3
            }
          ].map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: role.delay }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className={`bg-gradient-to-br ${role.gradient} p-8 text-center`}>
                <div className="bg-white/20 backdrop-blur-sm w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  {role.icon}
                </div>
                <h3 className="text-white font-bold text-2xl">{role.title}</h3>
              </div>
              <div className="p-8">
                <ul className="space-y-4">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-[#0066cc]" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onGetStarted}
                  className={`w-full mt-8 bg-gradient-to-r ${role.gradient} text-white py-3 rounded-lg font-semibold hover:shadow-lg transition`}
                >
                  Join as {role.title}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-white border-2 border-[#0066cc] rounded-xl p-12 text-center">
          <Shield className="w-16 h-16 text-[#0066cc] mx-auto mb-6" />
          <h3 className="mb-4">Academic-Grade, Trustworthy Platform</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built with security and transparency at its core. Our platform ensures
            verified users, secure transactions, and AI-driven insights you can trust.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#0066cc] to-[#008b8b] text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-6 text-white">Ready to Launch Your Journey?</h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join thousands of entrepreneurs, suppliers, and investors who are transforming ideas into successful businesses.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="bg-white text-[#0066cc] px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition shadow-2xl inline-flex items-center gap-2"
            >
              Create Your Account
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Newsletter Section */}
          <div className="border-b border-gray-700">
            <div className="container mx-auto px-6 py-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-2 !text-white">Stay Updated</h3>
                  <p className="!text-white">
                    Subscribe to our newsletter for the latest updates, tips, and success stories.
                  </p>
                </div>
                <div>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#0066cc] transition"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-4 bg-gradient-to-r from-[#0066cc] to-[#008b8b] rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2 text-white"
                    >
                      <Send className="w-5 h-5" />
                      Subscribe
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="container mx-auto px-6 py-12">
            <div className="grid md:grid-cols-12 gap-8 mb-12">
              {/* Brand Section - Wider */}
              <div className="md:col-span-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#0066cc] to-[#008b8b] text-white rounded-lg px-3 py-2">
                    SL
                  </div>
                  <span className="text-2xl font-bold !text-white">Startup LaunchPad</span>
                </div>
                <p className="!text-white mb-6 leading-relaxed">
                  The ultimate platform connecting entrepreneurs, suppliers, and investors. 
                  Transform your ideas into successful businesses with AI-powered insights.
                </p>
                
                {/* Social Media */}
                <div className="flex gap-3">
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    href="#"
                    className="w-10 h-10 bg-gray-800 hover:bg-[#0066cc] rounded-lg flex items-center justify-center transition"
                  >
                    <Facebook className="w-5 h-5 text-white" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    href="#"
                    className="w-10 h-10 bg-gray-800 hover:bg-[#0066cc] rounded-lg flex items-center justify-center transition"
                  >
                    <Twitter className="w-5 h-5 text-white" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    href="#"
                    className="w-10 h-10 bg-gray-800 hover:bg-[#008b8b] rounded-lg flex items-center justify-center transition"
                  >
                    <Linkedin className="w-5 h-5 text-white" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    href="#"
                    className="w-10 h-10 bg-gray-800 hover:bg-[#008b8b] rounded-lg flex items-center justify-center transition"
                  >
                    <Instagram className="w-5 h-5 text-white" />
                  </motion.a>
                </div>
              </div>

              {/* Platform */}
              <div className="md:col-span-2">
                <h4 className="font-bold mb-4 !text-white text-lg">Platform</h4>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => scrollToSection('features')}
                      className="!text-white hover:!text-[#0066cc] transition flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                      Features
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('how-it-works')}
                      className="!text-white hover:!text-[#0066cc] transition flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                      How It Works
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('roles')}
                      className="!text-white hover:!text-[#0066cc] transition flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                      Roles
                    </button>
                  </li>
                  <li>
                    <button className="!text-white hover:!text-[#0066cc] transition flex items-center gap-2 group">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                      Pricing
                    </button>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div className="md:col-span-2">
                <h4 className="font-bold mb-4 !text-white text-lg">Resources</h4>
                <ul className="space-y-3">
                  <li className="!text-white hover:!text-[#0066cc] transition cursor-pointer flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    Documentation
                  </li>
                  <li className="!text-white hover:!text-[#0066cc] transition cursor-pointer flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    Help Center
                  </li>
                  <li className="!text-white hover:!text-[#0066cc] transition cursor-pointer flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    API Reference
                  </li>
                  <li className="!text-white hover:!text-[#0066cc] transition cursor-pointer flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    Community
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div className="md:col-span-2">
                <h4 className="font-bold mb-4 !text-white text-lg">Company</h4>
                <ul className="space-y-3">
                  <li className="!text-white hover:!text-[#0066cc] transition cursor-pointer flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    About Us
                  </li>
                  <li className="!text-white hover:!text-[#0066cc] transition cursor-pointer flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    Careers
                  </li>
                  <li className="!text-white hover:!text-[#0066cc] transition cursor-pointer flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    Blog
                  </li>
                  <li className="!text-white hover:!text-[#0066cc] transition cursor-pointer flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    Contact
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div className="md:col-span-2">
                <h4 className="font-bold mb-4 !text-white text-lg">Legal</h4>
                <ul className="space-y-3">
                  <li className="!text-white hover:!text-[#0066cc] transition cursor-pointer flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    Privacy Policy
                  </li>
                  <li className="!text-white hover:!text-[#0066cc] transition cursor-pointer flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    Terms of Service
                  </li>
                  <li className="!text-white hover:!text-[#0066cc] transition cursor-pointer flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    Cookie Policy
                  </li>
                  <li className="!text-white hover:!text-[#0066cc] transition cursor-pointer flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    GDPR
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 pb-8 border-b border-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#0066cc]" />
                </div>
                <div>
                  <p className="font-semibold mb-1 !text-white">Email Us</p>
                  <a href="mailto:support@launchpad.com" className="!text-white hover:!text-[#0066cc] transition text-sm">
                    support@launchpad.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#008b8b]" />
                </div>
                <div>
                  <p className="font-semibold mb-1 !text-white">Call Us</p>
                  <a href="tel:+1234567890" className="!text-white hover:!text-[#008b8b] transition text-sm">
                    +1 (234) 567-890
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#0066cc]" />
                </div>
                <div>
                  <p className="font-semibold mb-1 !text-white">Visit Us</p>
                  <p className="!text-white text-sm">
                    123 Innovation Street, Tech City, TC 12345
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8">
              <p className="!text-white text-sm">
                &copy; 2026 LaunchPad. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <span className="!text-white text-sm flex items-center gap-2">
                  Made with <span className="text-red-500">❤️</span> for startups
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg transition">
    <div className="mb-4 flex justify-center">{icon}</div>
    <h3 className="mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }: { number: string; title: string; description: string }) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-[#0066cc] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
      {number}
    </div>
    <h4 className="mb-3">{title}</h4>
    <p className="text-gray-600">{description}</p>
  </div>
);