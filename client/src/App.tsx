import { Chat } from "@/components/Chat";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/lib/store";
import { Search } from "lucide-react";

function App() {
  const { theme } = useTheme();

  return (
    <div className={theme}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="flex flex-col items-center mb-12">
            <ThemeToggle className="self-end mb-8" />
            <Search className="h-16 w-16 mb-4 text-primary" />
            <h1 className="text-4xl font-bold text-center mb-4">
              What do you want to know?
            </h1>
            <div className="text-center text-muted-foreground">
              <p className="mb-1">Powered by Gemini 2.0, Tavily</p>
              <p>
                Created by{" "}
                <a 
                  href="https://www.linkedin.com/in/kallol-halder-195592b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  @Kallol
                </a>
              </p>
            </div>
          </header>
          <main>
            <Chat />
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;