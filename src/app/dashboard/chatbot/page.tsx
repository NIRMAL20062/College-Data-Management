import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatInterface } from "@/components/chatbot/chat-interface";

export default function ChatbotPage() {
  return (
    <div className="h-full flex flex-col">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Chatbot Assistant</CardTitle>
          <CardDescription>
            Ask questions about your course material. Upload your notes to get more accurate answers.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  )
}
