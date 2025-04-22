import { WebhookConfig } from "@/services/webhookService";
import WebhookCard from "@/components/WebhookCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";

interface WebhookListProps {
  loading: boolean;
  webhooks: WebhookConfig[];
  filteredWebhooks: WebhookConfig[];
  searchQuery: string;
  onAddNew: () => void;
  onEdit: (webhook: WebhookConfig) => void;
  onDelete: (webhookId: string) => void;
  setSearchQuery: (query: string) => void;
}

const WebhookList = ({ 
  loading, 
  webhooks, 
  filteredWebhooks, 
  searchQuery, 
  onAddNew, 
  onEdit, 
  onDelete,
  setSearchQuery 
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
    return <EmptyState onAddNew={onAddNew} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {filteredWebhooks.map((webhook) => (
        <WebhookCard
          key={webhook.id}
          webhook={webhook}
          onEdit={onEdit}
          onDelete={onDelete}
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
  );
};

export default WebhookList;
