import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";

interface CitationsProps {
  citations: string[];
}

export function Citations({ citations }: CitationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!citations.length) return null;

  return (
    <div className="mt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        {citations.length} {citations.length === 1 ? 'source' : 'sources'}
      </Button>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-1">
          {citations.map((citation, idx) => {
            const url = new URL(citation);
            return (
              <a
                key={idx}
                href={citation}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`}
                    alt=""
                    className="w-4 h-4 rounded"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.className = 'hidden';
                    }}
                  />
                </div>
                <span className="flex-1 truncate">
                  {url.hostname.replace('www.', '')}
                </span>
                <LinkIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}