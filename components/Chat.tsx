"use client";

import { useState, useEffect, useRef, FormEvent, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2Icon } from "lucide-react";
// import ChatMessage from "./ChatMessage";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import { collection, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { askQuestion } from "@/actions/askQuestion";

export type Message = {
  id?: string;
  role: "human" | "ai" | "placeholder";
  message: string;
  cratedAt: Date;
};

function Chat({ id }: { id: string }) {
  const { user } = useUser();

  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [messages, setMessages] = useState<Message[]>([]);

  const [snapshot, loading, error] = useCollection(
    user &&
      query(
        collection(db, "users", user?.id, "files", id, "chat"),
        orderBy("createdAt", "asc")
      )
  );

  useEffect(() => {
    if (!snapshot) return;

    console.log("Updated snapshot", snapshot.docs);

    //get second last message to check if the AI is thinking
    const lastMessage = messages.pop();

    if (lastMessage?.role === "ai" && lastMessage.message === "Thinking...") {
      return;
    }
    const newMessages = snapshot.docs.map((doc) => {
      const { role, message, createdAt } = doc.data();
      console.log("Check this Out ", message);
      return {
        id: doc.id,
        role,
        message,
        cratedAt: createdAt.toDate(),
      };
    });
    setMessages(newMessages);
  }, [snapshot]);

  const handleSumbmit = async (e: FormEvent) => {
    e.preventDefault();

    const q = input;
    setInput("");

    // Optimistic UI update
    setMessages((prev) => [
      ...prev,
      {
        role: "human",
        message: q,
        cratedAt: new Date(),
      },
      {
        role: "ai",
        message: "Thinking...",
        cratedAt: new Date(),
      },
    ]);

    startTransition(async () => {
      const { success, message } = await askQuestion(id, q);
      console.log(message);
      if (success) {
        // Update messages with the AI response
        setMessages((prev) =>
          prev.slice(0, prev.length - 1).concat([
            // Remove "Thinking..." message
            {
              role: "ai",
              message: message || "No Message", // Use the actual AI response
              cratedAt: new Date(),
            },
          ])
        );
      } else {
        setMessages((prev) =>
          prev.slice(0, prev.length - 1).concat([
            // Remove "Thinking..." message
            {
              role: "ai",
              message: `Whoops... ${message}`, // Handle error message
              cratedAt: new Date(),
            },
          ])
        );
      }
    });
  };
  console.log(messages);
  return (
    <div className="flex flex-col h-full overflow-scroll">
      {/* Chat constent */}
      <div className="flex-1 w-full">
        {messages.map((message, index) => (
          <div key={message.id || index}>
            {" "}
            {/* Use index as a fallback */}
            <p>{message.message}</p>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSumbmit}
        className="flex sticky bottom-0 space-x-2 p-5 bg-gray-700/75"
      >
        <Input
          placeholder="Ask a Questions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" disabled={!input || isPending}>
          {isPending ? (
            <Loader2Icon className="animate-spin text-gray-700" />
          ) : (
            "Ask"
          )}
        </Button>
      </form>
    </div>
  );
}

export default Chat;
