import * as readline from "readline";
import { performance } from "perf_hooks";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
}

class HashTable {
    table: Array<Array<{ key: string; helpText: string }>>;
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

    getLoadFactor(): number {
        return this.count / this.size;
    }

    private upsertToBucket(key: string, helpText: string): boolean {
        const index = this.hash(key);
        if (!this.table[index]) {
            this.table[index] = [];
        }

        for (let item of this.table[index]) {
            if (item.key === key) {
                item.helpText = helpText;
                return false;
            }
        }

        this.table[index].push({ key, helpText });
        this.count++;
        return true;
    }

    insert(key: string, helpText: string): { totalMs: number; resizeMs: number; resized: boolean } {
        const start = performance.now();
        let resizeMs = 0;
        let resized = false;

        if (this.getLoadFactor() > 0.75) {
            resized = true;
            resizeMs = this.resize();
        }

        this.upsertToBucket(key, helpText);
        return { totalMs: performance.now() - start, resizeMs, resized };
    }

    getHelp(key: string): string | null {
        const index = this.hash(key);
        if (this.table[index]) {
            for (let item of this.table[index]) {
                if (item.key === key) {
                    return item.helpText;
                }
            }
        }
        return null;
    }

    seedWithoutResize(entries: Array<{ key: string; helpText: string }>): void {
        for (const entry of entries) {
            this.upsertToBucket(entry.key, entry.helpText);
        }
    }

    resize(): number {
        const start = performance.now();
        const oldTable = this.table;
        this.size *= 2;
        this.table = new Array(this.size);
        this.count = 0;

        for (let bucket of oldTable) {
            if (bucket) {
                for (let item of bucket) {
                    this.upsertToBucket(item.key, item.helpText);
                }
            }
        }

        return performance.now() - start;
    }
}

const RESERVED_WORDS: Array<{ key: string; helpText: string }> = [
    { key: "if", helpText: "Условный оператор." },
    { key: "else", helpText: "Ветка, выполняемая при ложном условии if." },
    { key: "for", helpText: "Цикл с инициализацией, условием и шагом." },
    { key: "while", helpText: "Цикл, выполняемый пока условие истинно." },
    { key: "do", helpText: "Начало цикла do...while с проверкой после тела." },
    { key: "switch", helpText: "Множественный выбор по значению выражения." },
    { key: "case", helpText: "Ветка внутри switch для конкретного значения." },
    { key: "break", helpText: "Прерывает цикл или switch." },
    { key: "continue", helpText: "Переходит к следующей итерации цикла." },
    { key: "function", helpText: "Объявляет функцию." },
    { key: "return", helpText: "Возвращает значение из функции." },
    { key: "class", helpText: "Объявляет класс." },
    { key: "extends", helpText: "Наследует класс от другого класса." },
    { key: "new", helpText: "Создает экземпляр класса." },
    { key: "this", helpText: "Ссылка на текущий объект." },
    { key: "super", helpText: "Доступ к родительскому классу." },
    { key: "const", helpText: "Объявляет неизменяемую ссылку." },
    { key: "let", helpText: "Объявляет блочную переменную." },
    { key: "var", helpText: "Объявляет функционально-областную переменную." },
    { key: "try", helpText: "Начало блока обработки исключений." },
    { key: "catch", helpText: "Блок перехвата ошибки после try." },
    { key: "finally", helpText: "Блок, выполняемый независимо от ошибок." },
    { key: "throw", helpText: "Генерирует исключение." },
];

function buildSyntheticEntries(count: number): Array<{ key: string; helpText: string }> {
    const entries: Array<{ key: string; helpText: string }> = [];
    for (let i = 0; i < count; i++) {
        entries.push({
            key: `kw_${i}`,
            helpText: `Синтетическая подсказка ${i}`,
        });
    }
    return entries;
}

function compareInsertVsResize(): void {
    const baseSize = 128;
    const fillLevels = [0.25, 0.5, 0.75, 0.9];

    console.log("\nСравнение эффективности вставки (разная заполненность):");
    console.log("Заполненность | До вставки | Операция | Общее время (мс) | Время реструктуризации (мс)");
    console.log("-".repeat(90));

    for (const level of fillLevels) {
        const table = new HashTable(baseSize);
        const initialCount = Math.floor(baseSize * level);
        table.seedWithoutResize(buildSyntheticEntries(initialCount));

        const stats = table.insert(`new_keyword_${level}`, "Новая подсказка");
        const operation = stats.resized ? "вставка + resize" : "только вставка";

        console.log(
            `${(level * 100).toFixed(0).padStart(12)}% | ${`${table.count - 1}/${table.size}`.padEnd(10)} | ${operation.padEnd(16)} | ${stats.totalMs.toFixed(4).padStart(15)} | ${stats.resizeMs.toFixed(4).padStart(25)}`
        );
    }
}

async function main(): Promise<void> {
    const table = new HashTable(16);

    for (const word of RESERVED_WORDS) {
        table.insert(word.key, word.helpText);
    }

    console.log(`Таблица инициализирована. Слов: ${table.count}, размер: ${table.size}, load factor: ${table.getLoadFactor().toFixed(2)}.`);

    const query = (await askQuestion("Введите слово для поиска помощи: ")).trim();
    const foundHelp = table.getHelp(query);

    if (foundHelp !== null) {
        console.log(`Помощь по '${query}': ${foundHelp}`);
    } else {
        console.log(`Слово '${query}' не найдено.`);
        const newHelp = await askQuestion(`Введите HELP для нового слова "${query}": `);
        const stats = table.insert(query, newHelp.trim());

        if (stats.resized) {
            console.log(`[Реструктуризация] выполнена за ${stats.resizeMs.toFixed(4)} мс. Новый размер таблицы: ${table.size}.`);
        }
        console.log(`Слово '${query}' добавлено. Время операции: ${stats.totalMs.toFixed(4)} мс.`);
    }

    compareInsertVsResize();
    rl.close();
}

main();