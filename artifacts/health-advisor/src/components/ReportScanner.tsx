import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Loader2, CheckCircle2, AlertCircle, FileScan, X } from "lucide-react";
import { HealthInputs } from "@/lib/types";

interface ReportScannerProps {
  onExtracted: (values: Partial<HealthInputs>) => void;
}

const ACCEPTED = "image/png,image/jpeg,image/webp,application/pdf";

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function ReportScanner({ onExtracted }: ReportScannerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ count: number; preview?: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setSuccess(null);
    setBusy(true);
    setFileName(file.name);

    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }

    try {
      if (file.size > 15 * 1024 * 1024) {
        throw new Error("File is too large (max 15 MB).");
      }
      const { base64, mimeType } = await fileToBase64(file);
      const res = await fetch("/api/extract-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server returned ${res.status}`);
      }
      const data = await res.json();
      const extracted = (data.extracted ?? {}) as Partial<HealthInputs>;
      const count = Object.keys(extracted).length;
      if (count === 0) {
        throw new Error("Could not detect any lab values. Try a clearer image or fill the form manually.");
      }
      onExtracted(extracted);
      setSuccess({ count });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to scan the report.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setSuccess(null);
    setError(null);
    setPreviewUrl(null);
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileScan className="h-5 w-5 text-primary" />
          Scan or Upload Your Lab Report
        </CardTitle>
        <CardDescription>
          Upload a photo, scan or PDF of your lab report and we'll auto-fill the form for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0] ?? null)}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0] ?? null)}
        />

        <div className="grid sm:grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2 border-dashed hover:border-primary hover:bg-primary/5"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            <Upload className="h-6 w-6 text-primary" />
            <span className="font-medium">Upload File</span>
            <span className="text-xs text-muted-foreground">PNG, JPG, WEBP or PDF</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2 border-dashed hover:border-primary hover:bg-primary/5"
            onClick={() => cameraRef.current?.click()}
            disabled={busy}
          >
            <Camera className="h-6 w-6 text-primary" />
            <span className="font-medium">Scan with Camera</span>
            <span className="text-xs text-muted-foreground">Take a photo of the report</span>
          </Button>
        </div>

        {(busy || previewUrl || fileName) && (
          <div className="flex gap-3 p-3 rounded-lg border bg-background">
            {previewUrl ? (
              <img src={previewUrl} alt="Report preview" className="h-16 w-16 rounded object-cover border" />
            ) : (
              <div className="h-16 w-16 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">PDF</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              {busy && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Reading values from your report...
                </div>
              )}
              {success && !busy && (
                <div className="flex items-center gap-2 text-sm text-primary font-medium mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Filled in {success.count} value{success.count === 1 ? "" : "s"}. Review and adjust below.
                </div>
              )}
            </div>
            {!busy && (
              <Button type="button" size="icon" variant="ghost" onClick={reset} aria-label="Clear">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {error && (
          <div className="flex gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Your image is processed securely to extract values; we don't store the original document. Always double-check
          the extracted numbers before relying on them.
        </p>
      </CardContent>
    </Card>
  );
}
