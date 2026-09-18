import { NextResponse } from "next/server";
import { z } from "zod";
import { create } from "youtube-dl-exec";
import path from "path";
import { MediaFormat, MediaInfo, AnalyzeResponse } from "@/types/media";

const youtubedl = create(path.join(process.cwd(), 'bin', 'yt-dlp.exe'));

const analyzeSchema = z.object({
  url: z.string().url("Please enter a valid URL."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = analyzeSchema.parse(body);

    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      callHome: false,
      noCheckCertificates: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    }) as any;

    const mediaInfo: MediaInfo = {
      title: info.title || "Unknown Title",
      thumbnail: info.thumbnail || "",
      duration: info.duration || 0,
      uploader: info.uploader || info.extractor || "Unknown Source",
      source: info.extractor_key || info.extractor || "Unknown",
      url: url,
    };

    const videoFormats: MediaFormat[] = [];
    const audioFormats: MediaFormat[] = [];
    let bestAudioSize = 0;

    if (info.formats && Array.isArray(info.formats)) {
      // Find the best audio to estimate merged size
      const audios = info.formats.filter((f: any) => f.acodec !== "none" && f.acodec != null && (f.vcodec === "none" || f.vcodec == null));
      const bestAudio = audios.sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0))[0];
      if (bestAudio) {
        bestAudioSize = bestAudio.filesize || bestAudio.filesize_approx || ((bestAudio.abr || 128) * 1024 / 8) * info.duration;
      }

      // Collect all video tracks
      const videos = info.formats.filter((f: any) => f.vcodec !== "none" && f.vcodec != null);
      
      const seenQualities = new Set<string>();

      // Synthesize MP4 video formats
      for (const f of videos.sort((a: any, b: any) => (b.height || 0) - (a.height || 0))) {
        if (!f.format_id) continue;
        
        const height = f.height || 0;
        const qualityLabel = height ? `${height}p` : (f.format_note || "Default");
        
        // Prevent duplicate qualities (e.g. two 1080p streams)
        if (seenQualities.has(qualityLabel)) continue;
        seenQualities.add(qualityLabel);

        let vSize = f.filesize || f.filesize_approx;
        if (!vSize && f.tbr && info.duration) {
          vSize = (f.tbr * 1024 / 8) * info.duration;
        }
        
        // Final format ID will be this video + bestaudio. 
        // If it already has audio (pre-merged), just use its ID.
        const hasAudio = f.acodec !== "none" && f.acodec != null;
        const formatId = hasAudio ? f.format_id : `${f.format_id}+bestaudio`;
        const finalSize = hasAudio ? vSize : (vSize ? vSize + bestAudioSize : undefined);

        videoFormats.push({
          id: formatId,
          type: "video",
          container: "mp4",
          quality: qualityLabel,
          width: f.width,
          height: f.height,
          filesize: finalSize,
          hasAudio: true,
          hasVideo: true,
          vcodec: f.vcodec || "unknown",
          acodec: hasAudio ? f.acodec : (bestAudio?.acodec || "unknown"),
          fps: f.fps,
          bitrate: f.tbr || f.vbr,
        });
      }

      // Synthesize MP3 audio formats
      for (const f of audios.sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0))) {
        if (!f.format_id) continue;
        
        let aSize = f.filesize || f.filesize_approx;
        if (!aSize && f.abr && info.duration) {
          aSize = (f.abr * 1024 / 8) * info.duration;
        }

        const qualityLabel = f.abr ? `${Math.round(f.abr)} kbps` : (f.format_note || "Audio");

        audioFormats.push({
          id: f.format_id,
          type: "audio",
          container: "mp3",
          quality: qualityLabel,
          filesize: aSize,
          hasAudio: true,
          hasVideo: false,
          vcodec: "none",
          acodec: f.acodec || "unknown",
          bitrate: f.abr,
        });
      }
    }

    // Fallbacks if extraction failed
    if (videoFormats.length === 0) {
      videoFormats.push({
        id: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        type: "video",
        container: "mp4",
        quality: "Best Available",
        filesize: undefined,
        hasAudio: true,
        hasVideo: true,
        vcodec: "unknown",
        acodec: "unknown"
      });
    }
    if (audioFormats.length === 0) {
      audioFormats.push({
        id: "bestaudio/best",
        type: "audio",
        container: "mp3",
        quality: "Best Audio",
        filesize: undefined,
        hasAudio: true,
        hasVideo: false,
        vcodec: "none",
        acodec: "unknown"
      });
    }

    const formats = [...videoFormats, ...audioFormats];

    const response: AnalyzeResponse = {
      success: true,
      media: mediaInfo,
      formats,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Analyze Error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: (error as any).errors[0].message },
        { status: 400 }
      );
    }

    // Friendly error message for unsupported/private videos
    return NextResponse.json(
      { 
        success: false, 
        error: "We couldn't access this media. Make sure the content is public and available for download, and the URL is supported." 
      },
      { status: 400 }
    );
  }
}
