const blocksQSide = 3;
const blockSize = 3;

const matrixWithBlocks: number[][][][] = Array.from({ length: blocksQSide }, () =>
    Array.from({ length: blocksQSide }, () =>
        Array.from({ length: blockSize }, () =>
            Array.from({ length: blockSize }, () => Math.floor(Math.random() * 100))
        )
    )
);

const printBlocksAsSquares = (title: string): void => {
    console.log(title);
    for (let blockRow = 0; blockRow < blocksQSide; blockRow++) {
        for (let innerRow = 0; innerRow < blockSize; innerRow++) {
            let line = '';
            for (let blockCol = 0; blockCol < blocksQSide; blockCol++) {
                line += `[${matrixWithBlocks[blockRow][blockCol][innerRow].join(', ')}] `;
            }
            console.log(line.trimEnd());
        }
        console.log('');
    }
};

printBlocksAsSquares('');

const temp = matrixWithBlocks[0][0];
matrixWithBlocks[0][0] = matrixWithBlocks[2][1];
matrixWithBlocks[2][1] = temp;

console.log('');
printBlocksAsSquares('');
