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

    profileImage: schema.string(
      { trim: true },
      [
        rules.required(),
        rules.url(),
      ]
    ),

    image2: schema.string(
      { trim: true },
      [
        rules.required(),
        rules.url(),
      ]
    ),

    image3: schema.string(
      { trim: true },
      [
        rules.required(),
        rules.url(),
      ]
    ),

    image4: schema.string(
      { trim: true },
      [
        rules.required(),
        rules.url(),
      ]
    ),

    image5: schema.string(
      { trim: true },
      [
        rules.required(),
        rules.url(),
      ]
    ),
  })

  public messages = {
    '*.required':
      'This field is required',

    '*.minLength':
      'This field must contain at least 2 characters',

    '*.maxLength':
      'This field cannot exceed 100 characters',

    'profileImage.url':
      'The provided profile image must be a valid URL',

    'image2.url':
      'The provided image 2 must be a valid URL',

    'image3.url':
      'The provided image 3 must be a valid URL',

    'image4.url':
      'The provided image 4 must be a valid URL',

    'image5.url':
      'The provided image 5 must be a valid URL',
  }
}
