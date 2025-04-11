
import { useState } from "react";
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
}

const WebhookCard = ({ webhook, onEdit, onDelete }: WebhookCardProps) => {
  const { toast } = useToast();
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState<{ url: boolean; secret: boolean }>({
    url: false,
    secret: false,
  });

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

  return (
    <Card className="w-full">
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
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleCopy(webhook.secret, "secret")}
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
          <Button size="sm" variant="outline" onClick={() => onEdit(webhook)}>
            <Edit size={16} className="mr-2" /> Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(webhook.id)}>
            <Trash size={16} className="mr-2" /> Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default WebhookCard;
