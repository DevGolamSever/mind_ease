import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Heart, Mail, Lock, User as UserIcon, ArrowLeft, AlertCircle } from 'lucide-react';
import { db } from '../services/db';

type AuthView = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

interface AuthProps {
    onLoginSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clear errors when view changes
  useEffect(() => {
    setError(null);
    setSuccess(null);
    setName('');
    setEmail('');
    setPassword('');
  }, [view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
        await db.signIn(email, password);
        onLoginSuccess();
    } catch (err: any) {
        setError(err.message || 'Failed to sign in. Please check your credentials.');
        setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
        await db.signUp(email, password, name);
        setSuccess('Account created successfully! You can now sign in.');
        setView('LOGIN');
    } catch (err: any) {
        setError(err.message || 'Failed to create account.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation
    setSuccess('If an account exists, we simulated sending a reset link.');
  };

  const renderForm = () => {
    switch (view) {
      case 'LOGIN':
        return (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => setView('FORGOT_PASSWORD')}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <Button type="submit" fullWidth size="lg" className="mt-2" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        );

      case 'SIGNUP':
        return (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <UserIcon size={18} />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" fullWidth size="lg" className="mt-4" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        );

      case 'FORGOT_PASSWORD':
        return (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" fullWidth size="lg" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <button 
              type="button"
              onClick={() => setView('LOGIN')}
              className="w-full text-center text-sm text-slate-500 hover:text-slate-800 font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="p-8 sm:p-12">
          <div className="text-center mb-8">
            <div className="mx-auto bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-teal-600">
              <Heart className="w-8 h-8 fill-current" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Mind Ease</h1>
            <p className="text-slate-500">Your mental wellness companion</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-2 text-center">
              {view === 'LOGIN' && 'Welcome Back'}
              {view === 'SIGNUP' && 'Create Account'}
              {view === 'FORGOT_PASSWORD' && 'Reset Password'}
            </h2>

            <p className="text-sm text-slate-500 text-center">
              {view === 'LOGIN' && 'Sign in to access your personalized support'}
              {view === 'SIGNUP' && 'Begin your supportive journey today'}
              {view === 'FORGOT_PASSWORD' && 'Enter your email to receive reset instructions'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-shake">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 text-green-700 text-sm animate-fade-in">
              <p>{success}</p>
            </div>
          )}

          {renderForm()}

          {view !== 'FORGOT_PASSWORD' && (
            <div className="mt-8 text-center border-t border-slate-50 pt-6">
              <p className="text-sm text-slate-500">
                {view === 'LOGIN' ? "Don't have an account?" : "Already have an account?"}{' '}
                <button 
                  onClick={() => setView(view === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                  className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
                >
                  {view === 'LOGIN' ? 'Sign up' : 'Login'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};