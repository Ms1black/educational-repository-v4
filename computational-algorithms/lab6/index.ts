import * as readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
}

class HashTable {
    table: any[][];
    size: number;
    count: number;

    constructor(size: number = 10) {
        this.table = new Array(size);
        this.size = size;
        this.count = 0;
    }

    hash(key: string): number {
        let hashValue = 0;
        for (let i = 0; i < key.length; i++) {
            hashValue = (hashValue * 31 + key.charCodeAt(i)) % this.size;
        }
        return hashValue;
    }

    insert(key: string, helpText: string): void {
        let loadFactor = this.count / this.size;
        if (loadFactor > 0.75) {
            console.log(`\n[Реструктуризация] Load Factor ${loadFactor.toFixed(2)} > 0.75. Таблица увеличивается...`);
            this.resize();
        }

        const index = this.hash(key);
        if (!this.table[index]) {
            this.table[index] = [];
        }

        for (let item of this.table[index]) {
            if (item.key === key) {
                item.helpText = helpText;
                return;
            }
        }

        this.table[index].push({ key, helpText });
        this.count++;
    }

    getHelp(key: string): string {
        const index = this.hash(key);
        if (this.table[index]) {
            for (let item of this.table[index]) {
                if (item.key === key) {
                    return `Помощь по '${key}': ${item.helpText}`;
                }
            }
        }
        return `Слово '${key}' не найдено.`;
    }

    resize(): void {
        const oldTable = this.table;
        this.size *= 2;
        this.table = new Array(this.size);
        this.count = 0;

        let start = Date.now();
        for (let bucket of oldTable) {
            if (bucket) {
                for (let item of bucket) {
                    this.insert(item.key, item.helpText);
                }
            }
        }
        let end = Date.now();
        console.log(`Реструктуризация завершена за ${end - start} мс. Новый размер: ${this.size}\n`);
    }
}

async function main(): Promise<void> {
    const table = new HashTable();
    const nStr = await askQuestion("Сколько записей добавить? ");
    const n = Math.max(0, parseInt(nStr, 10) || 0);
    for (let i = 0; i < n; i++) {
        const key = await askQuestion(`Ключ ${i + 1}: `);
        const helpText = await askQuestion(`Текст помощи для "${key}": `);
        table.insert(key.trim(), helpText);
    }
    const query = await askQuestion("Введите слово для поиска помощи: ");
    console.log(table.getHelp(query.trim()));
    rl.close();
}

main();