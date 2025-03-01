import { CohereClientV2 } from "cohere-ai";
import { config } from "../config";

const cohere = new CohereClientV2({
  token: config.cohereApiKey,
});

export async function sendChatMessage(message: string): Promise<any> {
  try {
    const response = await cohere.chat({
      model: 'command-r-plus', 
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });
    return response;
  } catch (error: any) {
    console.error('Error sending chat message: ', error.message);
    throw error;
  }
}
