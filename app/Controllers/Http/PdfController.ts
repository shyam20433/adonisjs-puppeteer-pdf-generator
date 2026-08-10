import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GeneratePdfValidator from 'App/Validators/GeneratePdfValidator'
import DownloadPdfValidator from 'App/Validators/DownloadPdfCSVValidator'
import PdfService from 'App/Services/PdfService'

const pdfService = new PdfService()

export default class PdfController {
  public async generate({request,response}: HttpContextContract) {
    const form = await request.validate(GeneratePdfValidator)
    const fileName = await pdfService.generatePdf(form)
    return response.ok({
      success: true,
      message: 'PDF generated successfully & Record is Stored ',
      fileName: fileName,
    })
  }
  public async download({request,response}: HttpContextContract) {
    const data = await request.validate(DownloadPdfValidator)
    const filePath =await pdfService.getFilePath(data.filename)
    return response.download(filePath)
  }
}
