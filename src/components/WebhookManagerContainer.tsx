
import { useState, useEffect } from "react";
import { WebhookConfig, webhookService } from "@/services/webhookService";
import { useToast } from "@/hooks/use-toast";
import WebhookHeader from "@/components/WebhookHeader";
import WebhookDialogs from "@/components/WebhookDialogs";
import WebhookListSection from "@/components/WebhookListSection";
import { useWebhookCSV } from "@/hooks/useWebhookCSV";

const WebhookManagerContainer = () => {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [filteredWebhooks, setFilteredWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [deleteWebhookId, setDeleteWebhookId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropZone, setShowDropZone] = useState(false);

  const loadWebhooks = async () => {
    setLoading(true);
    try {
      const data = await webhookService.getAll();
      setWebhooks(data);
      setFilteredWebhooks(data);
    } catch (error) {
      console.error("Error loading webhooks:", error);
      toast({
        title: "Error",
        description: "Failed to load webhook configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebhooks();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = webhooks.filter(webhook => 
        webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        webhook.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWebhooks(filtered);
    } else {
      setFilteredWebhooks(webhooks);
    }
  }, [searchQuery, webhooks]);

  const handleAddWebhook = () => {
    setEditingWebhook(null);
    setIsAddDialogOpen(true);
  };

  const handleEditWebhook = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingWebhook(null);
  };

  const handleWebhookSaved = () => {
    loadWebhooks();
    setIsAddDialogOpen(false);
    setEditingWebhook(null);
  };

  const handleDeleteClick = (webhookId: string) => {
    setDeleteWebhookId(webhookId);
  };

  const confirmDelete = async () => {
    if (!deleteWebhookId) return;
    try {
      await webhookService.delete(deleteWebhookId);
      toast({
        title: "Success",
        description: "Webhook deleted successfully",
      });
      loadWebhooks();
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive",
      });
    } finally {
      setDeleteWebhookId(null);
    }
  };

  const {
    handleExportCSV,
    handleDrop,
    selectedFile,
    parsedWebhooks,
    startImport,
    cancelImport,
    isImporting
  } = useWebhookCSV(webhooks, loadWebhooks);

  const handleShowDropZone = () => setShowDropZone(true);

  const handleCancelImport = () => {
    cancelImport();
    setShowDropZone(false);
  };

  const handleStartImport = async () => {
    await startImport();
    setShowDropZone(false);
  };

  // Die Listensektion und die Dialoge werden gemounted:
  return (
    <div className="min-h-[600px] w-[480px] bg-background">
      <WebhookHeader
        onExportCSV={handleExportCSV}
        onImportCSVClick={handleShowDropZone}
      />
      <main className="w-full px-3 py-2">
        <WebhookListSection 
          loading={loading}
          webhooks={webhooks}
          filteredWebhooks={filteredWebhooks}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddNew={handleAddWebhook}
          onEdit={handleEditWebhook}
          onDelete={handleDeleteClick}
          showDropZone={showDropZone}
          setShowDropZone={setShowDropZone}
          handleDrop={handleDrop}
          selectedFile={selectedFile}
          parsedWebhooks={parsedWebhooks}
          isImporting={isImporting}
          handleStartImport={handleStartImport}
          handleCancelImport={handleCancelImport}
        />
        <WebhookDialogs
          isAddDialogOpen={isAddDialogOpen}
          editingWebhook={editingWebhook}
          handleWebhookSaved={handleWebhookSaved}
          handleDialogClose={handleDialogClose}
          deleteWebhookId={deleteWebhookId}
          confirmDelete={confirmDelete}
          closeDeleteDialog={() => setDeleteWebhookId(null)}
        />
      </main>
    </div>
  );
};

export default WebhookManagerContainer;
