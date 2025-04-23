
import { WebhookConfig } from "@/services/webhookService";
import WebhookCard from "@/components/WebhookCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { ParsedWebhook } from "@/hooks/useWebhookCSV";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WebhookListProps {
  loading: boolean;
  webhooks: WebhookConfig[];
  filteredWebhooks: WebhookConfig[];
  searchQuery: string;
  onAddNew: () => void;
  onEdit: (webhook: WebhookConfig) => void;
  onDelete: (webhookId: string) => void;
  setSearchQuery: (query: string) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => Promise<void> | void;
  selectedFile?: File | null;
  parsedWebhooks?: ParsedWebhook[] | null;
  isImporting?: boolean;
  handleStartImport?: () => Promise<void>;
  handleCancelImport?: () => void;
  onProviderFocus?: (webhookId: string) => void;
}

const WebhookList = ({ 
  loading, 
  webhooks, 
  filteredWebhooks, 
  searchQuery, 
  onAddNew, 
  onEdit, 
  onDelete,
  setSearchQuery,
  onDrop,
  selectedFile,
  parsedWebhooks,
  isImporting,
  handleStartImport,
  handleCancelImport,
  onProviderFocus
}: WebhookListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading webhooks...</span>
      </div>
    );
  }

  if (webhooks.length === 0) {
    // Pass all the import-related props to EmptyState
    return (
      <EmptyState 
        onAddNew={onAddNew} 
        onDrop={onDrop}
        selectedFile={selectedFile}
        parsedWebhooks={parsedWebhooks}
        isImporting={isImporting}
        handleStartImport={handleStartImport}
        handleCancelImport={handleCancelImport}
      />
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-1 gap-4">
        {filteredWebhooks.map((webhook) => (
          <WebhookCard
            key={webhook.id}
            webhook={webhook}
            onEdit={onEdit}
            onDelete={onDelete}
            onFocus={onProviderFocus}
          />
        ))}
        {filteredWebhooks.length === 0 && searchQuery && (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No webhooks found matching "{searchQuery}"</p>
            <Button variant="link" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default WebhookList;

