import View from '@ioc:Adonis/Core/View'
import puppeteer from 'puppeteer'
import { promises as fs } from 'fs'

type StudentForm = {
  name: string
  registerNumber: string
  course: string
  semester: number
}
export default class PdfRepository {


  public async generatePdf(payload: StudentForm){
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
      console.log(Buffer.from(pdf))
      return Buffer.from(pdf)
    } finally {
      await browser.close()
    }
  }

   public async checkFile(
    filePath: string
  ): Promise<void> {

    try {
      await fs.access(filePath)
    } catch {
      throw new Error('File name not found')
    }
}
}
