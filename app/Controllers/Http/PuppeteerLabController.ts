import {
  HttpContextContract,
} from '@ioc:Adonis/Core/HttpContext'

import PuppeteerLabService from 'App/Services/PuppeteerLabService'

const service =
  new PuppeteerLabService()

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

export default class PuppeteerLabController {

  public async run({
    request,
    response,
  }: HttpContextContract) {

    const test =
      request.input(
        'test'
      )

    const form: StudentForm = {

      name:
        request.input(
          'name'
        ),

      registerNumber:
        request.input(
          'registerNumber'
        ),

      course:
        request.input(
          'course'
        ),

      semester:
        Number(
          request.input(
            'semester'
          )
        ),

      profileImage:
        request.input(
          'profileImage'
        ),

      image2:
        request.input(
          'image2'
        ),

      image3:
        request.input(
          'image3'
        ),

      image4:
        request.input(
          'image4'
        ),

      image5:
        request.input(
          'image5'
        ),
    }

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
          'response',
          'requestfailed',
          'invalid-click',
          'abort-images',
          'screenshot',
          'pdf',
          'pdf-options',
        ],
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
