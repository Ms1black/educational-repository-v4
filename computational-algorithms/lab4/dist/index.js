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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function readMatrixFromFile(filePath) {
    const rawContent = fs.readFileSync(filePath, "utf-8").trim();
    if (!rawContent) {
        throw new Error("Файл пуст.");
    }
    const lines = rawContent
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    if (lines.length < 1) {
        throw new Error("Невозможно прочитать размеры матрицы.");
    }
    const [rowsStr, colsStr] = lines[0].split(/\s+/);
    const rows = Number(rowsStr);
    const cols = Number(colsStr);
    if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows <= 0 || cols <= 0) {
        throw new Error("Некорректные размеры матрицы в первой строке.");
    }
    if (lines.length - 1 < rows) {
        throw new Error(`Ожидалось ${rows} строк с элементами матрицы, получено ${lines.length - 1}.`);
    }
    const matrix = [];
    for (let i = 0; i < rows; i += 1) {
        const values = lines[i + 1].split(/\s+/).map(Number);
        if (values.length !== cols || values.some((value) => !Number.isInteger(value))) {
            throw new Error(`Некорректная строка матрицы №${i + 1}.`);
        }
        matrix.push(values);
    }
    return matrix;
}
function sortMainDiagonalComb(matrix) {
    const diagonalLength = Math.min(matrix.length, matrix[0].length);
    if (diagonalLength <= 1) {
        return matrix;
    }
    const diagonal = [];
    for (let i = 0; i < diagonalLength; i += 1) {
        diagonal.push(matrix[i][i]);
    }
    const shrinkFactor = 1.247;
    let gap = diagonalLength;
    let swapped = true;
    while (gap > 1 || swapped) {
        gap = Math.floor(gap / shrinkFactor);
        if (gap < 1) {
            gap = 1;
        }
        swapped = false;
        for (let i = 0; i + gap < diagonalLength; i += 1) {
            const j = i + gap;
            if (diagonal[i] > diagonal[j]) {
                [diagonal[i], diagonal[j]] = [diagonal[j], diagonal[i]];
                swapped = true;
            }
        }
    }
    for (let i = 0; i < diagonalLength; i += 1) {
        matrix[i][i] = diagonal[i];
    }
    return matrix;
}
function printMatrix(matrix, title) {
    console.log(title);
    for (const row of matrix) {
        console.log(row.join(" "));
    }
    console.log("");
}
function main() {
    const inputPath = process.argv[2] ?? "input.txt";
    const absolutePath = path.resolve(inputPath);
    try {
        const matrix = readMatrixFromFile(absolutePath);
        printMatrix(matrix, "Исходная матрица:");
        const sorted = sortMainDiagonalComb(matrix);
        printMatrix(sorted, "Матрица после сортировки главной диагонали (расчёска):");
    }
    catch (error) {
        console.error("Ошибка:", error.message);
        process.exit(1);
    }
}
main();
