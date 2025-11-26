
export class ToolDto{
    id: string = "";
    name: string = "";
    description: string = "";
    url: string = "";
    category: string = "";
    tags: string[] = [];
    pricing: 'Free' | 'Freemium' | 'Paid' | 'Contact for Pricing' = 'Free';
}