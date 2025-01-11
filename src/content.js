chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "addTask" && message.text) {
      useTodoList().addTask(message.text);
    }
  });
  