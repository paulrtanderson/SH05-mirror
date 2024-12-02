import React, { useState, useRef } from "react";
import "./InputBar.css";
import { FaTrash, FaBell, FaEdit } from "react-icons/fa";

function InputBar({ onAddTask }) {
  const getCurrentDate = () => {
    return getFormattedDate(new Date());
  };
  const getCurrentTime = () => {
    return getFormattedTime(new Date());
  };
  const getFormattedTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0"); // Format: HH
    const minutes = date.getMinutes().toString().padStart(2, "0"); // Format: MM
    return `${hours}:${minutes}`; // Format: HH:MM
  };
  const getFormattedDate = (date) => {
    return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  };
  const getFutureDate = (daysAhead) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return getFormattedDate(date);
  };
  const getEndOfWeekDate = () => {
    const today = new Date();
    const daysToSunday = 7 - today.getDay(); // Days until Sunday
    const endOfWeek = new Date(today.setDate(today.getDate() + daysToSunday));
    return getFormattedDate(endOfWeek);
  };

  const [taskText, setTaskText] = useState("");
  const [dueDate, setDueDate] = useState(getCurrentDate);
  const [dueTime, setDueTime] = useState(getCurrentTime);
  const [description, setDescription] = useState("");
  const [isReminder, setIsReminder] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState("");

  const inputRef = useRef(null);
  const descriptionRef = useRef(null);

  const handleAdd = () => {
    if (taskText.trim() != "") {
      onAddTask(taskText, dueDate, dueTime, description, isReminder);
      setTaskText("");
      setDescription("");
      setIsReminder(true);
      if (descriptionRef.current) {
        descriptionRef.current.style.height = "auto";
      }
    }
  };

  const presets = [
    {
      label: "Today",
      value: `${getFutureDate(0)} 17:00`, // End of today
    },
    {
      label: "Tomorrow",
      value: `${getFutureDate(1)} 17:00`, // End of tomorrow
    },
    {
      label: "This Week",
      value: `${getEndOfWeekDate()} 17:00`, // End of the week
    },
  ];

  const focusTextInput = (event) => {
    if (event.detail !== 0 && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 0);
    }
  };

  const handlePresetChange = (value) => {
    setSelectedPreset(value);
    setDueDate(value.split(" ")[0]);
    setDueTime(value.split(" ")[1]);
  };

  return (
    <div className="page-border">
      <div className="input-bar task-container p-2">
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Prevent the default page reload
            handleAdd();
          }}
        >
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Task title"
            className="task-input"
            ref={inputRef}
          />

          <div className="preset-dates">
            {/* <p className="preset-title">Preset Due Dates:</p> */}
            {presets.map((preset, index) => (
              <label key={index} className="preset-date-label">
                <input
                  type="radio"
                  name="preset-due-date"
                  value={preset.value}
                  className="preset-date-input"
                  checked={selectedPreset === preset.value}
                  onChange={() => handlePresetChange(preset.value)}
                />
                <span className="preset-date-btn" onClick={focusTextInput}>
                  {preset.label}
                </span>
              </label>
            ))}
          </div>
          <textarea
            className="task-textarea"
            ref={descriptionRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            rows={1}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />
          <div className="task-controls">
            {/* Reminder Checkbox */}
            <label className="bell-checkbox" htmlFor="reminder-checkbox">
              <input
                type="checkbox"
                id="reminder-checkbox"
                checked={isReminder}
                onChange={(e) => setIsReminder(e.target.checked)}
              />
              <img
                src={
                  isReminder
                    ? `/vector_arts/checked_bell.png`
                    : `/vector_arts/bell.png`
                }
                alt="Reminder"
              />
            </label>

            <button
              className="change-btn"
              type="submit"
              onClick={focusTextInput}
            >
              <img
                src="/vector_arts/add.svg"
                alt="Add Icon"
                className="btn-icon"
              />
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InputBar;
