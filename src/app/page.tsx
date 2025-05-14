'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';

interface HeartPosition {
  left: string;
  top: string;
  delay: string;
  duration: string;
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  alt: string;
}

const ImageModal = ({ isOpen, onClose, imageSrc, alt }: ImageModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-4xl hover:text-pink-400 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};

interface ImageData {
  src: string;
  alt: string;
}

export default function Home() {
  const [showMessage, setShowMessage] = useState(false);
  const [heartPositions, setHeartPositions] = useState<HeartPosition[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collageImages, setCollageImages] = useState<ImageData[]>([]);

  // Calculate age
  const birthYear = 2001;
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  // Fetch images for carousel
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/photos');
        const data = await response.json();
        setImages(data.images);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Fetch images for collage
  useEffect(() => {
    const fetchCollageImages = async () => {
      try {
        console.log('Fetching collage images...');
        const response = await fetch('/api/gf-photos');
        const data = await response.json();
        console.log('Received collage images:', data);
        setCollageImages(data.images);
      } catch (error) {
        console.error('Error fetching collage images:', error);
      }
    };

    fetchCollageImages();
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (isPaused || images.length === 0) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 500);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, images.length]);

  useEffect(() => {
    // Generate random positions for hearts
    const positions = Array.from({ length: 6 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${i * 0.5}s`,
      duration: `${3 + Math.random() * 2}s`
    }));
    setHeartPositions(positions);
  }, []);

  useEffect(() => {
    // Trigger confetti on page load
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
      setIsTransitioning(false);
    }, 500);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
      setIsTransitioning(false);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-pink-600 animate-pulse">Loading memories...</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-pink-600">No photos found in the photos directory</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center px-4 overflow-hidden">
        {/* Photo Collage Background */}
        <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 grid-rows-3 gap-1 sm:gap-2 p-1 sm:p-2">
          {collageImages.length > 0 ? (
            [...Array(12)].map((_, i) => {
              const imageIndex = i % collageImages.length;
              const image = collageImages[imageIndex];
              return (
                <div key={i} className="relative overflow-hidden rounded-lg aspect-square bg-gray-100">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-cover hover:scale-110 transition-transform duration-500 opacity-100"
                    priority={i < 4}
                    onError={(e) => {
                      console.error('Error loading image:', image.src);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              );
            })
          ) : (
            <div className="col-span-2 sm:col-span-3 md:col-span-4 row-span-3 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-lg mb-2">No photos found</p>
                <p className="text-sm">Add photos to the public/gf-photos directory</p>
              </div>
            </div>
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-100/80 to-purple-100/80 backdrop-blur-[2px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-200/20 via-transparent to-transparent animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-200/20 via-transparent to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Floating hearts */}
        <div className="absolute inset-0 pointer-events-none">
          {heartPositions.map((pos, i) => (
            <div
              key={i}
              className="absolute text-4xl"
              style={{
                left: pos.left,
                top: pos.top,
                animation: `float ${pos.duration} ease-in-out infinite`,
                animationDelay: pos.delay,
                transform: 'translateY(0)',
              }}
            >
              {['❤️', '💖', '💝', '💕', '💗', '💓'][i]}
            </div>
          ))}
        </div>

        <div className="relative space-y-6 z-10">
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-bold text-pink-600 animate-bounce">
              Happy {age}th Birthday!
            </h1>
            <div className="absolute -top-4 -right-5 text-4xl animate-spin-slow">🎂</div>
            <div className="absolute -bottom-4 -left-4 text-4xl animate-spin-slow">🎁</div>
          </div>

          <p className="text-2xl md:text-3xl text-purple-600 font-medium">
            To the most amazing girlfriend in the world
          </p>

          <button
            onClick={() => setShowMessage(!showMessage)}
            className="mt-8 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {showMessage ? 'Hide Message' : 'Click for a Special Message'}
          </button>

          {showMessage && (
            <div className="mt-8 p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl max-w-2xl mx-auto animate-fade-in border border-pink-200">
              <p className="text-lg text-gray-800 leading-relaxed">
                On this special day, I want to celebrate you and all the joy you bring to my life.
                Your smile brightens my darkest days, and your love makes every moment magical.
                Here&apos;s to many more beautiful memories together!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Carousel Section */}
      <section className="py-16 px-4">
        <h2 className="text-4xl font-bold text-center text-purple-600 mb-12">
          Our Beautiful Memories
        </h2>
        <div className="max-w-4xl mx-auto">
          <div
            className="relative h-[400px] rounded-xl overflow-hidden shadow-xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Main Image */}
            <div
              className="relative w-full h-full cursor-pointer"
              onClick={() => setSelectedImage(images[currentSlide].src)}
            >
              <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isTransitioning ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
                }`}>
                <Image
                  src={images[currentSlide].src}
                  alt={images[currentSlide].alt}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Navigation Buttons - Only show on hover */}
            <div className={`absolute inset-0 flex items-center justify-between px-4 transition-opacity duration-300 ${isPaused ? 'opacity-100' : 'opacity-0'}`}>
              <button
                onClick={prevSlide}
                className="bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setCurrentSlide(index);
                      setIsTransitioning(false);
                    }, 500);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Original Grid Section */}
      {/* <section className="py-16 px-4">
        <h2 className="text-4xl font-bold text-center text-purple-600 mb-12">
          Our Beautiful Memories (Grid View)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div
            className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform cursor-pointer"
            onClick={() => setSelectedImage('/photos/photo1.jpg')}
          >
            <Image
              src="/photos/photo1.jpg"
              alt="A beautiful memory"
              fill
              className="object-cover"
            />
          </div>
          <div
            className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform cursor-pointer"
            onClick={() => setSelectedImage('/photos/photo3.jpg')}
          >
            <Image
              src="/photos/photo3.jpg"
              alt="A beautiful memory"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section> */}

      {/* Image Modal */}
      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageSrc={selectedImage || ''}
        alt="Full size memory"
      />

      {/* Interactive Elements */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-purple-600 mb-8">
            Make a Wish!
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Click the stars to make them twinkle
          </p>
          <div className="flex justify-center space-x-4">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                  });
                }}
                className="text-4xl hover:scale-125 transition-transform"
              >
                ⭐
              </button>
            ))}
          </div>
        </div>
      </section>


    </main>
  );
}
