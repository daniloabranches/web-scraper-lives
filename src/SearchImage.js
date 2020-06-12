const fs = require("fs");
const path = require("path");

const GoogleImages = require("google-images");
const AsyncForEach = require("./AsyncForEach");

class SearchImage {
  constructor(engineId, apiKey, downloadImage, imagesPath) {
    this.engineId = engineId;
    this.apiKey = apiKey;
    this.downloadImage = downloadImage;
    this.imagesPath = imagesPath;
    this.client = new GoogleImages(this.engineId, this.apiKey);
  }

  async search(query, fileName) {
    if (Array.isArray(query)) {
      await AsyncForEach.each(query, async (image) => {
        await this.search(image.name, image.fileName);
      });
      return;
    }

    const fileNamePath = path.resolve(this.imagesPath, fileName);
    if (fs.existsSync(fileNamePath)) {
      return;
    }

    console.log(".");

    const fileNameWithouExtension = this.getFileNameWithouExtension(fileName);
    const fileNameExtension = this.getFileNameExtension(fileName);

    let images = null;

    await this.client
      .search(query, {})
      .then((items) => {
        images = items;
      })
      .catch((err) => {
        console.log(`Erro ao buscar imagem (${query}): ${err.message}`);
      });

    if (images) {
      await this.downloadImages(
        images,
        fileNameWithouExtension,
        fileNameExtension
      );
    }
  }

  getFileNameWithouExtension(fileName) {
    return fileName.substr(0, fileName.lastIndexOf("."));
  }

  getFileNameExtension(fileName) {
    return fileName.substr(fileName.lastIndexOf("."));
  }

  async downloadImages(images, fileNameWithouExtension, fileNameExtension) {
    let imagesCount = 0;
    await AsyncForEach.each(images, async (image) => {
      if (image.type == "image/jpeg" && image.width > image.height) {
        imagesCount++;

        const suffix = imagesCount == 1 ? "" : `_${imagesCount}`;
        const finalFileName =
          fileNameWithouExtension + suffix + fileNameExtension;

        console.log(".");

        await this.downloadImage
          .download(finalFileName, image.url, true)
          .catch((err) => {
            console.log(`Erro ao baixar imagem (${image.url}): ${err.message}`);
          });

        if (imagesCount == 5) {
          return false;
        }
      }
    });
  }
}

module.exports = SearchImage;
