import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

function parseNumberArray(input: string): number[] {
    return input.trim().split(/\s+/).filter(Boolean).map(Number).filter(value => !Number.isNaN(value));
}

function transposeMatrix(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;

    const transposed: number[][] = Array.from({ length: cols }, () => new Array<number>(rows));

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            transposed[j][i] = matrix[i][j];
        }
    }

    return transposed;
}

function printMatrix(matrix: number[][]): void {

    for (const row of matrix) {
        console.log(`  [${row.join(', ')}]`);
    }

}

async function main(): Promise<void> {
    const rowsInput = await askQuestion('Введите количество строк: ');
    const colsInput = await askQuestion('Введите количество столбцов: ');

    const rows = Number(rowsInput.trim());
    const cols = Number(colsInput.trim());

    if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows <= 0 || cols <= 0) {
        console.log('Ошибка: размеры должны быть положительными целыми числами.');
        rl.close();
        return;
    }

    const matrix: number[][] = [];

    for (let i = 0; i < rows; i++) {
        const rowInput = await askQuestion(`Введите элементы строки ${i + 1} через пробел: `);
        const row = parseNumberArray(rowInput);

        if (row.length !== cols) {
            console.log(`Ошибка: строка ${i + 1} должна содержать ровно ${cols} элементов.`);
            rl.close();
            return;
        }

        matrix.push(row);
    }

    const transposed = transposeMatrix(matrix);
    console.log('Транспонированная матрица:');
    printMatrix(transposed);

    rl.close();
}

main();
