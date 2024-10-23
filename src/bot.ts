import type { MessageContext } from '@mtcute/dispatcher'
import { Dispatcher } from '@mtcute/dispatcher'
import type { Chat, Peer, User } from '@mtcute/node'
import { html, TelegramClient } from '@mtcute/node'

import config from '@/config.js'

const makeChatLink = (chat: Peer | Chat) => {
  if (chat.username) return `tg://resolve?domain=${chat.username}`

  const isGroup = (chat as Chat).chatType && !['bot', 'channel', 'group', 'private'].includes((chat as Chat).chatType)

  if (isGroup) return `https://t.me/c/${(chat.id + 1e12) * -1}`
  if ((chat as Chat).chatType !== 'group') return `tg://user?id=${chat.id}`

  return '' // @note: if chat type is "group" and it doesn't have username
}

export const mentionNotify = (context: MessageContext, me: User) => {
  const message = html`
    <a href="${makeChatLink(context.sender)}">${`${context.sender.displayName}`}</a> mentioned <a href="${makeChatLink(me)}">${me.displayName}</a> in <a href="${makeChatLink(context.chat)}">${`${context.chat.title}`}</a>
  `

  bot.sendText(config.bot.chatId, message, {
    disableWebPreview: true,
  }).catch(() => {})
}

export const bot = new TelegramClient({
  apiId: config.mtcute.apiId,
  apiHash: config.mtcute.apiHash,
  enableErrorReporting: true,
  storage: './storage/bot.storage',
})

export const userbot = new TelegramClient({
  apiId: config.mtcute.apiId,
  apiHash: config.mtcute.apiHash,
  enableErrorReporting: true,
  storage: './storage/userbot.storage',
})

const dispatcher = Dispatcher.for(userbot)

dispatcher.onNewMessage(async (context) => {
  if (context.isOutgoing) return
  const hasMention = context.isMention || (context.text && config.userbot.regexps.some((regexp) => context.text.match(new RegExp(regexp))))

  if (hasMention) {
    const me = await userbot.getMe()
    await mentionNotify(context, me)
  }
})
