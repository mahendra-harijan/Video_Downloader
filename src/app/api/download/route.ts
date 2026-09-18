import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import youtubedl from "youtube-dl-exec";
import path from "path";
import { Readable } from "stream";
import fs from "fs";
import os from "os";

// Must run in Node.js runtime (not Edge) because it uses child_process
export const runtime = 'nodejs';

const downloadQuerySchema = z.object({
  url: z.string().url("Valid URL is required."),
  formatId: z.string().min(1, "Format ID is required."),
  filename: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");
    const formatId = searchParams.get("formatId");
    let filename = searchParams.get("filename") || "download";

    // Validate
    const parsed = downloadQuerySchema.parse({ url, formatId, filename });

    // Clean up filename to prevent path traversal / weird chars
    filename = (parsed.filename ?? "download").replace(/[^a-z0-9_\-\.]/gi, '_');

    const isAudio = filename.endsWith(".mp3");
    
    // Create a temporary file path
    const tmpExt = isAudio ? ".mp3" : ".mp4";
    const tmpFile = path.join(os.tmpdir(), `dl_${Date.now()}_${Math.floor(Math.random() * 1000)}${tmpExt}`);

    // Options for yt-dlp
    const dlOptions: any = {
      format: parsed.formatId,
      output: tmpFile,
      noWarnings: true,
      callHome: false,
      noCheckCertificates: true,
      quiet: true,
    };

    if (isAudio) {
      dlOptions.extractAudio = true;
      dlOptions.audioFormat = "mp3";
    } else {
      // Force MP4 container for video if we are merging
      dlOptions.mergeOutputFormat = "mp4";
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Await the download process to complete
          await youtubedl(parsed.url, dlOptions);

          // If file doesn't exist, something went wrong
          if (!fs.existsSync(tmpFile)) {
            throw new Error("File was not created by yt-dlp");
          }

          // Read the file as a stream
          const fileStream = fs.createReadStream(tmpFile);

          fileStream.on('data', (chunk) => {
            controller.enqueue(chunk);
          });

          fileStream.on('end', () => {
            controller.close();
            try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch (e) {}
          });

          fileStream.on('error', (err) => {
            controller.error(err);
            try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch (e) {}
          });
        } catch (error) {
          console.error("Stream Error:", error);
          controller.error(error);
          try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch (e) {}
        }
      },
      cancel() {
        try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch (e) {}
      }
    });

    const headers = new Headers();
    // Suggest the browser to download the file with this name
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Content-Type", "application/octet-stream");
    
    // Set a cookie so the frontend knows the server has responded and the download has started
    const cookieName = `dl_${parsed.formatId.replace(/[^a-zA-Z0-9]/g, '')}`;
    headers.set("Set-Cookie", `${cookieName}=1; Path=/; Max-Age=60; SameSite=Lax`);

    return new NextResponse(stream, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Download Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: (error as any).errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to prepare download. The source may be restricted or unavailable." 
      },
      { status: 400 }
    );
  }
}
