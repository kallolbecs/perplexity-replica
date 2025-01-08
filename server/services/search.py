#!/usr/bin/env python3
from tavily import TavilyClient
import os
import json
import sys
from datetime import datetime, timezone
from urllib.parse import urlparse
import re

def clean_content(content: str) -> str:
    """Clean and format the content for better readability."""
    if not content:
        return ""

    # Remove script and style tags
    content = re.sub(r'<script.*?</script>', '', content, flags=re.DOTALL)
    content = re.sub(r'<style.*?</style>', '', content, flags=re.DOTALL)

    # Remove HTML tags while preserving line breaks
    content = re.sub(r'<br\s*/?>', '\n', content)
    content = re.sub(r'<[^>]+>', ' ', content)

    # Remove extra whitespace and normalize newlines
    content = ' '.join(line.strip() for line in content.split('\n') if line.strip())

    # Limit content length while preserving complete sentences
    if len(content) > 2000:
        sentences = content[:2000].split('. ')
        content = '. '.join(sentences[:-1]) + '.'

    return content.strip()

def search_web(query):
    try:
        api_key = os.environ.get('TAVILY_API_KEY')
        if not api_key:
            raise ValueError("TAVILY_API_KEY environment variable is not set")

        print(f"Initializing Tavily client with API key...", file=sys.stderr)
        client = TavilyClient(api_key=api_key)

        print(f"Making Tavily search request for query: {query}", file=sys.stderr)
        response = client.search(
            query=query,
            search_depth="advanced",  # Advanced depth for better results
            max_results=15,  # Up to 15 results
            include_answer=True,
            include_raw_content=True,  # Get full content for better context
            search_type="news",  # Specifically search for news
            time_range="1m",  # Get most recent articles within the last month
            sort_by="date",  # Sort by date descending
            engine="google"  # Use Google as the search engine
        )

        if not isinstance(response, dict):
            raise ValueError(f"Unexpected response format: {type(response)}")

        print(f"Raw Tavily response: {json.dumps(response, indent=2)}", file=sys.stderr)

        # Extract URLs, content, and publish dates from results
        results = []
        if 'results' in response:
            now = datetime.now(timezone.utc)
            for result in response['results']:
                if not result.get('url') or not result.get('content'):
                    continue

                # Extract and validate publish date
                publish_date = result.get('published_date', '')
                try:
                    if publish_date:
                        # Convert to UTC for consistency
                        date = datetime.fromisoformat(publish_date.replace('Z', '+00:00'))
                        publish_date = date.isoformat()
                    else:
                        # If no publish date, use current time
                        publish_date = now.isoformat()
                except ValueError as e:
                    print(f"Error parsing date {publish_date}: {e}", file=sys.stderr)
                    publish_date = now.isoformat()

                # Get title or generate from URL
                title = result.get('title', '')
                if not title:
                    domain = urlparse(result['url']).netloc
                    path = urlparse(result['url']).path
                    title = f"{domain}{path}"

                # Clean and format content
                raw_content = result.get('raw_content')
                if raw_content:
                    content = clean_content(raw_content)
                else:
                    content = clean_content(result.get('content', ''))

                # Only append if we have meaningful content
                if content:
                    results.append({
                        'url': result['url'],
                        'content': content,
                        'title': title,
                        'publish_date': publish_date,
                        'score': result.get('score', 0)  # Include relevance score
                    })

            # Sort results by date (most recent first) and then by score
            results.sort(key=lambda x: (x['publish_date'], x['score']), reverse=True)

            # Take top 15 results
            results = results[:15]

            print(f"Processed {len(results)} valid results", file=sys.stderr)

        if not results:
            print("No valid results found in response", file=sys.stderr)
            results = []

        print(json.dumps({'results': results}))

    except Exception as e:
        print(f"Error in search_web: {str(e)}", file=sys.stderr)
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No search query provided'}))
        sys.exit(1)

    search_web(sys.argv[1])