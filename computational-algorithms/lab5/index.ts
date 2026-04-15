import * as readline from 'readline';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}


async function findMax():  Promise<number> {
    const input = await askQuestion("Введите натуральное число (0 для завершения): ");
    const current = parseInt(input, 10);

    if (isNaN(current) || current === 0) {
        return 0;
    }

    const nextMax = await findMax();
    return current > nextMax ? current : nextMax;
}

function apostolicoCrochemore(text: string, pattern: string): number[] {
    const m = pattern.length;
    const n = text.length;
    if (m === 0) return [];

    let i = 0, j = -1;
    let failure = new Array(m + 1).fill(0);
    failure[0] = -1;

    while (i < m) {
        while (j > -1 && pattern[i] !== pattern[j]) {
            j = failure[j];
        }
        i++;
        j++;
        if (i < m && pattern[i] === pattern[j]) {
            failure[i] = failure[j];
        } else {
            failure[i] = j;
        }
    }

    let result: number[] = [];
    i = 0; j = 0;

    while (i < n) {
        while (j > -1 && text[i] !== pattern[j]) {
            j = failure[j];
        }
        i++;
        j++;
        if (j >= m) {
            result.push(i - j);
            j = failure[j];
        }
    }
    return result;
}



async function main(): Promise<void> {
    const text = await askQuestion("Введите текст: ");
    const pattern = await askQuestion("Введите шаблон: ");
    const result = await findMax();
    const result2 = await apostolicoCrochemore(text, pattern);

    console.log(result);
    console.log(result2);

    rl.close();
}

main();
