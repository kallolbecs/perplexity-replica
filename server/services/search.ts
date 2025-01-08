import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface SearchResult {
  url: string;
  content: string;
  title: string;
  publish_date: string;
  score: number;
}

interface SearchResponse {
  results?: SearchResult[];
  error?: string;
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  try {
    console.log('Making Tavily API request for query:', query);

    const { stdout, stderr } = await execAsync(`python3 server/services/search.py "${query.replace(/"/g, '\\"')}"`);

    if (stderr) {
      console.error('Python script debug output:', stderr);
      // Don't throw error for stderr as it contains our debug logs
    }

    if (!stdout.trim()) {
      console.error('No stdout from Python script');
      throw new Error('No response from search service');
    }

    let response: SearchResponse;
    try {
      response = JSON.parse(stdout);
    } catch (e) {
      console.error('Failed to parse Python script output:', stdout);
      throw new Error('Invalid response format from search service');
    }

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.results || !Array.isArray(response.results)) {
      console.error('Invalid response format from Python script:', response);
      return [];
    }

    console.log(`Successfully retrieved ${response.results.length} results`);
    return response.results;
  } catch (error) {
    console.error("Error searching web:", error);
    throw error;
  }
}