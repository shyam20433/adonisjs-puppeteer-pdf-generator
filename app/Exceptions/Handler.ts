import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {

  public async handle(
    error: any,
    ctx: HttpContextContract
  ) {

    const statusCode = error.status || 500

    return ctx.response.status(statusCode).send({
      status: false,
      message: 'PDF can\'t be generated',
      error: error.messages || error.message,
    })
  }

  public async report(
    error: any,
    ctx: HttpContextContract
  ) {
    Logger.error(error)

    return super.report(error, ctx)
  }
}
