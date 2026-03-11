import { create } from "zustand";
import { Chat, Message, ActionButton } from "@/types";
import { chats, allMessages } from "@/data/seed";
import { generateId } from "@/lib/utils";

interface ChatStore {
  chats: Chat[];
  messages: Message[];
  getChat: (id: string) => Chat | undefined;
  getChatByRoom: (roomId: string) => Chat | undefined;
  getMessagesByChat: (chatId: string) => Message[];
  addMessage: (chatId: string, content: string, senderId: string, senderType: "human" | "agent", type?: Message["type"], actionButtons?: ActionButton[]) => Message;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: chats,
  messages: allMessages,
  getChat: (id) => get().chats.find((c) => c.id === id),
  getChatByRoom: (roomId) => get().chats.find((c) => c.roomId === roomId),
  getMessagesByChat: (chatId) => get().messages.filter((m) => m.chatId === chatId),
  addMessage: (chatId, content, senderId, senderType, type = "text", actionButtons) => {
    const newMsg: Message = {
      id: `msg-${generateId()}`,
      chatId,
      senderId,
      senderType,
      type: type,
      content,
      mentions: [],
      attachments: [],
      actionButtons,
      createdAt: Date.now(),
    };
    set((s) => ({
      messages: [...s.messages, newMsg],
      chats: s.chats.map((c) =>
        c.id === chatId ? { ...c, messageIds: [...c.messageIds, newMsg.id] } : c
      ),
    }));
    return newMsg;
  },
}));
