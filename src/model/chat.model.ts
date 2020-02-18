interface ChatMessage{
    chatId?: string;
    content: string;
    createdAt: any;
    ownership?: string;
    senderName: string;
    senderID : string;
    showName?: boolean;
    showDaySep? : boolean;
}