
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileInput } from "lucide-react";

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
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    fileInputRef,
    triggerFileDialog,
    selectedFile,
    parsedWebhooks,
    startImport,
    cancelImport,
    isImporting
  } = useWebhookCSV(webhooks, loadWebhooks);

  return (
    <div className="min-h-[600px] w-[480px] bg-background">
      <WebhookHeader
        onExportCSV={handleExportCSV}
        onImportCSVClick={triggerFileDialog}
      />
      <main className="w-full px-3 py-2">
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          aria-label="CSV Import"
        />
        
        {/* CSV Import-Bereich anzeigen, wenn keine Datei ausgewählt ist */}
        {!selectedFile && !parsedWebhooks && (
          <div 
            className="mt-4 mb-6 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onClick={triggerFileDialog}
          >
            <FileInput className="mx-auto mb-2 h-10 w-10 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">CSV-Datei importieren</h3>
            <p className="text-sm text-gray-500 mb-2">Drag & Drop oder klicken zum Auswählen</p>
            <p className="text-xs text-gray-400">Unterstützt CSV-Dateien mit name, url und secret</p>
          </div>
        )}
        
        {/* Zweiter Schritt des Imports anzeigen, wenn eine Datei ausgewählt wurde */}
        {selectedFile && parsedWebhooks && (
          <div className="mt-4 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2">CSV-Datei bereit zum Import</h3>
            <p className="text-sm text-gray-600 mb-1">Datei: {selectedFile.name}</p>
            <p className="text-sm text-gray-600 mb-4">
              {parsedWebhooks.length} Webhooks gefunden
            </p>
            <div className="flex space-x-3">
              <Button 
                onClick={startImport} 
                disabled={isImporting || parsedWebhooks.length === 0}
                className="flex-1"
              >
                {isImporting ? "Wird importiert..." : "Import starten"}
              </Button>
              <Button 
                onClick={cancelImport} 
                variant="outline" 
                disabled={isImporting}
                className="flex-1"
              >
                Abbrechen
              </Button>
            </div>
          </div>
        )}
        
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
