import fetch from "node-fetch";
import * as cheerio from "cheerio";

export async function scrapeContent(url: string): Promise<string> {
  try {
    console.log(`Scraping content from: ${url}`);
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script tags, style tags, and other unnecessary elements
    $("script").remove();
    $("style").remove();
    $("nav").remove();
    $("header").remove();
    $("footer").remove();

    // Extract text from main content areas
    const mainContent = $("main, article, .content, #content, .main")
      .text()
      .trim();

    if (mainContent) {
      return mainContent;
    }

    // Fallback to body content if no main content areas found
    const bodyContent = $("body")
      .text()
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 2000); // Limit content length

    console.log(`Scraped content length: ${bodyContent.length} characters`);
    return bodyContent;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return "";
  }
}