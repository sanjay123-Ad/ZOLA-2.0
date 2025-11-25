import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';
import { MaleIcon, FemaleIcon } from '../components/icons';

interface SettingsPageProps {
  user: User;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  gender: 'Male' | 'Female' | null;
  residentialAddress: string;
  avatarUrl: string | null;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    username: user.username || '',
    email: user.email || '',
    gender: null,
    residentialAddress: '',
    avatarUrl: user.avatar || null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .limit(1);

        if (profileError) {
          console.warn('Error loading profile:', profileError);
        }

        const profile = profiles?.[0];
        if (profile) {
          setProfileData({
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            username: profile.username || user.username || '',
            email: user.email || '',
            gender: profile.gender || null,
            residentialAddress: profile.residential_address || '',
            avatarUrl: profile.avatar_url || user.avatar || null,
          });
        } else {
          // If no profile exists, initialize with user data
          setProfileData(prev => ({
            ...prev,
            username: user.username || '',
            email: user.email || '',
            avatarUrl: user.avatar || null,
          }));
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (field: keyof ProfileData, value: string | 'Male' | 'Female' | null) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }

    setUploadingAvatar(true);
    setError('');

    try {
      // Delete old avatar if exists
      if (profileData.avatarUrl) {
        const oldPath = profileData.avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          gender: profileData.gender,
          residential_address: profileData.residentialAddress,
        }, { onConflict: 'id' });

      if (updateError) throw updateError;

      setProfileData(prev => ({ ...prev, avatarUrl: publicUrl }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(err.message || 'Failed to upload avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!profileData.avatarUrl) return;

    setUploadingAvatar(true);
    setError('');

    try {
      // Delete from storage
      const oldPath = profileData.avatarUrl.split('/').pop();
      if (oldPath) {
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: null,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          gender: profileData.gender,
          residential_address: profileData.residentialAddress,
        }, { onConflict: 'id' });

      if (updateError) throw updateError;

      setProfileData(prev => ({ ...prev, avatarUrl: null }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error deleting avatar:', err);
      setError(err.message || 'Failed to delete avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profileData.username,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          gender: profileData.gender,
          residential_address: profileData.residentialAddress,
          avatar_url: profileData.avatarUrl,
        }, { onConflict: 'id' });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-10 lg:p-12 border border-gray-200/50">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">Profile Settings</h1>

        <form onSubmit={handleSaveChanges}>
          {/* Avatar Section - Centered and Big */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative mb-6">
              {profileData.avatarUrl ? (
                <img
                  src={profileData.avatarUrl}
                  alt="Profile Avatar"
                  className="w-40 h-40 rounded-full object-cover border-4 border-sky-500 shadow-xl"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-sky-100 border-4 border-sky-500 flex items-center justify-center shadow-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              {/* Camera Icon Overlay - Clickable */}
              <label className="absolute bottom-2 right-2 w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg cursor-pointer hover:bg-sky-600 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            </div>
            <div className="flex gap-3">
              <label className="px-6 py-2.5 bg-sky-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-sky-700 transition-colors shadow-lg">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
                {uploadingAvatar ? 'Uploading...' : 'Upload New'}
              </label>
              {profileData.avatarUrl && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={uploadingAvatar}
                  className="px-6 py-2.5 bg-red-500 text-white font-semibold rounded-lg cursor-pointer hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete avatar
                </button>
              )}
            </div>
          </div>

          {/* Form Fields - Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* First Name */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-sky-500 transition-colors bg-gray-50"
                  required
                />
              </div>

              {/* Email - Non-editable */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 'Male')}
                    className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                      profileData.gender === 'Male'
                        ? 'border-sky-600 bg-sky-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-8 h-8 mb-2 text-sky-600">
                      <MaleIcon />
                    </div>
                    <span className="font-semibold text-gray-800">Male</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 'Female')}
                    className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                      profileData.gender === 'Female'
                        ? 'border-sky-600 bg-sky-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-8 h-8 mb-2 text-sky-600">
                      <FemaleIcon />
                    </div>
                    <span className="font-semibold text-gray-800">Female</span>
                  </button>
                </div>
              </div>

              {/* Residential Address */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Residential Address
                </label>
                <textarea
                  value={profileData.residentialAddress}
                  onChange={(e) => handleInputChange('residentialAddress', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-sky-500 transition-colors resize-y"
                  placeholder="Enter your residential address"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Last Name */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-sky-500 transition-colors bg-gray-50"
                  required
                />
              </div>

              {/* Username - Non-editable */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">Changes saved successfully!</p>
            </div>
          )}

          {/* Save Changes Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={saving || uploadingAvatar}
              className="px-8 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SettingsPage;

