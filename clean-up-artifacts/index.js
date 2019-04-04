// Simon Edwards <simon@simonzone.com>
// https://github.com/sedwards2009/extraterm-devops
// License: MIT

// Google Cloud Platform script to 
const {Storage} = require('@google-cloud/storage');

const SIGNAL_FILENAME = "request_clean";
const MAX_DIRS = 7;

const log = console.log.bind(console);

exports.cleanBuildArtifacts = (data, context, callback) => {
  gcpClean(context, data).then(() => {
    callback();
  });
};

async function gcpClean(context, triggerFile) {
  if (context.eventType === "google.storage.object.finalize" && triggerFile.name === SIGNAL_FILENAME) {
    log(`Received trigger file ${SIGNAL_FILENAME}. Starting clean up.`);
    const bucket = openBucket(null);
    await clean(bucket);
    await bucket.file(SIGNAL_FILENAME).delete();
    log("Completed clean up.");
  }
}

function openBucket(keyFilename) {
  const options  = keyFilename == null ? {} : {
    projectId: "extraterm",
    keyFilename
  };
  const storage = new Storage(options);
  return storage.bucket("extraterm_builds");
}

async function clean(bucket) {
  const [allFiles] = await bucket.getFiles();

  const dirNames = gatherDirectoryNames(allFiles);
  dirNames.reverse();
  if (dirNames.length > MAX_DIRS) {
    for (const dirName of dirNames.slice(MAX_DIRS)) {
      await deleteDirectory(dirName, allFiles);
    }
  }
}

function extractDateDirectoryName(filename) {
  const stampLength = "2019-04-03 18:00:48".length;
  if (filename.indexOf("/") === stampLength) {
    return filename.split("/")[0];
  }
  return null;
}

function gatherDirectoryNames(allFiles) {
  const result = new Set();

  for (const bucketFile of allFiles) {
    const dirName = extractDateDirectoryName(bucketFile.name);
    if (dirName != null) {
      result.add(dirName);
    }
  }
  return [...result].sort();
}

async function deleteDirectory(targetDirName, allFiles) {
  for (const bucketFile of allFiles) {
    const dirName = extractDateDirectoryName(bucketFile.name);
    if (targetDirName === dirName) {
      log(`Deleting file ${bucketFile.name}`);
      await bucketFile.delete();
    }
  }
}

function main() {
  const bucket = openBucket("extraterm-e7f88c1ce73f.json");
  clean(bucket).then(() => {
    log("Completed clean up.");
  });
}

// main();
