"use client";

import { useState } from "react";
import { Cloud, ArrowDownToLine, Zap, ShieldCheck } from "lucide-react";
import { UrlInput } from "@/components/analyzer/UrlInput";
import { MediaCard } from "@/components/analyzer/MediaCard";
import { FAQ } from "@/components/home/FAQ";
import { AnalyzeResponse } from "@/types/media";
import { toast } from "sonner";

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeData, setAnalyzeData] = useState<AnalyzeResponse | null>(null);

  const handleAnalyzeStart = () => {
    setIsAnalyzing(true);
    setAnalyzeData(null);
  };

  const handleAnalyzeSuccess = (data: AnalyzeResponse) => {
    setIsAnalyzing(false);
    setAnalyzeData(data);
  };

  const handleAnalyzeError = (error: string) => {
    setIsAnalyzing(false);
    toast.error("Analysis Failed", {
      description: error,
    });
  };

  const resetState = () => {
    setAnalyzeData(null);
  };

  return (
    <div className="flex flex-col flex-1 w-full relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-40 blur-[100px]"></div>
      </div>

      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 flex flex-col items-center justify-center text-center px-4">
        <div className="space-y-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
            <Cloud className="mr-2 h-4 w-4" />
            Fast & Secure Downloads
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 pb-2">
            Download Your Media, <br className="hidden sm:inline" /> Your Way.
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl leading-relaxed mt-6">
            Paste a video URL, explore available formats, and download the media you are authorized to save. Support for hundreds of platforms.
          </p>
        </div>

        <div className="w-full max-w-3xl mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <UrlInput
            isLoading={isAnalyzing}
            onAnalyzeStart={handleAnalyzeStart}
            onAnalyzeSuccess={handleAnalyzeSuccess}
            onAnalyzeError={handleAnalyzeError}
          />
        </div>

        {isAnalyzing && (
          <div className="mt-16 w-full max-w-5xl text-left animate-pulse flex flex-col space-y-4">
            <div className="h-48 w-full bg-muted/50 rounded-xl"></div>
            <div className="flex gap-4">
              <div className="h-6 w-32 bg-muted/50 rounded"></div>
              <div className="h-6 w-24 bg-muted/50 rounded"></div>
              <div className="h-6 w-24 bg-muted/50 rounded"></div>
            </div>
          </div>
        )}

        {analyzeData?.media && analyzeData.formats && !isAnalyzing && (
          <div className="mt-16 w-full max-w-5xl mx-auto text-left" id="result">
            <MediaCard
              media={analyzeData.media}
              formats={analyzeData.formats}
              onReset={resetState}
            />
          </div>
        )}
      </section>

      {!analyzeData && !isAnalyzing && (
        <section id="how-it-works" className="w-full py-12 md:py-24 bg-muted/30 border-t mt-auto">
          <div className="container mx-auto max-w-5xl px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ArrowDownToLine className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Paste URL</h3>
                <p className="text-muted-foreground">Copy any supported video or audio URL and paste it into the search box.</p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Fast Analysis</h3>
                <p className="text-muted-foreground">Our backend instantly fetches the available qualities and formats for your media.</p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Secure Download</h3>
                <p className="text-muted-foreground">Download the media directly to your device securely without leaving the page.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {!analyzeData && !isAnalyzing && <FAQ />}
    </div>
  );
}
