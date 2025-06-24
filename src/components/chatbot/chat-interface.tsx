
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
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useAuth } from "@/hooks/use-auth"

interface Message {
  role: "user" | "bot"
  content: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! I'm AcademIQ-Bot. Ask me about your course material, your exam scores, or anything else I can help with!" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [courseNotes, setCourseNotes] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()

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
    if (!input || loading || !user) return

    setLoading(true)
    const userMessage: Message = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")

    try {
      const result = await chatbotAssistant({
        question: input,
        courseNotes: courseNotes || "No course notes provided.",
        userId: user.uid,
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
                  {message.role === 'bot' ? (
                     <ReactMarkdown
                        className="prose dark:prose-invert prose-sm max-w-none"
                        remarkPlugins={[remarkGfm]}
                      >
                        {message.content}
                      </ReactMarkdown>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
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
            placeholder="Ask about your notes, marks, or anything else..."
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
