"use client";

import { useState } from "react";
import { z } from "zod";
import { Search, Loader2, X, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnalyzeResponse } from "@/types/media";
import { toast } from "sonner";

const urlSchema = z.string().url("Please enter a valid URL.");

interface UrlInputProps {
  onAnalyzeStart: () => void;
  onAnalyzeSuccess: (data: AnalyzeResponse) => void;
  onAnalyzeError: (error: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onAnalyzeStart, onAnalyzeSuccess, onAnalyzeError, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");

  const handleAnalyze = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim()) return;

    try {
      urlSchema.parse(url);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        onAnalyzeError((error as any).errors[0].message);
        return;
      }
    }

    onAnalyzeStart();

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = (await response.json()) as AnalyzeResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze the URL.");
      }

      onAnalyzeSuccess(data);
    } catch (err: any) {
      onAnalyzeError(err.message || "An unexpected error occurred.");
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
      }
    } catch (err) {
      toast.error("Could not paste", {
        description: "Please paste the URL manually.",
      });
    }
  };

  return (
    <form onSubmit={handleAnalyze} className="w-full max-w-3xl mx-auto relative group">
      <div className="relative flex items-center w-full shadow-sm rounded-2xl bg-card border-2 transition-all duration-300 focus-within:border-primary focus-within:shadow-md focus-within:ring-4 focus-within:ring-primary/20">
        <div className="pl-6 text-muted-foreground">
          <Search className="h-6 w-6" />
        </div>
        <Input
          type="text"
          placeholder="Paste your video URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          className="h-16 border-0 bg-transparent px-4 text-base md:text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
        />
        <div className="pr-2 flex items-center space-x-1 sm:space-x-2">
          {url && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-foreground hidden sm:inline-flex rounded-full"
              onClick={() => setUrl("")}
              title="Clear"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          {!url && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-foreground hidden sm:inline-flex rounded-full"
              onClick={handlePaste}
              title="Paste"
            >
              <ClipboardPaste className="h-5 w-5" />
            </Button>
          )}
          <Button
            type="submit"
            disabled={!url || isLoading}
            className="h-12 px-6 rounded-xl text-base font-semibold transition-transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing
              </>
            ) : (
              "Analyze"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
