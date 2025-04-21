
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WebhookActionBarProps {
  onAddNew: () => void;
}

const WebhookActionBar = ({ onAddNew }: WebhookActionBarProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-2xl font-semibold">Your Webhook Configurations</h2>
      <Button onClick={onAddNew} className="shadow-sm hover:shadow transition-shadow">
        <Plus size={16} className="mr-2" /> Add New Webhook
      </Button>
    </div>
  );
};

export default WebhookActionBar;
