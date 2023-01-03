const fs = require("fs");
const path = require("path");
const jsonfile = require("jsonfile");
const { writeToPath } = require("@fast-csv/format");
const isPlural = require("is-plural");

const saveOutput = (data, name = "names.csv") => {
  return new Promise((resolve) => {
    writeToPath(path.resolve(__dirname, name), data, { headers: true })
      .on("error", (err) => console.error(err))
      .on("finish", () => resolve());
  });
};

const wordFile = (file) => path.join(__dirname, "words", file);

const files = fs
  .readdirSync(wordFile(""))
  .flatMap((file) => {
    return jsonfile.readFileSync(wordFile(file));
  })
  .filter((word) => isPlural(word))
  .map((word) => ({
    word,
    link: `https://www.dictionary.com/browse/${word}`,
  }));

saveOutput(files, "plural-names.csv");
// saveJsonOutput(files);

jsonfile.writeFileSync(path.join(__dirname, "plurals.json"), files);
