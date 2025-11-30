import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../constants/paths';

interface PricingPlan {
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  annualSavings: number;
  credits: number;
  features: string[];
  popular?: boolean;
  color: 'blue' | 'sky' | 'purple';
}

const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const navigate = useNavigate();

  const plans: PricingPlan[] = [
    {
      name: 'Basic',
      tagline: 'Perfect for getting started',
      monthlyPrice: 19,
      annualPrice: 190,
      annualSavings: 38,
      credits: 250,
      features: [
        '250 Credits / month',
        'Real-Time Generation',
        'Commercial License',
        'Remove Watermark',
        'Standard Support'
      ],
      color: 'blue'
    },
    {
      name: 'Pro',
      tagline: 'Accelerate growth & consistency',
      monthlyPrice: 49,
      annualPrice: 490,
      annualSavings: 98,
      credits: 750,
      features: [
        '750 Credits / month',
        'Access to All Tools',
        'Commercial License',
        'Remove Watermark',
        'High Pixel Quality',
        'Standard Support'
      ],
      popular: true,
      color: 'sky'
    },
    {
      name: 'Agency',
      tagline: 'Maximum power & scale',
      monthlyPrice: 99,
      annualPrice: 990,
      annualSavings: 198,
      credits: 1450,
      features: [
        '1,450 Credits / month',
        'API Access',
        'Commercial License',
        'Priority Support',
        'Early Access to New Models',
        'Remove Watermark',
        '4K Ultra-High Resolution'
      ],
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string, isPopular: boolean = false) => {
    const baseClasses = isPopular 
      ? 'border-2 border-sky-500 shadow-xl shadow-sky-200/50' 
      : 'border border-gray-200 dark:border-gray-700';
    
    switch (color) {
      case 'blue':
        return {
          card: `${baseClasses} bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20`,
          badge: 'bg-blue-500 text-white',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          checkmark: 'text-blue-600 dark:text-blue-400',
          price: 'text-blue-600 dark:text-blue-400'
        };
      case 'sky':
        return {
          card: `${baseClasses} bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20`,
          badge: 'bg-sky-500 text-white',
          button: 'bg-sky-600 hover:bg-sky-700 text-white',
          checkmark: 'text-sky-600 dark:text-sky-400',
          price: 'text-sky-600 dark:text-sky-400'
        };
      case 'purple':
        return {
          card: `${baseClasses} bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20`,
          badge: 'bg-purple-500 text-white',
          button: 'bg-purple-600 hover:bg-purple-700 text-white',
          checkmark: 'text-purple-600 dark:text-purple-400',
          price: 'text-purple-600 dark:text-purple-400'
        };
      default:
        return {
          card: baseClasses,
          badge: 'bg-gray-500 text-white',
          button: 'bg-gray-600 hover:bg-gray-700 text-white',
          checkmark: 'text-gray-600 dark:text-gray-400',
          price: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-200">
      {/* Hero Section - Ready to Revolutionize */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full text-sm font-semibold animate-fade-in">
              🚀 Transform Your Workflow
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-sky-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
            Ready to Revolutionize
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto animate-fade-in delay-200">
            Your Fashion E-commerce Workflow?
          </p>
          
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8 animate-fade-in delay-300">
            Choose the perfect plan for your business. Start creating professional AI-generated assets in minutes, not weeks.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-12 animate-fade-in delay-400">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
                isAnnual ? 'bg-sky-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              role="switch"
              aria-checked={isAnnual}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  isAnnual ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
                <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  Annual <span className={`text-sky-600 dark:text-sky-400 font-bold transition-all duration-300 ${isAnnual ? 'glow-effect' : ''}`}>(2 months free)</span>
                </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {plans.map((plan, index) => {
              const colors = getColorClasses(plan.color, plan.popular);
              const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const period = isAnnual ? '/year' : '/month';
              const savings = isAnnual ? `Save $${plan.annualSavings} / year` : null;

              return (
                <div
                  key={plan.name}
                  className={`relative ${colors.card} rounded-2xl p-8 transition-all duration-500 ${
                    hoveredCard === index ? 'scale-105 -translate-y-2' : 'scale-100'
                  } ${plan.popular ? 'md:-mt-4 md:mb-4' : ''} animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className={`${colors.badge} px-4 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce`}>
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {plan.tagline}
                    </p>
                    
                    {/* Price */}
                    <div className="mb-2">
                      <span className={`text-4xl font-extrabold ${colors.price}`}>
                        ${price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 text-lg">
                        {period}
                      </span>
                    </div>
                    
                    {savings && (
                      <p className="text-sm text-sky-600 dark:text-sky-400 font-semibold">
                        {savings}
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4 mb-8 min-h-[400px]">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-3 animate-fade-in"
                        style={{ animationDelay: `${(index * 100) + (featureIndex * 50)}ms` }}
                      >
                        <svg
                          className={`flex-shrink-0 w-5 h-5 mt-0.5 ${colors.checkmark}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => navigate(PATHS.AUTH)}
                    className={`w-full ${colors.button} py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95`}
                  >
                    Get Started
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ or Additional Info Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            All Plans Include
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
              <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">All 5 Core Features</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Virtual Photoshoot, Asset Generator, Catalog Forged, Style|Scene, AI Stylist</p>
            </div>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Commercial License</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Use all generated assets for commercial purposes</p>
            </div>
            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cloud Storage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Secure cloud storage for all your generated assets</p>
            </div>
          </div>
        </div>
      </section>

      {/* Add custom animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .glow-effect {
          animation: glow-pulse 2s ease-in-out infinite;
          text-shadow: 0 0 10px rgba(14, 165, 233, 0.5),
                       0 0 20px rgba(14, 165, 233, 0.4),
                       0 0 30px rgba(14, 165, 233, 0.3),
                       0 0 40px rgba(14, 165, 233, 0.2);
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            text-shadow: 0 0 10px rgba(14, 165, 233, 0.5),
                         0 0 20px rgba(14, 165, 233, 0.4),
                         0 0 30px rgba(14, 165, 233, 0.3),
                         0 0 40px rgba(14, 165, 233, 0.2);
            transform: scale(1);
          }
          50% {
            text-shadow: 0 0 20px rgba(14, 165, 233, 0.8),
                         0 0 30px rgba(14, 165, 233, 0.6),
                         0 0 40px rgba(14, 165, 233, 0.5),
                         0 0 50px rgba(14, 165, 233, 0.4),
                         0 0 60px rgba(14, 165, 233, 0.3);
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};

export default PricingPage;

