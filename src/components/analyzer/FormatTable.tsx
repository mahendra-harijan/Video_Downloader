import { useState } from "react";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { MediaFormat, MediaInfo } from "@/types/media";
import { formatBytes } from "@/lib/format";
import { Button } from "@/components/ui/button";
// Let's use shadcn standard exports
import {
  Table as ShadcnTable,
  TableBody as ShadcnTableBody,
  TableCell as ShadcnTableCell,
  TableHead as ShadcnTableHead,
  TableHeader as ShadcnTableHeader,
  TableRow as ShadcnTableRow,
} from "@/components/ui/table";

import { toast } from "sonner";

interface FormatTableProps {
  formats: MediaFormat[];
  media: MediaInfo;
}

export function FormatTable({ formats, media }: FormatTableProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (format: MediaFormat) => {
    if (downloadingId) return;
    setDownloadingId(format.id);

    try {
      const cleanTitle = media.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${cleanTitle}_${format.quality}.${format.container}`;

      const url = new URL("/api/download", window.location.origin);
      url.searchParams.set("url", media.url);
      url.searchParams.set("formatId", format.id);
      url.searchParams.set("filename", filename);

      // Create an invisible iframe or anchor to trigger the browser's native download
      const a = document.createElement("a");
      a.href = url.toString();
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success("Download Preparing", {
        description: `Server is processing ${format.quality} ${format.container}. Please wait...`,
      });

      // Poll for the cookie that indicates the server has finished preparing and sent the headers
      const cookieName = `dl_${format.id.replace(/[^a-zA-Z0-9]/g, '')}`;
      const pollInterval = setInterval(() => {
        if (document.cookie.includes(`${cookieName}=1`)) {
          clearInterval(pollInterval);
          setDownloadingId(null);
          toast.success("Download Started", {
            description: "Your file is now downloading.",
          });
        }
      }, 1000);

      // Fallback timeout in case something goes wrong (e.g. 10 minutes)
      setTimeout(() => {
        clearInterval(pollInterval);
        setDownloadingId(prev => prev === format.id ? null : prev);
      }, 600000);

    } catch (err) {
      toast.error("Download Failed", {
        description: "Something went wrong while starting the download.",
      });
      setDownloadingId(null);
    }
  };

  if (formats.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No formats available in this category.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border">
      <div className="hidden md:block">
        <ShadcnTable>
          <ShadcnTableHeader className="bg-muted/50">
            <ShadcnTableRow>
              <ShadcnTableHead>Quality</ShadcnTableHead>
              <ShadcnTableHead>Format</ShadcnTableHead>
              <ShadcnTableHead>Resolution</ShadcnTableHead>
              <ShadcnTableHead>Size</ShadcnTableHead>
              <ShadcnTableHead className="text-right">Action</ShadcnTableHead>
            </ShadcnTableRow>
          </ShadcnTableHeader>
          <ShadcnTableBody>
            {formats.map((f) => (
              <ShadcnTableRow key={f.id} className="transition-colors hover:bg-muted/30">
                <ShadcnTableCell className="font-medium">{f.quality}</ShadcnTableCell>
                <ShadcnTableCell className="uppercase">{f.container}</ShadcnTableCell>
                <ShadcnTableCell>
                  {f.width && f.height ? `${f.width}×${f.height}` : "-"}
                </ShadcnTableCell>
                <ShadcnTableCell>{formatBytes(f.filesize)}</ShadcnTableCell>
                <ShadcnTableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => handleDownload(f)}
                    disabled={downloadingId !== null}
                    variant={downloadingId === f.id ? "secondary" : "default"}
                  >
                    {downloadingId === f.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Preparing
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                </ShadcnTableCell>
              </ShadcnTableRow>
            ))}
          </ShadcnTableBody>
        </ShadcnTable>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-3 p-3 md:hidden">
        {formats.map((f) => (
          <div key={f.id} className="flex flex-col gap-3 rounded-lg border p-4 bg-card shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">{f.quality}</span>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary uppercase">
                {f.container}
              </span>
            </div>
            <div className="text-sm text-muted-foreground flex justify-between">
              <span>{f.width && f.height ? `${f.width}×${f.height}` : (f.type === 'audio' ? 'Audio Only' : 'Unknown')}</span>
              <span>{formatBytes(f.filesize)}</span>
            </div>
            <Button
              className="w-full mt-2"
              onClick={() => handleDownload(f)}
              disabled={downloadingId !== null}
              variant={downloadingId === f.id ? "secondary" : "default"}
            >
              {downloadingId === f.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
