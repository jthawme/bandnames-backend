const SpotifyWebApi = require("spotify-web-api-node");
const credentials = require("./credentials.json");

let credentialsIndex = 0;

// Create the api object with the credentials
let spotifyApi = new SpotifyWebApi(credentials[credentialsIndex]);

const timer = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const getToken = () => {
  return spotifyApi.clientCredentialsGrant().then((data) => {
    spotifyApi.setAccessToken(data.body["access_token"]);

    return data.body["access_token"];
  });
};

const searchArtist = async (name) => {
  try {
    const data = await Promise.race([
      spotifyApi
        .searchArtists(`"${name}"`, {
          limit: 50,
        })
        .then((data) => {
          return data.body;
        }),
      timer(5000).then(() => true),
    ]);

    if (typeof data === "boolean") {
      console.log("Break Timer went off", name);
      return searchArtist(name);
    }

    return data;
  } catch (e) {
    console.log("dealing with error", e.statusCode);

    if (e.statusCode === 401) {
      await getToken();
      return searchArtist(name);
    }

    if (e.statusCode === 429) {
      if (credentialsIndex < credentials.length - 1) {
        credentialsIndex++;
        spotifyApi = new SpotifyWebApi(credentials[credentialsIndex]);
        return searchArtist(name);
      }

      console.log(`Retrying in ${parseInt(e.headers["retry-after"])}...`);
      await timer(parseInt(e.headers["retry-after"]) * 1000 || 5000);
      return searchArtist(name);
    }
    console.log(e);
  }
};

module.exports = { getToken, searchArtist };
