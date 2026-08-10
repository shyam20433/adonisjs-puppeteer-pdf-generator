import View from '@ioc:Adonis/Core/View'
import puppeteer from 'puppeteer'

export default class PdfRepository {

  public async generatePdf(payload: any){
    const html = await View.render('StudentsForm', {
      name: payload.name,
      registerNumber: payload.registerNumber,
      course: payload.course,
      semester: payload.semester,
    })
    const browser = await puppeteer.launch({
      headless: true,
    })
    try {
      const page = await browser.newPage()
      await page.setContent(html)
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
      })
      return Buffer.from(pdf)
    } finally {
      await browser.close()
    }
  }
}
