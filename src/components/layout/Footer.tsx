import Link from "next/link";
import { CloudDownload } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background py-8">
      <div className="container mx-auto max-w-5xl px-4 md:px-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <div className="flex items-center gap-2">
            <CloudDownload className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">CloudDrop</span>
          </div>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left max-w-sm">
            Fast, simple media downloads for content you have permission to save.
          </p>
        </div>
        <div className="flex gap-10">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-sm">Product</h3>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
            <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">How it Works</Link>
            <Link href="/#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-sm">Legal</h3>
            <span className="text-sm text-muted-foreground cursor-not-allowed">Terms</span>
            <span className="text-sm text-muted-foreground cursor-not-allowed">Privacy</span>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
        <p>
          Only download content you own or have permission to download. Respect the rights and terms of the content provider.
        </p>
        <p className="mt-2">© 2026 CloudDrop</p>
      </div>
    </footer>
  );
}
