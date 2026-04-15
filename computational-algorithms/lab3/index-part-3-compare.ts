import * as readline from 'readline';
import { performance } from 'perf_hooks';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

type Node = {
    value: number;
    next: Node | null;
};

type StackNode = {
    value: number;
    next: StackNode | null;
};

class Stack {
    private top: StackNode | null = null;

    push(value: number): void {
        this.top = { value, next: this.top };
    }

    pop(): number | null {
        if (this.top === null) return null;
        const v = this.top.value;
        this.top = this.top.next;
        return v;
    }

    isEmpty(): boolean {
        return this.top === null;
    }
}

type QueueNode = {
    value: number;
    next: QueueNode | null;
};

class Queue {
    private front: QueueNode | null = null;
    private rear: QueueNode | null = null;

    enqueue(value: number): void {
        const node: QueueNode = { value, next: null };
        if (this.rear === null) {
            this.front = node;
            this.rear = node;
            return;
        }
        this.rear.next = node;
        this.rear = node;
    }

    dequeue(): number | null {
        if (this.front === null) return null;
        const v = this.front.value;
        this.front = this.front.next;
        if (this.front === null) this.rear = null;
        return v;
    }

    isEmpty(): boolean {
        return this.front === null;
    }
}

function appendNode(head: Node | null, tail: Node | null, value: number): { head: Node | null; tail: Node | null } {
    const node: Node = { value, next: null };
    if (head === null) return { head: node, tail: node };
    tail!.next = node;
    return { head, tail: node };
}

function buildListFromInput(input: string): Node | null {
    let head: Node | null = null;
    let tail: Node | null = null;
    let hasSeparator = false;

    let j = 0;
    while (j < input.length) {
        if (input[j] === ' ' || input[j] === ',' || input[j] === ';') {
            hasSeparator = true;
            break;
        }
        j++;
    }

    let i = 0;
    if (!hasSeparator) {
        let sign = 1;
        while (i < input.length) {
            if (input[i] === '-') {
                sign = -1;
                i++;
                continue;
            }
            if (input[i] === '+') {
                sign = 1;
                i++;
                continue;
            }
            if (input[i] >= '0' && input[i] <= '9') {
                const value = (input.charCodeAt(i) - 48) * sign;
                const appended = appendNode(head, tail, value);
                head = appended.head;
                tail = appended.tail;
                sign = 1;
            }
            i++;
        }
    } else {
        while (i < input.length) {
            while (
                i < input.length &&
                (input[i] === ' ' || input[i] === ',' || input[i] === ';')
            ) {
                i++;
            }
            if (i >= input.length) break;

            let sign = 1;
            if (input[i] === '-') {
                sign = -1;
                i++;
            } else if (input[i] === '+') {
                i++;
            }

            let value = 0;
            let hasDigit = false;
            while (i < input.length && input[i] >= '0' && input[i] <= '9') {
                hasDigit = true;
                value = value * 10 + (input.charCodeAt(i) - 48);
                i++;
            }

            if (hasDigit) {
                const appended = appendNode(head, tail, sign * value);
                head = appended.head;
                tail = appended.tail;
            }

            while (
                i < input.length &&
                input[i] !== ' ' &&
                input[i] !== ',' &&
                input[i] !== ';'
            ) {
                i++;
            }
        }
    }

    return head;
}

function isSymmetricCustom(head: Node | null): boolean {
    if (head === null) return true;

    const queue = new Queue();
    const stack = new Stack();
    let slow: Node | null = head;
    let fast: Node | null = head;

    while (fast !== null && fast.next !== null) {
        queue.enqueue(slow!.value);
        slow = slow!.next;
        fast = fast.next.next;
    }

    if (fast !== null) slow = slow?.next ?? null;

    while (slow !== null) {
        stack.push(slow.value);
        slow = slow.next;
    }

    while (!queue.isEmpty()) {
        const left = queue.dequeue();
        const right = stack.pop();
        if (left === null || right === null) return false;
        if (left !== right) return false;
    }

    return true;
}

function isSymmetricStd(head: Node | null): boolean {
    if (head === null) return true;

    const queue: number[] = [];
    const stack: number[] = [];
    let queueHead = 0;

    let slow: Node | null = head;
    let fast: Node | null = head;

    while (fast !== null && fast.next !== null) {
        queue.push(slow!.value);
        slow = slow!.next;
        fast = fast.next.next;
    }

    if (fast !== null) slow = slow?.next ?? null;

    while (slow !== null) {
        stack.push(slow.value);
        slow = slow.next;
    }

    while (queueHead < queue.length) {
        const left = queue[queueHead++];
        const right = stack.pop();
        if (right === undefined) return false;
        if (left !== right) return false;
    }

    return true;
}

function benchmark(fn: (head: Node | null) => boolean, head: Node | null, iterations: number): { ms: number; result: boolean } {
    let result = true;
    const start = performance.now();
    let i = 0;
    while (i < iterations) {
        result = fn(head);
        i++;
    }
    const end = performance.now();
    return { ms: end - start, result };
}

async function main(): Promise<void> {
    const input = await askQuestion('Введите список: ');
    const iterInput = await askQuestion('Введите число повторов для замера (например 10000): ');
    const iterations = Math.max(1, Number(iterInput) || 10000);

    const head = buildListFromInput(input);

    const custom = benchmark(isSymmetricCustom, head, iterations);
    const standard = benchmark(isSymmetricStd, head, iterations);

    console.log(`custom: ${custom.result}`);
    console.log(`standard: ${standard.result}`);
    console.log('\nВремя выполнения:');
    console.log(`Собственные структуры: ${custom.ms.toFixed(4)} ms`);
    console.log(`Стандартные коллекции: ${standard.ms.toFixed(4)} ms`);

    rl.close();
}

main();

