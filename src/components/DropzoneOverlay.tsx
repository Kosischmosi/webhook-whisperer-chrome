
import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DropzoneOverlayProps {
  onDrop: (e: React.DragEvent<HTMLDivElement>) => Promise<void> | void;
  onClose: () => void;
  selectedFile: File | null;
  parsedWebhooks: any;
  isImporting: boolean;
  handleStartImport: () => Promise<void>;
  handleCancelImport: () => void;
}

const DropzoneOverlay = ({
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDropEvent = async (e: React.DragEvent<HTMLDivElement>) => {
    setDragActive(false);
    await onDrop(e);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div
        ref={dropRef}
        className={`
          flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer gap-3 bg-white shadow-xl relative
          ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-primary/30"}
        `}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropEvent}
        tabIndex={0}
        style={{ minWidth: 340, minHeight: 270 }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-black text-xl"
          aria-label="Close"
        >
          ×
        </button>
        <div className={`p-4 rounded-full mb-3 transition-colors ${dragActive ? "bg-blue-200" : "bg-primary/10"}`}>
          <Upload className={`h-10 w-10 ${dragActive ? "text-blue-500" : "text-primary"}`} />
        </div>
        <h3 className="text-lg font-medium mb-1">CSV-Datei per Drag & Drop hier ablegen</h3>
        <p className="text-sm text-muted-foreground text-center mb-2 max-w-[260px]">
          Lass deine Datei hier fallen.<br/> 
          Oder schließe den Dialog mit „×“.
        </p>
        <div className="w-full flex flex-col items-center mt-2">
          {selectedFile && (
            <>
              <div className="text-xs mb-1">Datei: <b>{selectedFile.name}</b></div>
              {parsedWebhooks && Array.isArray(parsedWebhooks) && (
                <div className="text-xs text-muted-foreground mb-2">{parsedWebhooks.length} Webhooks erkannt</div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleStartImport}
                  disabled={isImporting}
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
};

export default DropzoneOverlay;
