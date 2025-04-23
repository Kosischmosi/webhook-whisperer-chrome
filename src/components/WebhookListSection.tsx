
import { memo } from "react";
import WebhookActionBar from "@/components/WebhookActionBar";
import SearchBar from "@/components/SearchBar";
import WebhookList from "@/components/WebhookList";
import AddWebhookButton from "@/components/AddWebhookButton";
import { WebhookConfig } from "@/services/webhookService";
import DropzoneOverlay from "@/components/DropzoneOverlay";
import { ParsedWebhook } from "@/hooks/useWebhookCSV";

interface WebhookListSectionProps {
  loading: boolean;
  webhooks: WebhookConfig[];
  filteredWebhooks: WebhookConfig[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddNew: () => void;
  onEdit: (webhook: WebhookConfig) => void;
  onDelete: (webhookId: string) => void;
  showDropZone: boolean;
  setShowDropZone: (show: boolean) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => Promise<void> | void;
  selectedFile: File | null;
  parsedWebhooks: ParsedWebhook[] | null;
  isImporting: boolean;
  handleStartImport: () => Promise<void>;
  handleCancelImport: () => void;
  onProviderFocus?: (webhookId: string) => void;
}

const WebhookListSection = memo(({
  loading,
  webhooks,
  filteredWebhooks,
  searchQuery,
  setSearchQuery,
  onAddNew,
  onEdit,
  onDelete,
  showDropZone,
  setShowDropZone,
  handleDrop,
  selectedFile,
  parsedWebhooks,
  isImporting,
  handleStartImport,
  handleCancelImport,
  onProviderFocus,
}: WebhookListSectionProps) => {
  const importProps = {
    onDrop: handleDrop,
    selectedFile,
    parsedWebhooks,
    isImporting,
    handleStartImport,
    handleCancelImport
  };

  return (
    <div className="relative">
      <WebhookActionBar onAddNew={onAddNew} />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <WebhookList
        loading={loading}
        webhooks={webhooks}
        filteredWebhooks={filteredWebhooks}
        searchQuery={searchQuery}
        onAddNew={onAddNew}
        onEdit={onEdit}
        onDelete={onDelete}
        setSearchQuery={setSearchQuery}
        importProps={importProps}
        onProviderFocus={onProviderFocus}
      />
      <AddWebhookButton onClick={onAddNew} />
      {showDropZone && (
        <DropzoneOverlay
          onDrop={handleDrop}
          onClose={() => setShowDropZone(false)}
          selectedFile={selectedFile}
          parsedWebhooks={parsedWebhooks}
          isImporting={isImporting}
          handleStartImport={handleStartImport}
          handleCancelImport={handleCancelImport}
        />
      )}
    </div>
  );
});

WebhookListSection.displayName = "WebhookListSection";

export default WebhookListSection;
