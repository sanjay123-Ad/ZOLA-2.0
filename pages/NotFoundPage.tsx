import React from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../constants/paths';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gradient-to-b from-sky-50 via-white to-sky-50 relative overflow-hidden">
    {/* Animated background blobs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-300/40 rounded-full blur-[120px] animate-blob mix-blend-multiply" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply" />
      <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-cyan-200/40 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply" />
    </div>

    {/* Main content */}
    <div className="relative z-10 max-w-2xl mx-auto">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-sky-200/40 p-8 sm:p-12 border border-sky-100">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl sm:text-9xl font-bold font-headline bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
            404
          </h1>
        </div>

        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-lg shadow-sky-200/50">
            <svg
              className="w-12 h-12 text-sky-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title and Description */}
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-headline mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for seems to have wandered off. Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={PATHS.HOME}
            className="px-8 py-4 bg-sky-500 text-white font-bold rounded-full shadow-xl shadow-sky-200/50 hover:bg-sky-600 hover:shadow-sky-300/50 hover:-translate-y-1 transition-all duration-300 flex items-center group"
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Back Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 bg-white border-2 border-sky-200 text-sky-700 font-bold rounded-full shadow-lg shadow-sky-100/50 hover:border-sky-400 hover:text-sky-900 hover:-translate-y-1 transition-all duration-300 flex items-center group"
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-sky-100">
          <p className="text-sm text-slate-500 mb-4 font-medium">Quick Links:</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { path: PATHS.HOME, label: 'Home' },
              { path: PATHS.GALLERY, label: 'Gallery' },
              { path: PATHS.PROFILE, label: 'Profile' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-2 text-sm font-semibold text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-full transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
