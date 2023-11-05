let isMouseDown = true;
let startTime = 0;
let solving = false;
let canSolve = false;
let solveTime = 0;
let solveStartTime = 0;
let solves = loadTimesFromLocalStorage();
let shouldSwitch = false;
let driveLink = "https://drive.google.com/file/d/1g-g-SBjXSuXiSOZxI1_FCnw0AgRvTmXD/view?usp=sharing";
let cloudData = []

let view = 'solving';

// document.addEventListener('mousedown', mouseDown);
// document.addEventListener('mouseup', mouseUp);
document.addEventListener('touchstart', mouseDown);
document.addEventListener('touchend', mouseUp);
setInterval(update, 100);

function getCloudJson()
{
    fetch(driveLink)
    .then(response => response.json())
    .then(data => {
        // Use the data from the JSON file here
        console.log(data);
        cloudData = data;
    })
    .catch(error => console.error(error));
}

function mouseDown(e) {

    console.log('down');
    isMouseDown = true;
    if (view == 'solving')
    {
    canSolve = false;
    if (!solving)
    {
        startTime = Date.now();
        const timer = document.getElementById("timer-text");
        timer.style.color = "#FF0000";
        timer.textContent = 0;
    }
    else 
    {
        solveTime = parseFloat((Date.now() - solveStartTime ) / 1000).toFixed(2);
        console.log(solveTime);
        const timer = document.getElementById("timer-text");
        timer.textContent = solveTime;
        solving = false;
        startTime = 0;
        solves.push([solveTime, Date.now()]);
    }

}
else {
    startTime = Date.now();
}};

async function mouseUp(e) {
    isMouseDown = false;

    if (shouldSwitch)
    {
        toggleScreen();
        shouldSwitch = false
        const timer = document.getElementById("timer-text");
        timer.style.color = "#FFF";

    }

    else if (view == 'solving')
    {
    if (e.touches.length > 1)
    {
        await toggleScreen();
    }

    const timer = document.getElementById("timer-text");
    timer.style.color = "#FFFFFF";

    if (canSolve)
    {
        solving = true;
        solveStartTime = Date.now();
    }
}
};

async function toggleScreen()
{
    if (view == 'solving')
    {const firstScreenContainer = document.getElementById('timer-text-container');
    firstScreenContainer.style.opacity = 0;

    const secondScreenContainer = document.getElementById('solves-container');
    secondScreenContainer.style.opacity = 1;
    view = 'viewing'
    await setupView();
}

    else    {
        const firstScreenContainer = document.getElementById('timer-text-container');
    firstScreenContainer.style.opacity = 1;

    const secondScreenContainer = document.getElementById('solves-container');
    secondScreenContainer.style.opacity = 0;
    view = 'solving';
    };

};

function find(number)
{
    
    for (let i = 0; i < solves.length; i++) {
        if (solves[i][0] == number) {
            return solves[i]
            }
    }

    return -1;
};

function saveListToJson(list) {
    // Convert the list to a JSON string
    const json = JSON.stringify(list);

    // Create a Blob with the JSON content
    const blob = new Blob([json], { type: "application/json" });

    // Create a download link
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "solves.json";
    a.style.display = "none";

    // Append the link to the document body and trigger the click event
    document.body.appendChild(a);
    a.click();

    // Clean up by removing the link element
    document.body.removeChild(a);
}

// Function to save times to local storage
function saveTimesToLocalStorage(times) {
    localStorage.setItem('solves', JSON.stringify(times));
}

// Function to load times from local storage
function loadTimesFromLocalStorage() {
    const storedTimes = localStorage.getItem('solves');
    return storedTimes ? JSON.parse(storedTimes) : [];
}

async function setupView()
{
    saveTimesToLocalStorage(solves);
    getCloudJson();

    solves.sort((a, b) => b[1] - a[1])
    let onlySolves = [];
    for (i=0;i <  solves.length; i++)
    {
        onlySolves.push(parseFloat(solves[i][0]));
    }
    const bestText = document.getElementById('best-solve');
    const meanText = document.getElementById('mean-solve');
    const mo3Text = document.getElementById('mo3-solve');
    const ao5Text = document.getElementById('ao5-solve');
    const ao12Text = document.getElementById('ao12-solve');


    let best = 0;
    let mean = 0;
    let mo3 = 0;
    let ao5 = 0;
    let ao12 = 0;

    if (onlySolves.length > 0) {
        best = Math.min(...onlySolves);
        mean = parseFloat(onlySolves.reduce((acc, val) => acc + val, 0) / onlySolves.length).toFixed(2);
    }
if (onlySolves.length > 2) {
    mo3 = parseFloat(onlySolves.slice(-3).reduce((acc, val) => acc + val, 0) / 3).toFixed(2);
}

if (onlySolves.length > 4) {
    ao5 = parseFloat(onlySolves.slice(-5).reduce((acc, val) => acc + val, 0) / 5).toFixed(2);
}

if (onlySolves.length > 11) {
    ao12 = parseFloat(onlySolves.slice(-12).reduce((acc, val) => acc + val, 0) / 12).toFixed(2);
}
    bestText.children[1].textContent = best;
    0
    const date = Date(find(best)).split(' ');

    const date_= `${date[1]}-${date[2]}-${date[3]}`;
    bestText.children[2].textContent = date_;

    meanText.children[1].textContent = mean;
    mo3Text.children[1].textContent = mo3;
    ao5Text.children[1].textContent = ao5;
    ao12Text.children[1].textContent = ao12;

    const elementsToDelete = document.querySelectorAll('.solve');

    // 2. Iterate through and remove the selected elements
    elementsToDelete.forEach((element) => {
        element.remove();
    });

    const text = document.getElementById('solves');
    const container = document.getElementById('solves-container')


    for (let i = 0; i < solves.length; i++) {
        const solve = document.createElement('div');
        solve.classList.add('flexer'); // Remove the dot before class names
        solve.classList.add('solve'); // Remove the dot before class names
    
        const time = document.createElement('h1');
        time.textContent = solves[i][0];
    
        const date = document.createElement('h1');
        const date_value = new Date(solves[i][1]);
        const date_ = `${date_value.getMonth() + 1}-${date_value.getDate()}-${date_value.getFullYear()}`;
        date.textContent = date_;
    
        // Append time and date to the solve div
        solve.appendChild(time);
        solve.appendChild(date);
        // Append the solve div to the document (or any other container element you want)
        container.appendChild(solve);
    }
}; 


function update() {
    if (isMouseDown)
    {
        if (view == 'viewing')
        {
            if (startTime > 0 && Date.now() - startTime > 1000)
            {
                console.log('switch time')
                const timer = document.getElementById("timer-text");
                timer.style.color = "#FFFF00";
                shouldSwitch = true;
            }
        }
        else if (startTime > 0 && Date.now() - startTime > 3000)
        {
            console.log('switch time')
            const timer = document.getElementById("timer-text");
            timer.style.color = "#FFFF00";
            shouldSwitch = true;
        }
        else if (startTime > 0 && Date.now() - startTime > 500)
        {
            const timer = document.getElementById("timer-text");
            timer.style.color = "#00FF00";
            canSolve = true;
        }
        
    };

    if (solving)
    {
        const timer = document.getElementById("timer-text");
        timer.textContent = parseInt((Date.now() - solveStartTime)/1000);
    }
};