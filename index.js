require("dotenv").config();

const wordlist = require("wordlist-english");
const jsonfile = require("jsonfile");
const path = require("path");
const { searchArtist } = require("./spotify");
const isPlural = require("is-plural");
// const express = require("express");
// const app = express();
// const port = 3000;

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

const runner = (arr, cb, startingIndex = 0) => {
  return new Promise((resolve) => {
    const run = async (idx = 0) => {
      if (idx >= arr.length) {
        resolve();
        return;
      }
      await cb(arr[idx], idx);
      run(idx + 1);
    };

    run(startingIndex);
  });
};

// const startFrom = "blouse";
const startFrom = null;

(async () => {
  const noBands = {};
  // const wordPool = wordlist["english/35"];
  const wordPool = wordlist["english/35"];
  let lastLetter = null;

  let startingIndex = startFrom ? wordPool.indexOf(startFrom) : 0;

  if (startFrom) {
    const startFirstLetter = startFrom.slice(0, 1).toLowerCase();

    lastLetter = startFirstLetter;
    noBands[startFirstLetter] = [];

    if (
      wordPool[startingIndex - 1].slice(0, 1).toLowerCase() === startFirstLetter
    ) {
      console.log("middle of word");
      const bands = jsonfile.readFileSync(
        path.join(__dirname, "words", `${startFirstLetter}.json`)
      );
      noBands[startFirstLetter] = bands;
    }
  }

  await runner(
    wordPool,
    async (word, idx) => {
      const firstLetter = word.slice(0, 1).toLowerCase();

      if (firstLetter !== lastLetter) {
        noBands[firstLetter] = [];
        lastLetter = firstLetter;

        // if (lastLetter !== null) {
        //   jsonfile.writeFileSync(
        //     path.join(__dirname, `${lastLetter}.json`),
        //     noBands[lastLetter]
        //   );
        //   lastLetter = firstLetter;
        // }
      }

      if (word.length <= 2) {
        console.log(`Skipping ${word} because of word length`);
        return;
      }

      console.log(`Searching ${word} ${idx + 1}/${wordPool.length} -----`);
      const artists = await searchArtist(word);
      const find = artists.artists.items.filter((item) => {
        if (isPlural(word.toLowerCase())) {
          return (
            item.name.toLowerCase() === word.toLowerCase() ||
            item.name.toLowerCase() === `the ${word.toLowerCase()}`
          );
        } else {
          return item.name.toLowerCase() === word.toLowerCase();
        }
      });

      console.log(
        `${find.length} bands/artists!`,
        find.length ? "Damn..." : "COOL"
      );
      console.log("");

      if (find.length === 0) {
        noBands[firstLetter].push(word);
      }

      await jsonfile.writeFile(
        path.join(__dirname, "words", `${firstLetter}.json`),
        noBands[firstLetter]
      );
    },
    startingIndex
  );

  console.log(noBands);
})();
