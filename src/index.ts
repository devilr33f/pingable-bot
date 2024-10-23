import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'

import { oneLine } from 'common-tags'
import { createLogger, format, transports } from 'winston'

import config from '@/config.js'

import { bot, userbot } from './bot.js'

const logger = createLogger({
  level: 'info',
  defaultMeta: { type: 'index' },
  format: format.combine(
    format.colorize({ all: true }),
    format.timestamp(),
    format.printf(({ level, message, timestamp, type }) => {
      return `${timestamp} [${level}] ${type}: ${message}`
    }),
  ),
  transports: [
    new transports.Console(),
  ],
})

const init = async () => {
  logger.info(oneLine`
    starting
    ${config.package.name}
    (${config.package.version})
    in ${config.package.mode} mode...
  `)

  if (!existsSync('./storage')) await mkdir('./storage')

  await Promise.all([
    bot.start({
      botToken: config.bot.token,
    }),
    userbot.start({
      phone: () => userbot.input('Phone > '),
      code: () => userbot.input('Code > '),
      password: () => userbot.input('Password > '),
    }),
  ])

  logger.info('bot is started')
}

init()
