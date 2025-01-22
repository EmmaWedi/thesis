import fs from 'fs';
import csv from 'csv-parser';
import axios from 'axios';

interface CsvRow {
    Sentence: string;
}

const csvFilePath = 'SQLiV3.csv';
const apiUrl = 'http://localhost:3500/api/v1/customers/login';

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

async function makeRequests(rows: CsvRow[]) {
    rows.forEach(async (row) => {

        const requestBody = {
            username: 'dataset',
            password: row.Sentence,
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                mode: 'cors',
                credentials: 'include',
            });
            const result = await response.text();
            console.log('Request successful:', result);
        } catch (error) {
            console.error('Request failed:', error);
        }
    });
}

async function main() {
    try {
        const rows = await readCsvFile(csvFilePath);

        console.log('CSV file successfully processed');

        // if (rows.length > 0) {
        //     await makeRequests(rows);
        // }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'dataset', password: "SELECT * FROM request" }),
                mode: 'cors',
                credentials: 'include',
            });
            const result = await response.text();
            console.log('Request successful:', result);
        } catch (error) {
            console.error('Request failed:', error);
        }
    } catch (error) {
        console.error('Error processing CSV file:', error);
    }
}

main();