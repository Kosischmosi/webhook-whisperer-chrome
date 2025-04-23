
import { useRef } from "react";
import { WebhookConfig, webhookService } from "@/services/webhookService";
import { webhooksToCSV, csvToWebhooks } from "@/utils/csvUtils";
import { useToast } from "@/hooks/use-toast";

export const useWebhookCSV = (
  webhooks: WebhookConfig[],
  reloadWebhooks: () => void
) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a new FileReader
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error("Datei konnte nicht gelesen werden");
        
        const imported = csvToWebhooks(text);
        if (!imported.length) throw new Error("Keine Webhooks gefunden");
        
        for (const w of imported) {
          const exists = webhooks.some(existing => existing.name === w.name && existing.url === w.url);
          if (!exists)
            await webhookService.add(w);
        }
        
        toast({ title: "Import erfolgreich", description: `${imported.length} Webhooks importiert.` });
        reloadWebhooks();
      } catch (err) {
        console.error("CSV Import error:", err);
        toast({
          title: "Import fehlgeschlagen",
          description: "Die Datei konnte nicht gelesen oder das Format war ungültig.",
          variant: "destructive"
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Import fehlgeschlagen",
        description: "Die Datei konnte nicht gelesen werden.",
        variant: "destructive"
      });
    };
    
    // Read the file as text
    reader.readAsText(file);
    
    // Reset the file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return {
    handleExportCSV,
    handleImportCSV,
    fileInputRef,
    triggerImportDialog: () => fileInputRef.current?.click(),
  };
};
