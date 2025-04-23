
import { Dialog, DialogContent } from "@/components/ui/dialog";
import WebhookForm from "@/components/WebhookForm";
import { WebhookConfig } from "@/services/webhookService";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WebhookDialogFormProps {
  isOpen: boolean;
  webhook: WebhookConfig | null;
  onSave: () => void;
  onClose: () => void;
}

const WebhookDialogForm = ({ isOpen, webhook, onSave, onClose }: WebhookDialogFormProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen => !setIsOpen && onClose()}>
      <DialogContent className="sm:max-w-[380px] max-h-[470px] p-0 dialog-content" style={{
        scrollbarGutter: 'stable',
        scrollbarWidth: 'thin',
        overflowY: 'scroll'
      }}>
        <ScrollArea className="h-[470px] scrollbar-fix" style={{
          scrollbarGutter: 'stable',
          scrollbarWidth: 'thin',
          overflowY: 'scroll'
        }}>
          <div className="p-4">
            <WebhookForm
              webhook={webhook || undefined}
              onSave={onSave}
              onCancel={onClose}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default WebhookDialogForm;
