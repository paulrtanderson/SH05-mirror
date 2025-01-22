import { useState, useEffect} from 'react';

export function useTodoList() {
    const [tasks, setTasks] = useState([]);
    const [tasksLoaded, setTasksLoaded] = useState(false);
    useEffect(() => {
        if (tasksLoaded) {
            console.log("the tasks have updated, Tasks updated:", tasks);
            saveTasks(); // Save tasks whenever `tasks` updates 
        }    
    }, [tasks,tasksLoaded]);
    
    useEffect(() => {
        loadTasks();
    }, []);

    const addTask = (taskText, dueDate='', dueTime='', description = '',reminder=false) => {
        if (taskText.trim() === '') return;

        let due = null;
        if (dueDate && dueTime) {
            // Combine dueDate and dueTime into a Date object
            due = new Date(`${dueDate}T${dueTime}`);
        }
        // description += "This is a long ish test description that should be able to be seen when the user clicks on the task"
        const newTask = {
            id: Date.now(),
            text: taskText,
            due: due,
            description:description,
            reminder:reminder
        }
        //console.log(due.toString())
        setTasks([...tasks, newTask]);
    };

    const deleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    const toggleReminder = (taskId) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, reminder: !task.reminder } : task
        ));
    };

    const updateTask = (taskId, newText) => {
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, text: newText } : task
        ));
      };

    const saveTasks = () => {
        console.log("saving tasks to chrome local storage")
        const serializedTasks = tasks.map(task => {
            // console.log("Saving task:", task); // Log each task before serialization
            return {
                ...task,
                due: task.due ? task.due.toISOString() : null, // Convert Date object to ISO string
            };
        });
        // console.log("Serialized tasks to save:", serializedTasks); // Log the serialized tasks
        chrome.storage.local.set({ tasks: serializedTasks });
    };

    const loadTasks = () => {
        
        chrome.storage.local.get(['tasks'], (result) => {
            // console.log("Loaded raw tasks from storage:", result.tasks); // Log raw loaded tasks
            if (result.tasks) {
                const deserializedTasks = result.tasks.map(task => {
                    console.log("Deserializing task:", task); // Log each task before deserialization
                    return {
                        ...task,
                        due: task.due ? new Date(task.due) : null, // Convert string back to Date
                    };
                });
                // console.log("Deserialized tasks:", deserializedTasks); // Log the deserialized tasks
                setTasks(deserializedTasks);
            }
            setTasksLoaded(true);
        });
        
    };

    return { tasks, addTask, deleteTask,toggleReminder, saveTasks, loadTasks };
}
useEffect(() => {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "addTask" && message.text) {
        addTask(message.text);
      }
    });
  }, []);
  