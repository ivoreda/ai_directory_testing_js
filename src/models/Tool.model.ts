export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  pricing: 'Free' | 'Freemium' | 'Paid' | 'Contact for Pricing';

  embeddings?: number[];
  isEmbedded: boolean;

  createdAt: Date;
  updatedAt: Date;
}