import fs from 'fs';
import csv from 'csv-parser';
import axios from 'axios';

interface CsvRow {
  Sentence: string;
  Label: string;
}

const csvFilePath = 'SQLi.csv';
const apiUrl = 'http://localhost:3500/api/v1/customers/login';

const batchSize = 10;

const rows: CsvRow[] = [];

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row: CsvRow) => {
    rows.push(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');

    processRowsInBatches(rows, batchSize);
  });


async function processRowsInBatches(rows: CsvRow[], batchSize: number) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(rows.length / batchSize)}`);

    const promises = batch.map((row) => {
      const requestBody = { statement: row.Sentence, label: row.Label };

      return axios.post(apiUrl, requestBody)
        .then((response) => {
          console.log(`Request successful for query: ${row.Sentence}`, response.data);
        })
        .catch((error) => {
          console.error(`Error making request for query: ${row.Sentence}`, error.message);
        });
    });

    await Promise.all(promises);

    console.log(`Batch ${i / batchSize + 1} completed`);
  }

  console.log('All batches processed');
}