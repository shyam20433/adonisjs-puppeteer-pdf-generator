import View from '@ioc:Adonis/Core/View'
import puppeteer from 'puppeteer'
import { promises as fs } from 'fs'
type StudentForm = {name: string
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

    const browser = await puppeteer.launch()
    
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

    public async fileExists(
    filePath: string
  ): Promise<boolean> {

    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }


  public async writeFile(filePath: string,data: string){

    await fs.writeFile(
      filePath,
      data
    )
  }
  public async appendFile(
    filePath: string,
    data: string
  ){

    await fs.appendFile(
      filePath,
      data
    )
  }


  public async savePdf(filePath: string,pdf: Buffer){
    await fs.writeFile(filePath,pdf as any)
  }
  public async checkFile(filePath: string){
    try {
      await fs.access(filePath)
    } catch {
      throw new Error('File name not found')
    }
  }
}
