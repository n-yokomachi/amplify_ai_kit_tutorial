import { Authenticator } from "@aws-amplify/ui-react";
import { AIConversation } from '@aws-amplify/ui-react-ai';
import { useAIConversation } from './client';

export default function App() {
  const [
    {
      data: { messages },
      isLoading,
    },
    handleSendMessage,
  ] = useAIConversation('chat');

  return (
    <Authenticator>
      <AIConversation
        messages={messages}
        isLoading={isLoading}
        handleSendMessage={handleSendMessage}
      />
    </Authenticator>
  );
}