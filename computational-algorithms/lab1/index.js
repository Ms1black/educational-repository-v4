const readline = require('readline');
const { performance } = require('perf_hooks');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query,resolve));
}

async function main() {
    let day = parseInt(await askQuestion("Введите день: "));
    let month = parseInt(await askQuestion("Введите месяц:"));
    let year = parseInt(await askQuestion("Введите год:"));

    console.log("Идет поиск...");

    let startTime = performance.now()
    
    let birthDate = new Date(year, month - 1, day);
    let targetDayOfWeek = birthDate.getDay();
    let countFound = 0;

    for (let i = 1; i <= 100; i++){
        let currentYear = year  + i;
        let checkDate = new Date(currentYear, month - 1, day);
        if (checkDate.getMonth() !== (month - 1)) {
            continue
        }
        if (checkDate.getDay() === targetDayOfWeek){
            countFound++;
        }
    }
    let endTime = performance.now();

    console.log(`\nНайдено совпадени: ${countFound}`);
    console.log(`Время выполнения алгоритма: ${(endTime - startTime).toFixed(4)} мс\n`);

    rl.close();
}

main();
