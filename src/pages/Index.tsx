import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { WebhookConfig, webhookService } from "@/services/webhookService";
import WebhookForm from "@/components/WebhookForm";
import WebhookCard from "@/components/WebhookCard";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { WebhookWhispererIcon } from "@/assets/IconGenerator";
import { Loader2, Plus, Search } from "lucide-react";

const Index = () => {
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

  const isExtension = typeof chrome !== 'undefined' && !!chrome?.runtime?.id;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <WebhookWhispererIcon size={36} />
            <h1 className="text-2xl font-semibold ml-3">Webhook Whisperer</h1>
          </div>
          {!isExtension && (
            <div className="text-sm text-muted-foreground">
              Chrome Extension Mode
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Your Webhook Configurations</h2>
          <Button onClick={handleAddWebhook}>
            <Plus size={16} className="mr-2" /> Add New Webhook
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            className="pl-10"
            placeholder="Search webhooks by name or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Loading webhooks...</span>
          </div>
        ) : webhooks.length === 0 ? (
          <EmptyState onAddNew={handleAddWebhook} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWebhooks.map((webhook) => (
              <WebhookCard
                key={webhook.id}
                webhook={webhook}
                onEdit={handleEditWebhook}
                onDelete={handleDeleteClick}
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
        )}

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <WebhookForm
              webhook={editingWebhook || undefined}
              onSave={handleWebhookSaved}
              onCancel={handleDialogClose}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteWebhookId} onOpenChange={(open) => !open && setDeleteWebhookId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this webhook configuration. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Index;
