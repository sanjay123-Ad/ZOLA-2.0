import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { supabase } from '../services/supabase';
import { MaleIcon, FemaleIcon } from '../components/icons';
import { PATHS } from '../constants/paths';
import ImageCropper from '../components/ImageCropper';

interface ProfilePageProps {
  user: User;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  gender: 'Male' | 'Female' | null;
  country: string;
  avatarUrl: string | null;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    username: user.username || '',
    email: user.email || '',
    gender: null,
    country: '',
    avatarUrl: user.avatar || null,
  });
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  // Session storage key for profile edits
  const PROFILE_EDIT_STORAGE_KEY = `profile_edit_${user.id}`;

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Check for unsaved edits in sessionStorage
        const savedEditData = sessionStorage.getItem(PROFILE_EDIT_STORAGE_KEY);
        
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .limit(1);

        if (profileError) {
          console.warn('Error loading profile:', profileError);
        }

        const profile = profiles?.[0];
        let loadedData: ProfileData;
        
        if (profile) {
          loadedData = {
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            username: profile.username || user.username || '',
            email: user.email || '',
            gender: profile.gender || null,
            country: profile.country || '',
            avatarUrl: profile.avatar_url || user.avatar || null,
          };
        } else {
          // If no profile exists, initialize with user data
          loadedData = {
            firstName: '',
            lastName: '',
            username: user.username || '',
            email: user.email || '',
            gender: null,
            country: '',
            avatarUrl: user.avatar || null,
          };
        }

        // If there are unsaved edits, prompt user to restore
        if (savedEditData) {
          try {
            const parsedData = JSON.parse(savedEditData);
            setShowRestorePrompt(true);
            // Store the loaded data as original for comparison
            setOriginalProfileData(loadedData);
            // Don't auto-restore, wait for user decision
            setProfileData(loadedData);
          } catch (e) {
            console.error('Error parsing saved edit data:', e);
            sessionStorage.removeItem(PROFILE_EDIT_STORAGE_KEY);
            setProfileData(loadedData);
            setOriginalProfileData(loadedData);
          }
        } else {
          setProfileData(loadedData);
          setOriginalProfileData(loadedData);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, PROFILE_EDIT_STORAGE_KEY]);

  // Save edit state to sessionStorage
  const saveEditStateToSession = useCallback((data: ProfileData) => {
    try {
      const stateToSave = {
        profileData: data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(PROFILE_EDIT_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.error('Error saving edit state to session:', err);
    }
  }, [PROFILE_EDIT_STORAGE_KEY]);

  const handleInputChange = (field: keyof ProfileData, value: string | 'Male' | 'Female' | null) => {
    setProfileData(prev => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
    setError('');
    setSuccess(false);
  };

  // Save to sessionStorage when profileData changes in edit mode
  useEffect(() => {
    if (isEditMode && profileData && originalProfileData) {
      try {
        saveEditStateToSession(profileData);
      } catch (err) {
        console.error('Error saving to session storage:', err);
      }
    }
  }, [isEditMode, profileData.username, profileData.firstName, profileData.lastName, profileData.gender, profileData.country, profileData.avatarUrl, newAvatarFile, newAvatarPreview, saveEditStateToSession]);

  // Restore unsaved edits
  const handleRestoreEdits = () => {
    try {
      const savedEditData = sessionStorage.getItem(PROFILE_EDIT_STORAGE_KEY);
      if (savedEditData) {
        const parsedData = JSON.parse(savedEditData);
        setProfileData(parsedData.profileData);
        setIsEditMode(true);
        setShowRestorePrompt(false);
      }
    } catch (err) {
      console.error('Error restoring edits:', err);
      setShowRestorePrompt(false);
    }
  };

  // Discard unsaved edits
  const handleDiscardEdits = () => {
    sessionStorage.removeItem(PROFILE_EDIT_STORAGE_KEY);
    setShowRestorePrompt(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setError('');
    
    // Read file and show cropper
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    e.target.value = '';
  };

  const handleCropComplete = (croppedFile: File) => {
    setNewAvatarFile(croppedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      setNewAvatarPreview(preview);
      // Update profile data and save to sessionStorage if in edit mode
      if (isEditMode) {
        setProfileData(prev => {
          const updated = { ...prev, avatarUrl: preview };
          saveEditStateToSession(updated);
          return updated;
        });
      }
    };
    reader.readAsDataURL(croppedFile);
    setShowCropper(false);
    setImageToCrop(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
  };

  const handleDeleteAvatar = () => {
    // Update local state and save to sessionStorage if in edit mode
    setNewAvatarFile(null);
    setNewAvatarPreview(null);
    setProfileData(prev => {
      const updated = { ...prev, avatarUrl: null };
      if (isEditMode) {
        saveEditStateToSession(updated);
      }
      return updated;
    });
  };

  // Removed automatic useEffect saving to prevent infinite loops
  // Saving is now handled explicitly in handleInputChange, handleCropComplete, and handleDeleteAvatar

  const handleEditClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    // Ensure we have original data before entering edit mode
    if (!originalProfileData) {
      // If no original data, set current data as original
      setOriginalProfileData({ ...profileData });
    }
    setIsEditMode(true);
    setError('');
    setSuccess(false);
    // Save initial edit state
    saveEditStateToSession(profileData);
  };

  const handleCancelEdit = () => {
    // Reset to original data
    if (originalProfileData) {
      setProfileData({ ...originalProfileData });
    }
    setNewAvatarFile(null);
    setNewAvatarPreview(null);
    setIsEditMode(false);
    setError('');
    setSuccess(false);
    // Clear session storage
    sessionStorage.removeItem(PROFILE_EDIT_STORAGE_KEY);
  };

  // Check if there are any changes
  const hasChanges = () => {
    if (!originalProfileData) return false;
    
    // Check if avatar changed
    const avatarChanged = newAvatarFile !== null || 
      (newAvatarPreview === null && profileData.avatarUrl === null && originalProfileData.avatarUrl !== null) ||
      (profileData.avatarUrl === null && originalProfileData.avatarUrl !== null);
    
    // Check if other fields changed
    const fieldsChanged = 
      profileData.username !== originalProfileData.username ||
      profileData.firstName !== originalProfileData.firstName ||
      profileData.lastName !== originalProfileData.lastName ||
      profileData.gender !== originalProfileData.gender ||
      profileData.country !== originalProfileData.country;
    
    return avatarChanged || fieldsChanged;
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges()) {
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);
    setUploadingAvatar(true);

    try {
      let finalAvatarUrl = profileData.avatarUrl;

      // Upload new avatar if one was selected
      if (newAvatarFile) {
        // Delete old avatar if exists
        if (originalProfileData?.avatarUrl) {
          const oldPath = originalProfileData.avatarUrl.split('/').pop();
          if (oldPath) {
            await supabase.storage.from('avatars').remove([oldPath]);
          }
        }

        // Upload new avatar
        const fileExt = newAvatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, newAvatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalAvatarUrl = publicUrl;
      } else if (profileData.avatarUrl === null && originalProfileData?.avatarUrl) {
        // Avatar was deleted
        const oldPath = originalProfileData.avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }

      // Update profile with all changes
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profileData.username,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          gender: profileData.gender,
          country: profileData.country,
          avatar_url: finalAvatarUrl,
        }, { onConflict: 'id' });

      if (updateError) {
        // Check for duplicate username error
        if (updateError.code === '23505' || updateError.message.includes('duplicate') || updateError.message.includes('unique')) {
          throw new Error('This username is already taken. Please choose another username.');
        }
        throw updateError;
      }

      // Update state with saved data
      const savedData = {
        ...profileData,
        avatarUrl: finalAvatarUrl,
      };
      setProfileData(savedData);
      setOriginalProfileData(savedData);
      setNewAvatarFile(null);
      setNewAvatarPreview(null);
      setIsEditMode(false);
      setSuccess(true);
      // Clear session storage after successful save
      sessionStorage.removeItem(PROFILE_EDIT_STORAGE_KEY);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setDeletingAccount(true);
    setError('');

    try {
      // 1. Delete all generated assets from storage
      const { data: generatedAssets } = await supabase
        .from('generated_assets')
        .select('image_url')
        .eq('user_id', user.id);
      
      if (generatedAssets && generatedAssets.length > 0) {
        const paths = generatedAssets.map(asset => asset.image_url);
        const { error: storageError } = await supabase.storage.from('generated_assets').remove(paths);
        if (storageError) {
          console.warn('Error deleting generated assets from storage:', storageError);
        }
      }

      // 2. Delete all collection assets from storage
      const { data: collectionAssets } = await supabase
        .from('asset_collection')
        .select('image_url')
        .eq('user_id', user.id);
      
      if (collectionAssets && collectionAssets.length > 0) {
        const paths = collectionAssets.map(asset => asset.image_url);
        const { error: storageError } = await supabase.storage.from('Asset_Collection').remove(paths);
        if (storageError) {
          console.warn('Error deleting collection assets from storage:', storageError);
        }
      }

      // 3. Delete style scene collections (if any)
      try {
        const { data: styleSceneFiles } = await supabase.storage
          .from('style_scene_collections')
          .list(user.id, { limit: 1000 });
        
        if (styleSceneFiles && styleSceneFiles.length > 0) {
          const paths = styleSceneFiles.map(file => `${user.id}/${file.name}`);
          await supabase.storage.from('style_scene_collections').remove(paths);
        }
      } catch (err) {
        console.warn('Error deleting style scene collections:', err);
      }

      // 4. Delete catalog forged outputs (if any)
      try {
        const { data: catalogFiles } = await supabase.storage
          .from('catalog_forged_outputs')
          .list(user.id, { limit: 1000 });
        
        if (catalogFiles && catalogFiles.length > 0) {
          const paths = catalogFiles.map(file => `${user.id}/${file.name}`);
          await supabase.storage.from('catalog_forged_outputs').remove(paths);
        }
      } catch (err) {
        console.warn('Error deleting catalog forged outputs:', err);
      }

      // 5. Delete avatar from storage if exists
      if (profileData.avatarUrl) {
        const oldPath = profileData.avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }

      // 6. Try to use the database function first (if it exists)
      const { error: functionError } = await supabase.rpc('delete_user_account', {
        user_id_to_delete: user.id
      });

      if (functionError) {
        // Fallback: Delete records manually if function doesn't exist or fails
        console.warn('Database function not available, deleting manually:', functionError);
        
        await supabase.from('generated_assets').delete().eq('user_id', user.id);
        await supabase.from('asset_collection').delete().eq('user_id', user.id);
        await supabase.from('profiles').delete().eq('id', user.id);
      }

      // 7. Delete the auth user via Edge Function
      try {
        const { data: deleteAuthData, error: deleteAuthError } = await supabase.functions.invoke('-delete-auth-user', {
          body: { userId: user.id }
        });

        if (deleteAuthError) {
          console.warn('Error deleting auth user via Edge Function:', deleteAuthError);
          // Continue with sign out even if Edge Function fails
        }
      } catch (err) {
        console.warn('Edge Function not available or failed:', err);
        // Continue with sign out even if Edge Function fails
      }

      // 8. Sign out the user
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }

      // 9. Navigate to landing page
      navigate(PATHS.LANDING, { replace: true });
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Failed to delete account. Please try again or contact support.');
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-200">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-sky-500 dark:border-sky-400 border-t-transparent rounded-full animate-spin transition-all duration-300 ease-linear"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      {showCropper && imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      <main className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-10 lg:p-12 border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-200">
        {/* Restore Unsaved Changes Prompt */}
        {showRestorePrompt && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Unsaved Changes Detected</h3>
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  You have unsaved changes from a previous session. Would you like to restore them?
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  type="button"
                  onClick={handleRestoreEdits}
                  className="px-4 py-2 text-xs font-semibold bg-yellow-600 dark:bg-yellow-700 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors"
                >
                  Restore
                </button>
                <button
                  type="button"
                  onClick={handleDiscardEdits}
                  className="px-4 py-2 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Profile</h1>
          {!isEditMode && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEditClick(e);
              }}
              className="px-6 py-2.5 bg-sky-600 text-white font-semibold rounded-lg shadow-lg hover:bg-sky-700 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSaveChanges}>
          {/* Avatar Section - Centered and Big */}
          {isEditMode && (
            <div className="flex flex-col items-center mb-12">
              <div className="relative mb-6">
                {(newAvatarPreview || profileData.avatarUrl) ? (
                  <img
                    src={newAvatarPreview || profileData.avatarUrl || ''}
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
                {isEditMode && (
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
                )}
              </div>
              <div className="flex gap-3">
                <label className="px-6 py-2.5 bg-sky-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-sky-700 transition-colors shadow-lg">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar || !isEditMode}
                  />
                  Upload New
                </label>
                {(newAvatarPreview || profileData.avatarUrl) && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    disabled={uploadingAvatar || !isEditMode}
                    className="px-6 py-2.5 bg-red-500 text-white font-semibold rounded-lg cursor-pointer hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete avatar
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Avatar Display (Read-only mode) */}
          {!isEditMode && (
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
              </div>
            </div>
          )}

          {/* Form Fields - Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* First Name */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditMode}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                    isEditMode 
                      ? 'border-gray-200 focus:outline-none focus:border-sky-500 bg-gray-50' 
                      : 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  required
                />
              </div>

              {/* Email - Non-editable */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => isEditMode && handleInputChange('gender', 'Male')}
                    disabled={!isEditMode}
                    className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                      !isEditMode 
                        ? 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60'
                        : profileData.gender === 'Male'
                        ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 mb-2 ${profileData.gender === 'Male' ? 'text-sky-600 dark:text-sky-400' : 'text-sky-600 dark:text-sky-400'}`}>
                      <MaleIcon />
                    </div>
                    <span className={`font-semibold ${profileData.gender === 'Male' ? 'text-gray-800 dark:text-white' : 'text-gray-800 dark:text-gray-300'}`}>Male</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => isEditMode && handleInputChange('gender', 'Female')}
                    disabled={!isEditMode}
                    className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                      !isEditMode 
                        ? 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60'
                        : profileData.gender === 'Female'
                        ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 mb-2 ${profileData.gender === 'Female' ? 'text-sky-600 dark:text-sky-400' : 'text-sky-600 dark:text-sky-400'}`}>
                      <FemaleIcon />
                    </div>
                    <span className={`font-semibold ${profileData.gender === 'Female' ? 'text-gray-800 dark:text-white' : 'text-gray-800 dark:text-gray-300'}`}>Female</span>
                  </button>
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={profileData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  disabled={!isEditMode}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                    isEditMode 
                      ? 'border-gray-200 focus:outline-none focus:border-sky-500 bg-gray-50' 
                      : 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  placeholder="Enter your country"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Last Name */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditMode}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                    isEditMode 
                      ? 'border-gray-200 focus:outline-none focus:border-sky-500 bg-gray-50' 
                      : 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  required
                />
              </div>

              {/* Username - Editable */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  disabled={!isEditMode}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                    isEditMode 
                      ? 'border-gray-200 dark:border-gray-600 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white' 
                      : 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  placeholder="Enter your username"
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[a-zA-Z0-9_]+"
                  title="Username must be 3-30 characters and contain only letters, numbers, and underscores"
                />
                {isEditMode && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    3-30 characters, letters, numbers, and underscores only
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-600 dark:text-green-400 text-sm">Changes saved successfully!</p>
            </div>
          )}

          {/* Save Changes and Cancel Buttons */}
          {isEditMode && (
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving || uploadingAvatar}
                className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploadingAvatar || !hasChanges()}
                className="px-8 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>

        {/* Delete Account Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete account</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                No longer want to use our service? Delete your account here. This action is not reversible. All information related to this account will be deleted permanently. If you have an active subscription, please cancel it before deleting your account.
              </p>
            </div>
            <div className="flex-shrink-0">
              {showDeleteConfirm ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-red-600 font-semibold mb-2">Are you sure? This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingAccount ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deletingAccount}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete my account
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;

