import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const photosDirectory = path.join(process.cwd(), 'public', 'photos');
    const files = fs.readdirSync(photosDirectory);
    
    // Filter for image files
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    // Create full paths for the images
    const images = imageFiles.map(file => ({
      src: `/photos/${file}`,
      alt: `Beautiful memory - ${file.split('.')[0]}`
    }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error reading photos directory:', error);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
} 