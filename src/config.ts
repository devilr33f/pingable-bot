import { existsSync } from 'fs'

import dotenv from 'dotenv'
import env from 'env-var'

// @note: this is required mostly for development purposes or non-docker environment
dotenv.config({
  path: (process.env.NODE_ENV === 'development' && existsSync('.env.development')) ? '.env.development' : '.env',
})

export default {
  package: {
    name: env.get('npm_package_name').default('unknown').asString(),
    version: env.get('npm_package_version').default('unknown').asString(),
    mode: env.get('NODE_ENV').default('production').asString(),
  },
  mtcute: {
    apiId: env.get('MTCUTE_API_ID').required().asInt(),
    apiHash: env.get('MTCUTE_API_HASH').required().asString(),
  },
  userbot: {
    regexps: env.get('USERBOT_REGEXPS').default('').asArray(';'),
  },
  bot: {
    token: env.get('BOT_TOKEN').required().asString(),
    chatId: env.get('BOT_CHAT_ID').required().asInt(),
  },
}
