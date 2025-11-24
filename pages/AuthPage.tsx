import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { GoogleIcon } from '../components/icons';
import { PATHS } from '../constants/paths';

type AuthView = 'login' | 'register' | 'forgot_password' | 'check_email' | 'signup_success';

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) return { valid: false, message: 'Password must contain at least one special character' };
  return { valid: true, message: '' };
};

const AVATARS = [
  { id: 1, src: 'https://i.postimg.cc/Z54WSJPG/2.avif', x: 10, y: 20 },
  { id: 2, src: 'https://i.postimg.cc/vZYZK3bb/Garment-1-front-mannequin-(2).png', x: 85, y: 15 },
  { id: 3, src: 'https://i.postimg.cc/sgHsNzT1/Dress.png', x: 5, y: 60 },
  { id: 4, src: 'https://i.postimg.cc/fyC6S7FN/F2.jpg', x: 90, y: 55 },
  { id: 5, src: 'https://i.postimg.cc/Z54WSJPG/2.avif', x: 15, y: 85 },
  { id: 6, src: 'https://i.postimg.cc/sgHsNzT1/Dress.png', x: 80, y: 80 },
] as const;

const FEATURES = [
  {
    id: 'style-swap',
    topCard: {
      title: 'Traditional Method (Old)',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80',
      tagText: 'Complex prompts, inconsistent results',
    },
    mainCard: {
      title: 'UCG Method (New)',
      image: 'https://i.postimg.cc/KcDsVhhQ/women-image-1.png',
      tagLine: 'Instant, perfect fit, one-click swap!',
    },
    headline: 'INSTANT STYLE SWAP',
    subhead: 'Just perfect fit, one-click swap!',
  },
  {
    id: 'digital-ironing',
    topCard: {
      title: 'Wrinkled Fabric (Old)',
      image: 'https://i.postimg.cc/1XcQ6r0p/not-ironed.png',
      tagText: 'Messy textures, ruined photos',
    },
    mainCard: {
      title: 'Digital Ironing (New)',
      image: 'https://i.postimg.cc/W4FcSv6t/ironed.png',
      tagLine: 'Perfectly smooth, iron-free results!',
    },
    headline: 'DIGITAL IRONING',
    subhead: 'Remove wrinkles instantly with AI!',
  },
] as const;

type IconProps = React.SVGProps<SVGSVGElement>;

const IconMail = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

const IconCheck = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const IconX = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconUpload = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 17v3h16v-3" />
    <path d="M12 3v12" />
    <path d="M8 7l4-4 4 4" />
  </svg>
);

const IconZap = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const IconUser = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 21v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconEye = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.77 21.77 0 014.23-5.52m3.11-2A10.94 10.94 0 0112 4c7 0 11 8 11 8a21.57 21.57 0 01-3.17 4.74" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconAlertCircle = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12" y2="16" />
  </svg>
);

const BackgroundNetwork: React.FC = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50">
    <svg className="absolute inset-0 w-full h-full opacity-25">
      <defs>
        <pattern id="dot-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" className="text-gray-300 fill-current" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" />
      <path d="M100 200 Q 400 100 800 200 T 1400 300" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="8 8" className="animate-pulse" />
      <path d="M50 600 Q 300 500 600 700 T 1200 600" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="8 8" className="animate-pulse" />
      <path d="M1200 100 Q 1000 400 1300 700" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="8 8" />
    </svg>
    {AVATARS.map((avatar, index) => (
      <div
        key={avatar.id}
        className={`absolute rounded-full p-1 bg-white shadow-lg animate-float${index % 2 === 0 ? '' : '-delayed'}`}
        style={{ top: `${avatar.y}%`, left: `${avatar.x}%` }}
      >
        <img src={avatar.src} alt="Fashion avatar" className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-white" />
      </div>
    ))}
  </div>
);

interface SocialButtonProps {
  icon?: React.ReactNode;
  text: string;
  onClick?: () => void;
  variant?: 'default' | 'google';
  userAvatar?: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon, text, onClick, variant = 'default', userAvatar }) => {
  if (variant === 'google') {
    return (
      <button
        onClick={onClick}
        className="w-full group flex items-center justify-between p-2.5 pr-4 bg-white border border-gray-200 rounded-full hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <img src={userAvatar || 'https://picsum.photos/id/64/100/100'} alt="User" className="w-10 h-10 rounded-full object-cover" />
          <div className="text-left leading-tight">
            <span className="text-xs font-medium text-gray-500 block">Continue as stylist</span>
            <span className="text-sm font-semibold text-gray-900">{text}</span>
          </div>
        </div>
        <GoogleIcon />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all text-sm font-semibold text-gray-700"
    >
      {icon}
      <span>{text}</span>
    </button>
  );
};

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrengthError, setPasswordStrengthError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setRedirectUrl(window.location.origin);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % FEATURES.length);
      setAnimKey((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkEmailExists = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck.trim() || !isValidEmail(emailToCheck)) {
      setEmailExists(false);
      setEmailError('');
      return;
    }
    setCheckingEmail(true);
    try {
      const { data, error } = await supabase.rpc('email_exists', {
        email_to_check: emailToCheck.toLowerCase().trim(),
      });
      if (error) {
        setEmailExists(false);
        setEmailError('');
      } else if (data === true) {
        setEmailExists(true);
        setEmailError('User account already exists. Please try with a new account or login instead.');
      } else {
        setEmailExists(false);
        setEmailError('');
      }
    } catch (err) {
      console.error('Exception checking email existence:', err);
      setEmailExists(false);
      setEmailError('');
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  useEffect(() => {
    if (view !== 'register') {
      setEmailExists(false);
      setEmailError('');
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setEmailExists(false);
      setEmailError('');
      return;
    }
    const timeoutId = setTimeout(() => checkEmailExists(email), 800);
    return () => clearTimeout(timeoutId);
  }, [email, view, checkEmailExists]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordStrengthError('');
    setLoading(true);

    if (view === 'login') {
      if (!email.trim() || !password.trim()) {
        setError('Email and password cannot be empty.');
        setLoading(false);
        return;
      }
      if (!isValidEmail(email)) {
        setEmailError('Please enter a valid email address.');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else if (view === 'register') {
      if (!username.trim() || !email.trim() || !password.trim()) {
        setError('Username, email, and password cannot be empty.');
        setLoading(false);
        return;
      }
      if (!isValidEmail(email)) {
        setEmailError('Please enter a valid email address.');
        setLoading(false);
        return;
      }
      if (emailExists) {
        setError('User account already exists. Please try with a new account or login instead.');
        setLoading(false);
        return;
      }
      const passwordCheck = isStrongPassword(password);
      if (!passwordCheck.valid) {
        setPasswordStrengthError(passwordCheck.message);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) {
        if (error.message.toLowerCase().includes('already')) {
          setError('User account already exists. Please try with a new account or login instead.');
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }
      if (!data.user || data.session) {
        setError('User account already exists. Please try with a new account or login instead.');
        setLoading(false);
        return;
      }
      setView('signup_success');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${PATHS.RESET_PASSWORD}`,
    });
    if (error) {
      setError(error.message);
    } else {
      setView('check_email');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
    if (error) setError(`Google sign-in error: ${error.message}`);
  };

  const renderStatusView = () => {
    if (view === 'forgot_password') {
      return (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-500 mb-6 text-sm">Enter your email to receive a reset link.</p>
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-rose-600 text-white py-3 rounded-full font-semibold shadow-lg hover:bg-rose-700 transition-all">
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-6 text-center">
            Remembered it?{' '}
            <button onClick={() => setView('login')} className="text-rose-600 font-semibold hover:underline">
              Back to login
            </button>
          </p>
        </div>
      );
    }

    const copy = view === 'signup_success'
      ? {
          title: 'Please check your email',
          body: `We have sent a confirmation link to ${email || 'your inbox'}. Click the link to activate your account.`,
          action: 'Back to Login',
        }
      : {
          title: 'Check your email',
          body: `A password reset link has been sent to ${email || 'your inbox'} if an account exists.`,
          action: 'Return to Login',
        };

    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
          <IconCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{copy.title}</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">{copy.body}</p>
        <button onClick={() => setView('login')} className="w-full bg-slate-900 text-white py-3 rounded-full font-semibold shadow-lg">
          {copy.action}
        </button>
      </div>
    );
  };

  const renderPrimaryView = () => (
    <div className="animate-fade-in">
      {view === 'login' ? (
        <>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Welcome to ZOLA AI</h1>
          <p className="text-gray-500 mb-6 text-sm">Use your email or another service to continue with ZOLA AI for FREE</p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h1>
          <p className="text-gray-500 mb-6 text-sm">Get started with 10 free generations.</p>
        </>
      )}

      <div className="bg-white/80 rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {view === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. fashion_house"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                  setEmailExists(false);
                }}
                onBlur={() => {
                  if (view === 'register' && email.trim() && isValidEmail(email)) checkEmailExists(email);
                }}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-xl border ${
                  emailError ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50/60'
                } focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none text-sm`}
                required
              />
              {checkingEmail && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-200 border-t-rose-500 rounded-full animate-spin" />}
            </div>
            {emailError && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><IconAlertCircle className="w-3 h-3" /> {emailError}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordStrengthError('');
                }}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-10 rounded-xl border ${
                  passwordStrengthError ? 'border-red-300 bg-red-50/40' : 'border-gray-200 bg-gray-50/60'
                } focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none text-sm`}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-gray-400 hover:text-gray-600">
                {showPassword ? <IconEyeOff className="w-4.5 h-4.5" /> : <IconEye className="w-4.5 h-4.5" />}
              </button>
            </div>
            {view === 'register' && (
              <div className="mt-3 text-xs bg-white border border-gray-100 rounded-xl p-3 text-gray-600">
                <p className="font-semibold mb-1">Password must contain:</p>
                <ul className="space-y-1 text-green-600">
                  <li className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> At least 8 characters</li>
                  <li className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> One uppercase letter</li>
                  <li className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> One lowercase letter</li>
                  <li className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> One number</li>
                  <li className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> One special character</li>
                </ul>
                {passwordStrengthError && <p className="text-red-500 mt-2">{passwordStrengthError}</p>}
              </div>
            )}
          </div>

          {view === 'login' && (
            <div className="text-right text-xs font-semibold text-gray-500">
              <button type="button" onClick={() => setView('forgot_password')} className="hover:text-rose-500">
                Forgot password?
              </button>
            </div>
          )}

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-full font-bold shadow-lg transition-all ${
              view === 'login' ? 'bg-slate-900 text-white hover:-translate-y-0.5' : 'bg-rose-600 text-white hover:bg-rose-700'
            } disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            {loading ? 'Processing...' : view === 'login' ? 'Continue with Email' : 'Create Account'}
          </button>
        </form>

        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-4 text-xs text-gray-400 uppercase tracking-[0.3em]">Or</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-full hover:bg-gray-50 text-sm font-semibold text-gray-700"
        >
          <GoogleIcon />
          <span>{view === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          {view === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setView(view === 'login' ? 'register' : 'login');
              setError('');
              setEmailError('');
              setPasswordStrengthError('');
              setShowPassword(false);
              setEmailExists(false);
              setCheckingEmail(false);
            }}
            className="text-rose-600 font-semibold hover:underline"
          >
            {view === 'login' ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );

  const activeFeature = FEATURES[activeFeatureIndex];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-50 py-12 px-4">
      <BackgroundNetwork />
      <div className="relative z-10 w-full max-w-[1100px] bg-white/95 backdrop-blur-sm border border-white/70 rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-5/12 relative p-8 md:p-10 text-white bg-gradient-to-br from-rose-500 via-rose-600 to-rose-800 flex flex-col overflow-hidden">
          <div className="absolute inset-0 opacity-80">
            <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1000&q=80" alt="Fashion presenter" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-b from-rose-900/60 via-transparent to-rose-900" />
          </div>
          <div className="relative flex items-center gap-3 mb-6">
            <div onClick={() => navigate(PATHS.LANDING)} className="w-10 h-10 bg-white/10 border border-white/30 rounded-xl flex items-center justify-center cursor-pointer">
              <img src="https://i.postimg.cc/pd8409Bg/Frame-14.png" alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <span className="font-bold text-2xl tracking-tight">ZOLA AI</span>
          </div>
          <div className="relative flex-1 flex flex-col justify-between">
            <style>{`
              @keyframes slide-in-right {
                0% {
                  transform: translateX(100px);
                  opacity: 0;
                }
                100% {
                  transform: translateX(0);
                  opacity: 1;
                }
              }
              @keyframes float {
                0%, 100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-10px);
                }
              }
              @keyframes float-delayed {
                0%, 100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-8px);
                }
              }
              .animate-slide-in {
                animation: slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              .animate-float {
                animation: float 3s ease-in-out infinite;
              }
              .animate-float-delayed {
                animation: float-delayed 3s ease-in-out infinite 1s;
              }
            `}</style>
            <div key={animKey} className="relative h-[620px] flex items-center justify-center overflow-visible animate-slide-in">
              <div className="absolute top-12 right-40 w-52 bg-white/90 backdrop-blur border border-white/60 rounded-2xl p-3.5 shadow-2xl transform rotate-6 animate-float-delayed z-10">
                <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">{activeFeature.topCard.title}</div>
                <div className="flex gap-3">
                  <div className="relative">
                    <div className="w-12 h-16 rounded-lg overflow-hidden border border-gray-100">
                      <img src={activeFeature.topCard.image} alt="Old method" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -right-2 -bottom-1 bg-red-500 text-white rounded-full p-0.5 border border-white">
                      <IconX className="w-3 h-3" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-tight">{activeFeature.topCard.tagText}</p>
                </div>
              </div>
              <div className="absolute bottom-36 left-28 w-72 bg-white rounded-3xl p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] border border-white/60 transform -rotate-3 animate-float z-20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{activeFeature.mainCard.title}</h3>
                    <p className="text-[11px] text-gray-500">{activeFeature.mainCard.tagLine}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <IconZap className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col gap-2">
                    {['Upload', 'Choose', 'Generate'].map((label, idx) => (
                      <div key={label} className="flex flex-col items-center text-[9px] text-gray-500 gap-1">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                            idx === 2 ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white border-none shadow-lg' : 'border-gray-200 bg-white'
                          }`}
                        >
                          {idx === 0 && <IconUpload className="w-3.5 h-3.5" />}
                          {idx === 1 && <IconUser className="w-3.5 h-3.5" />}
                          {idx === 2 && <IconZap className="w-3.5 h-3.5" />}
                        </div>
                        <span className={idx === 2 ? 'font-semibold text-rose-600' : ''}>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 rounded-2xl overflow-hidden border border-gray-100">
                    <img src={activeFeature.mainCard.image} alt="Result" className="w-full h-56 object-cover object-top" />
                  </div>
                </div>
              </div>
            </div>
            <div className="relative text-center mt-6">
              <h2 className="text-3xl font-bold tracking-tight mb-2">{activeFeature.headline}</h2>
              <p className="text-pink-100 text-sm font-medium">{activeFeature.subhead}</p>
              <div className="flex justify-center gap-2 mt-4">
                {FEATURES.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full ${idx === activeFeatureIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-7/12 bg-white p-8 md:p-12 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-white/80" />
          <div className="relative max-w-md mx-auto">
            {['login', 'register'].includes(view) ? renderPrimaryView() : renderStatusView()}
            <div className="mt-10 text-center text-xs text-gray-400">
              By signing in, you accept the{' '}
              <a href="#" className="text-rose-600 hover:underline">
                Terms of Service
              </a>{' '}
              and acknowledge our{' '}
              <a href="#" className="text-rose-600 hover:underline">
                Privacy Policy
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;