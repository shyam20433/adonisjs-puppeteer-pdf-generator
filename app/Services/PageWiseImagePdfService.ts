import View from '@ioc:Adonis/Core/View'
import puppeteer from 'puppeteer'

import PageWiseImagePdfRepository from 'App/Repositories/PageWiseImagePdfRepository'

type StudentForm = {
  name: string
  registerNumber: string
  course: string
  semester: number
}

type ChartConfig = {
  type: 'pie' | 'bar'

  data: {
    label: string
    value: number
  }[]
}

type PageConfig = {
  page: number
  imageCount: number
  chart?: ChartConfig[]
}
const pageWiseImagePdfRepository = new PageWiseImagePdfRepository()
export default class PageWiseImagePdfService {
  public async generatePdf(
    payload: StudentForm,
    pages: PageConfig[]
  ): Promise<Buffer> {

    const browser = await puppeteer.launch({
      headless: true,
    })

    try {

      const browserPage = await browser.newPage()

      let imageIndex = 0
      const renderedPages: {
        page: number
        images: string[]
        chart?: ChartConfig[]
      }[] = []
      for (const pageConfig of pages) {
        const pageResult = await pageWiseImagePdfRepository.getImagesForPage(imageIndex, pageConfig.imageCount, pageConfig.page)
        imageIndex = pageResult.nextImageIndex
        if (pageConfig.chart) {

          for (const chart of pageConfig.chart) {

            if (
              !chart.data ||
              chart.data.length === 0
            ) {

              throw new Error(
                `Chart data is empty on page ${pageConfig.page}`
              )
            }
          }
        }
        const html =
          await View.render(
            'StudentsForm2', {
            name: payload.name,
            registerNumber: payload.registerNumber,
            course: payload.course,
            semester: payload.semester,
            pages: [{
              page: pageConfig.page,
              images: pageResult.images,
              chart: pageConfig.chart,
            },
            ],
          }
          )
        await browserPage.setContent(html,
          {
            waitUntil: 'load',
          }
        )
        const imageStatus = await browserPage.evaluate(
          () => {
            const images =
              Array.from(
                document.querySelectorAll(
                  '.pdf-page img'
                )
              ) as HTMLImageElement[]
            return images.map(
              image => ({
                loaded:
                  image.complete &&
                  image.naturalWidth > 0,

                width:
                  image.naturalWidth,
              })
            )
          }
        )



        const failedImages = imageStatus.filter(
          image => !image.loaded)

        if (failedImages.length > 0) {
          throw new Error(
            `Image loading failed on page ${pageConfig.page}. ` +
            `Failed images: ${failedImages.length}`
          )
        }

        if (pageConfig.chart) {

          const chartCount =
            await browserPage.evaluate(() => {

              const charts =
                document.querySelectorAll(
                  '.chart'
                )

              return charts.length
            })

          if (
            chartCount !== pageConfig.chart.length
          ) {

            throw new Error(
              `Chart rendering failed on page ${pageConfig.page}. ` +
              `Expected: ${pageConfig.chart.length}, ` +
              `Rendered: ${chartCount}`
            )
          }

          renderedPages.push({
            page: pageConfig.page,
            images: pageResult.images,
            chart: pageConfig.chart,
          })
        }
      }
      const finalHtml =
        await View.render(
          'StudentsForm2',
          {
            name: payload.name,
            registerNumber: payload.registerNumber,
            course: payload.course,
            semester: payload.semester,
            pages: renderedPages,
          }
      )
      await browserPage.setContent(
        finalHtml, {
        waitUntil: 'load',
      }
      )

      const pdf = await browserPage.pdf({
        format: 'A4',
        printBackground: true,
      })

      return Buffer.from(pdf)
    } finally {
      await browser.close()
    }
  }
}
