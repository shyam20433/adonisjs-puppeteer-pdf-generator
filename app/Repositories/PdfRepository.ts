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
      const page =await browser.newPage()
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

            for (let index = 0;index < pages.length;index++){
              const currentPage =pages[index]
              const images =Array.from(
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




//testes

/*
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
    const html = await View.render(
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

    const browser = await puppeteer.launch({
      //headless: true, doesnt open the chrome
      //headless:false, opens the chrome
      /* headless: false,  executable installed chrome tab
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', */
      /* headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    ], */ //=> uses docker
      //headless: false,
      //devtools: true,
      //dumpio: true, => used to find error when chromium fails to start
      //timeout:100,
/*
         headless: true,
            dumpio: true,
            executablePath:
      'C:\\wrong\\chrome.exe' */ //=>intentional error
      /*
      headless: true
      defaultViewport: {
        width: 100,
        height: 100,
      },

    })
    try {
      const page = await browser.newPage() */

      //test case 2
      /*
            await page.setRequestInterception(true)

            page.on('request', request => {

              if (
                request.resourceType() === 'image'
              ) {
                request.abort()
                return
              }

              request.continue()
            })

            await page.setContent(
              html,
              {
                waitUntil: 'load',
              }
            ) */
           /*
      page.on(
        'response',
        response => {

          console.log(
            response.status(),
            response.url()
          )

        }
      )
      await page.setContent(
        html,
        {
          waitUntil: 'load',
        })
      //test case 1 : accessing button that doesnt exits
      /* await page.click(
        '#test'
      ) */

      //testcase 2:

      /* await page.goto(
  'https://www.youtube.com/',
  {
    waitUntil: 'networkidle2',
  },*/
      /* const element =
        await page.$(
          '.info h1'
        )

      console.log(
        element !== null
      )

      const pages =
        await page.$$(
          '.pdf-page'
        )

      console.log(
        'Pages:',
        pages.length
      )


      const name =
        await page.$eval(
          '.info h1',
          element =>
            element.textContent?.trim().toUpperCase()
        )

      console.log(
        'Student:',
        name
      )

      await page.click(
        '#test'
      ) */

      /* const pageCount =
        await page.evaluate(() => {

          return document
            .querySelectorAll(
              '.pdf-page'
            ).length

        })

      console.log(
        'PDF page count:',
        pageCount
      )

      if (
        pageCount === 0
      ) {

        throw new Error(
          'No .pdf-page elements found'
        )

      }

      await page.waitForSelector(
        '.pdf-page',
        {
          timeout: 5000,
        }
      )

      console.log(
        '.pdf-page selector found'
      ) */
      /* await page.waitForSelector(
        '.pdf-page'
      )

      console.log(
        'PDF pages found'
      )

      console.log(
        'All 5 image elements exist'
      ) */ //=> function run untill the conditions gets true
      /* const imageErrors =
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

            for (let index = 0; index < pages.length; index++) {
              const currentPage = pages[index]
              const images = Array.from(
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
        ) */
      /* const imageErrors =
        await page.evaluate(
          async () => {

            const pageElements =
              Array.from(
                document.querySelectorAll(
                  '.pdf-page'
                )
              ) as HTMLElement[]

            const errors: {
              page: number
              url: string
            }[] = []

            for (
              let index = 0;
              index < pageElements.length;
              index++
            ) {

              const pageElement =
                pageElements[index]

              const images =
                Array.from(
                  pageElement.querySelectorAll(
                    'img'
                  )
                ) as HTMLImageElement[]

              for (
                const image of images
              ) {

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
        */
      /*
      const pdf = await page.pdf({
        /* const pdf = await page.screenshot({
        path: './student.jpg',
        type: 'jpeg',
        quality: 90,
        fullPage: true,})

        format: 'A3',
        //pageRanges:'1,2',
        //landscape: true,
        //outline: true,
        //printBackground: true,
        //omitBackground: true,
        //path: './filledforms/student.pdf',
        /* displayHeaderFooter: true,

        margin: {
          top: '30px',
          bottom: '30px',
        },

        headerTemplate: `
    <div style="
      font-size: 10px;
      width: 100%;
      text-align: center;
    ">
      Student Academic Record
    </div>
  `,

        footerTemplate: `
    <div style="
      font-size: 10px;
      width: 100%;
      text-align: center;
    ">
      Page
      <span class="pageNumber"></span>
      of
      <span class="totalPages"></span>
    </div>
  `, */
  /*
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
          () => { }
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
  }*/

