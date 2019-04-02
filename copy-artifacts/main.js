// Simon Edwards <simon@simonzone.com>
// https://github.com/sedwards2009/extraterm-devops
// License: MIT

const log = console.log.bind(console);

const dayjs = require("dayjs");
const fs = require("fs");
const path = require("path");
const {Storage} = require('@google-cloud/storage');

const ARTIFACT_PATH = "../../extraterm.artifacts";

async function main() {
  const storage = new Storage({
    projectId: "extraterm",
    keyFilename: "extraterm-e7f88c1ce73f.json"
  });
  const bucket = storage.bucket("extraterm_builds");

  const dirBase = dayjs().format("YYYY-MM-DD HH:mm:ss");

  for (const entry of fs.readdirSync(ARTIFACT_PATH)) {
    const destinationPath = dirBase + "/" + entry;
    log(`Uploading ${entry} to ${destinationPath}`);

    await bucket.upload(path.join(ARTIFACT_PATH, entry), {
      destination: destinationPath,
      resumable: false,
      validation: "crc32c",
    });
  }
  log("Done");
}

main();
