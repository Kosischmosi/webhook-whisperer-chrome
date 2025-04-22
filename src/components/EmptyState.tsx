
import { MessageSquare } from "lucide-react";

interface EmptyStateProps {
  onAddNew: () => void;
}

const EmptyState = ({ onAddNew }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-gray-300 my-4 transition-all hover:border-primary/30">
      <div className="bg-primary/10 p-3 rounded-full mb-4 animate-fade-in">
        <MessageSquare className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-2">Looks empty here 👀</h3>
      <p className="text-sm text-muted-foreground text-center mb-2 max-w-[200px]">
        Add your first webhook configuration.
      </p>
    </div>
  );
};

export default EmptyState;
