import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { PATHS } from '../constants/paths';
import { EyeIcon, EyeOffIcon } from '../components/icons';

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

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrengthError, setPasswordStrengthError] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const navigate = useNavigate();

  // Extract and process the session token from URL hash on mount
  useEffect(() => {
    const handleAuthSession = async () => {
      try {
        // Check if there's a hash in the URL (Supabase puts tokens in the hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        
        // Check for error codes in the URL (expired/invalid links)
        const error = hashParams.get('error');
        const errorCode = hashParams.get('error_code');
        const errorDescription = hashParams.get('error_description');

        // If there's an error in the URL, handle it
        if (error || errorCode) {
          let errorMessage = 'The reset link is invalid or has expired.';
          
          if (errorCode === 'otp_expired') {
            errorMessage = 'This password reset link has expired. Please request a new reset link.';
          } else if (errorDescription) {
            errorMessage = decodeURIComponent(errorDescription.replace(/\+/g, ' '));
          } else if (error) {
            errorMessage = `Error: ${error}. Please request a new reset link.`;
          }
          
          setError(errorMessage);
          setCheckingSession(false);
          
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }

        // If we have a recovery token in the URL, wait for Supabase to process it
        if (accessToken && type === 'recovery') {
          // Wait a bit for Supabase to automatically process the hash
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Get the current session - Supabase should have processed the hash by now
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            setError(sessionError.message || 'Failed to establish session. Please request a new reset link.');
            setCheckingSession(false);
            return;
          }

          if (!session) {
            // Try one more time after a longer delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            
            if (!retrySession) {
              setError('Auth session missing! Please use the link from your email or request a new reset link.');
              setCheckingSession(false);
              return;
            }
          }

          // Clear the hash from URL for security (but keep any error params if they exist)
          if (!error && !errorCode) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else {
          // Check if there's already a valid session (user might have refreshed)
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            setError('Auth session missing! Please use the link from your email or request a new reset link.');
          }
        }
      } catch (err) {
        console.error('Error processing auth session:', err);
        setError('Failed to process reset link. Please request a new reset link.');
      } finally {
        setCheckingSession(false);
      }
    };

    handleAuthSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First verify we have a valid session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('Auth session missing! Please use the link from your email or request a new reset link.');
      return;
    }
    
    // Clear previous errors
    setError('');
    setPasswordStrengthError('');
    setPasswordMatchError('');
    
    // Validate password strength
    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      setPasswordStrengthError(passwordCheck.message);
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      setPasswordMatchError("Passwords do not match.");
      return;
    }
    
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      await supabase.auth.signOut();
    }
    setLoading(false);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-full max-w-sm p-8 bg-white text-[#2E1E1E] rounded-2xl shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#9F1D35] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-full max-w-sm p-8 bg-white text-[#2E1E1E] rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
            <h1 
                className="text-3xl font-bold text-gray-800 font-headline cursor-pointer"
                onClick={() => navigate(PATHS.LANDING)}
            >
                ZOLA AI
            </h1>
        </div>

        {success ? (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Password Updated!
            </h2>
            <p className="text-gray-500">
              Your password has been changed successfully. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate(PATHS.AUTH)}
              className="mt-8 w-full py-3 bg-[#9F1D35] text-white font-semibold rounded-full shadow-lg hover:bg-[#80172a] transition-colors"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Set a New Password
            </h2>
            <p className="text-gray-500 mb-8 text-center">
              Enter and confirm your new password below.
            </p>
            <form onSubmit={handleUpdatePassword}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordStrengthError('');
                      setPasswordMatchError('');
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
                {password && (
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
              <div className="mb-8">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordMatchError('');
                    }}
                    className={`w-full px-1 py-3 pr-10 bg-transparent border-b-2 ${passwordMatchError ? 'border-red-500' : password && confirmPassword && password === confirmPassword ? 'border-green-500' : 'border-gray-200'} focus:outline-none focus:border-[#9F1D35] transition-colors`}
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {passwordMatchError && <p className="text-red-500 text-xs mt-1">{passwordMatchError}</p>}
                {password && confirmPassword && password === confirmPassword && !passwordMatchError && (
                  <p className="text-green-600 text-xs mt-1">✓ Passwords match</p>
                )}
              </div>
              {error && (
                <div className="mb-4">
                  <p className="text-red-500 text-xs text-center mb-3">{error}</p>
                  {(error.includes('expired') || error.includes('invalid')) && (
                    <button
                      type="button"
                      onClick={() => navigate(PATHS.AUTH)}
                      className="w-full py-2 text-sm text-[#9F1D35] font-semibold hover:underline"
                    >
                      Request a new reset link →
                    </button>
                  )}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !!error}
                className="w-full py-3 bg-[#9F1D35] text-white font-semibold rounded-full shadow-lg hover:bg-[#80172a] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;