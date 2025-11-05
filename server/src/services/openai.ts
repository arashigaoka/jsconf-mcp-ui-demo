import OpenAI from 'openai';
import config from '../config/index.js';
import { mcpClient } from './mcpClient.js';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { EmbeddedResource } from '@modelcontextprotocol/sdk/types.js';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// MCP tools definition for OpenAI function calling
const functions: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[] =
  [
    {
      name: 'show_reservation_form',
      description:
        'ユーザーがレストランを予約したい時に、予約フォームを表示します。レストラン名が不明な場合は「レストラン」をデフォルトで使用してください。',
      parameters: {
        type: 'object',
        properties: {
          restaurantName: {
            type: 'string',
            description: 'レストランの名前（不明な場合は「レストラン」）',
            default: 'レストラン',
          },
        },
        required: [],
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
    {
      name: 'ask_allergy',
      description: 'ユーザーがアレルギーについて確認したい時に、アレルギー問い合わせフォームを表示します。',
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
      name: 'ask_private_room',
      description: 'ユーザーが個室について確認したい時に、個室に関する情報を表示します。',
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
      name: 'submit_allergy_inquiry',
      description: 'アレルギー問い合わせを送信します',
      parameters: {
        type: 'object',
        properties: {
          allergyInfo: {
            type: 'string',
            description: 'アレルギー情報（例: 小麦アレルギー）',
          },
          restaurantName: {
            type: 'string',
            description: 'レストランの名前',
          },
        },
        required: ['allergyInfo', 'restaurantName'],
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
  uiResource?: EmbeddedResource;
  functionCall?: {
    name: string;
    arguments: Record<string, unknown>;
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
ユーザーがレストランや食事の予約について話したら、すぐにshow_reservation_form関数を呼び出してフォームを表示してください。
レストラン名が不明な場合でも、フォームを表示してください。
フォームが送信されたら、submit_reservation関数で予約を処理してください。
予約完了後、ユーザーが「アレルギーについて」や「個室ですか」などと質問したら、適切なツール（ask_allergy、ask_private_room）を呼び出してください。
アレルギー問い合わせフォームが送信されたら、submit_allergy_inquiry関数で処理してください。
親切で丁寧な対応を心がけてください。`,
  };
}
