function createTask(name) {
    let count = 0;

    return {
        run() {
            count++;

            return new Promise((resolve, reject) => {
                const loadingTime = Math.floor(Math.random() * 1501) + 500;

                console.log(name + " started");
                console.log("Loading time:", loadingTime + " ms");

                setTimeout(() => {
                    const success = Math.random() > 0.3;

                    if (success) {
                        console.log(name + " completed");

                        resolve({
                            name: name,
                            status: "Completed",
                            time: loadingTime
                        });
                    } else {
                        console.log(name + " failed");

                        reject({
                            name: name,
                            status: "Failed",
                            time: loadingTime
                        });
                    }
                }, loadingTime);
            });
        },

        getCount() {
            return count;
        },

        reset() {
            count = 0;
        }
    };
}


const task1 = createTask("Load Users");
const task2 = createTask("Load Posts");
const task3 = createTask("Load Comments");

const tasksContainer = document.getElementById("tasks");

function showTask(task, result) {
    const taskElement = document.createElement("div");

    taskElement.className = "task";

    taskElement.innerHTML = `
        <strong>${result.name}</strong>
        <p>Status: ${result.status}</p>
        <p>Count: ${task.getCount()}</p>
        <p>Loading time: ${result.time} ms</p>
    `;

    tasksContainer.appendChild(taskElement);
}

async function runTask(task) {
    try {
        const result = await task.run();

        showTask(task, result);
    } catch (error) {
        showTask(task, error);
    }
}

const runAllButton = document.getElementById("runAllButton");

runAllButton.addEventListener("click", async () => {
    tasksContainer.innerHTML = "";

    document.getElementById("allFinished").textContent = "";

    await Promise.allSettled([
        runTask(task1),
        runTask(task2),
        runTask(task3)
    ]);

    document.getElementById("allFinished").textContent =
        "All tasks finished";
});

async function runSequential() {
    task1.reset();
    task2.reset();
    task3.reset();

    const start = performance.now();

    try {
        await task1.run();
    } catch (error) {
        console.log("Load Users failed");
    }

    try {
        await task2.run();
    } catch (error) {
        console.log("Load Posts failed");
    }

    try {
        await task3.run();
    } catch (error) {
        console.log("Load Comments failed");
    }

    const end = performance.now();

    const time = Math.round(end - start);

    document.getElementById("sequentialTime").textContent =
        time + " ms";
}

async function runConcurrent() {
    task1.reset();
    task2.reset();
    task3.reset();

    const start = performance.now();

    await Promise.allSettled([
        task1.run(),
        task2.run(),
        task3.run()
    ]);

    const end = performance.now();

    const time = Math.round(end - start);

    document.getElementById("concurrentTime").textContent =
        time + " ms";
}

document.getElementById("sequentialButton")
    .addEventListener("click", runSequential);

document.getElementById("concurrentButton")
    .addEventListener("click", runConcurrent);

async function eventLoopDemo() {
    console.log("1. Start");

    Promise.resolve().then(() => {
        console.log("9. Promise 3");
        Promise.resolve().then(() => {
            console.log("10. Promise child of 3");
        });
    }); 

    setTimeout(() => {
        console.log("2. Timer 1");
    }, 0);

    Promise.resolve().then(() => {
        console.log("3. Promise 1");
    });

    async function asyncFunction() {
        console.log("4. Async function start");

        await Promise.resolve();

        console.log("5. Async function after await");
    }

    asyncFunction();

    setTimeout(() => {
        console.log("6. Timer 2");
    }, 0);

    Promise.resolve().then(() => {
        console.log("7. Promise 2");
    });

    console.log("8. End");
}


document.getElementById("eventLoopButton")
    .addEventListener("click", eventLoopDemo);