import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { WebhookConfig, webhookService } from "@/services/webhookService";
import { useToast } from "@/hooks/use-toast";
import WebhookHeader from "@/components/WebhookHeader";
import WebhookDialogs from "@/components/WebhookDialogs";
import WebhookListSection from "@/components/WebhookListSection";
import { useWebhookCSV } from "@/hooks/useWebhookCSV";

const WebhookManagerContainer = () => {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [deleteWebhookId, setDeleteWebhookId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropZone, setShowDropZone] = useState(false);
  const [lastFocusedWebhookId, setLastFocusedWebhookId] = useState<string | null>(null);

  const filteredWebhooks = useMemo(() => {
    if (!searchQuery) return webhooks;    
    const query = searchQuery.toLowerCase();
    return webhooks.filter(webhook => 
      webhook.name.toLowerCase().includes(query) ||
      webhook.url.toLowerCase().includes(query)
    );
  }, [searchQuery, webhooks]);

  const listSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWindowFocus = () => {
      if (lastFocusedWebhookId && filteredWebhooks.length > 0) {
        setTimeout(() => {
          const card = document.querySelector(`[data-webhook-id="${lastFocusedWebhookId}"] button[tabindex="0"]`);
          if (card instanceof HTMLElement) {
            card.focus();
          }
        }, 30);
      }
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [lastFocusedWebhookId, filteredWebhooks]);

  const loadWebhooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await webhookService.getAll();
      setWebhooks(data);
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
  }, [toast]);

  useEffect(() => {
    loadWebhooks();
  }, [loadWebhooks]);

  const handleAddWebhook = useCallback(() => {
    setEditingWebhook(null);
    setIsAddDialogOpen(true);
  }, []);

  const handleEditWebhook = useCallback((webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setIsAddDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsAddDialogOpen(false);
    setEditingWebhook(null);
  }, []);

  const handleWebhookSaved = useCallback(() => {
    loadWebhooks();
    setIsAddDialogOpen(false);
    setEditingWebhook(null);
  }, [loadWebhooks]);

  const handleDeleteClick = useCallback((webhookId: string) => {
    setDeleteWebhookId(webhookId);
  }, []);

  const confirmDelete = useCallback(async () => {
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
  }, [deleteWebhookId, loadWebhooks, toast]);

  const {
    handleExportCSV,
    handleDrop,
    selectedFile,
    parsedWebhooks,
    startImport,
    cancelImport,
    isImporting
  } = useWebhookCSV(webhooks, loadWebhooks);

  const handleShowDropZone = useCallback(() => setShowDropZone(true), []);

  const handleCancelImport = useCallback(() => {
    cancelImport();
    setShowDropZone(false);
  }, [cancelImport]);

  const handleStartImport = useCallback(async () => {
    await startImport();
    setShowDropZone(false);
  }, [startImport]);

  const handleProviderFocus = useCallback((webhookId: string) => {
    setLastFocusedWebhookId(webhookId);
  }, []);

  return (
    <div className="min-h-[600px] w-[480px] bg-background" ref={listSectionRef}>
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
          onProviderFocus={handleProviderFocus}
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
