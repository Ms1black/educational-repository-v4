import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

type ListNode = {
    value: number;
    next: ListNode | null;
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
        if (this.top === null) {
            return null;
        }
        const value = this.top.value;
        this.top = this.top.next;
        return value;
    }

    isEmpty(): boolean {
        return this.top === null;
    }
}

function buildListFromInput(input: string): ListNode | null {
    let head: ListNode | null = null;
    let tail: ListNode | null = null;

    let i = 0;
    const n = input.length;
    let sign = 1;

    while (i < n) {
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
            const value = input.charCodeAt(i) - 48;
            const node: ListNode = { value: sign * value, next: null };
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

    return head;
}

function printByRule(head: ListNode | null): void {
    const positiveStack = new Stack();
    const negativeStack = new Stack();

    let current = head;
    while (current !== null) {
        if (current.value > 0) {
            positiveStack.push(current.value);
        } else if (current.value < 0) {
            negativeStack.push(current.value);
        }
        current = current.next;
    }

    let output = '';
    while (!positiveStack.isEmpty()) {
        const value = positiveStack.pop();
        if (value !== null) {
            output += (output.length > 0 ? ' ' : '') + value;
        }
    }
    while (!negativeStack.isEmpty()) {
        const value = negativeStack.pop();
        if (value !== null) {
            output += (output.length > 0 ? ' ' : '') + value;
        }
    }

    console.log('Результат:', output);
}

async function main(): Promise<void> {
    const input = await askQuestion('Введите список цифр: ');
    const head = buildListFromInput(input);
    printByRule(head);
    rl.close();
}

main();
