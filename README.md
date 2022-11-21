# ehive consent sources

## About consentIds

- Each consentId has the structure `hpims-<name>` or `ehive-<name>` and the consent contents have to be put in a
  directory in this repository called `<name>`.
- ConsentIds are not designed to be renamed since they are already identified by this in the database.
- `hpims` / `ehive` are static prefixes that can not be changed and configured in the deployment directory and consent
  service.

## PDF Coordinates

When a new PDF needs to be added, we need to calculate the coordinates of the various checkboxes and inputs to insert
text at. To do this, go to the [apache pdfbox releases](https://pdfbox.apache.org/download.cgi) and download the latest
feature version of the pdfbox-app (pdfbox-app-<VERSION>.jar). Then, load the consent PDF with the following command:

```shell script
java -jar <path/to/pdfbox-app-<VERSION>.jar> PDFDebugger <path/to/consent.pdf>
```

You can then page through the PDF and hover over spots to find out the coordinates. They are displayed on the bottom
left.

Notice that pdf page numbers are 0-indexed.
