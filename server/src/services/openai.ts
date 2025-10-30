import OpenAI from 'openai';
import config from '../config/index.js';
import { mcpClient } from './mcpClient.js';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// MCP tools definition for OpenAI function calling
const functions: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[] =
  [
    {
      name: 'show_reservation_form',
      description:
        'ユーザーがレストランを予約したい時に、予約フォームを表示します',
      parameters: {
        type: 'object',
        properties: {
          restaurantName: {
            type: 'string',
            description: 'レストランの名前',
          },
        },
        required: ['restaurantName'],
      },
    },
    {
      name: 'submit_reservation',
      description: 'レストラン予約を送信します',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: '予約者の名前',
          },
          date: {
            type: 'string',
            description: '予約日 (YYYY-MM-DD形式)',
          },
          time: {
            type: 'string',
            description: '予約時間 (HH:MM形式)',
          },
          partySize: {
            type: 'number',
            description: '人数',
          },
          contact: {
            type: 'string',
            description: '連絡先（電話番号またはメールアドレス）',
          },
          restaurantName: {
            type: 'string',
            description: 'レストランの名前',
          },
        },
        required: [
          'name',
          'date',
          'time',
          'partySize',
          'contact',
          'restaurantName',
        ],
      },
    },
  ];

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string | null;
  function_call?: {
    name: string;
    arguments: string;
  };
  name?: string;
}

export interface ChatResponse {
  message: string;
  uiResource?: any;
  functionCall?: {
    name: string;
    arguments: any;
  };
}

/**
 * Process chat with OpenAI and handle function calls
 */
export async function processChat(
  messages: ChatMessage[]
): Promise<ChatResponse> {
  try {
    // Convert messages to OpenAI format
    const openaiMessages: ChatCompletionMessageParam[] = messages.map((msg) => {
      if (msg.role === 'function') {
        return {
          role: 'function',
          name: msg.name!,
          content: msg.content || '',
        };
      }
      return {
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content || '',
      };
    });

    // Call OpenAI with function calling support
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: openaiMessages,
      functions: functions,
      function_call: 'auto',
    });

    const choice = response.choices[0];
    const message = choice.message;

    // Check if OpenAI wants to call a function
    if (message.function_call) {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);

      console.log(`OpenAI called function: ${functionName}`, functionArgs);

      // Call MCP server
      const mcpResponse = await mcpClient.callTool(functionName, functionArgs);

      // If the tool returns a UIResource, return it
      if (mcpResponse.uiResource) {
        return {
          message: mcpResponse.message || 'フォームを表示しました',
          uiResource: mcpResponse.uiResource,
          functionCall: {
            name: functionName,
            arguments: functionArgs,
          },
        };
      }

      // Otherwise return the tool result as a message
      return {
        message: mcpResponse.message || JSON.stringify(mcpResponse.data),
        functionCall: {
          name: functionName,
          arguments: functionArgs,
        },
      };
    }

    // Regular text response
    return {
      message: message.content || 'すみません、理解できませんでした。',
    };
  } catch (error) {
    console.error('Error in processChat:', error);
    throw error;
  }
}

/**
 * Create a system message for the assistant
 */
export function createSystemMessage(): ChatMessage {
  return {
    role: 'system',
    content: `あなたはレストラン予約を手伝うアシスタントです。
ユーザーがレストランを予約したいと言ったら、show_reservation_form関数を使ってフォームを表示してください。
フォームが送信されたら、submit_reservation関数で予約を処理してください。
親切で丁寧な対応を心がけてください。`,
  };
}
