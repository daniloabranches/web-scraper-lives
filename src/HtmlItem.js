const moment = require("moment");

const { invalidNames, textsToRemove, wrongTexts } = require("./UserTexts");

class HtmlItem {
  constructor(htmlItem, searchImage) {
    this.htmlItem = htmlItem;
    this.searchImage = searchImage;
    this.sepNameAndHour = "–";
  }

  getJSON() {
    if (this.htmlItem && this.htmlItem.textContent) {
      this.textContent = this.correctText(this.htmlItem.textContent);

      this.name = this.extractName();
      if (this.name) {
        const imageName = this.replaceSpecialChars(this.name) + ".jpg";
        const date = this.extractDateTime();
        const link = this.extractLink();

        return {
          name: this.name,
          image_name: imageName,
          date,
          link,
          no_set_time: !this.hasTime(),
        };
      }
    }

    return null;
  }

  extractName() {
    if (this.validateName(this.textContent)) {
      let nameAndHour = this.textContent.split(this.sepNameAndHour);
      if (nameAndHour.length > 0) {
        return nameAndHour[0].trim();
      }
    }

    return null;
  }

  validateName(name) {
    return !invalidNames.find((item) => name.includes(item));
  }

  correctText(text) {
    text = this.correctWrongTexts(text);
    text = this.removeTexts(text);
    text = this.removeDuplicateSep(text);
    return text;
  }

  correctWrongTexts(text) {
    wrongTexts.forEach((item) => {
      text = text.replace(item[0], item[1]);
    });
    return text.trim();
  }

  removeTexts(text) {
    textsToRemove.forEach((item) => {
      text = text.replace(item, "");
    });
    return text.trim();
  }

  removeDuplicateSep(text) {
    const nameAndHour = text.split(this.sepNameAndHour);
    if (nameAndHour.length > 2) {
      const hour = nameAndHour.pop();
      const name = nameAndHour.join("-");
      text = `${name} ${this.sepNameAndHour} ${hour}`;
    }
    return text;
  }

  replaceSpecialChars(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/([^\w]+|\s+)/g, "_");
  }

  hasTime() {
    const nameAndHour = this.textContent.split(this.sepNameAndHour);
    if (nameAndHour.length > 1) {
      return nameAndHour[1].includes("h");
    }
    return false;
  }

  extractHour() {
    if (this.hasTime()) {
      const nameAndHour = this.textContent.split(this.sepNameAndHour);
      const hour = nameAndHour[1].trim().split("h");
      return `${hour[0]}:${hour[1] == "" ? "00" : hour[1]}:00`;
    }
    return "00:00:00";
  }

  extractDate() {
    if (
      this.htmlItem.parentNode &&
      this.htmlItem.parentNode.previousElementSibling &&
      this.htmlItem.parentNode.previousElementSibling.textContent
    ) {
      const text = this.correctText(
        this.htmlItem.parentNode.previousElementSibling.textContent
      );

      if (text.includes("hoje")) {
        return moment().format("DD/MM/YYYY");
      }

      return text + "/2020";
    }

    console.log(`Live ${this.name} com data incorreta`);

    return null;
  }

  extractDateTime() {
    const hour = this.extractHour();
    const date = this.extractDate();

    const dateTime = `${date} ${hour}`;

    if (
      !moment(dateTime, "DD/MM/YYYY HH:mm:ss").isValid() ||
      dateTime.includes("(") ||
      dateTime.includes(")")
    ) {
      console.log(`Live ${this.name} com data/hora inválida`);
    }

    return dateTime;
  }

  extractLink() {
    const elementsTaga = this.htmlItem.getElementsByTagName("a");
    let link = "";

    if (elementsTaga && elementsTaga.length > 0) {
      link = elementsTaga[0].href;
    }

    return link;
  }
}

module.exports = HtmlItem;
