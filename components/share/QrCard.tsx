"use client";

import * as React from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Copy, Download, Share2, Check, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { getBaseUrl, formatUrlDisplay } from "@/lib/utils";

export interface QrCardProps {
  username: string;
  name: string;
  avatarUrl?: string | null;
  showPrintButton?: boolean;
  className?: string;
}

export function QrCard({
  username,
  name,
  avatarUrl,
  showPrintButton = false,
  className,
}: QrCardProps) {
  const [copied, setCopied] = React.useState(false);
  const [canShare, setCanShare] = React.useState(false);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const svgRef = React.useRef<HTMLDivElement>(null);

  const baseUrl = getBaseUrl();
  const [profileUrl, setProfileUrl] = React.useState(`${baseUrl}/${username}`);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setProfileUrl(`${window.location.origin}/${username}`);
    }
    if (typeof navigator !== "undefined" && "share" in navigator) {
      setCanShare(true);
    }
  }, [username]);

  const qrTargetUrl = `${profileUrl}?ref=qr`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    try {
      const url = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Downloaded high-resolution PNG QR code!");
    } catch {
      toast.error("Failed to generate PNG");
    }
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    try {
      const svgElement = svgRef.current.querySelector("svg");
      if (!svgElement) return;

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const a = document.createElement("a");
      a.href = svgUrl;
      a.download = `${username}-qr.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(svgUrl);

      toast.success("Downloaded vector SVG QR code!");
    } catch {
      toast.error("Failed to generate SVG");
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: `${name} | MyLinks`,
        text: `Check out ${name}'s links on MyLinks`,
        url: profileUrl,
      });
    } catch (err) {
      // Ignore user cancellation
      if ((err as Error)?.name !== "AbortError") {
        toast.error("Sharing failed");
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Image settings for embedding avatar inside QR code
  const imageSettings = avatarUrl
    ? {
        src: avatarUrl,
        x: undefined,
        y: undefined,
        height: 40,
        width: 40,
        excavate: true,
      }
    : undefined;

  const imageSettingsExport = avatarUrl
    ? {
        src: avatarUrl,
        x: undefined,
        y: undefined,
        height: 180,
        width: 180,
        excavate: true,
      }
    : undefined;

  return (
    <div className={className}>
      {/* Visual QR Container - White card with quiet zone (padding) */}
      <div className="flex flex-col items-center">
        <div
          ref={svgRef}
          className="qr-print-card bg-white p-6 rounded-2xl shadow-xl flex items-center justify-center border border-white/10"
        >
          <QRCodeSVG
            value={qrTargetUrl}
            size={220}
            level="H"
            marginSize={2}
            imageSettings={imageSettings}
          />
        </div>

        {/* Hidden high-res 1024x1024 canvas for crisp PNG download */}
        <div className="hidden">
          <QRCodeCanvas
            ref={canvasRef}
            value={qrTargetUrl}
            size={1024}
            level="H"
            marginSize={3}
            imageSettings={imageSettingsExport}
          />
        </div>

        {/* Info below QR */}
        <div className="mt-4 text-center">
          <h3 className="font-semibold text-white text-base">{name}</h3>
          <p
            className="text-sm text-sky-400 font-mono mt-0.5 break-all"
            suppressHydrationWarning
          >
            {formatUrlDisplay(profileUrl)}
          </p>
        </div>
      </div>

      {/* Action buttons (hidden on print) */}
      <div className="no-print mt-6 grid grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          className="w-full"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4 text-neutral-400" />
          )}
          <span>{copied ? "Copied" : "Copy link"}</span>
        </Button>

        {canShare && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleNativeShare}
            className="w-full"
          >
            <Share2 className="w-4 h-4 text-neutral-400" />
            <span>Share...</span>
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownloadPng}
          className="w-full"
        >
          <Download className="w-4 h-4 text-neutral-400" />
          <span>PNG (1024px)</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownloadSvg}
          className="w-full"
        >
          <Download className="w-4 h-4 text-neutral-400" />
          <span>Vector SVG</span>
        </Button>

        {showPrintButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            className="col-span-2 w-full mt-1 border border-white/5"
          >
            <Printer className="w-4 h-4 text-neutral-400 mr-1.5" />
            <span>Print QR card</span>
          </Button>
        )}
      </div>
    </div>
  );
}
