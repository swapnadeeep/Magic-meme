import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AICaptionGeneratorProps {
  templateName?: string;
  onCaptionGenerated: (topText: string, bottomText: string) => void;
}

interface CaptionResponse {
  topText: string;
  bottomText: string;
  originalResponse: string;
}

export function AICaptionGenerator({ templateName, onCaptionGenerated }: AICaptionGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [generatedCaption, setGeneratedCaption] = useState<CaptionResponse | null>(null);
  const { toast } = useToast();

  const generateCaption = useMutation({
    mutationFn: async (data: { topic: string; templateName?: string }) => {
      const response = await apiRequest("POST", "/api/captions/generate", data);
      return response.json() as Promise<CaptionResponse>;
    },
    onSuccess: (data) => {
      setGeneratedCaption(data);
      toast({
        title: "AI caption generated! ✨",
        description: "Your witty caption is ready to use!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate caption",
        description: error.message || "Please try again with a different topic.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your meme caption.",
        variant: "destructive",
      });
      return;
    }
    generateCaption.mutate({ topic: topic.trim(), templateName });
  };

  const handleUseCaption = () => {
    if (generatedCaption) {
      onCaptionGenerated(generatedCaption.topText, generatedCaption.bottomText);
      toast({
        title: "Caption applied!",
        description: "AI-generated text has been added to your meme.",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <Sparkles className="h-5 w-5" />
          AI Caption Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="topic" className="text-sm font-medium mb-2 block">
            What's your meme about?
          </Label>
          <Input
            id="topic"
            placeholder="e.g., working from home, coffee addiction, Monday mornings..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            data-testid="input-ai-topic"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generateCaption.isPending || !topic.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          data-testid="button-generate-ai-caption"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {generateCaption.isPending ? "Generating..." : "Generate AI Caption"}
        </Button>

        {generateCaption.isPending && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AI is crafting your perfect caption...
            </p>
          </div>
        )}

        {generatedCaption && (
          <div className="space-y-3 bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <h4 className="font-semibold text-gray-900 dark:text-white">Generated Caption:</h4>
            
            <div className="space-y-2">
              {generatedCaption.topText && (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded p-2">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Top:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {generatedCaption.topText}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCaption.topText)}
                    data-testid="button-copy-top-text"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {generatedCaption.bottomText && (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded p-2">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Bottom:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {generatedCaption.bottomText}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCaption.bottomText)}
                    data-testid="button-copy-bottom-text"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUseCaption}
                className="flex-1 bg-green-600 hover:bg-green-700"
                data-testid="button-use-ai-caption"
              >
                Use This Caption
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={generateCaption.isPending}
                data-testid="button-regenerate-caption"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}