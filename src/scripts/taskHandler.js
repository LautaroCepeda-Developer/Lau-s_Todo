const storageKey = 'tasks-storage';
const taskContainer = document.querySelector('ul');

const taskCreationButton = document.querySelector('.task-creation-button');
const taskCreationInput = document.querySelector('.task-creation-input');

taskCreationButton.addEventListener('click', () => {
    // Avoid empty task creation
    if (taskCreationInput.value.length < 1) return;

    // Add the task to the tasks storage
    addTask({ taskTitle: taskCreationInput.value });

    // Clear the task creation input
    taskCreationInput.value = '';
});

taskCreationInput.addEventListener('keydown', (evt) => {
    // Submit the task creation on Enter key
    if (evt.key === 'Enter') {
        taskCreationButton.click();
    }
});

function getTasks() {
    // Get the tasks from local storage
    const tasks = localStorage.getItem(storageKey);

    // Check if the tasks storage exists
    if (tasks) {
        // Return the tasks from local storage
        return JSON.parse(tasks);
    }

    // If the tasks storage doesn't exist, create an empty array and save it to local storage
    localStorage.setItem(storageKey, JSON.stringify([]));

    // Return an empty array
    return [];
}

function toggleTaskState(taskElement) {
    // Toggle the state of the task
    taskElement.classList.toggle('finished');

    // Update the state of the task
    if (taskElement.classList.contains('finished')) {
        taskElement.dataset.state = 'finished';
    } else {
        taskElement.dataset.state = 'active';
    }

    // Get the tasks from local storage
    const tasksStorage = getTasks();

    // Find the index of the task in the tasks storage
    const taskIndex = tasksStorage.findIndex(
        (task) => task.id === taskElement.id
    );

    // Update the state of the task in the tasks storage
    tasksStorage[taskIndex].state = taskElement.dataset.state;

    // Update the tasks in local storage
    localStorage.setItem(storageKey, JSON.stringify(tasksStorage));
}

function updateAllTasksInDOM() {
    // Clean the task container to avoid duplicated tasks
    taskContainer.innerHTML = '';

    // Get the tasks from local storage
    const tasks = getTasks();

    // Guard function to avoid unnecessary processing
    if (tasks.length === 0) return;

    // Create a document fragment to store the tasks
    const fragment = document.createDocumentFragment();

    // Iterate over the tasks stored in local storage
    tasks.forEach((task) => {
        // Create a new task element
        const taskElement = document.createElement('li');
        taskElement.innerHTML = `
                <p class="task-text" title="Task Text" aria-labelledby="Task Text">${task.title}</p>
                <div class="task-delete-button-container" title="Delete Task" aria-label="Delete Task">
                    <img src="/Cross.svg" alt="Delete Task Button" class="task-delete-button" width="30" draggable="false">
                </div>
            `;
        // Set the id of the task
        taskElement.setAttribute('id', task.id);

        // Set the state of the task
        taskElement.setAttribute('data-state', task.state);

        if (task.state === 'finished') {
            taskElement.classList.add('finished');
        }

        // Add the class to the task element
        taskElement.classList.add('task');

        // Task delete listener
        taskElement.querySelector('img').addEventListener('click', (evt) => {
            evt.stopPropagation();
            deleteTask(taskElement);
        });

        // Task state change listener
        taskElement.addEventListener('click', (evt) => {
            evt.stopPropagation();
            toggleTaskState(taskElement);
        });

        // Add the task element to the fragment
        fragment.appendChild(taskElement);
    });

    // Add the fragment to the task container
    taskContainer.appendChild(fragment);
}

function generateId() {
    // Get all tasks from local storage
    const tasks = getTasks();

    // Generate a unique id
    let generatedId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    // Ensure the id is unique
    while (tasks.find((task) => task.id === generatedId)) {
        // Generate a new id if it's not unique
        generatedId =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    // Return the generated id
    return generatedId;
}

function addTask({ taskTitle }) {
    // Get all tasks from local storage
    const tasks = getTasks();

    // Create the new task object
    const newTask = {
        id: generateId(),
        title: taskTitle,
        state: 'active',
    };

    // Add the new task to the tasks array
    tasks.push(newTask);

    // Update the tasks in local storage
    localStorage.setItem(storageKey, JSON.stringify(tasks));

    // Create a single task element
    createTaskInDOM({
        taskId: newTask.id,
        taskText: newTask.title,
        taskState: newTask.state,
    });
}

function createTaskInDOM({ taskId, taskText, taskState }) {
    // Create a SINGLE task element
    const taskElement = document.createElement('li');
    taskElement.innerHTML = `
                <p class="task-text" title="Task Text" aria-labelledby="Task Text">${taskText}</p>
                <div class="task-delete-button-container" title="Delete Task" aria-label="Delete Task">
                    <img src="/Cross.svg" alt="Delete Task Button" class="task-delete-button" width="30" draggable="false">
                </div>
            `;
    // Set the id of the task
    taskElement.setAttribute('id', taskId);

    // Set the state of the task
    taskElement.setAttribute('data-state', taskState);

    // Add the class to the task element
    taskElement.classList.add('task');

    // Task delete listener
    taskElement.querySelector('img').addEventListener('click', (evt) => {
        evt.stopPropagation();
        deleteTask(taskElement);
    });

    // Task state change listener
    taskElement.addEventListener('click', (evt) => {
        evt.stopPropagation();
        toggleTaskState(taskElement);
    });

    taskContainer.appendChild(taskElement);
}

// Variable to alternate between left and right animation directions
let transitionDirection = 'right';

function deleteTask(element) {
    // Get all tasks from local storage
    const tasks = getTasks();

    // Get the task id from the element
    const taskId = element.getAttribute('id');

    // Find the task index in the tasks array
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    // Remove the task from the tasks array
    tasks.splice(taskIndex, 1);

    // Update the tasks in local storage
    localStorage.setItem(storageKey, JSON.stringify(tasks));

    // Animate the deletion of the task
    if (transitionDirection === 'right') {
        element.style.transform = 'translateX(150%)';
        transitionDirection = 'left';
    } else {
        element.style.transform = 'translateX(-150%)';
        transitionDirection = 'right';
    }

    // Removing the task element from the DOM after delete animation completes
    setTimeout(() => {
        // Delete the task element from the DOM
        element.remove();
    }, 300);
}

// Initial task load
updateAllTasksInDOM();

// Listen for storage changes (real-time task updates)
window.addEventListener('storage', (evt) => {
    // If the storage key is updated, update the tasks in the DOM
    if (evt.key === storageKey) {
        updateAllTasksInDOM();
    }
});
