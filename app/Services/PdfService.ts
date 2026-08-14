import path from 'path'
import PdfRepository from 'App/Repositories/PdfRepository'

type StudentForm = {
  name: string
  registerNumber: string
  course: string
  semester: number
  profileImage: string
  image2: string
  image3: string
  image4: string
  image5: string
}

const pdfRepository =
  new PdfRepository()

export default class PdfService {

  private buildFilePath(
    filename: string
  ): string {

    return path.join(
      process.cwd(),
      'filledforms',
      filename
    )
  }

  private async createFolder(): Promise<void> {

    const folderPath =
      path.join(
        process.cwd(),
        'filledforms'
      )

    const fs =
      await import('fs/promises')

    await fs.mkdir(
      folderPath,
      {
        recursive: true,
      }
    )
  }

  public async saveStudentToCsv(
    form: StudentForm
  ): Promise<void> {

    await this.createFolder()

    const filePath =
      this.buildFilePath(
        'students.csv'
      )

    await pdfRepository.saveStudentToCsv(
      filePath,
      form
    )
  }

  public async saveStudentToExcel(
    form: StudentForm
  ): Promise<void> {

    await this.createFolder()

    const filePath =
      this.buildFilePath(
        'students.xlsx'
      )

    await pdfRepository.saveStudentToExcel(
      filePath,
      form
    )
  }

  public async generatePdf(
    form: StudentForm
  ): Promise<{
    pdf: Buffer
    fileName: string
  }> {

    const pdf =
      await pdfRepository.generatePdf(
        form
      )

    await this.createFolder()

    const safeName =
      form.name.replace(
        /[^a-zA-Z0-9-_]/g,
        '_'
      )

    const date =
      new Date()

    const formattedDate =
      `${date.getDate().toString().padStart(2, '0')}-` +
      `${(date.getMonth() + 1).toString().padStart(2, '0')}-` +
      `${date.getFullYear()}`

    const fileName =
      `${form.registerNumber}_${formattedDate}_${safeName}.pdf`

    await Promise.all([
      this.saveStudentToCsv(
        form
      ),
      this.saveStudentToExcel(
        form
      ),
    ])

    return {
      pdf,
      fileName,
    }
  }

  public async getFilePath(
    filename: string
  ): Promise<string> {

    const filePath =
      this.buildFilePath(
        filename
      )

    await pdfRepository.checkFile(
      filePath
    )

    return filePath
  }
}
