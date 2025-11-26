
export class ToolDto{
    name: string = "";
    description: string = "";
    url: string = "";
    category: string = "";
    tags: string[] = [];
    pricing: 'Free' | 'Freemium' | 'Paid' | 'Contact for Pricing' = 'Free';
}