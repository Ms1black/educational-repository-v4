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
    visualize(): string[] {
        if (this.root === null) return ["(empty)"];
        const rendered = this.renderSubtree(this.root);
        return rendered.lines.map((line) => line.trimEnd());
    }
    private renderSubtree(node: TreeNode): { lines: string[]; width: number; height: number; middle: number } {
        const value = node.value;
        const valueWidth = value.length;

        if (node.left === null && node.right === null) {
            return { lines: [value], width: valueWidth, height: 1, middle: Math.floor(valueWidth / 2) };
        }

        if (node.right === null && node.left !== null) {
            const left = this.renderSubtree(node.left);
            const firstLine = " ".repeat(left.middle + 1) + " ".repeat(left.width - left.middle - 1) + value;
            const secondLine = " ".repeat(left.middle) + "/" + " ".repeat(left.width - left.middle - 1 + valueWidth);
            const shiftedLines = left.lines.map((line) => line + " ".repeat(valueWidth));
            return {
                lines: [firstLine, secondLine, ...shiftedLines],
                width: left.width + valueWidth,
                height: left.height + 2,
                middle: left.width + Math.floor(valueWidth / 2),
            };
        }

        if (node.left === null && node.right !== null) {
            const right = this.renderSubtree(node.right);
            const firstLine = value + " ".repeat(right.middle) + " ".repeat(right.width - right.middle);
            const secondLine = " ".repeat(valueWidth + right.middle) + "\\" + " ".repeat(right.width - right.middle - 1);
            const shiftedLines = right.lines.map((line) => " ".repeat(valueWidth) + line);
            return {
                lines: [firstLine, secondLine, ...shiftedLines],
                width: valueWidth + right.width,
                height: right.height + 2,
                middle: Math.floor(valueWidth / 2),
            };
        }

        const left = this.renderSubtree(node.left as TreeNode);
        const right = this.renderSubtree(node.right as TreeNode);
        const firstLine = " ".repeat(left.middle + 1)
            + " ".repeat(left.width - left.middle - 1)
            + value
            + " ".repeat(right.middle)
            + " ".repeat(right.width - right.middle);
        const secondLine = " ".repeat(left.middle)
            + "/"
            + " ".repeat(left.width - left.middle - 1 + valueWidth + right.middle)
            + "\\"
            + " ".repeat(right.width - right.middle - 1);

        const leftLines = left.lines.slice();
        const rightLines = right.lines.slice();
        if (left.height < right.height) leftLines.push(...Array(right.height - left.height).fill(" ".repeat(left.width)));
        else if (right.height < left.height) rightLines.push(...Array(left.height - right.height).fill(" ".repeat(right.width)));

        const mergedLines = leftLines.map((line, idx) => line + " ".repeat(valueWidth) + rightLines[idx]);
        return {
            lines: [firstLine, secondLine, ...mergedLines],
            width: left.width + valueWidth + right.width,
            height: Math.max(left.height, right.height) + 2,
            middle: left.width + Math.floor(valueWidth / 2),
        };
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
    console.log("Визуализация дерева:");
    console.log(tree1.visualize().join("\n"));
    console.log("Симметричный обход:");
    console.log(tree1.printInOrder().join(" "));

    rl.close();
}

main();