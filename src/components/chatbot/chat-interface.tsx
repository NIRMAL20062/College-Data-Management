"use client"

import { useState, useRef, useEffect, type FormEvent } from "react"
import { Bot, Loader2, Send, Upload, User } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { chatbotAssistant } from "@/ai/flows/chatbot-assistant"
import { useToast } from "@/hooks/use-toast"

interface Message {
  role: "user" | "bot"
  content: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! How can I help you with your studies today?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [courseNotes, setCourseNotes] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setCourseNotes(text)
        toast({
            title: "Notes Uploaded",
            description: `${file.name} has been loaded for context.`,
        })
      }
      reader.readAsText(file)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input || loading) return

    setLoading(true)
    const userMessage: Message = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")

    try {
      const result = await chatbotAssistant({
        question: input,
        courseNotes: courseNotes || "No course notes provided.",
      })
      const botMessage: Message = { role: "bot", content: result.answer }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error("Chatbot error:", error)
      const errorMessage: Message = { role: "bot", content: "Sorry, I encountered an error. Please try again." }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader>
        {/* Can add more controls here */}
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'bot' && (
                  <Avatar>
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg px-4 py-3 max-w-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar>
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {loading && (
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-3 max-w-sm bg-muted flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin"/>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
           <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            <span className="sr-only">Upload Notes</span>
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.md" />
          <Button type="submit" disabled={loading || !input}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
