import View from '@ioc:Adonis/Core/View'
import puppeteer from 'puppeteer'
import { promises as fs } from 'fs'
import ExcelJS from 'exceljs'

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

export default class PdfRepository {

  public async generatePdf(
    payload: StudentForm
  ): Promise<Buffer> {
    const html =await View.render(
        'StudentsForm',
        {
          name: payload.name,
          registerNumber:
            payload.registerNumber,
          course: payload.course,
          semester: payload.semester,
          profileImage:
            payload.profileImage,
          image2: payload.image2,
          image3: payload.image3,
          image4: payload.image4,
          image5: payload.image5,
        }
      )
    const browser =
      await puppeteer.launch({
        headless: true,
      })
    try {
      const page =
        await browser.newPage()
      await page.setContent(
        html,
        {
          waitUntil: 'load',
        }
      )
      const imageErrors =
        await page.evaluate(
          async () => {
            const pages =
              Array.from(
                document.querySelectorAll(
                  '.pdf-page'
                )
              )
            const errors: {
              page: number
              url: string
            }[] = []
            for (
              let index = 0;
              index < pages.length;
              index++
            ) {
              const currentPage =pages[index]
              const images =
                Array.from(
                  currentPage.querySelectorAll(
                    'img'
                  )
                ) as HTMLImageElement[]
              for (
                const image of images
              ) {

                if (
                  !image.complete
                ) {
                  await new Promise<void>(resolve => {
                      image.onload =
                        () => resolve()
                      image.onerror =
                        () => resolve()
                    }
                  )
                }
                const imageLoaded =
                  image.complete &&
                  image.naturalWidth > 0 &&
                  image.naturalHeight > 0
                if (
                  !imageLoaded
                ) {
                  errors.push({
                    page: index + 1,
                    url: image.src,
                  })
                }
              }
            }
            return errors
          }
        )
      if (
        imageErrors.length > 0
      ) {
        const messages =
          imageErrors.map(
            error =>
              `Invalid image URL on page ${error.page}: ${error.url}`
          )
        throw new Error(
          messages.join('\n')
        )
      }
      const pdf =await page.pdf({
          format: 'A4',
          printBackground: true,
        })

      return Buffer.from(
        pdf
      )
    } finally {
      await browser.close()
    }
  }
  public async fileExists(
    filePath: string
  ): Promise<boolean> {
    try {
      await fs.access(
        filePath
      )
      return true
    } catch {
      return false
    }
  }
  public async checkFile(
    filePath: string
  ): Promise<void> {
    try {
      await fs.access(
        filePath
      )
    } catch {
      throw new Error(
        'File name not found'
      )
    }
  }
  public async saveStudentToCsv(
    filePath: string,
    form: StudentForm
  ): Promise<void> {
    const exists =
      await this.fileExists(
        filePath
      )
    if (
      !exists
    ) {
      await fs.writeFile(
        filePath,
        'Name,RegisterNumber,Course,Semester,ProfileImage\n'
      )
    }
    const row =
      `"${form.name}","${form.registerNumber}","${form.course}","${form.semester}","${form.profileImage}"\n`
    await fs.appendFile(
      filePath,
      row
    )
  }

  private excelWriteQueue:
    Promise<void> =
    Promise.resolve()

  public async saveStudentToExcel(
    filePath: string,
    form: StudentForm
  ): Promise<void> {

    this.excelWriteQueue =
      this.excelWriteQueue
        .catch(
          () => {}
        )
        .then(
          async () => {

            const workbook =
              new ExcelJS.Workbook()

            const exists =
              await this.fileExists(
                filePath
              )

            if (
              exists
            ) {

              await workbook.xlsx.readFile(
                filePath
              )
            }

            let worksheet =
              workbook.getWorksheet(
                'Students'
              )

            if (
              !worksheet
            ) {

              worksheet =
                workbook.addWorksheet(
                  'Students'
                )

              worksheet.columns = [
                {
                  header: 'Name',
                  key: 'name',
                  width: 25,
                },
                {
                  header: 'Register Number',
                  key: 'registerNumber',
                  width: 20,
                },
                {
                  header: 'Course',
                  key: 'course',
                  width: 30,
                },
                {
                  header: 'Semester',
                  key: 'semester',
                  width: 15,
                },
                {
                  header: 'Profile Image',
                  key: 'profileImage',
                  width: 50,
                },
              ]
            }

            worksheet.addRow([
              form.name,
              form.registerNumber,
              form.course,
              form.semester,
              form.profileImage,
            ])

            await workbook.xlsx.writeFile(
              filePath
            )
          }
        )

    return this.excelWriteQueue
  }
}
