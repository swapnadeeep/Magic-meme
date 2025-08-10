import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedMemeProps {
  memeData: {
    id: string;
    url: string;
    templateName: string;
    topText?: string;
    bottomText?: string;
  };
  onCreateAnother: () => void;
}

export function GeneratedMeme({ memeData, onCreateAnother }: GeneratedMemeProps) {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const response = await fetch(memeData.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meme-${memeData.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started!",
        description: "Your meme is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download the meme. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out this ${memeData.templateName} meme!`,
          text: `${memeData.topText || ''} ${memeData.bottomText || ''}`,
          url: memeData.url,
        });
      } catch (error) {
        // User cancelled the share
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(memeData.url);
        toast({
          title: "Link copied!",
          description: "Meme link has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Share failed",
          description: "Unable to copy link. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="shadow-xl mb-12">
      <CardContent className="p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Meme is Ready! 🎉
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Share it with the world and make everyone laugh!
          </p>

          {/* Generated Meme Display */}
          <div className="max-w-md mx-auto mb-8">
            <img
              src={memeData.url}
              alt={`Generated ${memeData.templateName} meme`}
              className="w-full rounded-xl shadow-lg"
              data-testid="generated-meme-image"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleDownload}
              className="success"
              data-testid="button-download-meme"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={handleShare}
              data-testid="button-share-meme"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={onCreateAnother}
              variant="secondary"
              className="bg-secondary hover:bg-secondary/90"
              data-testid="button-create-another"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Another
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
