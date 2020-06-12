const moment = require("moment");

class HtmlItem {
  constructor(htmlItem, searchImage) {
    this.htmlItem = htmlItem;
    this.searchImage = searchImage;
  }

  getJSON() {
    if (this.htmlItem && this.htmlItem.textContent) {
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
    if (this.validateName(this.htmlItem.textContent)) {
      let name = this.replaceLinkNames(this.htmlItem.textContent);

      let nameAndHour = name.split("–");
      if (nameAndHour.length > 0) {
        return nameAndHour[0].trim();
      }
    }

    return null;
  }

  validateName(name) {
    const invalidNames = [
      "Lives dessa semana",
      "Lives da semana que vem",
      "Lives nacionais que já passaram",
      "Lives internacionais que já passaram",
    ];

    const found = invalidNames.find((item) => name.includes(item));

    return !found;
  }

  replaceLinkNames(text) {
    return text
      .replace("(YouTube)", "")
      .replace("(Rede Globo)", "")
      .replace("(Instagram)", "")
      .replace("(TikTok)", "")
      .replace("(Facebook)", "")
      .replace("(Twich)", "")
      .replace("(Canal Multishow)", "")
      .replace("(Cultura Em Casa)", "")
      .replace("(Ingresse.com)", "")
      .trim();
  }

  replaceSpecialChars(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/([^\w]+|\s+)/g, "_");
  }

  hasTime() {
    const nameAndHour = this.htmlItem.textContent.split("–");
    if (nameAndHour.length > 1) {
      return nameAndHour[1].includes("h");
    }
    return false;
  }

  extractHour() {
    if (this.hasTime()) {
      let hour = this.replaceLinkNames(this.htmlItem.textContent);
      const nameAndHour = hour.split("–");
      hour = nameAndHour[1].trim().split("h");
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
      const text = this.htmlItem.parentNode.previousElementSibling.textContent;

      if (text.includes("hoje")) {
        return moment().format("DD/MM/YYYY");
      }

      return (
        text
          .replace("Lives do dia", "")
          .replace("(domingo)", "")
          .replace("(segunda-feira)", "")
          .replace("(terça-feira)", "")
          .replace("(quarta-feira)", "")
          .replace("(quinta-feira)", "")
          .replace("(sexta-feira)", "")
          .replace("(sábado)", "")
          .trim() + "/2020"
      );
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
