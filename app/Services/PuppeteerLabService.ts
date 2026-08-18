import PuppeteerLabRepository from 'App/Repositories/PuppeteerLabRepository'

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

const repository =
  new PuppeteerLabRepository()

export default class PuppeteerLabService {

  public async runTest(
    test: string,
    form: StudentForm
  ): Promise<any> {

    switch (test) {

      case 'launch':
        return repository.testLaunch()

      case 'invalid-click':
        return repository.testInvalidClick(
          form
        )

      case 'viewport':
        return repository.testViewport(
          form
        )

      case 'selector':
        return repository.testSelector(
          form
        )

      case 'evaluate':
        return repository.testEvaluate(
          form
        )

      case 'networkidle':
        return repository.testNetworkIdle(
          form
        )

      case 'response':
        return repository.testResponse(
          form
        )

      case 'requestfailed':
        return repository.testRequestFailed(
          form
        )

      case 'abort-images':
        return repository.testAbortImages(
          form
        )

      default:
        throw new Error(
          `Unknown test: ${test}`
        )
    }
  }

  public async generateScreenshot(
    form: StudentForm
  ): Promise<Buffer> {

    return repository.testScreenshot(
      form
    )
  }

  public async generatePdf(
    form: StudentForm
  ): Promise<Buffer> {

    return repository.testPdf(
      form
    )
  }

  public async generatePdfOptions(
    form: StudentForm
  ): Promise<Buffer> {

    return repository.testPdfOptions(
      form
    )
  }
}
