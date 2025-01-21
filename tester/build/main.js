"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const csvFilePath = 'SQLiV3.csv';
const apiUrl = 'http://localhost:3500/api/v1/customers/test/';
const rows = [];
// Function to read and parse the CSV file
function readCsvFile(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on('data', (row) => {
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
async function makeRequests(rows) {
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
        }
        catch (error) {
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
    }
    catch (error) {
        console.error('Error processing CSV file:', error);
    }
}
// Run the main function
main();
//# sourceMappingURL=main.js.map