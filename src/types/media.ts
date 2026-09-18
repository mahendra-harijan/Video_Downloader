export interface MediaFormat {
  id: string;
  type: "video" | "audio";
  container: string;
  quality: string;
  width?: number;
  height?: number;
  filesize?: number;
  hasAudio: boolean;
  hasVideo: boolean;
  vcodec: string;
  acodec: string;
  fps?: number;
  bitrate?: number;
}

export interface MediaInfo {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  source: string;
  url: string;
}

export interface AnalyzeResponse {
  success: boolean;
  media?: MediaInfo;
  formats?: MediaFormat[];
  error?: string;
}
