import * as readline from 'readline';
import { performance } from 'perf_hooks';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const DAYS_OF_WEEK = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

function askQuestion(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main(): Promise<void> {
    const day = parseInt(await askQuestion("Введите день: "), 10);
    const month = parseInt(await askQuestion("Введите месяц:"), 10);
    const year = parseInt(await askQuestion("Введите год:"), 10);

    console.log("Идет поиск...");

    const startTime = performance.now();

    const birthDate = new Date(year, month - 1, day);
    const targetDayOfWeek = birthDate.getDay();
    console.log(`День недели даты рождения: ${DAYS_OF_WEEK[targetDayOfWeek]}\n`);
    let countFound = 0;

    const month0 = month - 1;

    for (let i = 1; i <= 100; i++) {
        const currentYear = year + i;
        const checkDate = new Date(currentYear, month0, day);
        if (checkDate.getMonth() !== month0) {
            continue;
        }
        if (checkDate.getDay() === targetDayOfWeek) {
            console.log(`  ${currentYear}: ${checkDate.toLocaleDateString('ru-RU')} — ${DAYS_OF_WEEK[targetDayOfWeek]}`);
            countFound++;
        }
    }
    const endTime = performance.now();
    console.log(`\nНайдено совпадени: ${countFound}`);
    console.log(`Время выполнения алгоритма: ${(endTime - startTime).toFixed(4)} мс\n`);

    rl.close();
}

main();
