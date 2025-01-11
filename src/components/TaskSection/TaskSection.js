import React, { useEffect, useState } from 'react';
import { useTodoList } from '../../hooks/useTodoList/useTodoList';
import TodoList from '../TodoList/TodoList';
import InputBar from '../Inputbar/InputBar';

function TaskSection() {
  const { tasks, addTask, deleteTask, toggleReminder, saveTasks } = useTodoList();
  const [selectedText, setSelectedText] = useState(''); 

  useEffect(() => {
    const messageListener = (message) => {
      if (message.action === "addToTaskTitle" && message.text) {
        console.log("Received selected text:", message.text);
        setSelectedText(message.text);  
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener); 
    };
  }, []);

  return (
    <div className="sidebar container p-3">
      <InputBar onAddTask={addTask} taskTitle={selectedText} />  {/*  */}
      <TodoList tasks={tasks} onDeleteTask={deleteTask} onToggleReminder={toggleReminder} />
      <button onClick={saveTasks}>Save Tasks</button>
    </div>
  );
}

export default TaskSection;