const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const JSZip = require("jszip");

async function processConsents(distPath) {
  const configDirectory = path.join(__dirname, "configuration");
  const consents = await fs.promises.readdir(configDirectory);

  for (const consent of consents) {
    // Skip .DS_Store files
    if (consent === ".DS_Store") {
      continue;
    }

    const consentPath = path.join(configDirectory, consent);

    await fs.promises.copyFile(
      path.join(consentPath, "consent.pdf"),
      path.join(distPath, `${consent}.unsigned.pdf`)
    );

    const configData = await fs.promises.readFile(
      path.join(consentPath, "config.yaml"),
      { encoding: "utf-8" }
    );

    const signingConfig = transformSigningConfig(YAML.parse(configData));
    await fs.promises.writeFile(
      path.join(distPath, `${consent}.config.json`),
      JSON.stringify(signingConfig)
    );
  }
}

function transformSigningConfig(data) {
  const { consent, signing, options } = data;
  const key = consent.id.replace(/ehive-|hpims-/, "");
  const { width: optWidth, height: optHeight } = options || {};

  const signatureFields = [];

  const ret = {
    legacy: true,
    key,
    studyKey: key,
    options: (options?.inputs || []).map((input, i) => ({
      type: "yesno",
      key: `key-${i + 1}`,
      page: input.page,
      boxes: {
        yes: {
          x: input.yes.x,
          y: input.yes.y,
          width: optWidth,
          height: optHeight,
        },
        no: {
          x: input.no.x,
          y: input.no.y,
          width: optWidth,
          height: optHeight,
        },
      },
    })),
    signatures: [
      {
        type: "participant",
        fields: signatureFields,
      },
    ],
  };

  const signingFieldHeight = 30; // arbitrary value
  const signingFieldWidth = 160;

  if (signing.name) {
    signatureFields.push({
      field: "signature",
      page: signing.name.page,
      box: {
        x: signing.name.x,
        y: signing.name.y,
        width: signing.name.maxWidth || signingFieldWidth,
        height: signingFieldHeight,
      },
    });
  }

  if (signing.date) {
    signatureFields.push({
      field: "date",
      format: signing.date.format,
      page: signing.date.page,
      box: {
        x: signing.date.x,
        y: signing.date.y,
        width: signing.name.maxWidth || signingFieldWidth,
        height: signingFieldHeight,
      },
    });
  }

  if (signing.name) {
    signatureFields.push({
      field: "name",
      page: signing.name.page,
      box: {
        x: signing.name.x,
        y: signing.name.y,
        width: signing.name.maxWidth || signingFieldWidth,
        height: signingFieldHeight,
      },
    });
  }

  return ret;
}

(async function build() {
  const distPath = path.join(__dirname, "dist/signing-configuration");

  if (!fs.existsSync(distPath)) {
    await fs.promises.mkdir(distPath, { recursive: true });
  }
  await cleandir(distPath);

  await processConsents(distPath);

  // Create deployment zip
  const zip = new JSZip();
  const zipFolder = zip.folder("signing-configuration");

  // Add the folder contents to the zip
  await addFolderToZip(zip, distPath, zipFolder);

  // Generate the zip file and save it
  const zipContent = await zip.generateAsync({ type: "nodebuffer" });
  await fs.promises.writeFile(
    path.join(__dirname, "dist/signing-configuration.zip"),
    zipContent
  );
})();

async function cleandir(dir) {
  fs.statSync(dir);
  const items = fs.readdirSync(dir);
  await Promise.all(
    items.map((item) =>
      fs.promises.rm(path.join(dir, item), { recursive: true, force: true })
    )
  );
}

async function addFolderToZip(zip, folderPath, zipFolder) {
  const files = await fs.promises.readdir(folderPath);

  for (const fileName of files) {
    const filePath = path.join(folderPath, fileName);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      // Create a folder in the zip
      const newFolder = zipFolder.folder(fileName);
      // Recursively add subfolders and files
      await addFolderToZip(zip, filePath, newFolder);
    } else {
      // Read the file content and add it to the zip
      const fileData = await fs.promises.readFile(filePath);
      zipFolder.file(fileName, fileData);
    }
  }
}
