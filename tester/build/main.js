"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const csvFilePath = 'SQLiV3.csv';
const apiUrl = 'http://localhost:3500/api/v1/customers/login';
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
async function makeRequests(rows) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('Request failed:', error);
        }
    }
    catch (error) {
        console.error('Error processing CSV file:', error);
    }
}
main();
//# sourceMappingURL=main.js.map