# JavaScript Runtime and Async

## Project Description

This project demonstrates JavaScript closures, Promises,
async/await, setTimeout, the Call Stack and the Event Loop.

The application contains three simulated tasks:
Load Users, Load Posts, Load Comments

Each task has a status, execution count and loading time.

## Closures
The tasks are created using the `createTask()` function.
The execution counter is stored inside the function:
let count = 0;
The counter cannot be accessed directly from outside the function.

It can only be accessed through methods such as:
task.getCount();
task.reset();

Each task has its own private counter.

Promises
The run() method returns a Promise.
setTimeout() is used to simulate asynchronous loading.
Each task takes a random amount of time between 500 and 2000 milliseconds.
A task can either complete successfully or fail.

Call Stack
The Call Stack is used by JavaScript to keep track of
currently executing functions.
For example, when task.run() is called, JavaScript
executes the functions involved in the current call.
When a function finishes, it is removed from the Call Stack.

setTimeout
setTimeout() schedules a callback to run later.
JavaScript does not stop the whole program while waiting
for the timer.
This allows other JavaScript code to continue executing.

Tasks and Microtasks
A timer callback created with setTimeout() is a task.
Promise callbacks created with .then() are microtasks.
Microtasks are processed before the next task is taken
from the task queue.

Multiple Promises and Errors
The application uses Promise.allSettled() to run multiple
tasks and wait until all of them finish.
Promise.allSettled() allows the application to handle
both successful and failed tasks.
For example, one task can complete while another task fails.
The application still waits for all tasks before displaying:
All tasks finished