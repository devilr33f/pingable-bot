import type { MessageContext } from '@mtcute/dispatcher'
import { Dispatcher } from '@mtcute/dispatcher'
import type { Chat, User } from '@mtcute/node'
import { html, TelegramClient } from '@mtcute/node'

import config from '@/config.js'

const makeChatMention = (chat: User | Chat) => {
  if (chat.username) return html`<a href="tg://resolve?domain=${chat.username}">${chat.displayName || 'unknown chat'}</a>`

  if (chat.type === 'chat') {
    if (chat.chatType === 'group') return 'some group'

    return html`<a href="https://t.me/c/${(chat.id + 1e12) * -1}">${chat.displayName || 'unknown chat'}</a>`
  } else {
    return html`<a href="tg://user?id=${chat.id}">${chat.displayName}</a>`
  }
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
  if (context.isOutgoing || (context.sender as User).isBot) return
  const hasMention = context.isMention || (context.text && config.userbot.regexps.some((regexp) => context.text.match(new RegExp(regexp))))

  if (hasMention && !(config.userbot.ignoredIds.includes(context.sender.id) && config.userbot.ignoredIds.includes(context.chat.id))) {
    const me = await userbot.getMe()
    await mentionNotify(context, me)
  }
})
