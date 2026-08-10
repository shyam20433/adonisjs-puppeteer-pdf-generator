import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GeneratePdfValidator from 'App/Validators/GeneratePdfValidator'
import PdfRepository from 'App/Repositories/PdfRepository'
import { promises as fs } from 'fs'
import path from 'path'

const pdfRepository = new PdfRepository()

export default class PdfController {
  public async generate({ request, response }: HttpContextContract) {
    const form = await request.validate(GeneratePdfValidator)
    const pdf = await pdfRepository.generatePdf(form)

    const folderPath = path.join(process.cwd(), 'filledforms')
    await fs.mkdir(folderPath, { recursive: true })
    const filePath = path.join(
      folderPath,
      `${form.name}.pdf`
    )
    await fs.writeFile(filePath, pdf as any )
    /* response.header(
      'Content-Type',
      'application/pdf'
    )
    response.header(
      'Content-Disposition',
      `attachment; filename="${form.name}.pdf"`
    )
    response.header(
      'Content-Length',
      pdf.length.toString()
    ) */
    return response.ok({
  success: true,
  message: 'PDF generated successfully',
  fileName: `${form.name}.pdf`,
})
  }
}
