import Route from '@ioc:Adonis/Core/Route'
Route.get('/student-data', 'PdfController.generate')
Route.get(
  '/download-student-details',
  'PdfController.downloadStudentDetails'
)
