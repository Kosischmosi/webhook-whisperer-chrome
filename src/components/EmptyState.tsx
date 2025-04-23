
import { useRef, useState } from "react";
import { MessageSquare, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddNew: () => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => Promise<void> | void;
}

const EmptyState = ({ onAddNew, onDrop }: EmptyStateProps) => {
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
    if (onDrop) await onDrop(e);
  };

  return (
    <div
      ref={dropRef}
      className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed my-4 transition-all cursor-pointer gap-2
        ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-primary/30"}
      `}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropEvent}
      tabIndex={0}
    >
      <div className={`p-3 rounded-full mb-4 transition-colors ${dragActive ? "bg-blue-200" : "bg-primary/10"}`}>
        <Upload className={`h-8 w-8 ${dragActive ? "text-blue-500" : "text-primary"}`} />
      </div>
      <h3 className="text-lg font-medium mb-2">Drag & Drop your CSV here</h3>
      <p className="text-sm text-muted-foreground text-center mb-2 max-w-[230px]">
        You can also click below to add your first webhook manually.
      </p>
      <Button variant="secondary" onClick={onAddNew}>Add Webhook Manually</Button>
      <p className="text-xs text-gray-400 mt-2">Supports CSV with <code>name,url,secret</code></p>
      <span
        className={`absolute pointer-events-none select-none opacity-0`}
        aria-hidden
      />
    </div>
  );
};

export default EmptyState;
