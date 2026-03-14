export interface Profile {
  id: string;
  username: string | null;
  display_name: string;
  avatar_url: string | null;
  karma: number;
  status: 'sharing' | 'needing' | 'offline';
  sharing_product_id: string | null;
  location: { latitude: number; longitude: number } | null;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  type: 'pouches' | 'vape' | 'cigarettes' | 'dip' | 'snus' | 'other';
  flavor: string | null;
  strength: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  responder_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface Share {
  id: string;
  connection_id: string;
  sharer_id: string;
  receiver_id: string;
  product_id: string | null;
  sharer_confirmed: boolean;
  receiver_confirmed: boolean;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface SharerPin {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  karma: number;
  latitude: number;
  longitude: number;
  product_name: string;
  product_type: string;
  product_brand: string | null;
  distance_meters: number;
}

export interface StorePin {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  is_open: boolean | null;
}

export type KarmaTier = 'newcomer' | 'neutral' | 'contributor' | 'generous' | 'legend';

export function getKarmaTier(karma: number): KarmaTier {
  if (karma < 0) return 'newcomer';
  if (karma < 10) return 'neutral';
  if (karma < 50) return 'contributor';
  if (karma < 100) return 'generous';
  return 'legend';
}

export function getKarmaTierLabel(tier: KarmaTier): string {
  const labels: Record<KarmaTier, string> = {
    newcomer: 'Newcomer',
    neutral: 'Neutral',
    contributor: 'Contributor',
    generous: 'Generous',
    legend: 'Legend',
  };
  return labels[tier];
}
