let canvas;
let canvasContext;
let gridOffset = [0, 0];
let size = 30;
let maxGridSize = 40;
let gridSize = [20, 40]
let grid = [];
let clickedGrid = []
let backgroundColor = "#333333";
let mousePos = [0, 0];
let mousedown = false;
let colors = ["#666666", "#AAAAAA"]
let clicked = [0, 0]
let bombProbability = 0.25;
let flag = false;
let numberFlags = 0;
let numberBombs = 0;
let numberColors = ["#000000", "#AAAAAA", "#007f5f", "#fff75e", "#eb6424", "#e5383b", "#ba181b", "#a4161a", "#660708", "#540b0e"]
let dTime = 0; // in seconds
let fps; // time between frames
let timer = 0;
let firstClick = true;
let topPieceSize = size*2;
let gameOver = false;
let won = false;
let found = 0;

function init()
{
    canvas = document.getElementById('minesweeper');
    canvasContext = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    if (canvas.width > canvas.height)
    {
        gridSize[0] = Math.floor(maxGridSize * (canvas.offsetHeight / canvas.offsetWidth));
        gridSize[1] = Math.floor(maxGridSize * (canvas.offsetWidth / canvas.offsetWidth));

    }
    else
    {
        gridSize[0] = Math.floor(maxGridSize * (canvas.offsetHeight / canvas.offsetHeight));
        gridSize[1] = Math.floor(maxGridSize * (canvas.offsetWidth / canvas.offsetHeight));
    }
    size = Math.floor(Math.min(canvas.offsetWidth / gridSize[1], (canvas.offsetHeight) / (gridSize[0] + 2)));
    topPieceSize = size*2
    gridOffset[1] += Math.max(Math.round((canvas.offsetWidth / 2) - (size*gridSize[1] / 2)), 0);
    gridOffset[0] += topPieceSize;

    document.addEventListener("mousemove", function(evt)
    {
        mousePos[0] = evt.clientY - canvas.getBoundingClientRect().top;
        mousePos[1] = evt.clientX - canvas.getBoundingClientRect().left;
    });
    document.addEventListener("mousedown", function()
    {
        if (!mousedown)
        {
            clicked = [Math.floor((mousePos[0] - gridOffset[0]) / size), Math.floor((mousePos[1] - gridOffset[1]) / size)];
            if (clicked[0] >= 0 && clicked[0] < gridSize[0] && clicked[1] >= 0 && clicked[1] < gridSize[1])
            {
                if (flag && !won && !gameOver)
                {
                    if (clickedGrid[clicked[0]][clicked[1]] == 0)
                    {
                        clickedGrid[clicked[0]][clicked[1]] = 2;
                        numberFlags++;
                        if (numberBombs == numberFlags && found + numberFlags == gridSize[0] * gridSize[1])
                        {
                            console.log("won")
                            won = true;
                            firstClick = true;
                            flag = false;
                        }
                    }
                    else if (clickedGrid[clicked[0]][clicked[1]] == 2)
                    {
                        clickedGrid[clicked[0]][clicked[1]] = 0;
                        numberFlags--;
                    }

                }
                else if ((!flag && clickedGrid[clicked[0]][clicked[1]] == 0) || gameOver || won)
                {
                    found = 0;
                    if (firstClick && (gameOver || won))
                    {
                        firstClick = true;
                        gameOver = false;
                        won = false;
                        found = 0;
                        makeGrid();
                        console.log(grid)
                        for (let i = 0; i < gridSize[0]; i++)
                        {
                            for (let j = 0; j < gridSize[1]; j++)
                            {
                                if (clickedGrid[i][j] == 1)
                                {
                                    found++;
                                }
                            }
                        }
                        return
                    }
                    else if (firstClick)
                    {
                        firstClick = false;
                        gameOver = false;
                        found = 0;
                        makeGrid();
                        console.log(grid)
                        for (let i = 0; i < gridSize[0]; i++)
                        {
                            for (let j = 0; j < gridSize[1]; j++)
                            {
                                if (clickedGrid[i][j] == 1)
                                {
                                    found++;
                                }
                            }
                        }
                        return
                    }
                    clickedGrid[clicked[0]][clicked[1]] = 1;
                    openUpGrid();
                    for (let i = 0; i < gridSize[0]; i++)
                    {
                        for (let j = 0; j < gridSize[1]; j++)
                        {
                            if (clickedGrid[i][j] == 1)
                            {
                                found++;
                            }
                        }
                    }
                    if (grid[clicked[0]][clicked[1]] == -1)
                    {
                        console.log("lost")
                        firstClick = true;
                        gameOver = true;
                        console.log(grid)
                    }
                    if (numberBombs == numberFlags && found + numberFlags == gridSize[0] * gridSize[1])
                    {
                        console.log("won")
                        won = true;
                        firstClick = true;
                    }

                }

            }
            mousedown = true;
        }
    });
    document.addEventListener("mouseup", function(){mousedown = false;});
    document.addEventListener("keydown", keyPressed);
    document.addEventListener("keyup", keyUp);

    makeGrid();
    window.requestAnimationFrame(draw);
}

function update()
{

}

let oldTimeStamp = 0;

function draw(timeStamp)
{
    dTime = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;
    fps = Math.round(1 / dTime);
    timer += dTime;
    if (firstClick)
    {
        timer = 0;
    }
    update();
    //console.log([Math.floor((mousePos[0] - gridOffset[0]) / size), Math.floor((mousePos[1] - gridOffset[1]) / size)]);
    colorRectTop(gridOffset[1], 0, size*gridSize[1], topPieceSize, "#555555");
    let textSize = (gridSize[1] * topPieceSize * 0.01);
    if (!flag)
    {
        colorRectInidicator(gridOffset[1] + (size*gridSize[1]) - (topPieceSize), topPieceSize*0.1, topPieceSize*0.8, topPieceSize*0.8, colors[0], colors[1]);
        canvasContext.textAlign = "right";
        canvasContext.fillStyle = "white";
        canvasContext.font = textSize.toString().concat('px roboto condensed');
        canvasContext.fillText("Not Flaging ", gridOffset[1] + (size*gridSize[1]) - (topPieceSize), (0.6*topPieceSize));
        canvasContext.textAlign = "start";
    }
    else
    {
        colorRectInidicator(gridOffset[1] + (size*gridSize[1]) - (topPieceSize), topPieceSize*0.1, topPieceSize*0.8, topPieceSize*0.8, "#e5383b", "#a4161a");
        canvasContext.textAlign = "right";
        canvasContext.fillStyle = "white";
        canvasContext.font = textSize.toString().concat('px roboto condensed');
        canvasContext.fillText("Flaging ", gridOffset[1] + (size*gridSize[1]) - (topPieceSize), (0.6*topPieceSize));
        canvasContext.textAlign = "start";
    }
    canvasContext.fillStyle = "white";
    canvasContext.font = textSize.toString().concat('px roboto condensed');
    canvasContext.fillText("Number Of Bombs: ".concat(numberBombs, "   Number of Flags: ", numberFlags, "   time(s): ", Math.floor(timer)), (0.25*size) + gridOffset[1], (0.6*topPieceSize));
    for (let i = 0; i < gridSize[0]; i++)
    {
        for (let j = 0; j < gridSize[1]; j++)
        {
            colorRect(j*size + gridOffset[1], i*size + gridOffset[0], size, size, colors[1], colors[0])
            if (clickedGrid[i][j]  == 1)
            {
                colorRect(j*size + gridOffset[1], i*size + gridOffset[0], size, size, colors[0], colors[1])
                textSize = size/2;
                canvasContext.fillStyle = numberColors[grid[i][j] + 1];
                canvasContext.font = textSize.toString().concat('px roboto condensed');
                canvasContext.fillText(grid[i][j], j*size + gridOffset[1] + (0.4*size), i*size + gridOffset[0] + (0.7*size));
            }
            else if (clickedGrid[i][j]  == 2)
            {
                colorRect(j*size + gridOffset[1], i*size + gridOffset[0], size, size, "#e5383b", "#a4161a");
            }
            if (Math.floor((mousePos[0] - gridOffset[0]) / size)  == i && Math.floor((mousePos[1] - gridOffset[1]) / size) == j)
            {
                canvasContext.globalAlpha = 0.2;
                colorRect(j*size + gridOffset[1], i*size + gridOffset[0], size, size, "#ffffff", "#ffffff");
                canvasContext.globalAlpha = 1;
            }
        }
    }

    canvasContext.fillStyle = "black";
    canvasContext.fillRect(gridOffset[1], gridSize[0]*size + gridOffset[0], gridSize[1]*size, Math.ceil(size*0.1));
    canvasContext.fillRect(gridSize[1]*size + gridOffset[1], gridOffset[0], Math.ceil(size*0.1), gridSize[0]*size + Math.ceil(size*0.1));

    if (firstClick)
    {
        if (won)
        {
            canvasContext.textAlign = "center";
            canvasContext.fillStyle = "white";
            canvasContext.font = (gridSize[1]*size * 0.1).toString().concat('px roboto condensed');
            canvasContext.fillText("You Won!", (0.5*size*gridSize[1]) + gridOffset[1], (0.5*size*gridSize[0]) + (0.5*gridOffset[0]) - (gridSize[1]*size * 0.1));
            canvasContext.textAlign = "start";
        }
        else if (gameOver)
        {
            canvasContext.textAlign = "center";
            canvasContext.fillStyle = "white";
            canvasContext.font = (gridSize[1]*size * 0.1).toString().concat('px roboto condensed');
            canvasContext.fillText("You Lost :(", (0.5*size*gridSize[1]) + gridOffset[1], (0.5*size*gridSize[0]) + (0.5*gridOffset[0]) - (gridSize[1]*size * 0.1));
            canvasContext.textAlign = "start";
        }
        canvasContext.textAlign = "center";
        canvasContext.fillStyle = "white";
        canvasContext.font = (gridSize[1]*size * 0.1).toString().concat('px roboto condensed');
        canvasContext.fillText("Click Anywhere to start", (0.5*size*gridSize[1]) + gridOffset[1], (0.5*size*gridSize[0]) + (0.5*gridOffset[0]));
        canvasContext.textAlign = "start";
    }

    window.requestAnimationFrame(draw);
}

init();

function colorRect(leftX, topY, width, height, colorOut, colorIn)
{
    canvasContext.fillStyle = "black";
    canvasContext.fillRect(leftX, topY, width, height);
    canvasContext.fillStyle = colorOut;
    canvasContext.fillRect(leftX + Math.ceil(size*0.05), topY + Math.ceil(size*0.05), width - Math.ceil(size*0.1), height - Math.ceil(size*0.1));
    canvasContext.fillStyle = colorIn;
    canvasContext.fillRect(leftX + Math.ceil(size*0.1), topY + Math.ceil(size*0.1), width, height);
}
function colorRectTop(leftX, topY, width, height, colorOut)
{
    canvasContext.fillStyle = "black";
    canvasContext.fillRect(leftX, topY, width, height);
    canvasContext.fillStyle = colorOut;
    canvasContext.fillRect(leftX + Math.ceil(size*0.05), topY + Math.ceil(size*0.05), width - Math.ceil(size*0.1), height - Math.ceil(size*0.1));
}

function colorRectInidicator(leftX, topY, width, height, colorOut, colorIn)
{
    canvasContext.fillStyle = colorOut;
    canvasContext.fillRect(leftX + Math.ceil(size*0.05), topY + Math.ceil(size*0.05), width - Math.ceil(size*0.1), height - Math.ceil(size*0.1));
    canvasContext.fillStyle = colorIn;
    canvasContext.fillRect(leftX + Math.ceil(size*0.1), topY + Math.ceil(size*0.1), width*0.9, height*0.9);
}

function makeGrid()
{
    numberBombs = 0;
    numberFlags = 0;
    timer = 0;
    grid = [];
    clickedGrid = [];
    for (let i = 0; i < gridSize[0]; i++)
    {
        let temp = [];
        let temp1 = [];
        for (let j = 0; j < gridSize[1]; j++)
        {
            if (bombProbability > Math.random())
            {
                temp.push(-1);
                numberBombs++;
            }
            else
            {
                temp.push(0);
            }
            temp1.push(0);
        }
        clickedGrid.push(temp1);
        grid.push(temp);
    }
    if (!firstClick)
    {
        for (let i = clicked[0]-Math.max(randomInt(Math.round(gridSize[0] / 4)), Math.round(gridSize[0] / 8), 1); i < clicked[0]+Math.max(randomInt(Math.round(gridSize[0] / 4)), Math.round(gridSize[0] / 8), 2); i++)
        {
            for (let j = clicked[1]-Math.max(randomInt(Math.round(gridSize[1] / 4)), 1); j < clicked[1]+Math.max(randomInt(Math.round(gridSize[1] / 4)), 2); j++)
            {
                if (i < gridSize[0] && i >= 0 && j < gridSize[1] && j >= 0)
                {
                    if (grid[i][j] == -1)
                    {
                        numberBombs--;
                    }
                    grid[i][j] = 0;
                    clickedGrid[i][j] = 1;
                }
            }
        }
    }

    for (let i = 0; i < gridSize[0]; i++)
    {
        for (let j = 0; j < gridSize[1]; j++)
        {
            if (grid[i][j] != -1)
            {
                for (let k = i-1; k < i+2; k++)
                {
                    for (let l = j-1; l < j+2; l++)
                    {
                        if (k < gridSize[0] && k >= 0 && l < gridSize[1] && l >= 0)
                        {
                            if (grid[k][l] == -1)
                            {
                                grid[i][j]++;
                            }
                        }
                    }
                }
            }
            
        }
    }
    openUpGrid();
    if (firstClick)
    {
        numberBombs = "";
    }
    else if (numberBombs == 0)
    {
        makeGrid();
    }
}

function openUpGrid()
{
    for (let i = 0; i < gridSize[0]; i++)
    {
        for (let j = 0; j < gridSize[1]; j++)
        {
            if (clickedGrid[i][j] == 1 && grid[i][j] == 0)
            {
                for (let k = i-1; k < i+2; k++)
                {
                    for (let l = j-1; l < j+2; l++)
                    {
                        if (k < gridSize[0] && k >= 0 && l < gridSize[1] && l >= 0 && clickedGrid[k][l] != 1)
                        {
                            clickedGrid[k][l] = 1;
                            openUpGrid();
                        }
                    }
                }
            }
            
        }
    }
}

function randomInt(max)
{
    return Math.floor(Math.random() * Math.floor(max))
}

let spaceKeyDown = false;

function keyUp(evt)
{
    switch(evt.keyCode)
    {
        case 32:
            spaceKeyDown = false;

    }
    
}

let marked = [0, 0, false];
function keyPressed(evt)
{   

    switch(evt.keyCode)
    {
        case 32:
            if (!spaceKeyDown)
            {  
                flag = !flag;
                console.log(flag)
                spaceKeyDown = true;
            }
            break
    }
}