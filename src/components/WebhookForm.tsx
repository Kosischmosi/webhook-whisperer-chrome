import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { WebhookConfig, webhookService } from "@/services/webhookService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { isValidWebhookUrl, isStrongSecret } from "@/utils/securityUtils";

interface WebhookFormProps {
  webhook?: WebhookConfig;
  onSave: () => void;
  onCancel: () => void;
}

const WebhookForm = ({ webhook, onSave, onCancel }: WebhookFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [errors, setErrors] = useState<{
    url?: string;
    secret?: string;
  }>({});

  const [formData, setFormData] = useState({
    name: webhook?.name || "",
    url: webhook?.url || "",
    secret: webhook?.secret || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!formData.name.trim()) {
      newErrors.url = "Name is required";
    }
    
    if (!isValidWebhookUrl(formData.url)) {
      newErrors.url = "Please enter a valid HTTP/HTTPS URL";
    }
    
    if (formData.secret && !isStrongSecret(formData.secret)) {
      newErrors.secret = "Secret must be at least 10 characters and include numbers and special characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (webhook) {
        await webhookService.update(webhook.id, formData);
        toast({
          title: "Success",
          description: "Webhook updated successfully",
        });
      } else {
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
    <Card className="w-full shadow-none border-none bg-transparent">
      <CardHeader className="p-0 mb-1">
        <CardTitle className="text-base font-semibold leading-tight">
          {webhook ? "Edit Webhook" : "Add New Webhook"}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {webhook 
            ? "Update your webhook configuration" 
            : "Enter the details for your new webhook configuration"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-0 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-sm leading-tight">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="My API Integration"
              value={formData.name}
              onChange={handleChange}
              required
              className="h-8 text-sm px-2"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="url" className="text-sm leading-tight">Webhook URL</Label>
            <Input
              id="url"
              name="url"
              placeholder="https://api.example.com/webhook"
              value={formData.url}
              onChange={handleChange}
              required
              className={`h-8 text-sm px-2 ${errors.url ? 'border-red-500' : ''}`}
            />
            {errors.url && (
              <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle size={12} />
                {errors.url}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="secret" className="text-sm leading-tight">
              Secret Key (optional)
              <span className="text-xs text-muted-foreground ml-1">
                - min. 10 chars, include numbers & special chars
              </span>
            </Label>
            <div className="relative">
              <Input
                id="secret"
                name="secret"
                type={showSecret ? "text" : "password"}
                placeholder="Your webhook secret"
                value={formData.secret}
                onChange={handleChange}
                className={`h-8 text-sm pr-9 px-2 ${errors.secret ? 'border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowSecret(!showSecret)}
                tabIndex={-1}
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
            {errors.secret && (
              <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle size={12} />
                {errors.secret}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between space-x-2 p-0 pt-4">
          <Button type="button" variant="outline" size="sm" onClick={onCancel} className="h-8 px-3 text-sm">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} size="sm" className="h-8 px-4 text-sm">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {webhook ? "Update Webhook" : "Add Webhook"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default WebhookForm;
