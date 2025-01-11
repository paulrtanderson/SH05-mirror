import React, { useEffect } from 'react';
import TaskSection from '../TaskSection/TaskSection';
import { useTodoList } from "../../hooks/useTodoList/useTodoList";

function Sidebar() {
  const { tasks, addTask } = useTodoList();

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Received message in Sidebar:", message);
      if (message.action === "addTask" && message.text) {
        addTask(message.text);
        sendResponse({ status: "Task added successfully" });
      }
    });
  }, [addTask]);

  return (
    <div className="sidebar container p-3">
      <TaskSection />
    </div>
  );
}

export default Sidebar;