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
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function readMatrixFromFile(filePath) {
    const rawContent = fs.readFileSync(filePath, "utf-8").trim();
    if (!rawContent) {
        throw new Error("Файл пуст.");
    }
    const lines = rawContent
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    const [rowsStr, colsStr] = lines[0].split(/\s+/);
    const rows = Number(rowsStr);
    const cols = Number(colsStr);
    if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows <= 0 || cols <= 0) {
        throw new Error("Некорректные размеры матрицы.");
    }
    const matrix = [];
    for (let i = 0; i < rows; i += 1) {
        const row = lines[i + 1]?.split(/\s+/).map(Number) ?? [];
        if (row.length !== cols || row.some((value) => !Number.isInteger(value))) {
            throw new Error(`Некорректная строка матрицы №${i + 1}.`);
        }
        matrix.push(row);
    }
    return matrix;
}
function renderMatrix(matrix, title, active, gap, step) {
    console.clear();
    console.log(title);
    console.log(`Шаг: ${step} | Текущий gap: ${gap}`);
    console.log("");
    for (let row = 0; row < matrix.length; row += 1) {
        const rowParts = [];
        for (let col = 0; col < matrix[row].length; col += 1) {
            const value = matrix[row][col].toString().padStart(4, " ");
            const isDiagonal = row === col;
            const isCompared = active !== null && isDiagonal && (row === active[0] || row === active[1]);
            if (isCompared) {
                rowParts.push(`[${value}]`);
            }
            else if (isDiagonal) {
                rowParts.push(` ${value}* `);
            }
            else {
                rowParts.push(` ${value}  `);
            }
        }
        console.log(rowParts.join(" "));
    }
    console.log("");
    console.log("* - элемент главной диагонали, [ ] - сравниваемые элементы");
}
async function animateCombSortMainDiagonal(matrix, delayMs) {
    const diagonalLength = Math.min(matrix.length, matrix[0].length);
    if (diagonalLength <= 1) {
        renderMatrix(matrix, "Анимация сортировки диагонали (расчёска)", null, 1, 0);
        return;
    }
    const shrinkFactor = 1.247;
    let gap = diagonalLength;
    let swapped = true;
    let step = 0;
    renderMatrix(matrix, "Анимация сортировки диагонали (расчёска)", null, gap, step);
    await sleep(delayMs);
    while (gap > 1 || swapped) {
        gap = Math.floor(gap / shrinkFactor);
        if (gap < 1) {
            gap = 1;
        }
        swapped = false;
        for (let i = 0; i + gap < diagonalLength; i += 1) {
            const j = i + gap;
            step += 1;
            renderMatrix(matrix, "Анимация сортировки диагонали (расчёска)", [i, j], gap, step);
            await sleep(delayMs);
            if (matrix[i][i] > matrix[j][j]) {
                [matrix[i][i], matrix[j][j]] = [matrix[j][j], matrix[i][i]];
                swapped = true;
                renderMatrix(matrix, "Анимация сортировки диагонали (расчёска)", [i, j], gap, step);
                await sleep(delayMs);
            }
        }
    }
    renderMatrix(matrix, "Анимация завершена", null, gap, step);
}
async function main() {
    const inputPath = process.argv[2] ?? "input.txt";
    const delayArg = process.argv[3];
    const delayMs = Number(delayArg ?? "500");
    const absolutePath = path.resolve(inputPath);
    if (!Number.isFinite(delayMs) || delayMs < 0) {
        console.error("Ошибка: задержка должна быть неотрицательным числом (мс).");
        process.exit(1);
    }
    try {
        const matrix = readMatrixFromFile(absolutePath);
        await animateCombSortMainDiagonal(matrix, delayMs);
    }
    catch (error) {
        console.error("Ошибка:", error.message);
        process.exit(1);
    }
}
main();
