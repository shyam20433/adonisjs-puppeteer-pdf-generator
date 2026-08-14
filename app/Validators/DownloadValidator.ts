import { schema } from '@ioc:Adonis/Core/Validator'

export default class DownloadValidator {
  public schema = schema.create({
    download: schema.enum([
      'csv',
      'xlsx',
      'pdf'
    ] as const),
  })

  public messages = {
    'download.enum':
      'Download must be csv,xlsx or pdf',
  }
}
