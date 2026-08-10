import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class GeneratePdfValidator {
  public schema = schema.create({
    name: schema.string(
      { trim: true },
      [
        rules.required(),
        rules.minLength(2),
        rules.maxLength(100),
      ]
    ),

    registerNumber: schema.string(
      { trim: true },
      [
        rules.required(),
        rules.minLength(2),
        rules.maxLength(30),
      ]
    ),

    course: schema.string(
      { trim: true },
      [
        rules.required(),
        rules.minLength(2),
        rules.maxLength(100),
      ]
    ),

    semester: schema.number([
      rules.required(),
    ]),
  })

  public messages = {
    '*.required': 'This field is required',
    '*.minLength': 'This field must contain at least 2 characters',
    '*.maxLength': 'This field cannot exceed 100 characters',
  }
}
