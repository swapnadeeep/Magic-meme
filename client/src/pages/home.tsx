import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TemplateGrid } from "@/components/template-grid";
import { MemeCreator } from "@/components/meme-creator";
import { GeneratedMeme } from "@/components/generated-meme";
import type { MemeTemplate, GeneratedMeme as GeneratedMemeType } from "@shared/schema";

type ViewState = "templates" | "creator" | "generated";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [generatedMeme, setGeneratedMeme] = useState<any>(null);

  const { data: recentMemes = [] } = useQuery<GeneratedMemeType[]>({
    queryKey: ["/api/memes/recent"],
  });

  const handleSelectTemplate = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    setViewState("creator");
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setViewState("templates");
  };

  const handleMemeGenerated = (memeData: any) => {
    setGeneratedMeme(memeData);
    setViewState("generated");
  };

  const handleCreateAnother = () => {
    setGeneratedMeme(null);
    setSelectedTemplate(null);
    setViewState("templates");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Create Epic Memes in Seconds
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose from hundreds of popular meme templates and add your own hilarious text to create viral-worthy content.
          </p>
        </div>

        {/* Template Grid */}
        {viewState === "templates" && (
          <TemplateGrid onSelectTemplate={handleSelectTemplate} />
        )}

        {/* Meme Creator */}
        {viewState === "creator" && selectedTemplate && (
          <MemeCreator
            template={selectedTemplate}
            onBack={handleBackToTemplates}
            onMemeGenerated={handleMemeGenerated}
          />
        )}

        {/* Generated Meme */}
        {viewState === "generated" && generatedMeme && (
          <GeneratedMeme
            memeData={generatedMeme}
            onCreateAnother={handleCreateAnother}
          />
        )}

        {/* Recent Memes Section */}
        {viewState === "templates" && recentMemes.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recent Community Memes
              </h3>
              <button 
                className="text-primary hover:text-primary/80 font-medium"
                data-testid="button-view-all-recent"
              >
                View All →
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentMemes.slice(0, 6).map((meme) => (
                <img
                  key={meme.id}
                  src={meme.imageUrl}
                  alt={`${meme.templateName} meme`}
                  className="rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer aspect-square object-cover"
                  data-testid={`recent-meme-${meme.id}`}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
