const express = require('express')
const { Storage } = require('@google-cloud/storage')
const { port, bucketName } = require('./config.json')
const app = express()
const storage = new Storage({keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS})
const bucket = storage.bucket(bucketName)


app.get('/', function (req, res) {
  res.send('Welcome Home!')
})

app.route('/api/files')
  .get(async function (req, res) {
    const [file_objs] = await bucket.getFiles()
    var file_names = []
    file_objs.forEach(file => {
      file_names.push(file.name)
    })
    res.send({file_names})
  })

app.route('/api/files/:filename')
  .get(async function (req, res) {
    var file = bucket.file(req.params.filename)
    file.createReadStream()
    .on('error', (err) => {
      res.status(404).end()
    })
    .pipe(res)
  })
  .post(async function (req, res) {
    var filename = req.params.filename
    // TODO: send file to storage
  })

app.listen(port, () => {
  console.log(`App running on port: ${port}`)
})


