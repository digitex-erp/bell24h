import { NextResponse } from 'next/server';
import categoriesData from '@/data/categories.json';

export async function GET() {
  try {
    return NextResponse.json(categoriesData);
  } catch (error) {
    console.error('Error in categories API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
