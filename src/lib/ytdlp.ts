import fs from "fs";
import path from "path";
import os from "os";
import { create } from "youtube-dl-exec";
import https from "https";

const YTDLP_URL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux";

async function downloadBinary(url: string, dest: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download yt-dlp: ${response.status} ${response.statusText}`);
  }
  
  if (!response.body) {
    throw new Error("No response body");
  }

  const fileStream = fs.createWriteStream(dest);
  
  // Convert web ReadableStream to Node.js stream and pipe
  const reader = response.body.getReader();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fileStream.write(value);
    }
  } finally {
    fileStream.end();
  }

  // Wait for file to finish writing completely
  await new Promise(resolve => fileStream.on('finish', () => resolve(undefined)));
  
  // Make the binary executable
  fs.chmodSync(dest, 0o777);
}

let ytdlpInstance: ReturnType<typeof create> | null = null;

export async function getYtdlp() {
  if (ytdlpInstance) return ytdlpInstance;

  const isWindows = os.platform() === "win32";

  if (isWindows) {
    // On local Windows, rely on the default youtube-dl-exec behavior
    // which uses the yt-dlp.exe downloaded during npm install
    ytdlpInstance = create("yt-dlp");
    return ytdlpInstance;
  }

  // On Linux (Vercel), download the compiled standalone binary dynamically
  // This bypasses the need for python3 to be installed on the server
  const binPath = path.join(os.tmpdir(), "yt-dlp_linux");

  if (!fs.existsSync(binPath)) {
    console.log("Downloading standalone yt-dlp_linux binary to /tmp...");
    await downloadBinary(YTDLP_URL, binPath);
    console.log("Download complete.");
  }

  ytdlpInstance = create(binPath);
  return ytdlpInstance;
}
