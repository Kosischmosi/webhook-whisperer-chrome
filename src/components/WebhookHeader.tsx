
import { WebhookWhispererIcon } from "@/assets/IconGenerator";

interface WebhookHeaderProps {
  isExtension: boolean;
}

const WebhookHeader = ({ isExtension }: WebhookHeaderProps) => {
  return (
    <header className="border-b py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center group">
          <div className="transform transition-transform duration-200 group-hover:scale-110">
            <WebhookWhispererIcon size={36} />
          </div>
          <h1 className="text-2xl font-semibold ml-3">Webhook Whisperer</h1>
        </div>
        {isExtension && (
          <div className="text-sm text-muted-foreground">
            Chrome Extension Mode
          </div>
        )}
      </div>
    </header>
  );
};

export default WebhookHeader;
