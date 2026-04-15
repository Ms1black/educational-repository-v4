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
const readline = __importStar(require("readline"));
const perf_hooks_1 = require("perf_hooks");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const DAYS_OF_WEEK = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}
async function main() {
    const day = parseInt(await askQuestion("Введите день: "), 10);
    const month = parseInt(await askQuestion("Введите месяц:"), 10);
    const year = parseInt(await askQuestion("Введите год:"), 10);
    console.log("Идет поиск...");
    const startTime = perf_hooks_1.performance.now();
    const birthDate = new Date(year, month - 1, day);
    const targetDayOfWeek = birthDate.getDay();
    console.log(`День недели даты рождения: ${DAYS_OF_WEEK[targetDayOfWeek]}\n`);
    let countFound = 0;
    const month0 = month - 1; // в Date месяцы с 0 (январь = 0)
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
    const endTime = perf_hooks_1.performance.now();
    console.log(`\nНайдено совпадени: ${countFound}`);
    console.log(`Время выполнения алгоритма: ${(endTime - startTime).toFixed(4)} мс\n`);
    rl.close();
}
main();
