const fs = require('fs')
const express = require('express')
const fileUpload = require('express-fileupload');
const cors = require('cors')
const { Storage } = require('@google-cloud/storage')
const { port, bucketName } = require('./config.json')
const app = express()
//const storage = new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS })
const storage = new Storage({ keyFilename: "../dodge-a-wrench-eac61bf90783.json" })
const bucket = storage.bucket(bucketName)

app.use(cors()) // it enables all cors requests
app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/tmp/'
}))

app.get('/', (req, res) => {
  res.send('Welcome Home!')
})

app.route('/api/files')
  .get(async (req, res) => {
    const [file_objs] = await bucket.getFiles()
    var file_names = []
    file_objs.forEach(file => {
      file_names.push(file.name)
    })
    res.send({ file_names })
  })

app.route('/api/files/:filename')
  .get(async (req, res) => {
    var file = bucket.file(req.params.filename)
    file.createReadStream()
      .on('error', (err) => {
        res.status(404).end()
      })
      .pipe(res)
  })
  .post(async (req, res) => {
    var file = bucket.file(req.files.file.name)
    if (!req.files) {
      return res.status(500).send({ msg: "file is not found" })
    }
    fs.createReadStream(req.files.file.tempFilePath)
      .pipe(file.createWriteStream())
    res.status(200).end()
  })

app.listen(port, () => {
  console.log(`App running on port: ${port}`)
})


