
import { WebhookWhispererIcon } from "@/assets/IconGenerator";

const WebhookHeader = () => {
  return (
    <header className="border-b py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center group">
          <div className="transform transition-transform duration-200 group-hover:scale-110">
            <WebhookWhispererIcon 
              size={24} 
              imageSrc="/icons/icon48.png"  // Use the 48x48 icon, scaled down
            />
          </div>
          <h1 className="text-lg font-semibold ml-2">Webhook Whisperer</h1>
        </div>
      </div>
    </header>
  );
};

export default WebhookHeader;
