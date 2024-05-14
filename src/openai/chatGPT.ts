import { request, RequestUrlParam } from 'obsidian'
import { openai } from './chatGPT-types'

export const OPENAI_COMPLETIONS_URL = `https://openrouter.ai/api/v1/chat/completions`

export const CHAT_MODELS = {
	GPT_35_TURBO: {
		name: 'openai/gpt-3.5-turbo',
		tokenLimit: 16385
	},
	CLAUDE_3_HAIKU: {
		name: 'anthropic/claude-3-haiku',
		tokenLimit: 200000
	},
	GPT_4O: {
		name: 'openai/gpt-4o',
		tokenLimit: 128000
	},
	LLAMA_3_80B: {
		name: 'meta-llama/llama-3-8b',
		tokenLimit: 8192
	}
} as const

export type ChatGPTModel = keyof typeof CHAT_MODELS

export type ChatGPTModelType = keyof typeof CHAT_MODELS

export function chatModelByName(name: string) {
	return Object.values(CHAT_MODELS).find((model) => model.name === name)
}

export const defaultChatGPTSettings: Partial<openai.CreateChatCompletionRequest> =
{
	model: CHAT_MODELS.CLAUDE_3_HAIKU.name,
	max_tokens: 500,
	temperature: 0,
	top_p: 1.0,
	presence_penalty: 0,
	frequency_penalty: 0,
	stop: []
}

export async function getChatGPTCompletion(
	apiKey: string,
	apiUrl: string,
	model: openai.CreateChatCompletionRequest['model'],
	messages: openai.CreateChatCompletionRequest['messages'],
	settings?: Partial<
		Omit<openai.CreateChatCompletionRequest, 'messages' | 'model'>
	>
): Promise<string | undefined> {
	const headers = {
		Authorization: `Bearer ${apiKey}`,
		'Content-Type': 'application/json'
	}
	const body: openai.CreateChatCompletionRequest = {
		messages,
		model,
		...settings
	}
	const requestParam: RequestUrlParam = {
		url: apiUrl,
		method: 'POST',
		contentType: 'application/json',
		body: JSON.stringify(body),
		headers
	}
	console.debug('Calling openAI', requestParam)
	const res: openai.CreateChatCompletionResponse | undefined = await request(
		requestParam
	)
		.then((response) => {
			return JSON.parse(response)
		})
		.catch((err) => {
			console.error(err)
			if (err.code === 429) {
				console.error(
					'OpenAI API rate limit exceeded. If you have free account, your credits may have been consumed or expired.'
				)
			} else {
				console.error(
					'Another error... Dunno'
				)
			}
		})
	return res?.choices?.[0]?.message?.content
}
