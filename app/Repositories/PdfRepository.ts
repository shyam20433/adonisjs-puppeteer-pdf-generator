import View from '@ioc:Adonis/Core/View'
import puppeteer from 'puppeteer'
import { promises as fs } from 'fs'
import ExcelJS from 'exceljs'

type StudentForm = {
  name: string
  registerNumber: string
  course: string
  semester: number
}

export default class PdfRepository {

  public async generatePdf(
    payload: StudentForm
  ): Promise<Buffer> {

    const html = await View.render('StudentsForm', {
      name: payload.name,
      registerNumber: payload.registerNumber,
      course: payload.course,
      semester: payload.semester,
    })

    const browser = await puppeteer.launch()

    try {
      const page = await browser.newPage()

      await page.setContent(html, {
        waitUntil: 'load',
      })

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

  public async savePdf(
    filePath: string,
    pdf: Buffer
  ): Promise<void> {

    await fs.writeFile(
      filePath,
      pdf as any
    )
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
  public async saveStudentToCsv(
  filePath: string,
  form: StudentForm
): Promise<void> {

  const exists = await this.fileExists(filePath)

  if (!exists) {
    await fs.writeFile(
      filePath,
      'Name,RegisterNumber,Course,Semester\n'
    )
  }

  const row =`"${form.name}","${form.registerNumber}","${form.course}","${form.semester}"\n`

  await fs.appendFile(
    filePath,
    row
  )
}


  public async saveStudentToExcel(
    filePath: string,
    form: StudentForm
  ): Promise<void> {

    const workbook = new ExcelJS.Workbook()

    const exists = await this.fileExists(filePath)

    if (exists) {
      await workbook.xlsx.readFile(filePath)
    }

    let worksheet = workbook.getWorksheet('Students')

    if (!worksheet) {
      worksheet = workbook.addWorksheet('Students')

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
      ]
    }

    worksheet.addRow({
      name: form.name,
      registerNumber: form.registerNumber,
      course: form.course,
      semester: form.semester,
    })

    await workbook.xlsx.writeFile(filePath)
  }
}
