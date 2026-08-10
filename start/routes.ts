import Route from '@ioc:Adonis/Core/Route'

Route.post('/generate-pdf', 'PdfController.generate')
Route.get('/generate-pdf', 'PdfController.generate')
