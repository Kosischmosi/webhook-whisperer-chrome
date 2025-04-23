
import { useRef, useState, memo } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ParsedWebhook } from "@/hooks/useWebhookCSV";

interface DropzoneOverlayProps {
  onDrop: (e: React.DragEvent<HTMLDivElement>) => Promise<void> | void;
  onClose: () => void;
  selectedFile: File | null;
  parsedWebhooks: ParsedWebhook[] | null;
  isImporting: boolean;
  handleStartImport: () => Promise<void>;
  handleCancelImport: () => void;
}

// Optimiert: Mit memo und besseren Zugänglichkeitsfeatures
const DropzoneOverlay = memo(({
  onDrop,
  onClose,
  selectedFile,
  parsedWebhooks,
  isImporting,
  handleStartImport,
  handleCancelImport,
}: DropzoneOverlayProps) => {
  const [dragActive, setDragActive] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Event-Handler verbessert
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Nur deaktivieren, wenn wir wirklich das Container-Element verlassen
    const rect = dropRef.current?.getBoundingClientRect();
    if (rect) {
      const { left, right, top, bottom } = rect;
      if (
        e.clientX < left ||
        e.clientX > right ||
        e.clientY < top ||
        e.clientY > bottom
      ) {
        setDragActive(false);
      }
    } else {
      setDragActive(false);
    }
  };

  const handleDropEvent = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    await onDrop(e);
  };

  // Tastatur-Navigation hinzugefügt für bessere Zugänglichkeit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    // Overlay mit besserem Keyboard-Support
    <div 
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dropzone-title"
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dropRef}
        className={cn(
          "flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed",
          "transition-all cursor-pointer gap-3 bg-white shadow-xl relative",
          dragActive 
            ? "border-blue-500 bg-blue-50/90" 
            : "border-gray-300 hover:border-primary/40"
        )}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropEvent}
        tabIndex={0}
        role="button"
        aria-describedby="dropzone-desc"
        style={{ minWidth: 340, minHeight: 270 }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-black p-1 rounded-full"
          aria-label="Schließen"
          type="button"
        >
          ×
        </button>
        <div 
          className={cn(
            "p-4 rounded-full mb-3 transition-colors", 
            dragActive ? "bg-blue-200" : "bg-primary/10"
          )}
        >
          <Upload 
            className={cn("h-10 w-10", dragActive ? "text-blue-500" : "text-primary")} 
            aria-hidden="true"
          />
        </div>
        <h3 
          id="dropzone-title" 
          className="text-lg font-medium mb-1"
        >
          CSV-Datei per Drag & Drop hier ablegen
        </h3>
        <p 
          id="dropzone-desc" 
          className="text-sm text-muted-foreground text-center mb-2 max-w-[260px]"
        >
          Lass deine Datei hier fallen.<br/> 
          Oder schließe den Dialog mit „×".
        </p>
        <div className="w-full flex flex-col items-center mt-2">
          {selectedFile && (
            <>
              <div className="text-xs mb-1">
                Datei: <strong>{selectedFile.name}</strong>
              </div>
              {parsedWebhooks && Array.isArray(parsedWebhooks) && (
                <div className="text-xs text-muted-foreground mb-2">
                  {parsedWebhooks.length} Webhooks erkannt
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleStartImport}
                  disabled={isImporting}
                  aria-busy={isImporting}
                >
                  {isImporting ? "Importiert..." : "Importieren"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelImport}
                  disabled={isImporting}
                >
                  Abbrechen
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                <code>name,url,secret</code> als Kopfzeile
              </p>
            </>
          )}
          {!selectedFile && (
            <p className="text-xs text-gray-400 mt-2">
              Unterstützt CSV mit <code>name,url,secret</code>
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

DropzoneOverlay.displayName = "DropzoneOverlay";

export default DropzoneOverlay;
