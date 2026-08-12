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

    course: schema.enum([
      'M.Sc Data Science',
      'M.Sc Computer Science',
      'MCA',
    ] as const),
    semester: schema.number([
      rules.required(),
      rules.range(1, 10),
    ]),
    profileImage: schema.string([
      rules.required(),
      rules.url(),
    ])
  })

  public messages = {
    '*.required': 'This field is required',
    '*.minLength': 'This field must contain at least 2 characters',
    '*.maxLength': 'This field cannot exceed 100 characters',
    'profileImage.url': 'The provided profile image must be a valid URL',
  }
}
