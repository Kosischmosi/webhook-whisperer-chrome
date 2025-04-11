
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WebhookActionBarProps {
  onAddNew: () => void;
}

const WebhookActionBar = ({ onAddNew }: WebhookActionBarProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-medium">Your Webhook Configurations</h2>
      <Button onClick={onAddNew}>
        <Plus size={16} className="mr-2" /> Add New Webhook
      </Button>
    </div>
  );
};

export default WebhookActionBar;
