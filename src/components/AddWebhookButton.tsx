
import { Plus } from "lucide-react";

interface AddWebhookButtonProps {
  onClick: () => void;
}

const AddWebhookButton = ({ onClick }: AddWebhookButtonProps) => (
  <button
    onClick={onClick}
    className="fixed bottom-4 right-4 p-2 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 z-50"
    aria-label="Add Webhook"
  >
    <Plus size={20} />
  </button>
);

export default AddWebhookButton;
