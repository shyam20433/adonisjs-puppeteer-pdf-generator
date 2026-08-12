import path from 'path'
import fetch from 'node-fetch'
import PdfRepository from 'App/Repositories/PdfRepository'

type StudentForm = {
  name: string
  registerNumber: string
  course: string
  semester: number
  profileImage: string
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

  public async validateImageUrl(
    imageUrl: string
  ): Promise<void> {

    try {

      const imageResponse = await fetch(imageUrl)

      if (!imageResponse.ok) {

        const error = new Error('Image URL is not accessible.')
        ;(error as any).status = 400
        throw error

      }

      const contentType = imageResponse.headers.get('content-type')

      if (!contentType || !contentType.toLowerCase().startsWith('image/')) {

        const error = new Error('The provided URL does not return an image')
        ;(error as any).status = 400
        throw error

      }

    } catch (error: any) {

      if (
        error.message === 'Image URL is not accessible.' ||
        error.message === 'The provided URL does not return an image'
      ) {
        throw error
      }

      const err = new Error('Image URL is not accessible.')
      ;(err as any).status = 400
      throw err

    }
  }

  public async saveStudentToCsv(
    form: StudentForm
  ): Promise<void> {

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

    await this.validateImageUrl(
      form.profileImage
    )

    const pdf =
      await pdfRepository.generatePdf(
        form
      )

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
      this.saveStudentToCsv(form),
      this.saveStudentToExcel(form),
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
      this.buildFilePath(filename)

    await pdfRepository.checkFile(
      filePath
    )

    return filePath
  }
}
