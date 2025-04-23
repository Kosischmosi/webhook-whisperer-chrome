
import { useRef, useState } from "react";
import { WebhookConfig, webhookService } from "@/services/webhookService";
import { webhooksToCSV, csvToWebhooks } from "@/utils/csvUtils";
import { useToast } from "@/hooks/use-toast";

export const useWebhookCSV = (
  webhooks: WebhookConfig[],
  reloadWebhooks: () => void
) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedWebhooks, setParsedWebhooks] = useState<{name: string; url: string; secret: string}[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  // Export-Funktion - unverändert
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

  // Drag & Drop-Handler
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
      return;
    }
    
    const file = e.dataTransfer.files[0];
    await processSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Dateiauswahl-Handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    await processSelectedFile(file);
    
    // Input-Element zurücksetzen, damit die gleiche Datei erneut ausgewählt werden kann
    e.target.value = '';
  };

  // Gemeinsame Funktion zum Verarbeiten der ausgewählten Datei
  const processSelectedFile = async (file: File) => {
    try {
      setSelectedFile(file);
      toast({
        title: "Datei geladen",
        description: `"${file.name}" wurde geladen. Klicke auf "Import starten" um fortzufahren.`,
      });
      
      // Datei einlesen und CSV parsen
      const text = await readFileAsText(file);
      const imported = csvToWebhooks(text);
      
      if (!imported || imported.length === 0) {
        toast({
          title: "Fehler beim Parsen",
          description: "Die CSV-Datei enthält keine gültigen Webhook-Daten.",
          variant: "destructive",
        });
        setParsedWebhooks(null);
        return;
      }
      
      setParsedWebhooks(imported);
    } catch (error) {
      console.error("Fehler beim Verarbeiten der Datei:", error);
      toast({
        title: "Fehler beim Laden",
        description: typeof error === 'string' ? error : "Die Datei konnte nicht verarbeitet werden.",
        variant: "destructive",
      });
      setSelectedFile(null);
      setParsedWebhooks(null);
    }
  };

  // Import starten (zweiter Schritt)
  const startImport = async () => {
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
      
      // Webhooks sequentiell importieren
      for (const webhook of parsedWebhooks) {
        const exists = webhooks.some(existing => existing.name === webhook.name && existing.url === webhook.url);
        
        if (!exists) {
          try {
            await webhookService.add(webhook);
            importedCount++;
          } catch (error) {
            console.error(`Fehler beim Hinzufügen von Webhook ${webhook.name}:`, error);
          }
          
          // Kurze Pause zwischen den Anfragen, um UI-Blockierung zu vermeiden
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      toast({
        title: "Import erfolgreich",
        description: `${importedCount} Webhooks wurden importiert.`,
      });
      
      // Zurücksetzen und neuladen
      setSelectedFile(null);
      setParsedWebhooks(null);
      setTimeout(reloadWebhooks, 300);
    } catch (error) {
      console.error("Fehler beim Import:", error);
      toast({
        title: "Import fehlgeschlagen",
        description: typeof error === 'string' ? error : "Beim Import der Webhooks ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Hilfsfunktion zum Lesen einer Datei als Text
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
      
      reader.readAsText(file);
    });
  };

  // Import-Dialog trigger (für Legacy-Unterstützung)
  const triggerFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Zurücksetzen des Imports
  const cancelImport = () => {
    setSelectedFile(null);
    setParsedWebhooks(null);
  };

  return {
    handleExportCSV,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleFileSelect,
    triggerFileDialog,
    startImport,
    cancelImport,
    fileInputRef,
    selectedFile,
    parsedWebhooks,
    isImporting,
  };
};
