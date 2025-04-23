
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { WebhookConfig } from "@/services/webhookService";
import { Copy, Edit, Trash, CheckCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface WebhookCardProps {
  webhook: WebhookConfig;
  onEdit: (webhook: WebhookConfig) => void;
  onDelete: (webhookId: string) => void;
  onFocus?: (webhookId: string) => void;
}

// Add tabIndex and data attribute for focus restoration
const WebhookCard = ({ webhook, onEdit, onDelete, onFocus }: WebhookCardProps) => {
  const { toast } = useToast();
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState<{ url: boolean; secret: boolean }>({
    url: false,
    secret: false,
  });

  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopy = (text: string, field: "url" | "secret") => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [field]: true });

    toast({
      title: "Copied",
      description: `${field.charAt(0).toUpperCase() + field.slice(1)} copied to clipboard`,
    });

    setTimeout(() => {
      setCopied({ ...copied, [field]: false });
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // When user focuses this card (e.g. by click/tab), notify parent
  const handleCardFocus = () => {
    if (onFocus) onFocus(webhook.id);
  };

  // Keyboard accessibility: set tabIndex, only primary card-actions are tab stops
  return (
    <Card
      ref={cardRef}
      className="w-full"
      data-webhook-id={webhook.id}
      tabIndex={-1} // Card itself not focusable
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{webhook.name}</CardTitle>
            <CardDescription className="mt-1">
              Last updated: {formatDate(webhook.updatedAt)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-1">Webhook URL</div>
            <div className="flex items-center gap-2 group">
              <div className="bg-secondary p-2 rounded-md text-xs flex-1 truncate">
                {webhook.url}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => handleCopy(webhook.url, "url")}
                tabIndex={0}
                onFocus={handleCardFocus}
              >
                {copied.url ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
              </Button>
            </div>
          </div>

          {webhook.secret && (
            <div>
              <div className="text-sm font-medium mb-1">Secret Key</div>
              <div className="flex items-center gap-2">
                <div className="bg-secondary p-2 rounded-md text-xs flex-1 font-mono truncate">
                  {showSecret ? webhook.secret : "••••••••••••••••"}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setShowSecret(!showSecret)}
                  tabIndex={-1} // only the copy button is tab focusable
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleCopy(webhook.secret, "secret")}
                  tabIndex={0}
                  onFocus={handleCardFocus}
                >
                  {copied.secret ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex justify-end space-x-2 w-full">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { onEdit(webhook); if (onFocus) onFocus(webhook.id); }}
            tabIndex={0}
            onFocus={handleCardFocus}
          >
            <Edit size={16} className="mr-2" /> Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => { onDelete(webhook.id); if (onFocus) onFocus(webhook.id); }}
            tabIndex={0}
            onFocus={handleCardFocus}
          >
            <Trash size={16} className="mr-2" /> Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default WebhookCard;

