
import { Button } from "@/components/ui/button";
import { Plus, Webhook } from "lucide-react";

interface EmptyStateProps {
  onAddNew: () => void;
}

const EmptyState = ({ onAddNew }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-gray-300 mt-10 mb-4">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <Webhook className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-2">No webhooks yet</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        Add your first webhook configuration to get started with managing your integrations.
      </p>
      <Button onClick={onAddNew}>
        <Plus size={16} className="mr-2" />
        Add Your First Webhook
      </Button>
    </div>
  );
};

export default EmptyState;
