import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class DownloadPdfCSVValidator {
  public schema = schema.create({
    filename: schema.string(
      { trim: true },
      [
        rules.required(),
        rules.minLength(1),
        rules.maxLength(255),
        rules.regex(/^[a-zA-Z0-9_-]+\.(pdf|csv|xlsx)$/),
      ]
    ),
  })

  public messages = {
    'filename.required': 'Filename is required',
    'filename.minLength': 'Filename cannot be empty',
    'filename.maxLength': 'Filename is too long',
    'filename.regex': 'Invalid PDF filename',
  }
}
