import { useRef, useEffect } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { useChatStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Chat() {
  const { messages, addMessage, clearMessages } = useChatStore();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: messages.slice(-10) })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      return response.json();
    },
    onSuccess: (data) => {
      addMessage({
        role: 'assistant',
        content: data.content,
        citations: data.citations
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response. Please try again."
      });
    }
  });

  const handleSubmit = (question: string) => {
    addMessage({ role: 'user', content: question });
    askMutation.mutate(question);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col gap-8">
      {messages.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Eraser className="h-4 w-4 mr-2" />
            Clear conversation
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-6">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>
      <ChatInput 
        onSubmit={handleSubmit}
        isLoading={askMutation.isPending}
      />
    </div>
  );
}