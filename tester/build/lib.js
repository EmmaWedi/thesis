"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const axios_1 = __importDefault(require("axios"));
const csvFilePath = 'data.csv';
const apiUrl = 'https://example.com/api/endpoint';
const batchSize = 10;
const rows = [];
fs.createReadStream(csvFilePath)
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
            const requestBody = { payload: row.Sentence };
            return axios_1.default.post(apiUrl, requestBody)
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
//# sourceMappingURL=lib.js.map