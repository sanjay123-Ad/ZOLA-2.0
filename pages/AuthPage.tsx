import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { GoogleIcon, EyeIcon, EyeOffIcon } from '../components/icons';
import { PATHS } from '../constants/paths';

interface AuthPageProps {}

type AuthView = 'login' | 'register' | 'forgot_password' | 'check_email' | 'signup_success';

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation function
const isStrongPassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true, message: '' };
};

const AuthPage: React.FC<AuthPageProps> = () => {
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
  
  const navigate = useNavigate();

  useEffect(() => {
    // Set the redirect URL on component mount.
    // This ensures it's available to render and avoids any server-side rendering issues.
    setRedirectUrl(window.location.origin);
  }, []);

  // Function to check if email already exists using Supabase RPC function
  const checkEmailExists = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck.trim() || !isValidEmail(emailToCheck)) {
      setEmailExists(false);
      setEmailError('');
      return;
    }

    setCheckingEmail(true);
    try {
      // Call the database function to check if email exists
      const { data, error } = await supabase.rpc('email_exists', {
        email_to_check: emailToCheck.toLowerCase().trim()
      });

      if (error) {
        console.error('Error checking email existence:', error);
        // On error, assume email is NEW (conservative - don't block legitimate signups)
        setEmailExists(false);
        setEmailError('');
      } else {
        // data will be true if email exists, false if it doesn't
        if (data === true) {
          setEmailExists(true);
          setEmailError('User account already exists. Please try with a new account or login instead.');
        } else {
          setEmailExists(false);
          setEmailError('');
        }
      }
    } catch (err) {
      console.error('Exception checking email existence:', err);
      // On any error, assume email is NEW (conservative - don't block legitimate signups)
      setEmailExists(false);
      setEmailError('');
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  // Debounced email check - check when user finishes typing (after 800ms delay)
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

    const timeoutId = setTimeout(() => {
      checkEmailExists(email);
    }, 800); // Wait 800ms after user stops typing

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
      
      // Validate email format
      if (!isValidEmail(email)) {
        setEmailError('Please enter a valid email address.');
        setLoading(false);
        return;
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      // onAuthStateChange in App.tsx will handle navigation
    } else if (view === 'register') {
      if (!username.trim() || !email.trim() || !password.trim()) {
        setError('Username, email, and password cannot be empty.');
        setLoading(false);
        return;
      }
      
      // Validate email format
      if (!isValidEmail(email)) {
        setEmailError('Please enter a valid email address.');
        setLoading(false);
        return;
      }
      
      // Check if email already exists (from real-time check)
      if (emailExists) {
        setError('User account already exists. Please try with a new account or login instead.');
        setLoading(false);
        return;
      }
      
      // Validate password strength
      const passwordCheck = isStrongPassword(password);
      if (!passwordCheck.valid) {
        setPasswordStrengthError(passwordCheck.message);
        setLoading(false);
        return;
      }
      
      // If sign-in fails with "Invalid login credentials", it might be a new user or wrong password
      // Continue with signup attempt
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      // Check for error first - this is the primary way Supabase indicates existing users
      if (error) {
        // Check if user already exists - check error message, code, and status
        const errorMessage = error.message.toLowerCase();
        const errorCode = (error as any).code || '';
        const errorStatus = (error as any).status || '';
        
        // Comprehensive check for existing user errors
        if (
          errorMessage.includes('already exists') ||
          errorMessage.includes('already registered') || 
          errorMessage.includes('user already registered') || 
          errorMessage.includes('email already') ||
          errorMessage.includes('user already') ||
          errorMessage.includes('duplicate') ||
          errorMessage.includes('email address is already') ||
          errorCode.includes('already') ||
          errorCode.includes('duplicate') ||
          errorStatus === 400 || // Bad Request often indicates existing user
          errorStatus === 422   // Unprocessable Entity
        ) {
          setError('User account already exists. Please try with a new account or login instead.');
          setLoading(false);
          return;
        }
        
        // Handle other types of errors
        setError(error.message);
        setLoading(false);
        return;
      }

      // If no error, check if user was actually created
      if (!data.user) {
        setError('Failed to create account. Please try again.');
        setLoading(false);
        return;
      }

      // Check if this is an existing user (Supabase might return user object even for existing users in some cases)
      const user = data.user;
      const userAny = user as any;
      
      // Check 1: If user has a session, they might be an existing user who got auto-logged in
      if (data.session) {
        setError('User account already exists. Please try with a new account or login instead.');
        setLoading(false);
        return;
      }
      
      // Check 2: If email is already confirmed, it's definitely an existing user
      if (userAny.email_confirmed_at) {
        setError('User account already exists. Please try with a new account or login instead.');
        setLoading(false);
        return;
      }
      
      // Check 3: If user has signed in before (last_sign_in_at exists), it's an existing user
      if (userAny.last_sign_in_at) {
        setError('User account already exists. Please try with a new account or login instead.');
        setLoading(false);
        return;
      }
      
      // Check 4: Check user identities - existing users might have different identity patterns
      if (userAny.identities && userAny.identities.length > 0) {
        // Check if any identity was created more than a few seconds ago
        const now = Date.now();
        const hasOldIdentity = userAny.identities.some((identity: any) => {
          if (identity.created_at) {
            const identityCreated = new Date(identity.created_at).getTime();
            const secondsSinceCreation = (now - identityCreated) / 1000;
            return secondsSinceCreation > 3; // More than 3 seconds old
          }
          return false;
        });
        
        if (hasOldIdentity) {
          setError('User account already exists. Please try with a new account or login instead.');
          setLoading(false);
          return;
        }
      }
      
      // Check 5: If user was created more than 1 second ago, it's likely an existing user
      // (new users should be created just now, within 1 second)
      const userCreatedAt = user.created_at;
      if (userCreatedAt) {
        const createdAt = new Date(userCreatedAt);
        const now = new Date();
        const secondsSinceCreation = (now.getTime() - createdAt.getTime()) / 1000;
        
        // Be more strict - if created more than 1 second ago, it's likely existing
        if (secondsSinceCreation > 1) {
          setError('User account already exists. Please try with a new account or login instead.');
          setLoading(false);
          return;
        }
      }
      
      // All checks passed - this is a new user signup
      // Show the success page only for truly new users
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
      options: {
        redirectTo: window.location.origin, // Ensure Supabase redirects back to your app
      }
    });
    if (error) {
      setError(`Google sign-in error: ${error.message}`);
    }
    // onAuthStateChange will handle navigation after Google redirect
  };

  const renderContent = () => {
    switch (view) {
      case 'signup_success':
        return (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Please check your email</h2>
            <p className="text-gray-500">We've sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.</p>
            <button onClick={() => setView('login')} className="mt-8 w-full py-3 bg-[#9F1D35] text-white font-semibold rounded-full shadow-lg hover:bg-[#80172a] transition-colors">Back to Login</button>
          </div>
        );
      case 'check_email':
        return (
          <div className="text-center animate-fade-in">
             <div className="w-16 h-16 mx-auto mb-4 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Check your email</h2>
            <p className="text-gray-500">A password reset link has been sent to <strong>{email}</strong> if an account exists.</p>
            <button onClick={() => setView('login')} className="mt-8 w-full py-3 bg-[#9F1D35] text-white font-semibold rounded-full shadow-lg hover:bg-[#80172a] transition-colors">Back to Login</button>
          </div>
        );
      case 'forgot_password':
        return (
          <>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
            <p className="text-gray-500 mb-8">Enter your email to receive a reset link.</p>
            <form onSubmit={handleForgotPassword}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-1 py-3 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-[#9F1D35] transition-colors" placeholder="you@example.com" required />
              </div>
              {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-[#9F1D35] text-white font-semibold rounded-full shadow-lg hover:bg-[#80172a] transition-colors disabled:bg-gray-400">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-6">
              Remember your password?
              <button onClick={() => { 
                setView('login'); 
                setError(''); 
                setEmailError('');
                setShowPassword(false);
              }} className="font-semibold text-[#9F1D35] hover:underline ml-1">Back to Login</button>
            </p>
          </>
        );
      case 'login':
      case 'register':
      default:
        return (
          <>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {view === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-gray-500 mb-8">
              {view === 'login' ? 'Login to continue to your dashboard.' : 'Get started with 10 free generations.'}
            </p>
            <form onSubmit={handleSubmit}>
              {view === 'register' && (
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Username</label>
                  <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-1 py-3 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-[#9F1D35] transition-colors" placeholder="e.g. fashion_house" required />
                </div>
              )}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                <div className="relative">
                  <input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                      setEmailExists(false);
                    }} 
                    onBlur={() => {
                      // Check immediately when user leaves the field
                      if (view === 'register' && email.trim() && isValidEmail(email)) {
                        checkEmailExists(email);
                      }
                    }}
                    className={`w-full px-1 py-3 bg-transparent border-b-2 ${emailError || emailExists ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-[#9F1D35] transition-colors`} 
                    placeholder="you@example.com" 
                    required 
                  />
                  {checkingEmail && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-[#9F1D35] rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                {emailExists && !emailError && (
                  <p className="text-red-500 text-xs mt-1">User account already exists. Please try with a new account or login instead.</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                <div className="relative">
                  <input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordStrengthError('');
                    }} 
                    className={`w-full px-1 py-3 pr-10 bg-transparent border-b-2 ${passwordStrengthError ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-[#9F1D35] transition-colors`} 
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {view === 'register' && password && (
                  <div className="mt-2">
                    {passwordStrengthError ? (
                      <p className="text-red-500 text-xs">{passwordStrengthError}</p>
                    ) : (
                      <div className="text-xs text-gray-600">
                        <p className="mb-1">Password must contain:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li className={password.length >= 8 ? 'text-green-600' : ''}>At least 8 characters</li>
                          <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>One uppercase letter</li>
                          <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>One lowercase letter</li>
                          <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>One number</li>
                          <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600' : ''}>One special character</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {view === 'login' && (
                <div className="text-right mb-6">
                  <button type="button" onClick={() => setView('forgot_password')} className="text-xs font-semibold text-gray-500 hover:text-[#9F1D35] transition-colors">Forgot Password?</button>
                </div>
              )}
              {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-[#9F1D35] text-white font-semibold rounded-full shadow-lg hover:bg-[#80172a] transition-colors disabled:bg-gray-400">
                {loading ? 'Processing...' : (view === 'login' ? 'Login' : 'Create Account')}
              </button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-6">
              {view === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button onClick={() => { 
                setView(view === 'login' ? 'register' : 'login'); 
                setError(''); 
                setEmailError('');
                setPasswordStrengthError('');
                setShowPassword(false);
                setEmailExists(false);
                setCheckingEmail(false);
              }} className="font-semibold text-[#9F1D35] hover:underline ml-1">
                {view === 'login' ? 'Sign up' : 'Login'}
              </button>
            </p>
            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase">Or</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-full shadow-sm hover:bg-gray-50 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed">
                <GoogleIcon />
                <span>{view === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
            </button>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-[#2E1E1E] p-12 text-white flex-col justify-between">
        <div><h1 className="text-3xl font-bold font-headline cursor-pointer" onClick={() => navigate(PATHS.LANDING)}>ZOLA AI</h1></div>
        <div>
          <h2 className="text-4xl font-bold leading-snug">The AI Photoshoot that pays for itself.</h2>
          <p className="mt-4 text-white/70">Join the brands building the future of fashion e-commerce.</p>
        </div>
        <div className="text-sm text-white/50">&copy; {new Date().getFullYear()} ZOLA AI. All rights reserved.</div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white text-[#2E1E1E]">
        <div className="w-full max-w-sm">
          <div className="text-center lg:text-left mb-10">
            <h1 className="text-4xl font-bold text-gray-800 font-headline lg:hidden cursor-pointer" onClick={() => navigate(PATHS.LANDING)}>ZOLA AI</h1>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;