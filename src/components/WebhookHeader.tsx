
import { WebhookWhispererIcon } from "@/assets/IconGenerator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import React from "react";

interface WebhookHeaderProps {
  onExportCSV: () => void;
  onImportCSVClick: () => void;
}

const WebhookHeader: React.FC<WebhookHeaderProps> = ({ onExportCSV, onImportCSVClick }) => {
  return (
    <header className="border-b py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center group">
          <div className="transform transition-transform duration-200 group-hover:scale-110">
            <WebhookWhispererIcon 
              size={24} 
              imageSrc="/icons/icon48.png"
            />
          </div>
          <h1 className="text-lg font-semibold ml-2">Webhook Whisperer</h1>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={onImportCSVClick} 
                  className="rounded-full"
                  aria-label="CSV importieren"
                >
                  <Upload size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Import CSV
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={onExportCSV} 
                  className="rounded-full"
                  aria-label="CSV exportieren"
                >
                  <Download size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Export CSV
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
};

export default WebhookHeader;
