import * as fs from "fs";
import * as path from "path";

type Matrix = number[][];
type ActivePair = [number, number] | null;

const ANSI = {
    reset: "\x1b[0m",
    white: "\x1b[97m",
    cyan: "\x1b[96m",
    yellow: "\x1b[93m",
    green: "\x1b[92m",
};

function paint(text: string, color: string): string {
    return `${color}${text}${ANSI.reset}`;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function readMatrixFromFile(filePath: string): Matrix {
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

    const matrix: Matrix = [];
    for (let i = 0; i < rows; i += 1) {
        const row = lines[i + 1]?.split(/\s+/).map(Number) ?? [];
        if (row.length !== cols || row.some((value) => !Number.isInteger(value))) {
            throw new Error(`Некорректная строка матрицы №${i + 1}.`);
        }
        matrix.push(row);
    }

    return matrix;
}

function formatCell(value: number, row: number, col: number, active: ActivePair, isSwap: boolean): string {
    const text = value.toString().padStart(5, " ");
    const isDiagonal = row === col;
    const isActive = active !== null && isDiagonal && (row === active[0] || row === active[1]);

    if (isActive && isSwap) {
        return paint(text, ANSI.green);
    }
    if (isActive) {
        return paint(text, ANSI.yellow);
    }
    if (isDiagonal) {
        return paint(text, ANSI.cyan);
    }
    return paint(text, ANSI.white);
}

function renderFrame(matrix: Matrix, step: number, gap: number, message: string, active: ActivePair, isSwap: boolean): void {
    console.clear();
    console.log("Сортировка главной диагонали методом расчёски");
    console.log(`Шаг: ${step} | gap: ${gap}`);
    console.log(message);
    console.log("");

    for (let row = 0; row < matrix.length; row += 1) {
        const rowParts: string[] = [];
        for (let col = 0; col < matrix[row].length; col += 1) {
            rowParts.push(formatCell(matrix[row][col], row, col, active, isSwap));
        }
        console.log(rowParts.join(" "));
        console.log(" ");
    }

    console.log(" ");
}

async function animateCombSortMainDiagonal(matrix: Matrix, delayMs: number): Promise<void> {
    const diagonalLength = Math.min(matrix.length, matrix[0].length);
    if (diagonalLength <= 1) {
        renderFrame(matrix, 0, 1, "Недостаточно элементов для сортировки.", null, false);
        return;
    }

    const shrinkFactor = 1.247;
    let gap = diagonalLength;
    let swapped = true;
    let step = 0;

    renderFrame(matrix, step, gap, "Старт алгоритма.", null, false);
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
            const left = matrix[i][i];
            const right = matrix[j][j];
            renderFrame(
                matrix,
                step,
                gap,
                `Сравнение: (${i},${i})=${left} и (${j},${j})=${right}`,
                [i, j],
                false
            );
            await sleep(delayMs);

            if (left > right) {
                [matrix[i][i], matrix[j][j]] = [matrix[j][j], matrix[i][i]];
                swapped = true;
                renderFrame(
                    matrix,
                    step,
                    gap,
                    `Обмен: ${left} <-> ${right} (миграция по диагонали)`,
                    [i, j],
                    true
                );
                await sleep(delayMs);
            } else {
                renderFrame(matrix, step, gap, "Обмен не нужен.", [i, j], false);
                await sleep(delayMs);
            }
        }
    }

    renderFrame(matrix, step, gap, "Готово: диагональ отсортирована.", null, false);
}

async function main(): Promise<void> {
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
    } catch (error) {
        console.error("Ошибка:", (error as Error).message);
        process.exit(1);
    }
}

main();
