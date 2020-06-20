const fs = require("fs");
const path = require("path");
const axios = require("axios");

class DownloadImage {
  constructor(resizeImage, imagePath) {
    this.imagePath = imagePath;
    this.resizeImage = resizeImage;
  }

  async download(fileName, url, resize) {
    const tempFilePath = this.getTempFilePath(fileName, resize);
    try {
      const filePath = this.getFilePath(fileName);

      const writer = fs.createWriteStream(tempFilePath);

      await this.request(url, writer);

      const writerPromise = new Promise((resolve, reject) => {
        const me = this;
        writer.on("finish", function () {
          if (resize) {
            me.resizeImage.execute(tempFilePath, filePath);
          }
          resolve();
        });
        writer.on("error", reject);
      });

      await writerPromise;
    } catch (error) {
      fs.unlinkSync(tempFilePath);
      throw error;
    }
  }

  getTempFilePath(fileName, resize) {
    return path.resolve(this.imagePath, (resize ? "TMP_" : "") + fileName);
  }

  getFilePath(fileName) {
    return path.resolve(this.imagePath, fileName);
  }

  async request(url, writer) {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(writer);
  }
}

module.exports = DownloadImage;
