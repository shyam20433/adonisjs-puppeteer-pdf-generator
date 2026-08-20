import {
  schema,
  rules,
} from '@ioc:Adonis/Core/Validator'

export default class PageWiseImagePdfValidator {

  public schema = schema.create({

    name: schema.string([
      rules.trim(),
      rules.required(),
    ]),

    registerNumber: schema.string([
      rules.trim(),
      rules.required(),
    ]),

    course: schema.string([
      rules.trim(),
      rules.required(),
    ]),

    semester: schema.number([
      rules.required(),
      rules.unsigned(),
    ]),

    pages: schema.array([
      rules.required(),
      rules.minLength(1),
    ]).members(

      schema.object().members({

        page: schema.number([
          rules.required(),
          rules.unsigned(),
        ]),

        imageCount: schema.number([
          rules.required(),
          rules.unsigned(),
        ]),

        chart: schema.array.optional().members(

          schema.object().members({

            type: schema.enum([
              'pie',
              'bar',
            ] as const),

            data: schema.array([
              rules.required(),
            ]).members(

              schema.object().members({

                label: schema.string([
                  rules.required(),
                ]),

                value: schema.number([
                  rules.required(),
                ]),

              })

            ),

          })

        )

      })

    ),

  })
}
