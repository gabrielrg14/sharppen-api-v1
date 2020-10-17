const bodyParser = require('body-parser')
const cors = require('cors')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "../frontend/src/assets/uploads/" + req.params.folder)
    },
    filename: function(req, file, cb) {
        cb(null, req.params.folder + req.params.id + "_" + Date.now() + path.extname(file.originalname))
    }
})

module.exports = app => {
    app.use(bodyParser.json())
    app.use(cors())
    app.upload = multer({ storage })
}