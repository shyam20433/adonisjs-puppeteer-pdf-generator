import Route from '@ioc:Adonis/Core/Route'
Route.get(
  '/generate-pdf',
  'PdfController.generate'
)
Route.get(
  '/download-pdf',
  'PdfController.download'
)
