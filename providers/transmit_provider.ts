import { Transmit } from '../src/transmit.js'
import type { ApplicationService } from '@adonisjs/core/types'

export default class TransmitProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('transmit', () => {
      return new Transmit()
    })
  }

  boot() {
    this.app.container.resolving('router', async (router) => {
      const transmit = await this.app.container.make('transmit')

      router.get('__transmit/events', ({ request, response }) => {
        transmit.createStream(request, response)
      })

      router.post('__transmit/subscribe', (ctx) => {
        const uid = ctx.request.input('uid')
        const channel = ctx.request.input('channel')

        const success = transmit.subscribeToChannel(uid, channel, ctx)

        if (!success) {
          return ctx.response.badRequest()
        }

        return ctx.response.noContent()
      })

      router.post('__transmit/unsubscribe', ({ request, response }) => {
        const uid = request.input('uid')
        const channel = request.input('channel')

        const success = transmit.unsubscribeFromChannel(uid, channel)

        if (!success) {
          return response.badRequest()
        }

        return response.noContent()
      })
    })
  }
}
