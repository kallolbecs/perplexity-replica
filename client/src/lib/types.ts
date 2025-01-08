export interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  sources?: Array<{
    url: string;
    title: string;
    publish_date?: string;
  }>;
}