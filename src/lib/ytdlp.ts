import fs from "fs";
import path from "path";
import os from "os";
import { create } from "youtube-dl-exec";
import https from "https";

const YTDLP_URL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux";

async function downloadBinary(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 && response.headers.location) {
        // Handle redirect
        https.get(response.headers.location, (res) => {
          const file = fs.createWriteStream(dest, { mode: 0o777 });
          res.pipe(file);
          res.on("end", () => resolve());
          res.on("error", reject);
        }).on("error", reject);
      } else if (response.statusCode === 200) {
        const file = fs.createWriteStream(dest, { mode: 0o777 });
        response.pipe(file);
        response.on("end", () => resolve());
        response.on("error", reject);
      } else {
        reject(new Error(`Failed to download yt-dlp: ${response.statusCode}`));
      }
    }).on("error", reject);
  });
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
