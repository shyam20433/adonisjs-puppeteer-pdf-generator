import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import PageWiseImagePdfService from 'App/Services/PageWiseImagePdfService'
import PageWiseImagePdfValidator from 'App/Validators/PageWiseImagePdfValidator'

const service =new PageWiseImagePdfService()

export default class PageWiseImagePdfController {
  public async generate({request,response}: HttpContextContract) {
    try {
      const data =await request.validate(PageWiseImagePdfValidator)
      const pdf =await service.generatePdf({
            name:data.name,
            registerNumber:data.registerNumber,
            course:data.course,
            semester:data.semester,
          },data.pages,
        )

      response.header(
        'Content-Type',
        'application/pdf'
      )

      response.header(
        'Content-Disposition',
        'inline; filename="page-wise-images.pdf"'
      )

      return response.send(
        pdf
      )

    } catch (error: any) {

      return response.badRequest({

        status: false,

        message:
          'PDF cannot be generated',

        error:
          error.messages ||
          error.message,

      })
    }
  }
}
