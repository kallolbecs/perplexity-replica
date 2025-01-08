import { Message } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Citations } from "./Citations";
import { SourcePreview } from "./SourcePreview";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Convert line breaks to proper React elements while preserving formatting
  const formatContent = (content: string) => {
    // Replace [X,Y,Z] or [X] with clickable links
    const contentWithLinks = content.replace(
      /\[(\d+(?:,\s*\d+)*)\]/g,
      (match, indexGroup) => {
        const indexes = indexGroup.split(',').map(i => parseInt(i.trim()));
        return indexes.map(index => {
          const sourceUrl = message.citations?.[index - 1];
          if (!sourceUrl) return `[${index}]`;
          return `<a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">[${index}]</a>`;
        }).join(',');
      }
    );

    // Split content into sections if it contains headers
    const sections = contentWithLinks.split(/(?=^#+\s)/m);

    return sections.map((section, sectionIndex) => {
      const lines = section.split('\n');

      return (
        <div key={sectionIndex} className="mb-4 last:mb-0">
          {lines.map((line, index) => {
            // Convert HTML string to React elements for links
            if (line.includes('<a href=')) {
              const div = document.createElement('div');
              div.innerHTML = line;
              const links = Array.from(div.getElementsByTagName('a'));
              let result = line;
              links.forEach(link => {
                result = result.replace(link.outerHTML, 
                  `__LINK_${link.href}_${link.textContent}__`);
              });
              const parts = result.split(/__LINK_([^_]+)_\[(\d+)\]__/);
              return (
                <p key={index} className="mb-2 text-base leading-relaxed">
                  {parts.map((part, i) => {
                    if (i % 3 === 1) { // It's a link
                      const href = part;
                      const num = parts[i + 1];
                      return (
                        <a
                          key={i}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          [{num}]
                        </a>
                      );
                    }
                    if (i % 3 === 2) return ''; // Skip the number part
                    return part;
                  })}
                </p>
              );
            }

            // Handle headers (lines starting with #)
            if (line.trim().startsWith('#')) {
              const level = line.match(/^#+/)[0].length;
              const text = line.replace(/^#+\s/, '');
              const className = level === 1 
                ? 'text-2xl font-bold mb-3'
                : level === 2
                ? 'text-xl font-semibold mb-2'
                : 'text-lg font-medium mb-2';
              return (
                <h3 key={index} className={className}>
                  {text}
                </h3>
              );
            }

            // Handle bullet points
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
              return (
                <li key={index} className="ml-4 mb-2 text-base leading-relaxed list-disc">
                  {line.trim().substring(1).trim()}
                </li>
              );
            }

            // Handle numbered lists
            if (/^\d+\./.test(line.trim())) {
              return (
                <li key={index} className="ml-4 mb-2 text-base leading-relaxed list-decimal">
                  {line.trim()}
                </li>
              );
            }

            // Regular paragraphs
            if (line.trim()) {
              return (
                <p key={index} className="mb-2 text-base leading-relaxed">
                  {line}
                </p>
              );
            }

            // Empty lines
            return null;
          })}
        </div>
      );
    });
  };

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start mx-auto max-w-4xl w-full`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
      }`}>
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <Bot className="h-5 w-5" />
        )}
      </div>
      <div className="flex-1">
        <Card className={`${isUser ? 'ml-auto' : 'mr-auto'} w-full`}>
          <CardContent className="p-4">
            {!isUser && message.citations && (
              <SourcePreview 
                sources={message.citations.map((url, idx) => ({
                  url,
                  title: message.sources?.[idx]?.title || new URL(url).hostname.replace('www.', ''),
                  content: message.sources?.[idx]?.content,
                  publish_date: message.sources?.[idx]?.publish_date
                }))}
              />
            )}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {formatContent(message.content)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}