const App = require("./src/App");
const DI = require("./src/DI");
const HtmlItem = require("./src/HtmlItem");

const config = require("./config.json");

const di = new DI(config);

const app = new App(
  HtmlItem,
  di.searchImage(),
  di.tempPath(),
  di.imagesTempPath()
);

app.execute();