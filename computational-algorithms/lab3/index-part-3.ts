import * as readline from 'readline';

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
        if (this.front === null) {
            this.rear = null;
        }
        return v;
    }

    isEmpty(): boolean {
        return this.front === null;
    }
}

function buildListFromInput(input: string): Node | null {
    let head: Node | null = null;
    let tail: Node | null = null;
    let hasSpace = false;

    let j = 0;
    while (j < input.length) {
        if (input[j] === ' ') {
            hasSpace = true;
            break;
        }
        j++;
    }

    let i = 0;
    if (!hasSpace) {
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
                const node: Node = { value, next: null };
                if (head === null) {
                    head = node;
                    tail = node;
                } else {
                    tail!.next = node;
                    tail = node;
                }
                sign = 1;
            }
            i++;
        }
    } else {
        while (i < input.length) {
            while (i < input.length && input[i] === ' ') i++;
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
                const node: Node = { value: sign * value, next: null };
                if (head === null) {
                    head = node;
                    tail = node;
                } else {
                    tail!.next = node;
                    tail = node;
                }
            }

            while (i < input.length && input[i] !== ' ') i++;
        }
    }

    return head;
}

function isSymmetric(head: Node | null): boolean {
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


    if (fast !== null) {
        slow = slow?.next ?? null;
    }
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

function reverseNumber(n: number): number {
    let value = n;
    let reversed = 0;
    while (value > 0) {
        const digit = value % 10;
        reversed = reversed * 10 + digit;
        value = Math.floor(value / 10);
    }
    return reversed;
}

function isPalindromeNumber(n: number): boolean {
    const head = buildListFromInput(String(n));
    return isSymmetric(head);
}

function getPalindrome(start: number): string {
    let value = start;
    let i = 0;
    let lastLine = '';

    while (i < 5) {
        const left = value;
        const reversed = reverseNumber(value);
        const sum = left + reversed;
        value = sum;
        lastLine = left + '+' + reversed + '=' + sum;

        if (isPalindromeNumber(value)) {
            return lastLine + ' true (' + (i + 1) + ')';
        }
        i++;
    }

    return lastLine + ' false (5)';
}

async function main(): Promise<void> {

    await askQuestion(' ');

    let n = 100;
    while (n <= 999) {
        const process = getPalindrome(n);
        console.log(process);
        n++;
    }

    rl.close();
}

main();

