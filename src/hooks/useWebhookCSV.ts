
import { useState, useCallback } from "react";
import { WebhookConfig, webhookService } from "@/services/webhookService";
import { webhooksToCSV, csvToWebhooks } from "@/utils/csvUtils";
import { useToast } from "@/hooks/use-toast";

export type ParsedWebhook = {
  name: string;
  url: string;
  secret: string;
};

export const useWebhookCSV = (
  webhooks: WebhookConfig[],
  reloadWebhooks: () => void
) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedWebhooks, setParsedWebhooks] = useState<ParsedWebhook[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Optimiert: Mit useCallback
  const handleExportCSV = useCallback(() => {
    if (webhooks.length === 0) {
      toast({
        title: "Keine Daten",
        description: "Es sind keine Webhooks zum Exportieren vorhanden.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const simpleWebhooks = webhooks.map(({ name, url, secret }) => ({ name, url, secret }));
      const csv = webhooksToCSV(simpleWebhooks);
      
      // Sicherheits-Check: Prüfe, ob der CSV-String valide ist
      if (!csv || typeof csv !== 'string') {
        throw new Error("CSV-Generierung fehlgeschlagen");
      }
      
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "webhooks.csv";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      
      // Cleaner resource management
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Export erfolgreich",
        description: "Die Webhooks wurden als CSV exportiert.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export fehlgeschlagen",
        description: "Beim Exportieren ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  }, [webhooks, toast]);

  // Optimiert: Fehlerbehandlung verbessert
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
      toast({
        title: "Keine Datei",
        description: "Es wurde keine Datei erkannt.",
        variant: "destructive",
      });
      return;
    }

    const file = e.dataTransfer.files[0];
    
    // Validiere Datei-Typ
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte wähle eine CSV-Datei aus.",
        variant: "destructive",
      });
      return;
    }
    
    // Validiere Dateigröße (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Die Datei darf nicht größer als 5 MB sein.",
        variant: "destructive",
      });
      return;
    }

    await processSelectedFile(file);
  }, [toast]);

  // Optimiert: Datei verarbeiten mit besserer Fehlerbehandlung
  const processSelectedFile = useCallback(async (file: File) => {
    try {
      setSelectedFile(file);
      toast({
        title: "Datei geladen",
        description: `"${file.name}" wurde geladen. Klicke auf "Import starten" um fortzufahren.`,
      });

      const text = await readFileAsText(file);
      
      if (!text || text.trim().length === 0) {
        throw new Error("Die Datei ist leer");
      }
      
      const imported = csvToWebhooks(text);

      if (!imported || imported.length === 0) {
        throw new Error("Die CSV-Datei enthält keine gültigen Webhook-Daten");
      }

      // Validiere die importierten Daten
      for (const hook of imported) {
        if (!hook.name || !hook.url) {
          throw new Error("CSV enthält ungültige Daten (Name und URL sind Pflichtfelder)");
        }
        
        // Validiere URL-Format
        try {
          new URL(hook.url);
        } catch {
          throw new Error(`Ungültige URL in der CSV: ${hook.url}`);
        }
      }

      setParsedWebhooks(imported);
    } catch (error) {
      console.error("Fehler beim Verarbeiten der Datei:", error);
      toast({
        title: "Fehler beim Laden",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as Error).message 
          : "Die Datei konnte nicht verarbeitet werden.",
        variant: "destructive",
      });
      setSelectedFile(null);
      setParsedWebhooks(null);
    }
  }, [toast]);

  // Optimiert: Import mit Fehlerbehandlung und Status-Updates
  const startImport = useCallback(async () => {
    if (!parsedWebhooks) {
      toast({
        title: "Keine Daten",
        description: "Bitte wähle zuerst eine CSV-Datei aus.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      toast({
        title: "Import gestartet",
        description: `${parsedWebhooks.length} Webhooks werden importiert...`,
      });

      let importedCount = 0;
      let existingCount = 0;
      let errorCount = 0;

      for (const webhook of parsedWebhooks) {
        try {
          // Mit includes für natürlicheres Deduplizieren
          const exists = webhooks.some(
            existing => 
              existing.name.toLowerCase() === webhook.name.toLowerCase() && 
              existing.url.toLowerCase() === webhook.url.toLowerCase()
          );

          if (!exists) {
            await webhookService.add(webhook);
            importedCount++;
          } else {
            existingCount++;
          }
          
          // Kleine Pause, um UI-Blockaden zu vermeiden
          await new Promise(resolve => setTimeout(resolve, 10));
        } catch (error) {
          console.error(`Fehler beim Hinzufügen von Webhook ${webhook.name}:`, error);
          errorCount++;
        }
      }

      // Detailliertes Feedback
      let message = `${importedCount} Webhooks wurden importiert.`;
      if (existingCount > 0) {
        message += ` ${existingCount} waren bereits vorhanden.`;
      }
      if (errorCount > 0) {
        message += ` Bei ${errorCount} traten Fehler auf.`;
      }
      
      toast({
        title: "Import abgeschlossen",
        description: message,
      });

      setSelectedFile(null);
      setParsedWebhooks(null);
      setTimeout(reloadWebhooks, 300);
    } catch (error) {
      console.error("Fehler beim Import:", error);
      toast({
        title: "Import fehlgeschlagen",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as Error).message 
          : "Beim Import der Webhooks ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  }, [parsedWebhooks, webhooks, toast, reloadWebhooks]);

  // Optimiert: Datei einlesen mit besserem Error-Handling
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      const timeoutId = setTimeout(() => {
        reader.abort();
        reject("Datei konnte nicht innerhalb des Zeitlimits gelesen werden");
      }, 10000); // 10 Sekunden Timeout

      reader.onload = (event) => {
        clearTimeout(timeoutId);
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
        clearTimeout(timeoutId);
        reject("Fehler beim Zugriff auf die Datei");
      };

      reader.readAsText(file);
    });
  };

  // Optimiert: Import abbrechen
  const cancelImport = useCallback(() => {
    setSelectedFile(null);
    setParsedWebhooks(null);
  }, []);

  return {
    handleExportCSV,
    handleDrop,
    selectedFile,
    parsedWebhooks,
    startImport,
    cancelImport,
    isImporting,
  };
};
