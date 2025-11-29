import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';

interface SettingsPageProps {
    user: User;
}

type Theme = 'light' | 'dark' | 'system';

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
    const [selectedTheme, setSelectedTheme] = useState<Theme>('system');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadTheme();
    }, [user.id]);

    const loadTheme = async () => {
        try {
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('theme_preference')
                .eq('id', user.id)
                .limit(1);

            if (profileError) {
                console.warn('Error loading theme:', profileError);
            }

            const profile = profiles?.[0];
            if (profile?.theme_preference) {
                setSelectedTheme(profile.theme_preference as Theme);
                applyTheme(profile.theme_preference as Theme);
            } else {
                // Default to system
                setSelectedTheme('system');
                applyTheme('system');
            }
        } catch (err) {
            console.error('Error loading theme:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = (theme: Theme) => {
        const root = document.documentElement;
        
        if (theme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (systemPrefersDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        } else if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };

    const handleThemeChange = async (theme: Theme) => {
        setSelectedTheme(theme);
        setSaving(true);
        setError('');
        setSuccess(false);

        try {
            // Apply theme immediately
            applyTheme(theme);

            // Save to Supabase
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    theme_preference: theme,
                }, { onConflict: 'id' });

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err: any) {
            console.error('Error saving theme:', err);
            setError(err.message || 'Failed to save theme preference.');
            // Revert on error
            loadTheme();
        } finally {
            setSaving(false);
        }
    };

    // Listen for system theme changes when system theme is selected
    useEffect(() => {
        if (selectedTheme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme('system');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [selectedTheme]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 flex items-center justify-center bg-sky-100 dark:bg-sky-900 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 ml-13">Manage your application preferences</p>
            </div>

            {/* Settings Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Theme Section */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Theme</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred color scheme</p>
                            </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>

                {/* Theme Options */}
                <div className="p-6 space-y-4">
                    {/* Light Theme */}
                    <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 group ${
                        selectedTheme === 'light' 
                            ? 'border-sky-500 dark:border-sky-400 bg-sky-50 dark:bg-sky-900/20' 
                            : 'border-gray-200 dark:border-gray-700'
                    }`}>
                        <div className={`flex-1 flex items-center gap-4 ${selectedTheme === 'light' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${selectedTheme === 'light' ? 'bg-sky-100 dark:bg-sky-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${selectedTheme === 'light' ? 'text-sky-600 dark:text-sky-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold">Light</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Use light theme</div>
                            </div>
                        </div>
                        <div className="relative">
                            <input
                                type="radio"
                                name="theme"
                                value="light"
                                checked={selectedTheme === 'light'}
                                onChange={() => handleThemeChange('light')}
                                disabled={saving}
                                className="w-5 h-5 text-sky-600 focus:ring-sky-500 focus:ring-2 cursor-pointer disabled:opacity-50"
                            />
                        </div>
                    </label>

                    {/* Dark Theme */}
                    <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 group ${
                        selectedTheme === 'dark' 
                            ? 'border-sky-500 dark:border-sky-400 bg-sky-50 dark:bg-sky-900/20' 
                            : 'border-gray-200 dark:border-gray-700'
                    }`}>
                        <div className={`flex-1 flex items-center gap-4 ${selectedTheme === 'dark' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${selectedTheme === 'dark' ? 'bg-sky-100 dark:bg-sky-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${selectedTheme === 'dark' ? 'text-sky-600 dark:text-sky-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold">Dark</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Use dark theme</div>
                            </div>
                        </div>
                        <div className="relative">
                            <input
                                type="radio"
                                name="theme"
                                value="dark"
                                checked={selectedTheme === 'dark'}
                                onChange={() => handleThemeChange('dark')}
                                disabled={saving}
                                className="w-5 h-5 text-sky-600 focus:ring-sky-500 focus:ring-2 cursor-pointer disabled:opacity-50"
                            />
                        </div>
                    </label>

                    {/* System Theme */}
                    <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 group ${
                        selectedTheme === 'system' 
                            ? 'border-sky-500 dark:border-sky-400 bg-sky-50 dark:bg-sky-900/20' 
                            : 'border-gray-200 dark:border-gray-700'
                    }`}>
                        <div className={`flex-1 flex items-center gap-4 ${selectedTheme === 'system' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${selectedTheme === 'system' ? 'bg-sky-100 dark:bg-sky-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${selectedTheme === 'system' ? 'text-sky-600 dark:text-sky-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold">System</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Match your system preference</div>
                            </div>
                        </div>
                        <div className="relative">
                            <input
                                type="radio"
                                name="theme"
                                value="system"
                                checked={selectedTheme === 'system'}
                                onChange={() => handleThemeChange('system')}
                                disabled={saving}
                                className="w-5 h-5 text-sky-600 focus:ring-sky-500 focus:ring-2 cursor-pointer disabled:opacity-50"
                            />
                        </div>
                    </label>
                </div>

                {/* Success/Error Messages */}
                {error && (
                    <div className="px-6 pb-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}
                {success && (
                    <div className="px-6 pb-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm text-green-600 dark:text-green-400">Theme preference saved successfully!</p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default SettingsPage;
