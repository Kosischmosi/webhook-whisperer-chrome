
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { WebhookConfig, webhookService } from "@/services/webhookService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface WebhookFormProps {
  webhook?: WebhookConfig;
  onSave: () => void;
  onCancel: () => void;
}

const WebhookForm = ({ webhook, onSave, onCancel }: WebhookFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [formData, setFormData] = useState({
    name: webhook?.name || "",
    url: webhook?.url || "",
    secret: webhook?.secret || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.name || !formData.url) {
        toast({
          title: "Error",
          description: "Name and URL are required fields",
          variant: "destructive",
        });
        return;
      }

      if (webhook) {
        // Update existing webhook
        await webhookService.update(webhook.id, formData);
        toast({
          title: "Success",
          description: "Webhook updated successfully",
        });
      } else {
        // Create new webhook
        await webhookService.add(formData);
        toast({
          title: "Success",
          description: "Webhook added successfully",
        });
      }
      
      onSave();
    } catch (error) {
      console.error("Error saving webhook:", error);
      toast({
        title: "Error",
        description: "Failed to save webhook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{webhook ? "Edit Webhook" : "Add New Webhook"}</CardTitle>
        <CardDescription>
          {webhook 
            ? "Update your webhook configuration" 
            : "Enter the details for your new webhook configuration"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="My API Integration"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">Webhook URL</Label>
            <Input
              id="url"
              name="url"
              placeholder="https://api.example.com/webhook"
              value={formData.url}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secret">Secret Key (optional)</Label>
            <div className="relative">
              <Input
                id="secret"
                name="secret"
                type={showSecret ? "text" : "password"}
                placeholder="Your webhook secret"
                value={formData.secret}
                onChange={handleChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {webhook ? "Update Webhook" : "Add Webhook"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default WebhookForm;
