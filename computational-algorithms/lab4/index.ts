import * as fs from "fs";
import * as path from "path";

type Matrix = number[][];

function readMatrixFromFile(filePath: string): Matrix {
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

    const matrix: Matrix = [];
    for (let i = 0; i < rows; i += 1) {
        const values = lines[i + 1].split(/\s+/).map(Number);
        if (values.length !== cols || values.some((value) => !Number.isInteger(value))) {
            throw new Error(`Некорректная строка матрицы №${i + 1}.`);
        }
        matrix.push(values);
    }

    return matrix;
}

function sortMainDiagonalComb(matrix: Matrix): Matrix {
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

function printMatrix(matrix: Matrix, title: string): void {
    console.log(title);
    for (const row of matrix) {
        console.log(row.join(" "));
    }
    console.log("");
}

function main(): void {
    const inputPath = process.argv[2] ?? "input.txt";
    const absolutePath = path.resolve(inputPath);

    try {
        const matrix = readMatrixFromFile(absolutePath);
        printMatrix(matrix, "Исходная матрица:");
        const sorted = sortMainDiagonalComb(matrix);
        printMatrix(sorted, "Матрица после сортировки:");
    } catch (error) {
        console.error("Ошибка:", (error as Error).message);
        process.exit(1);
    }
}

main();
