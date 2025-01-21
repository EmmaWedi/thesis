import fs from 'fs';
import csv from 'csv-parser';
import axios from 'axios';

interface CsvRow {
    Sentence: string;
    // Add other columns if needed
}

const csvFilePath = 'SQLiV3.csv';
const apiUrl = 'http://localhost:3500/api/v1/customers/test/';

const rows: CsvRow[] = [];

// Function to read and parse the CSV file
function readCsvFile(filePath: string): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
        const results: CsvRow[] = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row: CsvRow) => {
                results.push(row);
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Function to make axios requests
async function makeRequests(rows: CsvRow[]) {
    const headers = {
        'Content-Type': 'application/json',
    };

    const options = {
        headers
    };

    rows.forEach(async (row) => {
        const requestBody = { payload: row.Sentence };

        // axios.post(
        //     apiUrl,
        //     { ...requestBody },
        //     options
        // ).then(
        //     (res) => console.log(`Request successful for query: ${row.Sentence}`, res.data)
        // ).catch(
        //     (err) => console.error(`Error making request for query: ${row.Sentence}`, err.message)
        // );

        try {
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
            });
            const result = await response.text();
            console.log('Request successful:', result);
          } catch (error) {
            console.error('Request failed:', error);
          }
    });
}

// Main function to read the CSV file and make requests
async function main() {
    try {
        const rows = await readCsvFile(csvFilePath);
        console.log('CSV file successfully processed');
        
        if (rows.length > 0) {
            await makeRequests(rows);
        }
        // await makeRequests(rows);
    } catch (error) {
        console.error('Error processing CSV file:', error);
    }
}

// Run the main function
main();