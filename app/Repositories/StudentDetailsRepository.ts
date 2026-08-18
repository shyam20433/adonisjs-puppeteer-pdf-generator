import View from '@ioc:Adonis/Core/View'
import puppeteer from 'puppeteer'
import { promises as fs } from 'fs'

type CsvStudent = {
  name: string
  registerNumber: string
  course: string
  semester: string
  profileImage: string
}

export default class StudentDetailsRepository {
  private parseCsv(csv: string): CsvStudent[] {
    const lines =csv.split('\n')
        .map(
          line => line.trim()
        )
        .filter(
          line => line.length > 0
        )

    if (lines.length <= 1){
      throw new Error(
        'No student records found'
      )
    }

    const students:
      CsvStudent[] = []

    for (let index = 1;index < lines.length;index++){
      const values =
        lines[index]
          .match(
            /"([^"]*)"|([^,]+)/g
          )
          ?.map(
            value =>
              value.replace(
                /^"|"$/g,
                ''
              )
          )

      if (
        !values ||
        values.length < 5
      ) {

        continue
      }

      students.push({
        name: values[0],
        registerNumber: values[1],
        course: values[2],
        semester: values[3],
        profileImage: values[4],
      })
    }

    if (
      students.length === 0
    ) {

      throw new Error(
        'No student records found'
      )
    }

    return students
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
        'Student CSV file not found'
      )
    }
  }

  public async generateStudentDetailsPdf(
    filePath: string
  ): Promise<Buffer> {

    const csv =
      await fs.readFile(
        filePath,
        'utf-8'
      )

    const students =
      this.parseCsv(
        csv
      )

    const html =
      await View.render(
        'DownloadStudentDetails',
        {
          students,
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
                  '.student-page'
                )
              )

            const errors: {
              page: number
              name: string
              url: string
            }[] = []

            for (
              let index = 0;
              index < pages.length;
              index++
            ) {

              const currentPage =
                pages[index]

              const nameElement =
                currentPage.querySelector(
                  '.student-name'
                )

              const studentName =
                nameElement
                  ?.textContent
                  ?.trim() ||
                'Student'

              const image =
                currentPage.querySelector(
                  'img.student-image'
                ) as HTMLImageElement | null

              if (
                !image
              ) {

                errors.push({
                  page: index + 1,
                  name: studentName,
                  url: '',
                })

                continue
              }

              if (
                !image.complete
              ) {

                await new Promise<void>(
                  resolve => {

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
                  name: studentName,
                  url: image.src,
                })
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
              `Page ${error.page}: ${error.name}'s image is incorrect`
          )

        throw new Error(
          messages.join('\n')
        )
      }

      const pdf =
        await page.pdf({
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
}
