import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchWeb } from "./services/search";

const askSchema = z.object({
  question: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    citations: z.array(z.string()).optional()
  }))
});

// Helper function to reorder sources based on their appearance in content
function reorderSourcesByReference(content: string, sources: Array<{ url: string; title: string; publish_date?: string }>) {
  const citationOrder: number[] = [];
  const seenIndexes = new Set<number>();

  // Find all citations in order of appearance
  const matches = content.matchAll(/\[(\d+)(?:,\s*\d+)*\]/g);
  for (const match of matches) {
    const indexes = match[1].split(',').map(i => parseInt(i.trim()) - 1);
    for (const index of indexes) {
      if (!seenIndexes.has(index)) {
        citationOrder.push(index);
        seenIndexes.add(index);
      }
    }
  }

  // Add any remaining sources that weren't cited
  for (let i = 0; i < sources.length; i++) {
    if (!seenIndexes.has(i)) {
      citationOrder.push(i);
    }
  }

  // Create the reordered sources array
  const reorderedSources = citationOrder.map(index => sources[index]);

  // Update citation numbers in content
  let updatedContent = content;
  const oldToNew = new Map(citationOrder.map((oldIndex, newIndex) => [oldIndex + 1, newIndex + 1]));
  updatedContent = updatedContent.replace(/\[(\d+)(?:,\s*\d+)*\]/g, (match) => {
    const numbers = match.slice(1, -1).split(',').map(n => oldToNew.get(parseInt(n.trim())));
    return `[${numbers.join(',')}]`;
  });

  return { reorderedSources, updatedContent };
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 2000
): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      if (retries >= maxRetries || error?.status !== 429) {
        throw error;
      }

      const delay = initialDelay * Math.pow(2, retries);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }
}

export function registerRoutes(app: Express): Server {
  app.post('/api/ask', async (req, res) => {
    try {
      const { question, history } = askSchema.parse(req.body);

      if (!process.env.GOOGLE_GEMINI_API_KEY) {
        throw new Error('GOOGLE_GEMINI_API_KEY is not set');
      }

      // 1. Get search results and sort by date
      console.log('Searching web for:', question);
      const searchResults = await searchWeb(question);
      console.log('Found search results:', searchResults.length);

      if (searchResults.length === 0) {
        throw new Error('No search results found');
      }

      // Sort results by date (most recent first)
      const sortedResults = searchResults.sort((a, b) => {
        const dateA = new Date(a.publish_date || 0);
        const dateB = new Date(b.publish_date || 0);
        return dateB.getTime() - dateA.getTime();
      });

      // Take up to 15 most recent results
      const limitedResults = sortedResults.slice(0, 15);

      // 2. Prepare context from search results with better formatting
      const context = limitedResults
        .map((r, index) => `[Source ${index + 1}] ${r.url}\nTitle: ${r.title || 'Untitled'}\nPublished: ${r.publish_date || 'Unknown'}\nContent: ${r.content}\n---\n`)
        .join('\n');

      console.log('Initializing Gemini API...');
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 4096,
        },
      });

      // Format conversation history for Gemini
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const systemPrompt = `You are an advanced conversational AI research assistant, designed to provide comprehensive and well-structured answers similar to Perplexity AI. Your role is to analyze multiple sources and provide detailed, nuanced responses while maintaining a clear and engaging format.

Web Search Results:
${context}

Instructions for Response Generation:

1. Content Structure and Depth:
   - For analysis questions:
     * Begin with a concise executive summary (2-3 sentences)
     * Use appropriate frameworks (SWOT, PESTLE, 5 Forces) when applicable
     * Break down topics into detailed sections with clear headers
     * Each section should have 4-5 lines of detailed analysis
     * End with comprehensive takeaways and specific recommendations

   - For informational questions:
     * Start with a brief overview of key findings
     * Organize details in logical sections
     * Provide in-depth explanations with examples
     * Include relevant data and statistics
     * Each section should contain substantial information (4-5 lines minimum)

2. Source Integration and Citation:
   - Evaluate and synthesize information from ALL available sources
   - Reference sources equally throughout your response
   - Use [X] notation for citations, referencing multiple sources when appropriate
   - Always support key facts with citations
   - Cross-reference information across multiple sources

3. Formatting Standards:
   - Use consistent header formatting:
     * # for main title (if needed)
     * ## for major sections
     * ### for subsections
   - Maintain consistent spacing:
     * One blank line before headers
     * No extra blank lines between paragraphs in the same section
   - For lists:
     * Use • for bullet points
     * Use 1. 2. 3. for numbered lists
   - Keep paragraph length consistent (4-5 lines)

4. Quality Guidelines:
   - Ensure each section has substantial depth
   - Use specific examples and data points
   - Compare perspectives from different sources
   - Address potential counterarguments
   - Maintain consistent detail level across sections

Remember to:
- Draw from all available sources equally
- Maintain consistent formatting
- Support claims with citations
- Keep sections detailed and thorough

Question: ${question}`;

      try {
        console.log('Creating Gemini chat session...');
        const chat = model.startChat({
          history: formattedHistory,
        });

        console.log('Sending request to Gemini API...');
        const result = await retryWithBackoff(async () => {
          return await chat.sendMessage(systemPrompt);
        });

        console.log('Received response from Gemini API');
        const response = await result.response;
        const text = response.text();

        // Clean up the content while preserving formatting
        let cleanedContent = text
          .replace(/\n{3,}/g, '\n\n')  // Normalize multiple newlines
          .trim();

        // Prepare sources for reordering
        const sources = limitedResults.map(r => ({
          url: r.url,
          title: r.title || new URL(r.url).hostname.replace('www.', ''),
          publish_date: r.publish_date
        }));

        // Reorder sources based on their appearance in the content
        const { reorderedSources, updatedContent } = reorderSourcesByReference(cleanedContent, sources);

        console.log('Sending response to client');
        res.json({
          content: updatedContent,
          citations: reorderedSources.map(s => s.url),
          sources: reorderedSources
        });
      } catch (error: any) {
        console.error('Gemini API error:', error);
        throw new Error(`Failed to get response from Gemini: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in /api/ask:', error);
      let status = 500;
      let message = 'Internal server error';

      if (error.status === 429) {
        status = 429;
        message = 'Service is temporarily busy. Please try again in a few moments.';
      } else if (error.message) {
        message = error.message;
      }

      res.status(status).json({ message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}