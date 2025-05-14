import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const photosDirectory = path.join(process.cwd(), 'public/gf-photos');
    console.log('Reading directory:', photosDirectory);
    
    const files = fs.readdirSync(photosDirectory);
    console.log('Found files:', files);
    
    // Filter for image files
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
    console.log('Filtered image files:', imageFiles);

    // Create image data array
    const images = imageFiles.map(file => ({
      src: `/gf-photos/${file}`,
      alt: 'Beautiful memory'
    }));
    console.log('Created image data:', images);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error reading photos directory:', error);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
} 