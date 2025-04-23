
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
    console.log("Import CSV triggered");
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    console.log("File selected:", file.name, file.type, file.size);
    
    // Prevent default behavior that might close the popup
    e.preventDefault();
    e.stopPropagation();
    
    // Create a new FileReader
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        console.log("FileReader loaded");
        const text = event.target?.result as string;
        if (!text) {
          console.error("No text content in file");
          throw new Error("Datei konnte nicht gelesen werden");
        }
        
        console.log("CSV content length:", text.length);
        const imported = csvToWebhooks(text);
        console.log("Parsed webhooks:", imported);
        
        if (!imported.length) {
          console.error("No webhooks found in CSV");
          throw new Error("Keine Webhooks gefunden");
        }
        
        let importedCount = 0;
        // Verwende Promise.all für parallele Verarbeitung, aber mit einem kleinen Delay
        // um das UI nicht zu blockieren und das Popup offen zu halten
        await Promise.all(imported.map(async (w, index) => {
          const exists = webhooks.some(existing => existing.name === w.name && existing.url === w.url);
          if (!exists) {
            console.log("Adding webhook:", w.name);
            // Delay hinzufügen, um das UI nicht zu blockieren
            await new Promise(resolve => setTimeout(resolve, index * 50));
            await webhookService.add(w);
            importedCount++;
          } else {
            console.log("Webhook already exists:", w.name);
          }
        }));
        
        toast({ 
          title: "Import erfolgreich", 
          description: `${importedCount} Webhooks importiert.` 
        });
        
        // Verwende setTimeout, um sicherzustellen, dass das Popup nicht geschlossen wird
        setTimeout(() => {
          reloadWebhooks();
        }, 100);
      } catch (err) {
        console.error("CSV Import error:", err);
        toast({
          title: "Import fehlgeschlagen",
          description: "Die Datei konnte nicht gelesen oder das Format war ungültig.",
          variant: "destructive"
        });
      }
    };
    
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      toast({
        title: "Import fehlgeschlagen",
        description: "Die Datei konnte nicht gelesen werden.",
        variant: "destructive"
      });
    };
    
    // Read the file as text
    console.log("Starting to read file...");
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
