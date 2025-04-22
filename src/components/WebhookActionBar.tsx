
interface WebhookActionBarProps {
  onAddNew: () => void;
}

const WebhookActionBar = ({ onAddNew }: WebhookActionBarProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">Your Webhook Configurations</h2>
    </div>
  );
};

export default WebhookActionBar;
