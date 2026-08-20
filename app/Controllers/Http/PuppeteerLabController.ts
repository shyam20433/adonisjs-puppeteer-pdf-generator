import {
  HttpContextContract,
} from '@ioc:Adonis/Core/HttpContext'

import PuppeteerLabService
  from 'App/Services/PuppeteerLabService'

import LocalImagePdfService
  from 'App/Services/LocalImagePdfService'

const service =
  new PuppeteerLabService()

const localImagePdfService =
  new LocalImagePdfService()

type StudentForm = {
  name: string
  registerNumber: string
  course: string
  semester: number

  // Used by your existing PDF tests
  profileImage: string
  image2: string
  image3: string
  image4: string
  image5: string
}

type PageConfig = {
  page: number
  imageCount: number
}

export default class PuppeteerLabController {

  public async run({
    request,
    response,
  }: HttpContextContract) {

    // -----------------------------------------
    // Get test name
    // -----------------------------------------

    const test =
      request.input('test')


    // -----------------------------------------
    // Existing student form
    // -----------------------------------------

    const form: StudentForm = {

      name:
        request.input('name'),

      registerNumber:
        request.input(
          'registerNumber'
        ),

      course:
        request.input('course'),

      semester:
        Number(
          request.input('semester')
        ),

      profileImage:
        request.input(
          'profileImage'
        ),

      image2:
        request.input('image2'),

      image3:
        request.input('image3'),

      image4:
        request.input('image4'),

      image5:
        request.input('image5'),
    }


    // -----------------------------------------
    // Dynamic page configuration
    // -----------------------------------------
    //
    // Example:
    //
    // pages: [
    //   {
    //     page: 1,
    //     imageCount: 5
    //   },
    //   {
    //     page: 2,
    //     imageCount: 2
    //   }
    // ]
    //
    // -----------------------------------------

    const pages: PageConfig[] =
      request.input('pages')


    // -----------------------------------------
    // Test parameter validation
    // -----------------------------------------

    if (!test) {

      return response.badRequest({

        status: false,

        message:
          'test query parameter is required',

        availableTests: [

          'launch',

          'viewport',

          'selector',

          'evaluate',

          'networkidle',

          'permissions',

          'response',

          'requestfailed',

          'invalid-click',

          'connect',

          'screenshot',

          'pdf',

          'local-images',

          'abort-images',

          'pdf-options',

        ],

      })
    }


    // =========================================
    // SCREENSHOT
    // =========================================
if (
  test === 'wait-until'
) {

  const waitUntil =
    request.input('waitUntil')

  if (
    ![
      'load',
      'networkidle0',
      'networkidle2',
    ].includes(waitUntil)
  ) {

    return response.badRequest({

      status: false,

      message:
        'waitUntil must be load, networkidle0 or networkidle2',

    })
  }

  const result =
    await service.testWaitUntil(
      waitUntil
    )

  return response.ok({

    status: true,

    test: 'wait-until',

    result,

  })
}
    if (
      test === 'screenshot'
    ) {

      const image =
        await service.generateScreenshot(
          form
        )

      response.header(
        'Content-Type',
        'image/png'
      )

      response.header(
        'Content-Disposition',
        'inline; filename="puppeteer-test.png"'
      )

      return response.send(
        image
      )
    }


    // =========================================
    // NORMAL PDF
    // =========================================

    if (
      test === 'pdf'
    ) {

      const pdf =
        await service.generatePdf(
          form
        )

      response.header(
        'Content-Type',
        'application/pdf'
      )

      response.header(
        'Content-Disposition',
        'inline; filename="puppeteer-test.pdf"'
      )

      return response.send(
        pdf
      )
    }


    // =========================================
    // LOCAL IMAGES PDF
    // =========================================

    if (
      test === 'local-images'
    ) {

      // Validate pages

      if (
        !Array.isArray(pages) ||
        pages.length === 0
      ) {

        return response.badRequest({

          status: false,

          message:
            'pages is required and must contain at least one page',

        })
      }


      // Validate each page

      for (
        const page of pages
      ) {

        if (
          typeof page.page !== 'number'
        ) {

          return response.badRequest({

            status: false,

            message:
              'page must be a number',

          })
        }

        if (
          typeof page.imageCount !== 'number'
        ) {

          return response.badRequest({

            status: false,

            message:
              `imageCount is required for page ${page.page}`,

          })
        }

        if (
          page.imageCount < 0
        ) {

          return response.badRequest({

            status: false,

            message:
              `imageCount cannot be negative for page ${page.page}`,

          })
        }
      }


      // Generate PDF

      const pdf =
        await localImagePdfService.generatePdf(

          {
            name:
              form.name,

            registerNumber:
              form.registerNumber,

            course:
              form.course,

            semester:
              form.semester,
          },

          pages
        )


      // Return PDF

      response.header(
        'Content-Type',
        'application/pdf'
      )

      response.header(
        'Content-Disposition',
        'inline; filename="local-images.pdf"'
      )

      return response.send(
        pdf
      )
    }


    // =========================================
    // ABORT IMAGES PDF
    // =========================================

    if (
      test === 'abort-images'
    ) {

      const pdf =
        await service.generateabortPdf(
          form
        )

      response.header(
        'Content-Type',
        'application/pdf'
      )

      response.header(
        'Content-Disposition',
        'inline; filename="puppeteer-no-images.pdf"'
      )

      return response.send(
        pdf
      )
    }


    // =========================================
    // PDF OPTIONS
    // =========================================

    if (
      test === 'pdf-options'
    ) {

      const pdf =
        await service.generatePdfOptions(
          form
        )

      response.header(
        'Content-Type',
        'application/pdf'
      )

      response.header(
        'Content-Disposition',
        'inline; filename="puppeteer-options.pdf"'
      )

      return response.send(
        pdf
      )
    }


    // =========================================
    // OTHER PUPPETEER TESTS
    // =========================================

    const result =
      await service.runTest(
        test,
        form
      )


    return response.ok({

      status: true,

      test,

      result,

    })
  }
}
