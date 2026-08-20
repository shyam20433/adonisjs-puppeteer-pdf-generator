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
/puppeteer-lab?test=permissions
/puppeteer-lab?test=invalid-click

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
          waitUntil: 'load', //networkidle2
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
  ): Promise<Buffer> {

    const {
      browser,
      page,
    } = await this.createPage()

    const abortedImages: string[] = []

    try {

      await page.setRequestInterception(true)

      page.on(
        'request',
        request => {

          if (
            request.resourceType() === 'image'
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

      // Generate PDF after image requests
      // have been aborted
      const pdf =
        await page.pdf({
          format: 'A4',
          printBackground: true,
        })

      return Buffer.from(pdf)

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
  //permissions

  public async testPermissions(): Promise<object> {

    const browser = await puppeteer.launch({
      headless: false,
    })

    try {

      const context =
        browser.defaultBrowserContext()

      await context.overridePermissions(
        'http://127.0.0.1:3333',
        ['geolocation']
      )

      const page =
        await browser.newPage()

      await page.setGeolocation({
        latitude: 13.0827,
        longitude: 80.2707,
      })

      await page.goto(
        'http://127.0.0.1:3333/geolocation-test',
        {
          waitUntil: 'load',
        }
      )

      const permission =
        await page.evaluate(async () => {

          const result =
            await navigator.permissions.query({
              name: 'geolocation',
            })

          return result.state
        })

      const location =
        await page.evaluate(() => {

          return new Promise((resolve) => {

            navigator.geolocation.getCurrentPosition(

              position => {

                resolve({
                  success: true,
                  latitude:
                    position.coords.latitude,
                  longitude:
                    position.coords.longitude,
                })

              },

              error => {

                resolve({
                  success: false,
                  error:
                    error.message,
                  code:
                    error.code,
                })

              }

            )

          })

        })

      return {
        test: 'permissions',
        status: 'passed',
        permission,
        location,
      }

    } finally {

      await browser.close()

    }
  }


  //load networkidle2 and 0
public async testWaitUntil(
  waitUntil: 'load' | 'networkidle0' | 'networkidle2'
): Promise<object> {

  const browser = await puppeteer.launch({
    headless: true,
  })

  try {

    const page = await browser.newPage()

    const html = `
      <!DOCTYPE html>

      <html>

      <body>

        <h1>Puppeteer WaitUntil Test</h1>

        <img
          id="image1"
          src="https://placehold.co/500x300/png"
        >

        <img
          id="image2"
          src="https://placehold.co/500x301/png"
        >

        <img
          id="image3"
          src="https://placehold.co/500x302/png"
        >

        <img
          id="image4"
          src="https://placehold.co/500x303/png"
        >

        <img
          id="image5"
          src="https://placehold.co/500x304/png"
        >

      </body>

      </html>
    `

    const start = Date.now()

    await page.setContent(
      html,
      {
        waitUntil,
      }
    )

    const end = Date.now()

    const imageStatus =
      await page.evaluate(() => {

        const images =
          Array.from(
            document.querySelectorAll('img')
          ) as HTMLImageElement[]

        return images.map(
          (image, index) => {

            return {

              image:
                index + 1,

              url:
                image.src,

              complete:
                image.complete,

              loaded:
                image.complete &&
                image.naturalWidth > 0,

              naturalWidth:
                image.naturalWidth,

            }

          }
        )
      })

    return {

      test:
        'wait-until',

      waitUntil,

      timeTaken:
        `${end - start} ms`,

      totalImages:
        imageStatus.length,

      loadedImages:
        imageStatus.filter(
          image => image.loaded
        ).length,

      imageStatus,

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

      const pdf = await page.pdf({

        format: 'A4',

        landscape: false,

        printBackground: true,

        margin: {
          top: '75px',
          bottom: '45px',
          left: '20px',
          right: '20px',
        },

        displayHeaderFooter: true,

        headerTemplate: `
    <div style="
      width: 100%;
      padding: 0 56px 10px;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #14213D;
      text-align: center;
      border-bottom: 1px solid #E3E1E8;
    ">
      Student Academic Record
    </div>
  `,

        footerTemplate: `
    <div style="
      width: 100%;
      padding: 8px 56px 0;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
      color: #9A97A3;
      text-align: center;
      border-top: 1px solid #E3E1E8;
      display: flex;
      justify-content: space-between;
    ">
      <span></span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
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

  //connect


  public async testConnect(): Promise<object> {
    const browser =
      await puppeteer.launch({
        headless: false,
      })

    const browserWSEndpoint =
      browser.wsEndpoint()

    browser.disconnect()

    const connectedBrowser =
      await puppeteer.connect({
        browserWSEndpoint,
      })

    try {

      const page =
        await connectedBrowser.newPage()

      await page.goto(
        'https://footballplayers.onrender.com/players',
        {
          waitUntil: 'networkidle2',
        }
      )

      const title =
        await page.title()

      const url =
        page.url()

      return {
        test: 'connect',
        status: 'passed',

        message:
          'Successfully disconnected and reconnected to the running browser',

        browserWSEndpoint,

        title,

        url,
      }

    } finally {

      // Disconnect Puppeteer
      // Browser itself remains running
      connectedBrowser.disconnect()
    }
  }
}
