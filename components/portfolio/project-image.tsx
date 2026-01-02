'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface ProjectImageProps {
  src: string
  fallbackSrc: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  unoptimized?: boolean
}

export function ProjectImage({ 
  src, 
  fallbackSrc, 
  alt, 
  fill = true, 
  className, 
  sizes, 
  unoptimized 
}: ProjectImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(false)
      setHasError(false)
    }, 100)
  }, [src])

  const handleError = () => {
    setHasError(true)
    setTimeout(() => {
      setIsLoaded(false)
    }, 100)
  }

  const handleLoad = () => {
    setTimeout(() => {
      setIsLoaded(true)
    }, 100)
  }

  const shouldShowMainImage = src !== fallbackSrc && !hasError

  return (
    <>
      <Image
        src={fallbackSrc}
        alt={alt}
        fill={fill}
        className={`${className || ''} object-cover object-center`}
        sizes={sizes}
        unoptimized={unoptimized}
        priority={false}
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      {shouldShowMainImage && (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          className={`${className || ''} object-cover object-center transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          sizes={sizes}
          unoptimized={unoptimized}
          onError={handleError}
          onLoad={handleLoad}
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      )}
    </>
  )
}

