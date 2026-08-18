import View from '@ioc:Adonis/Core/View'
import puppeteer, {
  Browser,
  Page,
} from 'puppeteer'


/*
/puppeteer-lab?test=launch
/puppeteer-lab?test=viewport
/puppeteer-lab?test=selector
/puppeteer-lab?test=evaluate
/puppeteer-lab?test=networkidle
/puppeteer-lab?test=response
/puppeteer-lab?test=requestfailed
/puppeteer-lab?test=abort-images
/puppeteer-lab?test=screenshot
/puppeteer-lab?test=pdf
/puppeteer-lab?test=pdf-options

 */
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

export default class PuppeteerLabRepository {

  private async createPage(): Promise<{
    browser: Browser
    page: Page
  }> {

    const browser =
      await puppeteer.launch({
        headless: true,
      })

    const page =
      await browser.newPage()

    return {
      browser,
      page,
    }
  }

  private async loadStudentPage(
    page: Page,
    form: StudentForm
  ): Promise<void> {

    const html =
      await View.render(
        'StudentsForm',
        {
          name: form.name,
          registerNumber:
            form.registerNumber,
          course: form.course,
          semester: form.semester,
          profileImage:
            form.profileImage,
          image2: form.image2,
          image3: form.image3,
          image4: form.image4,
          image5: form.image5,
        }
      )

    await page.setContent(
      html,
      {
        waitUntil: 'load',
      }
    )
  }


//launch


  public async testLaunch(): Promise<object> {

    const browser =
      await puppeteer.launch({
        headless: true,
      })

    await browser.close()

    return {
      test: 'launch',
      status: 'passed',
      message:
        'Puppeteer launched and closed successfully',
    }
  }

//viewport

  public async testViewport(
    form: StudentForm
  ): Promise<object> {

    const {
      browser,
      page,
    } = await this.createPage()

    try {

      await page.setViewport({
        width: 400,
        height: 800,
      })

      await this.loadStudentPage(
        page,
        form
      )

      const viewport =
        page.viewport()

      return {
        test: 'viewport',
        status: 'passed',
        viewport,
      }

    } finally {

      await browser.close()

    }
  }

//selector
  public async testSelector(
    form: StudentForm
  ): Promise<object> {

    const {
      browser,
      page,
    } = await this.createPage()

    try {

      await this.loadStudentPage(
        page,
        form
      )

      await page.waitForSelector(
        '.pdf-page',
        {
          timeout: 5000,
        }
      )

      const pages =
        await page.$$(
          '.pdf-page'
        )

      return {
        test: 'selector',
        status: 'passed',
        message:
          '.pdf-page selector found',
        pageCount:
          pages.length,
      }

    } finally {

      await browser.close()

    }
  }

//evaluate

  public async testEvaluate(
    form: StudentForm
  ): Promise<object> {

    const {
      browser,
      page,
    } = await this.createPage()

    try {

      await this.loadStudentPage(
        page,
        form
      )

      const pageCount =
        await page.evaluate(() => {

          return document
            .querySelectorAll(
              '.pdf-page'
            )
            .length

        })

      const imageCount =
        await page.evaluate(() => {

          return document
            .querySelectorAll(
              '.pdf-page img'
            )
            .length

        })

      const studentName =
        await page.$eval(
          '.info h1',
          element =>
            element
              .textContent
              ?.trim()
        )

      return {
        test: 'evaluate',
        status: 'passed',
        pageCount,
        imageCount,
        studentName,
      }

    } finally {

      await browser.close()

    }
  }

//network idle

  public async testNetworkIdle(
    form: StudentForm
  ): Promise<object> {

    const {
      browser,
      page,
    } = await this.createPage()

    try {

      const start =
        Date.now()

      const html =
        await View.render(
          'StudentsForm',
          form
        )

      await page.setContent(
        html,
        {
          waitUntil:'load', //networkidle2
        }
      )

      const time =
        Date.now() - start

      return {
        test: 'networkidle2',
        status: 'passed',
        loadTime:
          `${time} ms`,
      }

    } finally {

      await browser.close()

    }
  }

//response
  public async testResponse(
    form: StudentForm
  ): Promise<object> {

    const {
      browser,
      page,
    } = await this.createPage()

    const responses: object[] = []

    try {

      page.on(
        'response',
        response => {

          responses.push({
            status:
              response.status(),

            url:
              response.url(),

            resourceType:
              response
                .request()
                .resourceType(),
          })

        }
      )

      await this.loadStudentPage(
        page,
        form
      )

      await page.waitForNetworkIdle({
        idleTime: 1000,
      })

      return {
        test: 'response',
        status: 'passed',
        responses,
      }

    } finally {

      await browser.close()

    }
  }

//request failed


  public async testRequestFailed(
    form: StudentForm
  ): Promise<object> {

    const {
      browser,
      page,
    } = await this.createPage()

    const failures: object[] = []

    try {

      page.on(
        'requestfailed',
        request => {

          failures.push({
            url:
              request.url(),

            error:
              request
                .failure()
                ?.errorText,
          })

        }
      )

      await this.loadStudentPage(
        page,
        form
      )

      await page.waitForNetworkIdle({
        idleTime: 1000,
      })

      return {
        test: 'requestfailed',
        status: 'passed',
        failures,
        message:
          failures.length === 0
            ? 'No failed requests'
            : 'Failed requests detected',
      }

    } finally {

      await browser.close()

    }
  }

  //abort image
  public async testAbortImages(
    form: StudentForm
  ): Promise<object> {

    const {
      browser,
      page,
    } = await this.createPage()

    let abortedImages: string[] = []

    try {

      await page.setRequestInterception(
        true
      )

      page.on(
        'request',
        request => {

          if (
            request.resourceType()
            === 'image'
          ) {

            abortedImages.push(
              request.url()
            )

            request.abort()

            return
          }

          request.continue()

        }
      )

      await this.loadStudentPage(
        page,
        form
      )

      const imageCount =
        await page.evaluate(() => {

          return document
            .querySelectorAll(
              '.pdf-page img'
            )
            .length

        })

      return {
        test: 'abort-images',
        status: 'passed',
        imageElements:
          imageCount,
        abortedImages,
      }

    } finally {

      await browser.close()

    }
  }

//screenshot
  public async testScreenshot(
    form: StudentForm
  ): Promise<Buffer> {

    const {
      browser,
      page,
    } = await this.createPage()

    try {

      await this.loadStudentPage(
        page,
        form
      )

      const screenshot =
        await page.screenshot({
          type: 'png',
          fullPage: true,
        })

      return Buffer.from(
        screenshot
      )

    } finally {

      await browser.close()

    }
  }

//pdf
  public async testPdf(
    form: StudentForm
  ): Promise<Buffer> {

    const {
      browser,
      page,
    } = await this.createPage()

    try {

      await this.loadStudentPage(
        page,
        form
      )

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

  //invalid button click

  public async testInvalidClick(
  form: StudentForm
): Promise<object> {

  const {
    browser,
    page,
  } = await this.createPage()

  try {

    await this.loadStudentPage(
      page,
      form
    )

    try {

      await page.click(
        '#invalid-button'
      )

      return {
        test: 'invalid-click',
        status: 'unexpected',
        message:
          'Button was found and clicked',
      }

    } catch (error) {

      return {
        test: 'invalid-click',
        status: 'passed',
        message:
          'Expected error occurred while clicking invalid selector',
        error:
          error instanceof Error
            ? error.message
            : String(error),
      }
    }

  } finally {

    await browser.close()

  }
}

//pdf options
  public async testPdfOptions(
    form: StudentForm
  ): Promise<Buffer> {

    const {
      browser,
      page,
    } = await this.createPage()

    try {

      await this.loadStudentPage(
        page,
        form
      )

      const pdf =
        await page.pdf({

          format: 'A3',

          landscape: false,

          printBackground: true,

          margin: {
            top: '30px',
            bottom: '30px',
            left: '20px',
            right: '20px',
          },

          displayHeaderFooter:
            true,

          headerTemplate: `
            <div style="
              width: 100%;
              text-align: center;
              font-size: 10px;
            ">
              Student Academic Record
            </div>
          `,

          footerTemplate: `
            <div style="
              width: 100%;
              text-align: center;
              font-size: 10px;
            ">
              Page
              <span class="pageNumber"></span>
              of
              <span class="totalPages"></span>
            </div>
          `,
        })

      return Buffer.from(
        pdf
      )

    } finally {

      await browser.close()

    }
  }
}
