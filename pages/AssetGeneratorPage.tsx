import React, { useState, useEffect } from 'react';
import { User, ImageFile, ExtractedAsset, AssetCategory } from '../types';
import { saveImage, getImage, deleteImage } from '../services/imageStore';
import { saveState, loadState, removeState } from '../services/stateStore';
import ImageUploader from '../components/ImageUploader';
import { GarmentIcon, DownloadIcon, MaleIcon, FemaleIcon, SaveIcon } from '../components/icons';
import { extractAssetsFromImage, composeOutfit } from '../services/assetGeneratorService';
import { detectGender } from '../services/virtualTryOnService';
import Spinner from '../components/Spinner';

// --- Types ---
interface AssetGeneratorPageProps {
  user: User;
  onSaveToCollection: (data: { imageUrl: string, asset_type: 'individual' | 'composed', item_name: string, item_category: string }) => void;
}
type ExtractionScope = 'full' | 'upper' | 'lower';
type View = 'setup' | 'loading' | 'results';

// --- Helper Functions ---
const dataUrlToImageFile = (dataUrl: string): ImageFile => {
    if (!dataUrl) return null;
    const parts = dataUrl.split(',');
    const mimeTypePart = parts[0].match(/:(.*?);/);
    if (!mimeTypePart || parts.length < 2 || !parts[1]) {
        console.error("Invalid data URL format");
        return null;
    }
    return { dataUrl: dataUrl, base64: parts[1], mimeType: mimeTypePart[1] };
};

// --- Sub-components for Different Views ---

const LoadingView: React.FC<{ type: 'assets' | 'composition' }> = ({ type }) => (
  <div className="text-center py-16">
    <div className="flex justify-center items-center"><Spinner /></div>
    <p className="mt-4 text-lg text-gray-600 animate-pulse">
      {type === 'assets' ? 'Extracting e-commerce assets...' : 'Composing your outfit...'}
    </p>
    <p className="text-sm text-gray-500 mt-1">Target speed: 15-20 seconds.</p>
  </div>
);

const ResultsView: React.FC<{
  generatedAssets: ExtractedAsset[];
  composedOutfitImage: string | null;
  onCompose: () => void;
  onStartOver: () => void;
  isComposing: boolean;
  onSaveToCollection: (data: { imageUrl: string, asset_type: 'individual' | 'composed', item_name: string, item_category: string }) => void;
  savedAssetIds: Set<string>;
}> = ({ generatedAssets, composedOutfitImage, onCompose, onStartOver, isComposing, onSaveToCollection, savedAssetIds }) => {

  const handleDownload = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasUpperBody = generatedAssets.some(a => a.category === 'Upper Body');
  const hasLowerBody = generatedAssets.some(a => a.category === 'Lower Body');

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Generated Assets</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {generatedAssets.map(asset => {
          const mainView = asset.views.find(v => v.viewType === 'Front');
          if (!mainView) return null;
          const assetId = `${asset.category}-${asset.itemName}`;
          const isSaved = savedAssetIds.has(assetId);

          return (
            <div key={assetId} className="flex flex-col">
              <div className="relative group aspect-[4/5] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <img src={`data:image/png;base64,${mainView.imageBase64}`} alt={asset.itemName} className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-2">
                    <button
                      onClick={() => !isSaved && onSaveToCollection({ 
                        imageUrl: `data:image/png;base64,${mainView.imageBase64}`,
                        asset_type: 'individual',
                        item_name: asset.itemName,
                        item_category: asset.category
                      })}
                      disabled={isSaved}
                      className="w-full flex items-center justify-center px-3 py-2 bg-white/90 text-sm text-sky-600 border border-sky-600 font-semibold rounded-full shadow-sm hover:bg-sky-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                    >
                      <div className="w-4 h-4 mr-2"><SaveIcon /></div>
                      {isSaved ? '✓ Saved' : 'Save'}
                    </button>
                    <button
                      onClick={() => handleDownload(mainView.imageBase64, asset.itemName.replace(/\s+/g, '_'))}
                      className="w-full flex items-center justify-center px-3 py-2 bg-white/90 text-gray-700 text-sm font-semibold rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <DownloadIcon /> Download
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm font-semibold text-gray-700 text-center truncate" title={asset.itemName}>{asset.itemName}</p>
              <p className="text-xs text-gray-500 text-center">{asset.category}</p>
            </div>
          );
        })}
      </div>

      {(hasUpperBody && hasLowerBody && !composedOutfitImage) && (
        <div className="text-center mt-10">
          <button
            onClick={onCompose}
            disabled={isComposing}
            className="px-8 py-3 bg-[#2E1E1E] text-white font-semibold rounded-full shadow-md hover:bg-black transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
          >
            {isComposing ? <Spinner /> : 'Compose an Outfit'}
          </button>
        </div>
      )}

      {isComposing && <LoadingView type="composition" />}

      {composedOutfitImage && (
        <div className="mt-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Composed Outfit</h2>
          <div className="flex justify-center">
            <div className="relative group max-w-sm w-full">
              <img src={composedOutfitImage} alt="Composed Outfit" className="rounded-xl shadow-lg border" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <button
                      onClick={() => !savedAssetIds.has('composed') && onSaveToCollection({ 
                        imageUrl: composedOutfitImage,
                        asset_type: 'composed',
                        item_name: 'Composed Outfit',
                        item_category: 'Full Outfit'
                      })}
                      disabled={savedAssetIds.has('composed')}
                      className="px-6 py-3 bg-white/90 text-sky-600 border border-sky-600 font-semibold rounded-full shadow-lg hover:bg-sky-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                  >
                      {savedAssetIds.has('composed') ? '✓ Saved!' : 'Save Composed Outfit'}
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center mt-12 pt-6 border-t border-gray-200">
        <button onClick={onStartOver} className="text-sky-600 hover:text-sky-700 font-semibold">
          Start Over With a New Image
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const AssetGeneratorPage: React.FC<AssetGeneratorPageProps> = ({ user, onSaveToCollection }) => {
  const [view, setView] = useState<View>('setup');
  const [gender, setGender] = useState<'Male' | 'Female' | null>(null);
  const [sourceImage, setSourceImage] = useState<ImageFile>(null);
  const [extractionScope, setExtractionScope] = useState<ExtractionScope>('full');
  const [generatedAssets, setGeneratedAssets] = useState<ExtractedAsset[]>([]);
  const [composedOutfitImage, setComposedOutfitImage] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAssetIds, setSavedAssetIds] = useState<Set<string>>(new Set());
  const [isStateRestored, setIsStateRestored] = useState(false);
  const [genderWarning, setGenderWarning] = useState<string | null>(null);
  const [isValidatingGender, setIsValidatingGender] = useState(false);

  // User-specific storage keys
  const SESSION_STORAGE_KEY = `assetGeneratorState_${user.id}`;
  const SOURCE_IMAGE_KEY = `asset-generator-source-image_${user.id}`;

  // Load state from session on mount
  useEffect(() => {
    let isMounted = true;
    const initializeState = async () => {
        let bridged = false;
        try {
            const bridgedDataUrl = sessionStorage.getItem('bridge_image_to_asset_generator');
            if (bridgedDataUrl) {
                bridged = true;
                sessionStorage.removeItem('bridge_image_to_asset_generator');
                removeState(SESSION_STORAGE_KEY);
                await deleteImage(SOURCE_IMAGE_KEY);
                const imageFile = dataUrlToImageFile(bridgedDataUrl);
                if (imageFile && isMounted) {
                    setSourceImage(imageFile);
                    setGender(null);
                    setExtractionScope('full');
                    setGeneratedAssets([]);
                    setComposedOutfitImage(null);
                    setSavedAssetIds(new Set());
                    setView('setup');
                }
            }

            if (bridged) {
                if (isMounted) {
                    setIsStateRestored(true);
                }
                return;
            }

            const savedState = loadState<any>(SESSION_STORAGE_KEY);
            if (savedState) {
                const storedImage = savedState.sourceImageKey ? await getImage(savedState.sourceImageKey) : null;

                if (!isMounted) return;

                if (storedImage) {
                    setSourceImage(storedImage);
                } else {
                    setSourceImage(null);
                }

                if (savedState.view === 'results') {
                    setGender(savedState.gender ?? null);
                    setGeneratedAssets(savedState.generatedAssets || []);
                    setComposedOutfitImage(savedState.composedOutfitImage || null);
                    setSavedAssetIds(new Set(savedState.savedAssetIds || []));
                    setView('results');
                } else {
                    if (savedState.gender) setGender(savedState.gender);
                    if (savedState.extractionScope) setExtractionScope(savedState.extractionScope as ExtractionScope);
                    setView('setup');
                }
            }

        } catch (error) {
            console.error("Failed to load state", error);
            removeState(SESSION_STORAGE_KEY);
            await deleteImage(SOURCE_IMAGE_KEY);
        } finally {
            if (isMounted) {
                setIsStateRestored(true);
            }
        }
    };

    initializeState();

    return () => {
        isMounted = false;
    };
  }, [user.id, SESSION_STORAGE_KEY, SOURCE_IMAGE_KEY]);

  // Save state before page unload/navigation
  useEffect(() => {
    if (!isStateRestored) return;

    const handleBeforeUnload = () => {
      let stateToSave: any;
      if (view === 'results') {
        stateToSave = {
          view: 'results',
          gender,
          sourceImageKey: sourceImage ? SOURCE_IMAGE_KEY : null,
          generatedAssets,
          composedOutfitImage,
          savedAssetIds: Array.from(savedAssetIds),
        };
      } else {
        stateToSave = {
          view: 'setup',
          gender,
          sourceImageKey: sourceImage ? SOURCE_IMAGE_KEY : null,
          extractionScope,
        };
      }
      saveState(SESSION_STORAGE_KEY, stateToSave);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isStateRestored, view, gender, sourceImage, extractionScope, generatedAssets, composedOutfitImage, savedAssetIds, user.id, SOURCE_IMAGE_KEY]);

  // Save state on change
  useEffect(() => {
    if (!isStateRestored) return;

    const saveCurrentState = async () => {
        try {
            let stateToSave: any;
            if (view === 'results') {
                stateToSave = {
                    view: 'results',
                    gender,
                    sourceImageKey: sourceImage ? SOURCE_IMAGE_KEY : null,
                    generatedAssets,
                    composedOutfitImage,
                    savedAssetIds: Array.from(savedAssetIds),
                };
            } else { // setup view
                if (sourceImage) await saveImage(SOURCE_IMAGE_KEY, sourceImage);
                else await deleteImage(SOURCE_IMAGE_KEY);
                stateToSave = {
                    view: 'setup',
                    gender,
                    sourceImageKey: sourceImage ? SOURCE_IMAGE_KEY : null,
                    extractionScope,
                };
            }
            saveState(SESSION_STORAGE_KEY, stateToSave);
        } catch (error) {
            console.error("Failed to save state", error);
        }
    };
    saveCurrentState();
  }, [gender, sourceImage, extractionScope, view, generatedAssets, composedOutfitImage, savedAssetIds, user.id, SOURCE_IMAGE_KEY, isStateRestored]);


  const handleImageUpload = async (file: ImageFile) => {
    setSourceImage(file);
    setGenderWarning(null);
  };

  // Validate gender when image is uploaded
  useEffect(() => {
    const validateGender = async () => {
      if (!gender || !sourceImage) {
        setGenderWarning(null);
        return;
      }

      setIsValidatingGender(true);
      try {
        const detectedGender = await detectGender(sourceImage, user.id);
        if (detectedGender !== 'Unknown' && detectedGender !== gender) {
          setGenderWarning(`Warning: Your selected gender is '${gender}', but the photo appears to be of a '${detectedGender}' person. Please correct the selection or upload a different image.`);
        } else {
          setGenderWarning(null);
        }
      } catch (err) {
        console.error("Gender detection failed:", err);
        setGenderWarning(null); // Fail open, don't block user on API error
      } finally {
        setIsValidatingGender(false);
      }
    };

    validateGender();
  }, [gender, sourceImage]);

  const handleSetGender = (selectedGender: 'Male' | 'Female') => {
    setGender(selectedGender);
    setGenderWarning(null); // Clear any previous warnings
    // For women, lock the scope to 'full'. For men, default to 'full' but allow changes via UI.
    setExtractionScope('full');
  };

  const handleGenerate = async () => {
    if (!gender || !sourceImage) {
      setError('Please select a gender and upload an image.');
      return;
    }
    setView('loading');
    setError(null);
    try {
      const assets = await extractAssetsFromImage(sourceImage, extractionScope, gender, user.id);
      setGeneratedAssets(assets);
      setView('results');
    } catch (err) {
      setError((err as Error).message);
      setView('setup');
    }
  };

  const handleCompose = async () => {
    const upperAsset = generatedAssets.find(a => a.category === 'Upper Body');
    const lowerAsset = generatedAssets.find(a => a.category === 'Lower Body');
    if (!upperAsset || !lowerAsset || !gender) {
        setError("Both upper and lower body assets are needed to compose an outfit.");
        return;
    }
    setIsComposing(true);
    setError(null);
    try {
        const upperFile = dataUrlToImageFile(`data:image/png;base64,${upperAsset.views[0].imageBase64}`);
        const lowerFile = dataUrlToImageFile(`data:image/png;base64,${lowerAsset.views[0].imageBase64}`);
        const resultBase64 = await composeOutfit(upperFile, lowerFile, gender, user.id);
        setComposedOutfitImage(`data:image/png;base64,${resultBase64}`);
    } catch (err) {
        setError((err as Error).message);
    } finally {
        setIsComposing(false);
    }
  };

  const handleSaveWrapper = (data: { imageUrl: string, asset_type: 'individual' | 'composed', item_name: string, item_category: string }) => {
    onSaveToCollection(data);
    const assetId = data.asset_type === 'composed' ? 'composed' : `${data.item_category}-${data.item_name}`;
    setSavedAssetIds(prev => new Set(prev).add(assetId));
  };

  const handleStartOver = async () => {
    setView('setup');
    setGender(null);
    setSourceImage(null);
    setExtractionScope('full');
    setGeneratedAssets([]);
    setComposedOutfitImage(null);
    setError(null);
    setSavedAssetIds(new Set());
    await deleteImage(SOURCE_IMAGE_KEY);
    removeState(SESSION_STORAGE_KEY);
  };
  
  const isGenerateDisabled = !gender || !sourceImage || !!genderWarning;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-200">
      <main className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-200">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#2E1E1E] dark:text-white font-headline">E-commerce Asset Generator</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Turn lifestyle shots into ghost mannequin assets.</p>
        </div>

        {view === 'setup' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
             <div className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-300 dark:border-sky-500 p-4 rounded-r-lg mb-8">
                <h3 className="font-bold text-sky-600 dark:text-sky-400">Instructions for a Perfect Extraction:</h3>
                <p className="text-[#2E1E1E]/80 dark:text-gray-300 text-sm mt-1">
                    Provide a lifestyle photo where the garment is clearly visible on a person. The AI will isolate it for you.
                </p>
            </div>
            {/* Step 1: Gender */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4"><span className="text-white bg-sky-600 dark:bg-sky-500 rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-3">1</span>Select Subject's Gender</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleSetGender('Male')} className={`flex flex-col items-center p-6 border-2 rounded-2xl transition-colors ${gender === 'Male' ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                  <span className="w-10 h-10 mb-2 text-sky-600 dark:text-sky-400"><MaleIcon/></span>
                  <span className="font-semibold text-gray-800 dark:text-white">Male</span>
                </button>
                <button onClick={() => handleSetGender('Female')} className={`flex flex-col items-center p-6 border-2 rounded-2xl transition-colors ${gender === 'Female' ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                  <span className="w-10 h-10 mb-2 text-sky-600 dark:text-sky-400"><FemaleIcon/></span>
                  <span className="font-semibold text-gray-800 dark:text-white">Female</span>
                </button>
              </div>
            </div>
            {/* Step 2: Image - Only show after gender is selected */}
            {gender && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4"><span className="text-white bg-sky-600 dark:bg-sky-500 rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-3">2</span>Upload Lifestyle Photo</h3>
                <div className="max-w-md mx-auto">
                  <ImageUploader id="source-image" title="Upload Photo" onImageUpload={handleImageUpload} icon={<GarmentIcon/>} currentFile={sourceImage} />
                  {isValidatingGender && (
                    <div className="mt-6 flex flex-col items-center justify-center">
                      <div className="flex justify-center">
                        <Spinner />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Analyzing image with AI...</p>
                    </div>
                  )}
                  {!isValidatingGender && genderWarning && (
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-r-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">{genderWarning}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Step 3: Scope - Only show after image is uploaded and validation is complete */}
            {gender && sourceImage && !isValidatingGender && gender === 'Male' && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4"><span className="text-white bg-sky-600 dark:bg-sky-500 rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-3">3</span>Definition Extraction Scope</h3>
                    <div className="flex flex-col md:flex-row md:space-x-6 space-y-3 md:space-y-0">
                      <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                          <input type="radio" name="scope" value="upper" checked={extractionScope === 'upper'} onChange={() => setExtractionScope('upper')} className="h-5 w-5 rounded-full border-gray-300 dark:border-gray-600 text-sky-600 dark:text-sky-400 focus:ring-sky-600 dark:focus:ring-sky-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">Upper Body Only</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                          <input type="radio" name="scope" value="lower" checked={extractionScope === 'lower'} onChange={() => setExtractionScope('lower')} className="h-5 w-5 rounded-full border-gray-300 dark:border-gray-600 text-sky-600 dark:text-sky-400 focus:ring-sky-600 dark:focus:ring-sky-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">Lower Body Only</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                          <input type="radio" name="scope" value="full" checked={extractionScope === 'full'} onChange={() => setExtractionScope('full')} className="h-5 w-5 rounded-full border-gray-300 dark:border-gray-600 text-sky-600 dark:text-sky-400 focus:ring-sky-600 dark:focus:ring-sky-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">Both (Upper &amp; Lower)</span>
                      </label>
                    </div>
                </div>
            )}
            {gender && sourceImage && !isValidatingGender && gender === 'Female' && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4"><span className="text-white bg-sky-600 dark:bg-sky-500 rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-3">3</span>Definition Extraction Scope</h3>
                    <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <p className="font-medium text-gray-700 dark:text-gray-300">A full outfit will be generated for female garments.</p>
                    </div>
                </div>
            )}
            {/* Step 4: Generate - Only show after image is uploaded and validation is complete */}
            {gender && sourceImage && !isValidatingGender && (
              <div className="mt-10 text-center">
                <button onClick={handleGenerate} disabled={isGenerateDisabled} className="px-12 py-4 bg-sky-600 text-white font-semibold rounded-full shadow-lg hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Generate Assets
                </button>
                {isGenerateDisabled && genderWarning && (
                  <p className="mt-4 text-sm text-yellow-600 dark:text-yellow-400 font-medium">Please resolve the gender mismatch before generating assets.</p>
                )}
                {error && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}
              </div>
            )}
          </div>
        )}
        
        {view === 'loading' && <LoadingView type="assets" />}

        {view === 'results' && (
          <ResultsView
            generatedAssets={generatedAssets}
            composedOutfitImage={composedOutfitImage}
            onCompose={handleCompose}
            onStartOver={handleStartOver}
            isComposing={isComposing}
            onSaveToCollection={handleSaveWrapper}
            savedAssetIds={savedAssetIds}
          />
        )}
      </main>
      <footer className="text-center mt-8 text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} ZOLA AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AssetGeneratorPage;