import * as readline from 'readline';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

function intersection(first: number[], second: number[]): number[] {
    const secondSet = new Set(second);
    const resultSet = new Set<number>();

    for (const value of first) {
        if (secondSet.has(value)) {
            resultSet.add(value);
        }
    }

    return Array.from(resultSet);
}

function parseNumberArray(input: string): number[] {
    return input.trim().split(/\s+/).filter(Boolean).map(Number).filter(value => !Number.isNaN(value));
}

async function main(): Promise<void> {
    const firstInput = await askQuestion('Введите элементы первого массива через пробел: ');
    const secondInput = await askQuestion('Введите элементы второго массива через пробел: ');

    const first = parseNumberArray(firstInput);
    const second = parseNumberArray(secondInput);
    const result = intersection(first, second);

    console.log('Пересечение:', result);

    rl.close();
}

main();
