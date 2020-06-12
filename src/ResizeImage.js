const fs = require("fs");

class ResizeImage {
  constructor(clipper) {
    this.clipper = clipper;
  }

  execute(tempFilePath, filePath) {
    try {
      this.clipper.image(tempFilePath, function () {
        this.resize(300)
          .quality(80)
          .toFile(filePath, function () {
            fs.unlinkSync(tempFilePath);
          });
      });
    } catch (error) {}
  }
}

module.exports = ResizeImage;
