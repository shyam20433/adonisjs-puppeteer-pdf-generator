import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GeneratePdfValidator from 'App/Validators/GeneratePdfValidator'
import DownloadValidator from 'App/Validators/DownloadValidator'
import PdfService from 'App/Services/PdfService'
import StudentDetailsService from 'App/Services/StudentDetailsService'

const pdfService =new PdfService()
const studentDetailsService =new StudentDetailsService()
export default class PdfController {
  public async generate({request,response}: HttpContextContract){

    const download =request.input('download')
      if (
        download === 'pdf'
      ) {
        const form =await request.validate(GeneratePdfValidator)
        const result =await pdfService.generatePdf(form)
        response.header(
          'Content-Type',
          'application/pdf' //'image/jpeg' for screenshots
        )
        response.header(
          'Content-Disposition',
          `inline; filename="${result.fileName}"`
        )

        return response.send(
          result.pdf
        )
      }

      const data =await request.validate(DownloadValidator)
      const filePath =await pdfService.getFilePath(`students.${data.download}`)
      const fs =await import('fs/promises')

      response.download(
        filePath
      )

      response.response.on(
        'finish',
        async () => {

          try {

            await fs.unlink(
              filePath
            )

          } catch (error) {

            console.error(
              'Failed to delete file:',
              error
            )

          }

        }
      )

      return
    }
  public async downloadStudentDetails(
    {
      response,
    }: HttpContextContract
  ) {

    const pdf =await studentDetailsService.generateStudentDetailsPdf()
    response.header(
      'Content-Type',
      'application/pdf'
    )
    response.header(
      'Content-Disposition',
      'inline; filename="student-details.pdf"'
    )

    return response.send(
      pdf
    )
  }
}
