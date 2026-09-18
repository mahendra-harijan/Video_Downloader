import { MediaInfo, MediaFormat } from "@/types/media";
import { formatDuration } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ExternalLink, Clock, User, Link as LinkIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormatTable } from "./FormatTable";

interface MediaCardProps {
  media: MediaInfo;
  formats: MediaFormat[];
  onReset: () => void;
}

export function MediaCard({ media, formats, onReset }: MediaCardProps) {
  const videoFormats = formats.filter(f => f.type === "video");
  const audioFormats = formats.filter(f => f.type === "audio");

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(media.url);
      toast.success("URL Copied", {
        description: "The source URL has been copied to your clipboard.",
      });
    } catch (err) {
      toast.error("Failed to copy", {
        description: "Could not copy URL to clipboard.",
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="overflow-hidden border-2 shadow-lg">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail Section */}
          <div className="md:w-1/3 bg-muted relative aspect-video md:aspect-auto min-h-[200px]">
            {media.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.thumbnail}
                alt={media.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                No Thumbnail
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono font-medium backdrop-blur-sm">
              {formatDuration(media.duration)}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-6 md:w-2/3 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold leading-tight line-clamp-2" title={media.title}>
                {media.title}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="truncate">{media.uploader}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-primary" />
                  <span className="capitalize">{media.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{formatDuration(media.duration)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={copyUrl}>
                <Copy className="mr-2 h-4 w-4" />
                Copy URL
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(media.url, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Source
              </Button>
              <Button variant="ghost" size="sm" onClick={onReset} className="ml-auto text-muted-foreground hover:text-foreground">
                <RefreshCw className="mr-2 h-4 w-4" />
                Analyze Another
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Formats Section */}
      <Card className="border-2 shadow-lg">
        <CardContent className="p-0 sm:p-6">
          <Tabs defaultValue="video" className="w-full">
            <div className="px-4 pt-4 sm:p-0">
              <TabsList className="grid w-full grid-cols-2 max-w-sm mb-6">
                <TabsTrigger value="video">Video</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="video" className="px-4 pb-4 sm:p-0 mt-0">
              <FormatTable formats={videoFormats} media={media} />
            </TabsContent>

            <TabsContent value="audio" className="px-4 pb-4 sm:p-0 mt-0">
              <FormatTable formats={audioFormats} media={media} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
