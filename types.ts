
export interface Contact {
  id: string;
  name: string;
  title?: string;
  company?: string;
  phone?: string[];
  email?: string[];
  address?: string;
  website?: string;
  notes?: string;
  cardImageUrl?: string; // base64 string or URL
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  // Potentially other user details from Firebase
}

export interface OCRResult {
  name?: string;
  title?: string;
  company?: string;
  phone?: string[];
  email?: string[];
  address?: string;
  website?: string;
  notes?: string; // Added to align with form
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // Could have other types like "retrievedContext"
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // Other grounding metadata fields
}