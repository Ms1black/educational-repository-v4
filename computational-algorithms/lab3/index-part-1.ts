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

function reverseList(head: Node | null): Node | null {
    let prev: Node | null = null;
    let curr: Node | null = head;

    while (curr !== null) {
        const next: Node | null = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }

    return prev;
}

async function main(): Promise<void> {
    const input = await askQuestion('Введите список цифр: ');
    const str = input.trim();

    let head: Node | null = null;
    let tail: Node | null = null;

    let i = 0;
    while (i < str.length) {
        const ch = str[i];
        if (ch >= '0' && ch <= '9') {
            const num = ch.charCodeAt(0) - 48;
            const node: Node = { value: num, next: null };

            if (head === null) {
                head = node;
                tail = node;
            } else {
                tail!.next = node;
                tail = node;
            }
        }
        i++;
    }

    head = reverseList(head);

    let cur: Node | null = head;
    let out = '';
    while (cur !== null) {
        out += (out.length ? ' ' : '') + cur.value;
        cur = cur.next;
    }

    console.log('Развернутый список:', out);

    rl.close();
}

main();