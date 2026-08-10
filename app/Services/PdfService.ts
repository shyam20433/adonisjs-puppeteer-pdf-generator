import path from 'path'
import PdfRepository from 'App/Repositories/PdfRepository'

type StudentForm = {
  name: string
  registerNumber: string
  course: string
  semester: number
}
const pdfRepository=new PdfRepository()
export default class PdfService {
  public async generatePdf(
    form: StudentForm
  ): Promise<string> {
    const pdf = await pdfRepository.generatePdf(form)
    const folderPath = path.join(
      process.cwd(),
      'filledforms'
    )
    const fs = await import('fs/promises')

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
    await pdfRepository.savePdf(
      filePath,
      pdf
    )

    return fileName
  }


  public async getFilePath(
    filename: string
  ): Promise<string> {

    const folderPath = path.join(
      process.cwd(),
      'filledforms'
    )

    const filePath = path.join(
      folderPath,
      filename
    )

    await pdfRepository.checkFile(
      filePath
    )

    return filePath
  }
}
