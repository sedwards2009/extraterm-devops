// Some code to show the contents of a Google Cloud Platform bucket as a directory list.
// Simon Edwards <simon@simonzone.com>
// License: MIT

interface BucketItem {
  directory: string;
  filename: string;
  url: string;
  size: number;
}

function main(): void {
  const url = window.location.href;
  const bucketListUrl = url.slice(0, -("index.html".length + window.location.search.length));
  // const bucketListUrl = "test_data.xml";

  fetch(bucketListUrl).then(
    response => {
      return response.text();
    }).then(bodyText => {

      const params = new URLSearchParams(document.location.search.substring(1));
      let path = params.get("p")
      if (path == null) {
        path = "";
      }

      document.getElementById("contents").innerHTML = bucketXML2HTML(bodyText, path);
    }
  );
}

function keyCmp<T>(key: keyof T): (a: T, b: T) => number {
  return (a: T, b: T): number => {
    const keyA = a[key];
    const keyB = b[key];
    if (keyA === keyB) {
      return 0;
    }
    return keyA < keyB ? -1 : 1;
  };
}

function bucketXML2HTML(xmlString: string, path: string): string {
  const xmlDoc = (new DOMParser()).parseFromString(xmlString, "application/xml");
  
  const itemList = parseListBucketResult(xmlDoc);

  const shownItemList = itemList.filter(item => path === "" || item.directory === path || item.directory.startsWith(path + "/"));

  const rawDirs = shownItemList.filter(item => item.directory !== path).map(item => item.directory)
  const dirList = [...new Set(rawDirs)];
  dirList.sort();

  let fileItemList = itemList.filter(item => item.directory === path);
  fileItemList.sort(keyCmp<BucketItem>("filename"));
  if (path === "") {
    fileItemList = [];
  }

  const parentLink = path !== "" ? `<tr><td><a href='index.html?p='>../</a></td></tr>\n` : "";
  const dirContentsHtml = dirList.map(dirname => `<tr><td><a href='index.html?p=${encodeURI(dirname)}'>${dirname}/</a></td></tr>\n`).join("");
  const fileContentsHtml = fileItemList.map(item => `<tr><td><a href='${item.url}' download>${item.filename}</a></td><td>${formatDataSize(item.size)}</td></tr>\n`).join("");

  return `<h2>Directory Contents: ${path}</h2>
  <table>
    ${parentLink}
    ${dirContentsHtml}
    ${fileContentsHtml}
  </table>`;
}

function parseListBucketResult(listNode: Node): BucketItem[] {
  const result: BucketItem[] = [];

  for (const node of listNode.childNodes) {
    for (const item of node.childNodes) {
      if (item.nodeName === "Contents") {
        const content = parseContentsNode(item);
        if (content != null) {
          result.push(content);
        }
      }
    }
  }
  return result;
}

function parseContentsNode(item: Node): BucketItem {
  let key: string = null;
  let size = -1;

  for (const property of item.childNodes) {
    if (property.nodeName === "Key") {
      key = property.textContent;
    } else if (property.nodeName === "Size") {
      size = parseInt(property.textContent, 10);
    }
  }

  if (key != null) {
    const parts = key.split("/");
    if (parts.length === 1) {
      return {
        directory: "",
        filename: key,
        url: key,
        size
      };
    } else {
      return {
        directory: parts.slice(0, -1).join("/"),
        filename: parts[parts.length-1],
        url: key,
        size
      };
    }
  }
  return null;
}

function formatDataSize(size: number): string {
  const ONE_MEG = 1024*1024;
  const ONE_KAY = 1024;

  if (size > ONE_MEG) {
    const s = Math.round(size / ONE_MEG);
    return `${s} MiB`;
  }

  if (size > ONE_KAY) {
    const s = Math.round(size / ONE_KAY);
    return `${s} KiB`;
  }

  return `${size} b`;
}
