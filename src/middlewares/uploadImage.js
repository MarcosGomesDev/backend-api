const multer = require('multer')

module.exports = (multer({
    storage: multer.diskStorage({}),
    fileFilter: (_, file, callback) => {
        if(file.mimetype.startsWith('image')) {
            callback(null, true)
        } else {
            callback(null, false)
        }
    }
}))