
import { useState, useEffect } from "react";
import { WebhookConfig, webhookService } from "@/services/webhookService";
import { useToast } from "@/hooks/use-toast";
import WebhookHeader from "@/components/WebhookHeader";
import WebhookActionBar from "@/components/WebhookActionBar";
import SearchBar from "@/components/SearchBar";
import WebhookList from "@/components/WebhookList";
import WebhookDialogForm from "@/components/WebhookDialogForm";
import DeleteWebhookDialog from "@/components/DeleteWebhookDialog";
import AddWebhookButton from "@/components/AddWebhookButton";
import { useWebhookCSV } from "@/hooks/useWebhookCSV";

const WebhookManager = () => {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [filteredWebhooks, setFilteredWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [deleteWebhookId, setDeleteWebhookId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    handleImportCSV,
    fileInputRef,
    triggerImportDialog
  } = useWebhookCSV(webhooks, loadWebhooks);

  return (
    <div className="min-h-[600px] w-[480px] bg-background">
      <WebhookHeader
        onExportCSV={handleExportCSV}
        onImportCSVClick={triggerImportDialog}
      />
      <main className="w-full px-3 py-2">
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImportCSV}
        />
        <WebhookActionBar onAddNew={handleAddWebhook} />
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <WebhookList 
          loading={loading}
          webhooks={webhooks}
          filteredWebhooks={filteredWebhooks}
          searchQuery={searchQuery}
          onAddNew={handleAddWebhook}
          onEdit={handleEditWebhook}
          onDelete={handleDeleteClick}
          setSearchQuery={setSearchQuery}
        />
        <AddWebhookButton onClick={handleAddWebhook} />
        <WebhookDialogForm
          isOpen={isAddDialogOpen}
          webhook={editingWebhook}
          onSave={handleWebhookSaved}
          onClose={handleDialogClose}
        />
        <DeleteWebhookDialog 
          isOpen={!!deleteWebhookId}
          onClose={() => setDeleteWebhookId(null)}
          onConfirm={confirmDelete}
        />
      </main>
    </div>
  );
};

export default WebhookManager;
