const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const AsyncForEach = require("./AsyncForEach");

class App {
  constructor(htmlItemClass, searchImage, tempPath, imagesTempPath) {
    this.url =
      "https://www.letras.mus.br/blog/lives-da-semana?t=" +
      new Date().getTime();
    this.htmlItemClass = htmlItemClass;
    this.searchImage = searchImage;
    this.tempPath = tempPath;
    this.imagesTempPath = imagesTempPath;
  }

  async execute() {
    console.log("Processo iniciado");

    fs.mkdirSync(this.imagesTempPath, { recursive: true });

    let htmlItems = null;

    await JSDOM.fromURL(this.url, {})
      .then((dom) => {
        htmlItems = dom.window.document.querySelectorAll(".news-copy li");
      })
      .catch((err) => {
        console.log(`Erro ao solicitar URL (${this.url}): ${err.message}`);
      });

    if (htmlItems) {
      await this.extractLives(htmlItems);

      await this.searchImages();
    }

    console.log("Processo finalizado");
  }

  async extractLives(htmlItems) {
    this.lives = [];

    await AsyncForEach.each(htmlItems, async (item) => {
      const live = new this.htmlItemClass(item, this.searchImage).getJSON();
      if (live) {
        this.lives.push(live);
      }
    });

    this.saveFile(this.lives);
  }

  async searchImages() {
    const images = this.lives.map((live) => {
      return {
        name: live.name,
        fileName: live.image_name,
      };
    });

    await this.searchImage.search(images);
  }

  saveFile(lives) {
    const jsonPath = path.resolve(this.tempPath, "build_schedule_lives.json");
    fs.writeFileSync(jsonPath, JSON.stringify(lives));
  }
}

module.exports = App;
