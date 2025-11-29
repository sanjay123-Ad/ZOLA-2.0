import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  radius: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
}) => {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, radius: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [verticalPosition, setVerticalPosition] = useState(0); // -100 to 100, controls vertical offset
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize crop area when image loads
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      setContainerSize({ width: containerWidth, height: containerHeight });

      // Calculate image display size (maintaining aspect ratio)
      const imgAspect = img.width / img.height;
      let displayWidth = img.width;
      let displayHeight = img.height;
      
      // Fit image to container
      if (displayWidth > containerWidth) {
        displayWidth = containerWidth;
        displayHeight = displayWidth / imgAspect;
      }
      if (displayHeight > containerHeight) {
        displayHeight = containerHeight;
        displayWidth = displayHeight * imgAspect;
      }

      setImageSize({ width: displayWidth, height: displayHeight });
      
      // Initialize crop area (centered)
      const cropRadius = Math.min(displayWidth, displayHeight) * 0.35;
      
      setCropArea({
        x: containerWidth / 2,
        y: containerHeight / 2,
        radius: cropRadius,
      });

      // Center image (accounting for initial zoom)
      const scaledWidth = displayWidth * zoom;
      const scaledHeight = displayHeight * zoom;
      const initialX = (containerWidth - scaledWidth) / 2;
      const initialY = (containerHeight - scaledHeight) / 2;
      setImagePosition({
        x: initialX,
        y: initialY,
      });
      setVerticalPosition(0); // Reset vertical position
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, isResize: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isResize) {
      // Check if click is near the resize handle (on the circle edge, top)
      const distance = getDistance(mouseX, mouseY, cropArea.x, cropArea.y - cropArea.radius);
      if (distance < 25) {
        setIsResizing(true);
        setDragStart({ x: mouseX, y: mouseY });
      }
    } else {
      // Check if click is inside the circle
      const distance = getDistance(mouseX, mouseY, cropArea.x, cropArea.y);
      if (distance <= cropArea.radius) {
        setIsDragging(true);
        setDragStart({
          x: mouseX - cropArea.x,
          y: mouseY - cropArea.y,
        });
      }
    }
  }, [cropArea]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging && !isResizing) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      // Move crop area
      let newX = mouseX - dragStart.x;
      let newY = mouseY - dragStart.y;

      // Keep circle within container bounds
      const minX = cropArea.radius;
      const maxX = containerSize.width - cropArea.radius;
      const minY = cropArea.radius;
      const maxY = containerSize.height - cropArea.radius;

      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));

      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing) {
      // Resize crop area from center
      const centerX = cropArea.x;
      const centerY = cropArea.y;
      const distance = getDistance(mouseX, mouseY, centerX, centerY);
      
      const maxRadius = Math.min(
        Math.min(centerX, containerSize.width - centerX),
        Math.min(centerY, containerSize.height - centerY)
      );
      
      const newRadius = Math.max(60, Math.min(distance, maxRadius));
      setCropArea(prev => ({ ...prev, radius: newRadius }));
    }
  }, [isDragging, isResizing, dragStart, cropArea, containerSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent, isResize: boolean) => {
    e.preventDefault();
    const touch = e.touches[0];
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    if (isResize) {
      const distance = getDistance(touchX, touchY, cropArea.x, cropArea.y - cropArea.radius);
      if (distance < 30) {
        setIsResizing(true);
        setDragStart({ x: touchX, y: touchY });
      }
    } else {
      const distance = getDistance(touchX, touchY, cropArea.x, cropArea.y);
      if (distance <= cropArea.radius) {
        setIsDragging(true);
        setDragStart({
          x: touchX - cropArea.x,
          y: touchY - cropArea.y,
        });
      }
    }
  }, [cropArea]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging && !isResizing) return;
    
    const touch = e.touches[0];
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    if (isDragging) {
      let newX = touchX - dragStart.x;
      let newY = touchY - dragStart.y;

      const minX = cropArea.radius;
      const maxX = containerSize.width - cropArea.radius;
      const minY = cropArea.radius;
      const maxY = containerSize.height - cropArea.radius;

      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));

      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing) {
      const centerX = cropArea.x;
      const centerY = cropArea.y;
      const distance = getDistance(touchX, touchY, centerX, centerY);
      
      const maxRadius = Math.min(
        Math.min(centerX, containerSize.width - centerX),
        Math.min(centerY, containerSize.height - centerY)
      );
      
      const newRadius = Math.max(60, Math.min(distance, maxRadius));
      setCropArea(prev => ({ ...prev, radius: newRadius }));
    }
  }, [isDragging, isResizing, dragStart, cropArea, containerSize]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove as EventListener);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const getCroppedImage = useCallback(async () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise<File>((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate actual crop coordinates on original image
        // The zoom is visual only, we calculate based on the actual image size
        const scaleX = img.width / imageSize.width;
        const scaleY = img.height / imageSize.height;
        
        // Calculate crop area relative to image position
        const cropXInContainer = cropArea.x - cropArea.radius;
        const cropYInContainer = cropArea.y - cropArea.radius;
        const cropXInImage = (cropXInContainer - imagePosition.x) * scaleX;
        const cropYInImage = (cropYInContainer - imagePosition.y) * scaleY;
        const cropSize = cropArea.radius * 2 * scaleX;

        // Create circular crop
        const size = cropSize;
        canvas.width = size;
        canvas.height = size;

        // Draw circular image
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        
        ctx.drawImage(
          img,
          cropXInImage, cropYInImage, cropSize, cropSize,
          0, 0, size, size
        );
        
        ctx.restore();

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          const file = new File([blob], 'cropped-avatar.png', { type: 'image/png' });
          resolve(file);
        }, 'image/png', 0.95);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageSrc;
    });
  }, [imageSrc, cropArea, imageSize, imagePosition]);

  const handleCrop = async () => {
    try {
      const croppedFile = await getCroppedImage();
      onCropComplete(croppedFile);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    }
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
    
    // Update vertical position when zoom changes to maintain relative position
    const container = containerRef.current;
    if (!container || imageSize.height === 0 || containerSize.height === 0) return;
    
    const scaledHeight = imageSize.height * newZoom;
    const scaledWidth = imageSize.width * newZoom;
    
    // Calculate how much the image can move
    const maxVerticalMovement = Math.max(0, scaledHeight - containerSize.height);
    
    // Apply the same vertical position offset
    const offset = -(verticalPosition / 100) * (maxVerticalMovement / 2);
    
    // Base position (centered)
    const baseY = (containerSize.height - scaledHeight) / 2;
    const baseX = (containerSize.width - scaledWidth) / 2;
    
    setImagePosition({
      x: baseX,
      y: baseY + offset,
    });
  };

  const handleVerticalPositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = parseFloat(e.target.value);
    setVerticalPosition(newPosition);
    
    // Calculate vertical offset based on slider value (-100 to 100)
    // -100 = move image all the way up, 0 = center, 100 = move image all the way down
    if (imageSize.height === 0 || containerSize.height === 0) return;
    
    const scaledHeight = imageSize.height * zoom;
    const scaledWidth = imageSize.width * zoom;
    
    // Calculate how much the image can move (difference between scaled size and container)
    const maxVerticalMovement = Math.max(0, scaledHeight - containerSize.height);
    
    // Calculate offset: -100 moves up (negative Y), 100 moves down (positive Y)
    // When slider is at -100, image moves up (smaller Y value)
    // When slider is at 100, image moves down (larger Y value)
    const offset = -(newPosition / 100) * (maxVerticalMovement / 2);
    
    // Base position (centered when zoomed)
    const baseY = (containerSize.height - scaledHeight) / 2;
    const baseX = (containerSize.width - scaledWidth) / 2;
    
    // Apply the offset - negative offset moves image up, positive moves down
    const newY = baseY + offset;
    
    setImagePosition({
      x: baseX,
      y: newY,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-5xl w-full mx-4 max-h-[95vh] overflow-hidden flex flex-col border border-sky-100">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-headline mb-2">
            Choose Your Profile Photo
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Adjust the circular crop area</p>
        </div>

        {/* Image Container with Vertical Slider */}
        <div className="flex-1 min-h-0 mb-6 flex gap-4">
          <div className="flex-1 relative">
            <div
              ref={containerRef}
              className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden"
              style={{ minHeight: '400px', height: '100%' }}
            >
            <div
              className="absolute"
              style={{
                left: `${imagePosition.x}px`,
                top: `${imagePosition.y}px`,
                width: `${imageSize.width}px`,
                height: `${imageSize.height}px`,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
              }}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
            
            {/* Dark overlay with circular cutout */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${cropArea.x}px ${cropArea.y}px, transparent ${cropArea.radius}px, rgba(0, 0, 0, 0.75) ${cropArea.radius}px)`,
              }}
            />
            
            {/* Circular crop border */}
            <div
              className="absolute cursor-move"
              style={{
                left: `${cropArea.x - cropArea.radius}px`,
                top: `${cropArea.y - cropArea.radius}px`,
                width: `${cropArea.radius * 2}px`,
                height: `${cropArea.radius * 2}px`,
                borderRadius: '50%',
                border: '2px solid',
                borderColor: '#0ea5e9',
                boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 30px rgba(14, 165, 233, 0.5)',
                pointerEvents: 'all',
              }}
              onMouseDown={(e) => handleMouseDown(e, false)}
              onTouchStart={(e) => handleTouchStart(e, false)}
            >
              {/* Resize handle at the top */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full border-white cursor-ns-resize shadow-2xl hover:scale-110 transition-transform touch-none z-10 flex items-center justify-center"
                style={{
                  boxShadow: '0 4px 20px rgba(14, 165, 233, 0.6), 0 0 0 3px rgba(255, 255, 255, 0.9)',
                  borderWidth: '3px',
                  borderStyle: 'solid',
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e, true);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleTouchStart(e, true);
                }}
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              
              {/* Grid lines (crosshair) */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30" />
              </div>
            </div>
          </div>
          </div>
          
          {/* Vertical Position Slider (Right Side) */}
          <div className="flex flex-col items-center gap-3 py-4 w-16">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <div className="relative flex-1 flex items-center justify-center" style={{ minHeight: '300px' }}>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={verticalPosition}
                onChange={handleVerticalPositionChange}
                className="vertical-slider"
                style={{
                  width: '300px',
                  height: '6px',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center',
                  background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${((verticalPosition + 100) / 200) * 100}%, #e5e7eb ${((verticalPosition + 100) / 200) * 100}%, #e5e7eb 100%)`,
                  borderRadius: '6px',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                }}
              />
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Horizontal Zoom Slider */}
        <div className="mb-6 px-4">
          <div className="flex items-center gap-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={handleZoomChange}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${((zoom - 0.5) / 2.5) * 100}%, #e5e7eb ${((zoom - 0.5) / 2.5) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all shadow-md hover:shadow-lg"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleCrop}
            className="px-8 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg shadow-sky-200/50 hover:shadow-sky-300/50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
