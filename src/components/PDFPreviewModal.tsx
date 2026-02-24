import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import "./PDFPreviewModal.css";

interface PDFPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    htmlContent: string;
    fileName: string;
    onConfirmDownload: () => Promise<void>;
}

export default function PDFPreviewModal({
    open,
    onOpenChange,
    htmlContent,
    fileName,
    onConfirmDownload,
}: PDFPreviewModalProps) {
    const [zoom, setZoom] = useState(100);
    const [isDownloading, setIsDownloading] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    const handleZoom = (delta: number) => {
        setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
    };

    useEffect(() => {
        if (previewRef.current) {
            const element = previewRef.current.querySelector('.pdf-preview-content') as HTMLElement;
            if (element) {
                element.style.setProperty('--zoom-scale', `${zoom / 100}`);
            }
        }
    }, [zoom]);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            await onConfirmDownload();
            toast.success("PDF downloaded successfully");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to download PDF: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>PDF Preview - {fileName}</DialogTitle>
                </DialogHeader>

                <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded">
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleZoom(-10)}
                            disabled={zoom <= 50}
                            title="Zoom out"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center text-sm font-medium">{zoom}%</span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleZoom(10)}
                            disabled={zoom >= 200}
                            title="Zoom in"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div
                    ref={previewRef}
                    className="pdf-preview-container flex-1 overflow-auto bg-gray-100 p-4 rounded border flex justify-center items-start"
                >
                    <div
                        className="pdf-preview-content bg-white p-5 shadow-lg"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </div>

                <DialogFooter className="flex gap-2 justify-between">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button onClick={handleDownload} disabled={isDownloading}>
                        <Download className="h-4 w-4 mr-2" />
                        {isDownloading ? "Downloading..." : "Download PDF"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
