import path from 'path'
import StudentDetailsRepository from 'App/Repositories/StudentDetailsRepository'

const studentDetailsRepository =
  new StudentDetailsRepository()

export default class StudentDetailsService {

  private buildFilePath(
    filename: string
  ): string {

    return path.join(
      process.cwd(),
      'filledforms',
      filename
    )
  }

  public async generateStudentDetailsPdf(): Promise<Buffer> {

    const filePath =
      this.buildFilePath(
        'students.csv'
      )

    await studentDetailsRepository.checkFile(
      filePath
    )

    return studentDetailsRepository.generateStudentDetailsPdf(
      filePath
    )
  }
}
