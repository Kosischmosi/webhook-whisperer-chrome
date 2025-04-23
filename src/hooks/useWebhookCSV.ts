
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

  // Ändern des Import-Mechanismus für Browser-Erweiterungen
  const handleImportCSV = () => {
    // Statt auf Change-Event zu warten, setzen wir einen Click-Event-Handler,
    // der die Datei sofort verarbeitet, nachdem sie ausgewählt wurde
    
    if (!fileInputRef.current) return;
    
    // Entfernen des vorherigen Event-Listeners, falls vorhanden
    const oldInput = fileInputRef.current;
    const newInput = document.createElement('input');
    newInput.type = 'file';
    newInput.accept = '.csv';
    newInput.style.display = 'none';
    
    // Ersetzen des Input-Elements
    if (oldInput.parentNode) {
      oldInput.parentNode.replaceChild(newInput, oldInput);
      fileInputRef.current = newInput;
    }
    
    // Event-Handler für Dateiauswahl
    newInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) {
        console.log("Keine Datei ausgewählt");
        return;
      }
      
      console.log("Datei ausgewählt:", file.name, file.type, file.size);
      
      try {
        // Datei einlesen
        const text = await readFileAsText(file);
        
        if (!text || text.trim() === '') {
          toast({
            title: "Import fehlgeschlagen",
            description: "Die Datei enthält keine Daten.",
            variant: "destructive"
          });
          return;
        }
        
        // Parsen der CSV-Daten
        const imported = csvToWebhooks(text);
        
        if (!imported || !imported.length) {
          toast({
            title: "Import fehlgeschlagen",
            description: "Es wurden keine gültigen Webhook-Daten in der CSV gefunden.",
            variant: "destructive"
          });
          return;
        }
        
        // Sofortige Erfolgs-Nachricht vor dem Import
        toast({ 
          title: "CSV gelesen", 
          description: `${imported.length} Webhooks gefunden. Import wird verarbeitet...` 
        });
        
        let importedCount = 0;
        
        // Webhooks sequentiell verarbeiten
        for (let i = 0; i < imported.length; i++) {
          const w = imported[i];
          const exists = webhooks.some(existing => existing.name === w.name && existing.url === w.url);
          
          if (!exists) {
            try {
              await webhookService.add(w);
              importedCount++;
            } catch (error) {
              console.error(`Fehler beim Hinzufügen von Webhook ${w.name}:`, error);
            }
          }
        }
        
        // Abschließende Erfolgsmeldung
        toast({ 
          title: "Import erfolgreich", 
          description: `${importedCount} Webhooks importiert.` 
        });
        
        // Neuladen nach einer kurzen Verzögerung
        setTimeout(reloadWebhooks, 300);
      } catch (error) {
        console.error("CSV Import-Fehler:", error);
        toast({
          title: "Import fehlgeschlagen",
          description: typeof error === 'string' ? error : "Die CSV-Datei konnte nicht verarbeitet werden.",
          variant: "destructive"
        });
      }
    };
    
    // Dialog zum Öffnen der Datei anzeigen
    newInput.click();
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

  return {
    handleExportCSV,
    handleImportCSV,
    fileInputRef,
    triggerImportDialog: handleImportCSV,  // Direkt handleImportCSV verwenden statt fileInputRef.current?.click()
  };
};
