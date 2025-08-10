import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wand2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AICaptionGenerator } from "@/components/ai-caption-generator";
import type { MemeTemplate } from "@shared/schema";

interface MemeCreatorProps {
  template: MemeTemplate;
  onBack: () => void;
  onMemeGenerated: (memeData: any) => void;
}

interface GenerateMemeResponse {
  id: string;
  url: string;
  templateId: string;
  templateName: string;
  topText: string;
  bottomText: string;
}

export function MemeCreator({ template, onBack, onMemeGenerated }: MemeCreatorProps) {
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState("medium");
  const [textColor, setTextColor] = useState("white");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMeme = useMutation({
    mutationFn: async (data: { templateId: string; topText?: string; bottomText?: string }) => {
      const response = await apiRequest("POST", "/api/memes/generate", data);
      return response.json() as Promise<GenerateMemeResponse>;
    },
    onSuccess: (data) => {
      toast({
        title: "Meme generated successfully! 🎉",
        description: "Your epic meme is ready to be shared!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/memes/recent"] });
      onMemeGenerated(data);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate meme",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    generateMeme.mutate({
      templateId: template.id,
      topText: topText.trim() || undefined,
      bottomText: bottomText.trim() || undefined,
    });
  };

  const handleReset = () => {
    setTopText("");
    setBottomText("");
    setFontSize("medium");
    setTextColor("white");
  };

  const handleAICaptionGenerated = (aiTopText: string, aiBottomText: string) => {
    setTopText(aiTopText);
    setBottomText(aiBottomText);
  };

  return (
    <Card className="shadow-xl mb-12">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Create Your Meme
        </h3>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Preview</h4>

            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl p-4 min-h-96 flex items-center justify-center">
              <img
                src={template.url}
                alt={template.name}
                className="max-w-full h-auto rounded-lg"
                data-testid="preview-template-image"
              />

              {/* Text Overlays */}
              {topText && (
                <div
                  className={`absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-${textColor} px-4 py-2 rounded text-center font-bold ${
                    fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-xl" : "text-lg"
                  } max-w-[90%]`}
                  data-testid="preview-top-text"
                >
                  {topText}
                </div>
              )}
              {bottomText && (
                <div
                  className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-${textColor} px-4 py-2 rounded text-center font-bold ${
                    fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-xl" : "text-lg"
                  } max-w-[90%]`}
                  data-testid="preview-bottom-text"
                >
                  {bottomText}
                </div>
              )}
            </div>

            {generateMeme.isPending && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-gray-600 dark:text-gray-300">Generating your epic meme...</p>
              </div>
            )}
          </div>

          {/* Text Input Section */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Add Your Text</h4>

            {/* AI Caption Generator */}
            <AICaptionGenerator 
              templateName={template.name}
              onCaptionGenerated={handleAICaptionGenerated}
            />

            <div className="space-y-4">
              {/* Top Text Input */}
              <div>
                <Label htmlFor="topText" className="block text-sm font-medium mb-2">
                  Top Text
                </Label>
                <Textarea
                  id="topText"
                  rows={3}
                  placeholder="Enter top text..."
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  className="resize-none"
                  data-testid="input-top-text"
                />
              </div>

              {/* Bottom Text Input */}
              <div>
                <Label htmlFor="bottomText" className="block text-sm font-medium mb-2">
                  Bottom Text
                </Label>
                <Textarea
                  id="bottomText"
                  rows={3}
                  placeholder="Enter bottom text..."
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  className="resize-none"
                  data-testid="input-bottom-text"
                />
              </div>

              {/* Text Style Options */}
              <Card className="bg-gray-50 dark:bg-gray-900">
                <CardContent className="p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Text Style</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fontSize" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Font Size
                      </Label>
                      <Select value={fontSize} onValueChange={setFontSize}>
                        <SelectTrigger data-testid="select-font-size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="textColor" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Text Color
                      </Label>
                      <Select value={textColor} onValueChange={setTextColor}>
                        <SelectTrigger data-testid="select-text-color">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="white">White</SelectItem>
                          <SelectItem value="black">Black</SelectItem>
                          <SelectItem value="yellow">Yellow</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={generateMeme.isPending || (!topText.trim() && !bottomText.trim())}
                  className="flex-1"
                  data-testid="button-generate-meme"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {generateMeme.isPending ? "Generating..." : "Generate Meme"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                  data-testid="button-reset-creator"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>

              <Button
                variant="secondary"
                onClick={onBack}
                className="w-full bg-secondary hover:bg-secondary/90"
                data-testid="button-back-to-templates"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Choose Different Template
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
