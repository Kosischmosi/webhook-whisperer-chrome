
import { useState, useEffect, useRef } from "react";
import { WebhookConfig, webhookService } from "@/services/webhookService";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import WebhookHeader from "@/components/WebhookHeader";
import WebhookActionBar from "@/components/WebhookActionBar";
import SearchBar from "@/components/SearchBar";
import WebhookList from "@/components/WebhookList";
import WebhookDialogForm from "@/components/WebhookDialogForm";
import DeleteWebhookDialog from "@/components/DeleteWebhookDialog";
import { webhooksToCSV, csvToWebhooks } from "@/utils/csvUtils";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [filteredWebhooks, setFilteredWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [deleteWebhookId, setDeleteWebhookId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // --- Export als CSV ---
  const handleExportCSV = () => {
    if (webhooks.length === 0) {
      toast({
        title: "Keine Daten",
        description: "Es sind keine Webhooks zum Exportieren vorhanden.",
        variant: "destructive",
      });
      return;
    }
    const simpleWebhooks = webhooks.map(({ name, url, secret }) => ({ name, url, secret }));
    const csv = webhooksToCSV(simpleWebhooks);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "webhooks.csv";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    toast({
      title: "Export erfolgreich",
      description: "Die Webhooks wurden als CSV exportiert.",
    });
  };

  // --- Import aus CSV ---
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = csvToWebhooks(text);
      if (!imported.length) throw new Error("Keine Webhooks gefunden");
      // Parallel speichern (nacheinander, damit bestehende IDs nicht überschrieben werden)
      for (const w of imported) {
        // Möglichkeit: Duplikate verhindern (nach Name+URL)
        const exists = webhooks.some(existing => existing.name === w.name && existing.url === w.url);
        if (!exists)
          await webhookService.add(w);
      }
      toast({ title: "Import erfolgreich", description: `${imported.length} Webhooks importiert.` });
      loadWebhooks();
    } catch (err) {
      toast({
        title: "Import fehlgeschlagen",
        description: "Die Datei konnte nicht gelesen oder das Format war ungültig.",
        variant: "destructive"
      });
    } finally {
      // Reset input value so user can import the same file twice
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isExtension = typeof chrome !== 'undefined' && !!chrome?.runtime?.id;

  return (
    <div className="min-h-[600px] w-[480px] bg-background">
      <WebhookHeader />

      <main className="w-full px-3 py-2">
        <div className="flex justify-end gap-3 mb-2">
          <Button size="sm" variant="secondary" onClick={handleExportCSV}>
            Export CSV
          </Button>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImportCSV}
          />
          <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Import CSV
          </Button>
        </div>
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
        <button
          onClick={handleAddWebhook}
          className="fixed bottom-4 right-4 p-2 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
        </button>
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

export default Index;
