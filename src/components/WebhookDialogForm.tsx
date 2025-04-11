
import { Dialog, DialogContent } from "@/components/ui/dialog";
import WebhookForm from "@/components/WebhookForm";
import { WebhookConfig } from "@/services/webhookService";

interface WebhookDialogFormProps {
  isOpen: boolean;
  webhook: WebhookConfig | null;
  onSave: () => void;
  onClose: () => void;
}

const WebhookDialogForm = ({ isOpen, webhook, onSave, onClose }: WebhookDialogFormProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen => !setIsOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <WebhookForm
          webhook={webhook || undefined}
          onSave={onSave}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default WebhookDialogForm;
