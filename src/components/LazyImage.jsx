import React, { useState, useEffect, useRef } from "react";

/**
 * Componente de imagem com lazy loading e blur placeholder
 * Otimizado para performance e Core Web Vitals
 */
const LazyImage = React.memo(({ 
  src, 
  alt = "", 
  className = "",
  placeholderClassName = "",
  onLoad,
  onError,
  loading = "lazy",
  objectFit = "cover",
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Reset ao mudar a imagem
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  }[objectFit] || 'object-cover';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder blur enquanto carrega */}
      {!isLoaded && !hasError && (
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse ${placeholderClassName}`}
          aria-hidden="true"
        />
      )}
      
      {/* Imagem principal */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        className={`w-full h-full ${objectFitClass} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* Fallback de erro */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <span className="text-slate-400 text-sm">Imagem não disponível</span>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = "LazyImage";

export default LazyImage;
