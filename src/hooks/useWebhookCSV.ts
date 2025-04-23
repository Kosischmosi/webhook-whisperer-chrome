
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
    
    // Immediately prevent default behavior
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    console.log("File selected:", file.name, file.type, file.size);
    
    try {
      // Use Promise-based file reading approach
      const text = await readFileAsText(file);
      console.log("CSV content length:", text.length);
      
      if (!text || text.trim() === '') {
        console.error("Empty file content");
        toast({
          title: "Import fehlgeschlagen",
          description: "Die Datei enthält keine Daten.",
          variant: "destructive"
        });
        return;
      }
      
      const imported = csvToWebhooks(text);
      console.log("Parsed webhooks:", imported);
      
      if (!imported || !imported.length) {
        console.error("No webhooks found in CSV");
        toast({
          title: "Import fehlgeschlagen",
          description: "Es wurden keine gültigen Webhook-Daten in der CSV gefunden.",
          variant: "destructive"
        });
        return;
      }
      
      let importedCount = 0;
      
      // Process webhooks sequentially to maintain popup stability
      for (let i = 0; i < imported.length; i++) {
        const w = imported[i];
        const exists = webhooks.some(existing => existing.name === w.name && existing.url === w.url);
        
        if (!exists) {
          console.log(`Adding webhook (${i+1}/${imported.length}):`, w.name);
          try {
            await webhookService.add(w);
            importedCount++;
          } catch (error) {
            console.error(`Error adding webhook ${w.name}:`, error);
          }
          
          // Small delay between operations
          if (i < imported.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        } else {
          console.log(`Webhook already exists (${i+1}/${imported.length}):`, w.name);
        }
      }
      
      // Show success message
      toast({ 
        title: "Import erfolgreich", 
        description: `${importedCount} Webhooks importiert.` 
      });
      
      // Reload after a small delay
      setTimeout(() => {
        reloadWebhooks();
      }, 300);
    } catch (error) {
      console.error("CSV Import error:", error);
      toast({
        title: "Import fehlgeschlagen",
        description: typeof error === 'string' ? error : "Die CSV-Datei konnte nicht verarbeitet werden.",
        variant: "destructive"
      });
    } finally {
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  // Helper function to read file content as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          if (!text) {
            reject("Datei konnte nicht gelesen werden");
          } else {
            resolve(text);
          }
        } catch (err) {
          reject("Fehler beim Lesen der Datei");
        }
      };
      
      reader.onerror = () => {
        reject("Fehler beim Zugriff auf die Datei");
      };
      
      // Read the file as text
      reader.readAsText(file);
    });
  };

  return {
    handleExportCSV,
    handleImportCSV,
    fileInputRef,
    triggerImportDialog: () => fileInputRef.current?.click(),
  };
};
