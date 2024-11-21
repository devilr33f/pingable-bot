import type { MessageContext } from '@mtcute/dispatcher'
import { Dispatcher } from '@mtcute/dispatcher'
import type { Chat, Peer, User } from '@mtcute/node'
import { html, TelegramClient } from '@mtcute/node'

import config from '@/config.js'

const makeChatMention = (chat: Peer | Chat) => {
  if (chat.username) return html`<a href="tg://resolve?domain=${chat.username}">${chat.displayName || 'unknown chat'}</a>`

  const isGroup = (chat as Chat).chatType && !['bot', 'channel', 'group', 'private'].includes((chat as Chat).chatType)

  if (isGroup) return html`<a href="https://t.me/c/${(chat.id + 1e12) * -1}">${chat.displayName || 'unknown chat'}</a>`
  if ((chat as Chat).chatType !== 'group') return html`<a href="tg://user?id=${chat.id}">${chat.displayName}</a>`

  return 'group without username' // @note: if chat type is "group" and it doesn't have username
}

export const mentionNotify = (context: MessageContext, me: User) => {
  const message = html`
    ${makeChatMention(context.sender)} mentioned ${makeChatMention(me)} in ${makeChatMention(context.chat)}
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
  initConnectionOptions: {
    deviceModel: 'Pingable Bot',
  },
})

export const userbot = new TelegramClient({
  apiId: config.mtcute.apiId,
  apiHash: config.mtcute.apiHash,
  enableErrorReporting: true,
  storage: './storage/userbot.storage',
  initConnectionOptions: {
    deviceModel: 'Pingable Bot',
  },
})

const dispatcher = Dispatcher.for(userbot)

dispatcher.onNewMessage(async (context) => {
  if (context.isOutgoing || context.chat.chatType === 'bot') return
  const hasMention = context.isMention || (context.text && config.userbot.regexps.some((regexp) => context.text.match(new RegExp(regexp))))

  if (hasMention && !config.userbot.ignoredIds.includes(context.sender.id)) {
    const me = await userbot.getMe()
    await mentionNotify(context, me)
  }
})
