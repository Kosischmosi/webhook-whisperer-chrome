
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
  // STATE für Anzeige des Drop-Feldes
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

  // --- Anpassung: useWebhookCSV wird simpler ---

  const {
    handleExportCSV,
    handleDrop,
    selectedFile,
    parsedWebhooks,
    startImport,
    cancelImport,
    isImporting
  } = useWebhookCSV(webhooks, loadWebhooks);

  // Zeige DropZone nur wenn showDropZone true ist:
  const handleShowDropZone = () => setShowDropZone(true);

  // DropZone schließen, wenn Import abgebrochen oder abgeschlossen
  const handleCancelImport = () => {
    cancelImport();
    setShowDropZone(false);
  };

  const handleStartImport = async () => {
    await startImport();
    setShowDropZone(false);
  };

  // Wenn Import abgeschlossen wird, schließe DropZone (auch beim "x")
  const handleDropWithClose = async (e: React.DragEvent<HTMLDivElement>) => {
    await handleDrop(e);
    // Falls Datei erfolgreich geladen wurde, Dropzone bleiben; sonst zurück zur Auswahl
    // stay open here (user muss Import manuell starten)
  };

  return (
    <div className="min-h-[600px] w-[480px] bg-background">
      <WebhookHeader
        onExportCSV={handleExportCSV}
        // Upload-Icon: Zeige Drop-Feld per Klick!
        onImportCSVClick={handleShowDropZone}
      />
      <main className="w-full px-3 py-2">
        {/* DRAG & DROP IMPORTFELD - NUR falls getriggert */}
        {showDropZone && (
          <div 
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
            onClick={handleCancelImport}
          >
            <div
              className="bg-white border-2 border-blue-400 rounded-lg p-6 shadow-xl flex flex-col items-center min-w-[340px] relative"
              onDrop={handleDropWithClose}
              onDragOver={e => { e.preventDefault(); }}
              onDragEnter={e => { e.preventDefault(); }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
                onClick={handleCancelImport}
                aria-label="Import abbrechen"
              >
                ×
              </button>
              <FileInput className="mb-2 h-10 w-10 text-blue-400" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">CSV-Datei hier ablegen</h3>
              <p className="text-sm text-gray-500 mb-3">Ziehe deine Datei ins Feld</p>
              {!selectedFile && !parsedWebhooks && (
                <p className="text-xs text-gray-400 mb-2">Unterstützt CSV mit <code>name,url,secret</code></p>
              )}
              {/* Falls Datei geladen ist und geparst wurde */}
              {selectedFile && parsedWebhooks && (
                <div className="w-full mb-2 text-center">
                  <p className="text-sm text-gray-600 mb-1">Datei: {selectedFile.name}</p>
                  <p className="text-sm text-gray-600 mb-2">{parsedWebhooks.length} Webhooks gefunden</p>
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleStartImport}
                      disabled={isImporting || parsedWebhooks.length === 0}
                      className="flex-1"
                    >
                      {isImporting ? "Wird importiert..." : "Import starten"}
                    </Button>
                    <Button
                      onClick={handleCancelImport}
                      variant="outline"
                      disabled={isImporting}
                      className="flex-1"
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* KEIN klassischer Dateiupload mehr! */}

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
