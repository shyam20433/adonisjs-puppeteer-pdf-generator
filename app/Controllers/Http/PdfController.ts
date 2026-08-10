import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GeneratePdfValidator from 'App/Validators/GeneratePdfValidator'
import DownloadPdfValidator from 'App/Validators/DownloadPdfValidator'
import PdfRepository from 'App/Repositories/PdfRepository'
import { promises as fs } from 'fs'
import path from 'path'

const pdfRepository = new PdfRepository()

export default class PdfController {
  public async generate({
    request,
    response,
  }: HttpContextContract) {
    const form = await request.validate(
      GeneratePdfValidator
    )
    const pdf = await pdfRepository.generatePdf(form)
    const folderPath = path.join(
      process.cwd(),
      'filledforms'
    )
    await fs.mkdir(folderPath, {
      recursive: true,
    })
    const safeName = form.name.replace(
      /[^a-zA-Z0-9-_]/g,
      '_'
    )
    const date = new Date()
    const formattedDate =
      `${date.getDate().toString().padStart(2, '0')}-` +
      `${(date.getMonth() + 1).toString().padStart(2, '0')}-` +
      `${date.getFullYear()}`
    const fileName =
      `${form.registerNumber}_${formattedDate}_${safeName}.pdf`
    const filePath = path.join(
      folderPath,
      fileName
    )
    await fs.writeFile(
      filePath,
      pdf as any
    )
    return response.ok({
      success: true,
      message: 'PDF generated successfully',
      fileName: fileName,
    })
  }

   public async download({
    request,
    response,
  }: HttpContextContract) {

    const data = await request.validate(
      DownloadPdfValidator
    )

    const folderPath = path.join(
      process.cwd(),
      'filledforms'
    )

    const filePath = path.join(
      folderPath,
      data.filename
    )

    await pdfRepository.checkFile(filePath)
    return response.download(filePath)
  }
}
