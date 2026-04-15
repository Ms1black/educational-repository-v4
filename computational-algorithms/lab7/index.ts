import * as readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
}

class TreeNode {
    value: string; left: TreeNode | null = null; right: TreeNode | null = null;
    constructor(value: string) { this.value = value; }
}

class BinaryTree {
    root: TreeNode | null = null;
    buildMinHeight(arr: string[]): void { this.root = this._build(arr, 0, arr.length - 1); }
    private _build(arr: string[], start: number, end: number): TreeNode | null {
        if (start > end) return null;
        let mid = Math.floor((start + end) / 2);
        let node = new TreeNode(arr[mid]);
        node.left = this._build(arr, start, mid - 1);
        node.right = this._build(arr, mid + 1, end);
        return node;
    }
    postOrderSearch(node: TreeNode | null, targetValue: string): TreeNode | null {
        if (node === null) return null;
        let left = this.postOrderSearch(node.left, targetValue); if (left) return left;
        let right = this.postOrderSearch(node.right, targetValue); if (right) return right;
        if (node.value === targetValue) return node;
        return null;
    }
    attachSubtree(targetValue: string, secondTree: BinaryTree): void {
        let targetNode = this.postOrderSearch(this.root, targetValue);
        if (!targetNode) return;
        if (targetNode.left === null) targetNode.left = secondTree.root;
        else {
            let current = targetNode.left;
            while (current.left !== null) current = current.left;
            current.left = secondTree.root;
        }
    }
    printInOrder(node: TreeNode | null = this.root, result: string[] = []): string[] {
        if (node !== null) {
            this.printInOrder(node.left, result); result.push(node.value); this.printInOrder(node.right, result);
        }
        return result;
    }
}

async function main(): Promise<void> {
    const firstLine = await askQuestion("Введите элементы первого дерева через пробел: ");
    const arr1 = firstLine.trim().split(/\s+/).filter((s) => s.length > 0);
    const tree1 = new BinaryTree();
    tree1.buildMinHeight(arr1);

    const targetValue = await askQuestion("Значение узла для прикрепления поддерева: ");
    const secondLine = await askQuestion("Введите элементы второго дерева через пробел: ");
    const arr2 = secondLine.trim().split(/\s+/).filter((s) => s.length > 0);
    const tree2 = new BinaryTree();
    tree2.buildMinHeight(arr2);

    tree1.attachSubtree(targetValue.trim(), tree2);
    console.log(tree1.printInOrder().join(" "));

    rl.close();
}

main();