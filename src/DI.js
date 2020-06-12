const path = require("path");
const Clipper = require("image-clipper");
const Canvas = require("canvas");

const SearchImage = require("./SearchImage");
const DownloadImage = require("./DownloadImage");
const ResizeImage = require("./ResizeImage");

class DI {
  constructor(config) {
    this.rootPath = config.rootPath;
    this.searchImageEngineId = config.engineId;
    this.searchImageApiKey = config.apiKey;
  }

  searchImage() {
    const clipper = Clipper();
    clipper.injectNodeCanvas(Canvas);

    const resizeImage = new ResizeImage(clipper);

    const downloadImage = new DownloadImage(resizeImage, this.imagesTempPath());

    const imagesPath = path.resolve(
      this.rootPath,
      "hosting",
      "public",
      "images"
    );

    return new SearchImage(
      this.searchImageEngineId,
      this.searchImageApiKey,
      downloadImage,
      imagesPath
    );
  }

  tempPath() {
    return path.resolve(this.rootPath, "temp");
  }

  imagesTempPath() {
    return path.resolve(this.tempPath(), "images");
  }
}

module.exports = DI;
