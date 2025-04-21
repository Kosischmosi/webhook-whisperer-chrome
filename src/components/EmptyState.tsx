
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from "lucide-react";

interface EmptyStateProps {
  onAddNew: () => void;
}

const EmptyState = ({ onAddNew }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 rounded-lg border-2 border-dashed border-gray-300 mt-12 mb-6 transition-all hover:border-primary/30">
      <div className="bg-primary/10 p-5 rounded-full mb-6 animate-fade-in">
        <MessageSquare className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-2xl font-medium mb-3">Looks a little empty here 👀</h3>
      <p className="text-muted-foreground text-center mb-8 max-w-sm">
        Add your first webhook configuration to start managing your integrations with ease.
      </p>
      <Button onClick={onAddNew} size="lg" className="shadow-sm hover:shadow transition-all">
        <Plus size={18} className="mr-2" />
        Add Your First Webhook
      </Button>
    </div>
  );
};

export default EmptyState;
