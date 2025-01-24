"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const axios_1 = __importDefault(require("axios"));
const csvFilePath = 'SQLi.csv';
const apiUrl = 'http://localhost:3500/api/v1/customers/login';
const batchSize = 10;
const rows = [];
fs_1.default.createReadStream(csvFilePath)
    .pipe((0, csv_parser_1.default)())
    .on('data', (row) => {
    rows.push(row);
})
    .on('end', () => {
    console.log('CSV file successfully processed');
    processRowsInBatches(rows, batchSize);
});
async function processRowsInBatches(rows, batchSize) {
    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(rows.length / batchSize)}`);
        const promises = batch.map((row) => {
            const requestBody = { statement: row.Sentence, label: row.Label };
            console.log(requestBody);
            return axios_1.default.post(apiUrl, requestBody)
                .then((response) => {
                console.log(`Request successful for query: ${row.Sentence}`, response.data);
                console.log(response.data);
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
//# sourceMappingURL=main.js.map