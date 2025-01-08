import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Link as LinkIcon } from "lucide-react";

interface Source {
  url: string;
  title: string;
  content?: string;
  publish_date?: string;
}

interface SourcePreviewProps {
  sources: Source[];
}

export function SourcePreview({ sources }: SourcePreviewProps) {
  if (!sources.length) return null;

  const visibleSources = sources.slice(0, 5);
  const hasMoreSources = sources.length > 5;

  const SourceCard = ({ source, index }: { source: Source; index: number }) => {
    const url = new URL(source.url);
    const formattedDate = source.publish_date
      ? new Date(source.publish_date).toLocaleString()
      : "";

    return (
      <Card className="hover:bg-muted/50 transition-colors h-full">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full"
        >
          <CardContent className="p-4 flex flex-col gap-2 h-full">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex-shrink-0">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`}
                  alt=""
                  className="w-4 h-4 rounded"
                  onError={(e) => {
                    e.currentTarget.src = "";
                    e.currentTarget.className = "hidden";
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                [{index + 1}]
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {url.hostname.replace("www.", "")}
              </span>
            </div>
            <p className="text-sm font-medium line-clamp-2 flex-1">
              {source.title}
            </p>
            {source.content && (
              <p className="text-xs text-muted-foreground line-clamp-3">
                {source.content}
              </p>
            )}
            {formattedDate && (
              <p className="text-xs text-muted-foreground mt-auto">
                {formattedDate}
              </p>
            )}
            <LinkIcon className="h-3 w-3 text-muted-foreground/50 ml-auto" />
          </CardContent>
        </a>
      </Card>
    );
  };

  return (
    <div className="mb-6">
      <div className="grid grid-cols-6 gap-4">
        {visibleSources.map((source, idx) => (
          <div key={idx} className="col-span-1">
            <SourceCard source={source} index={idx} />
          </div>
        ))}
        {hasMoreSources && (
          <Sheet>
            <SheetTrigger asChild>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center h-full gap-2">
                  <ChevronRight className="h-6 w-6" />
                  <p className="text-sm font-medium">
                    Show All ({sources.length})
                  </p>
                </CardContent>
              </Card>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px]">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4 py-4">
                  <h3 className="text-lg font-semibold mb-4">All Sources</h3>
                  {sources.map((source, idx) => (
                    <SourceCard key={idx} source={source} index={idx} />
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
}