import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
      setInput("");
    }
  };

  // Auto-resize textarea as content changes
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Max height of 200px
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-4 mx-auto max-w-3xl w-full">
      <div className="relative flex gap-2 bg-card p-2 rounded-lg shadow-lg">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask anything..."
          className="flex-1 py-2 text-base bg-background min-h-[48px] max-h-[200px] resize-none"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="lg"
          disabled={isLoading || !input.trim()}
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </form>
  );
}