// Simon Edwards <simon@simonzone.com>
// https://github.com/sedwards2009/extraterm-devops
// License: MIT

const log = console.log.bind(console);

const fs = require("fs");

// const storage = require("@google-cloud/storage")({
//   projectId: "extraterm",
//   keyFilename: "extraterm-e7f88c1ce73f.json"
// });

// const bucket = storage.bucket("extraterm_builds");


for (const entry of fs.readdirSync("../../extraterm.artifacts")) {
  log(entry);
}
