
import { memo } from "react";
import WebhookDialogForm from "@/components/WebhookDialogForm";
import DeleteWebhookDialog from "@/components/DeleteWebhookDialog";
import { WebhookConfig } from "@/services/webhookService";

interface WebhookDialogsProps {
  isAddDialogOpen: boolean;
  editingWebhook: WebhookConfig | null;
  handleWebhookSaved: () => void;
  handleDialogClose: () => void;
  deleteWebhookId: string | null;
  confirmDelete: () => void;
  closeDeleteDialog: () => void;
}

// Optimiert: Mit memo für bessere Performance (reduziert unnötige Rerenders)
const WebhookDialogs = memo(({
  isAddDialogOpen,
  editingWebhook,
  handleWebhookSaved,
  handleDialogClose,
  deleteWebhookId,
  confirmDelete,
  closeDeleteDialog
}: WebhookDialogsProps) => (
  <>
    <WebhookDialogForm
      isOpen={isAddDialogOpen}
      webhook={editingWebhook}
      onSave={handleWebhookSaved}
      onClose={handleDialogClose}
    />
    <DeleteWebhookDialog
      isOpen={!!deleteWebhookId}
      onClose={closeDeleteDialog}
      onConfirm={confirmDelete}
    />
  </>
));

WebhookDialogs.displayName = "WebhookDialogs";

export default WebhookDialogs;
