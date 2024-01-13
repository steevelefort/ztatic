#!/usr/bin/env node

const { log } = require('console');
const fs = require('fs');

const path = require('path');
const { kill } = require('process');

console.log("Ztatic");

let distFolder = null;
let baseUrl = "";
let target = null;
let errors = false;

for (const arg of process.argv) {
  if (arg.indexOf("=") > -1) {
    const [key, value] = arg.split("=");
    switch (key) {
      case "--baseurl":
        baseUrl = value;
        break;
      case "--target":
        target = value;
        break;
      case "--distfolder":
        distFolder = value;
        break;
      default:
        console.log("Error: Unknown argument " + key);
        errors = true;
        break;
    }
  }
}

if (!distFolder || errors) {
  console.log("Ztatic creates a JavaScript file that lists the resources present in your distribution directory. This is particularly useful for caching these files from a service worker.")
  console.log("Syntax:");
  console.log("  ztatic --distFolder=[distFolderPath]")
  console.log("Options:");
  console.log(" --baseUrl=[siteRootFolder]");
  console.log(" --target=[pathToOutputFile]");
  process.exit(1);
}

if (!target) target = path.join(__dirname, distFolder, "static-resources.js");

function recurse(currentPath) {
  let list = "";
  const workingDirectory = path.join(__dirname, distFolder, currentPath);
  const files = fs.readdirSync(workingDirectory)

  for (const key in files) {
    const file = files[key];
    const current = path.join(__dirname, distFolder, currentPath, file);
    if (fs.statSync(current).isFile()) {
      // list += `${key > 0 ? "," : ""}"${baseUrl}${currentPath}/${file}"`;
      // list += `${key > 0 && currentPath.length == 0 ? "," : ""}\r\n\t"${baseUrl}${currentPath}/${file}"`;
      list += `${key == 0 && currentPath.length == 0 ? "" : ","}\r\n\t"${baseUrl}${currentPath}/${file}"`;
    } else {
      list += recurse(`${baseUrl}${currentPath}/${file}`)
    }
  }
  return list;
}

try {
  const list = recurse("")
  const sf = `const staticResources = [${list}\r\n];`;
  console.log(sf)
  fs.writeFileSync(target,sf,"utf8");
} catch (err) {
  console.log("Failed with message:", err.message);
}
