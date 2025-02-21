import React, { useEffect } from 'react';
import { useTodoList } from '../../hooks/useTodoList/useTodoList';
import TodoList from '../TodoList/TodoList';
import InputBar from '../Inputbar/InputBar';
import { useState } from "react";

function TaskSection() {
    const { tasks, addTask, deleteTask, toggleReminder, updateTask, setTasks } = useTodoList();

    useEffect(() => {
        chrome.storage.local.get("taskBackup", (data) => {
            if (data.taskBackup) {
                setTasks(data.taskBackup);
                console.log("Backup: Tasks restored.");
            }
        });
    }, []);

    useEffect(() => {
        chrome.storage.local.set({ taskBackup: tasks }, () => {
            console.log("Backup: Tasks saved.");
        });
    }, [tasks]);

    return (
        <div data-testid="task-section">
            <InputBar onAddTask={addTask} />
            <TodoList tasks={tasks} onDeleteTask={deleteTask} onToggleReminder={toggleReminder} onUpdateTask={updateTask}/>
        </div>
    );
}

export default TaskSection;
