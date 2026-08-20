import Route from '@ioc:Adonis/Core/Route'
Route.get('/student-data', 'PdfController.generate')
Route.get(
  '/download-student-details',
  'PdfController.downloadStudentDetails'
)

//pagewise

Route.post(
  '/puppeteer/page-wise-images',
  'PageWiseImagePdfController.generate'
)




Route.get(
  '/puppeteer-lab',
  'PuppeteerLabController.run'
)

Route.post(
  '/puppeteer-lab',
  'PuppeteerLabController.run'
)

Route.get(
  '/geolocation-test',
  async ({ response }) => {

    return response
      .type('html')
      .send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Geolocation Test</title>
        </head>

        <body>

          <h1>Geolocation Test</h1>

          <button id="location">
            Get Location
          </button>

          <p id="result">
            Waiting...
          </p>

          <script>

            document
              .getElementById('location')
              .addEventListener('click', () => {

                navigator.geolocation.getCurrentPosition(

                  position => {

                    document.getElementById(
                      'result'
                    ).innerText =
                      'Latitude: ' +
                      position.coords.latitude +
                      ', Longitude: ' +
                      position.coords.longitude

                  },

                  error => {

                    document.getElementById(
                      'result'
                    ).innerText =
                      'Error: ' +
                      error.message

                  }

                )

              })

          </script>

        </body>
        </html>
      `)
  }
)
