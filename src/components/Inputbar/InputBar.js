import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaBellSlash, FaCalendarAlt } from "react-icons/fa";
import "../tooltip";
import "../base.css";
import "./InputBar.css";
import DueOverlay1 from "../DueOverlay1"; 
import "react-datetime-picker/dist/DateTimePicker.css";

function InputBar({ onAddTask }) {
  const [taskText, setTaskText] = useState("");
  const [hasReminder, setHasReminder] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState(null);
  const [description, setDescription] = useState("");
  const [showDueOverlay, setShowDueOverlay] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });

  const bellButtonRef = useRef(null);
  const dueDateButtonRef = useRef(null);
  const longPressTimer = useRef(null);

  useEffect(() => {
    chrome.storage.local.get(["selectedText"], (result) => {
      if (result.selectedText) {
        setTaskText(result.selectedText);
        chrome.storage.local.remove("selectedText");
      }
    });

    const handleStorageChange = (changes, area) => {
      if (area === "local" && changes.selectedText?.newValue) {
        setTaskText(changes.selectedText.newValue);
        chrome.storage.local.remove("selectedText");
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const handleAdd = () => {
    if (taskText.trim() !== "") {
      try {
        let dueDate = selectedDueDate || null;
        if (dueDate) {
          const parsedDueDate = new Date(dueDate);
          if (isNaN(parsedDueDate.getTime())) {
            dueDate = null;
          } else {
            dueDate = parsedDueDate.toISOString();
          }
        }

        onAddTask(taskText, hasReminder, description, dueDate);

        setTaskText("");
        setDescription("");
        setHasReminder(false);
        setSelectedDueDate(null);
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && taskText.trim() !== "") {
        e.preventDefault();
        handleAdd();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [taskText, hasReminder, description, selectedDueDate]);

  const handleReminderClick = (event) => {
    event.stopPropagation();
    setHasReminder(!hasReminder);
  };

  const handleDueDateMouseDown = (e) => {
    e.stopPropagation();
    longPressTimer.current = setTimeout(() => {
      setShowDueOverlay(false);
    }, 500);
  };

  const handleDueDateMouseUp = (e) => {
    e.stopPropagation();
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      if (dueDateButtonRef.current) {
        const rect = dueDateButtonRef.current.getBoundingClientRect();
        const newPosition = {
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        };
        
        if (showDueOverlay) {
          setShowDueOverlay(false);
        } else {
          setOverlayPosition(newPosition);
          setShowDueOverlay(true);
        }
      }
    }
  };

  const handleDueDateSelect = (preset) => {
    if (!preset || !preset.time) {
      setSelectedDueDate(null);
    } else {
      setSelectedDueDate(preset.time);
    }
    setShowDueOverlay(false);
  };

  const renderBellIcon = () => {
    return (
      <button
        ref={bellButtonRef}
        className="reminder-display"
        type="button"
        onClick={handleReminderClick}
        data-tooltip={hasReminder ? "Reminder on" : "Reminder off"}
        aria-label={hasReminder ? "Reminder on" : "Reminder off"}
      >
        {hasReminder ? (
          <FaBell className="bell-icon active" />
        ) : (
          <FaBellSlash className="bell-icon no-reminder" />
        )}
      </button>
    );
  };

  const renderCalendarIconWithDate = () => {
    const formatDateTime = (date) => {
      if (!date) return null;
      const dueDate = new Date(date);
      if (isNaN(dueDate.getTime())) return "Invalid Date";

      const currentYear = new Date().getFullYear();
      const dueYear = dueDate.getFullYear();

      return dueDate.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).replace(/,/, "") + (dueYear !== currentYear ? `, ${dueYear}` : "");
    };

    return (
      <div className="due-date-wrapper">
        <FaCalendarAlt
          data-tooltip="Due date"
          data-tooltip-position="top"
          className={`calendar-icon ${!selectedDueDate ? "no-due-date-icon" : ""}`}
        />
        {selectedDueDate && <span className="due-date">{formatDateTime(selectedDueDate)}</span>}
      </div>
    );
  };

  return (
    <div className="page-border">
      <div className="input-bar task-container p-2">
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Add a Task"
            className="task-input"
          />

          <textarea
            className="task-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            rows={1}
          />

          <div className="task-controls">
            {selectedDueDate && (
              <div className="reminder-wrapper full-width" style={{ position: "relative" }}>
                {renderBellIcon()}
              </div>
            )}

            <div className="task-controls-row">
              {!selectedDueDate && (
                <div className="reminder-wrapper" style={{ position: "relative" }}>
                  {renderBellIcon()}
                </div>
              )}

              <div className="due-date-wrapper" style={{ position: "relative" }}>
                <button
                  ref={dueDateButtonRef}
                  className="due-date-display"
                  type="button"
                  onMouseDown={handleDueDateMouseDown}
                  onMouseUp={handleDueDateMouseUp}
                  data-testid="due-date-button"
                >
                  {renderCalendarIconWithDate()}
                </button>
                {showDueOverlay && (
                  <DueOverlay1
                    onSelectPreset={handleDueDateSelect}
                    targetPosition={overlayPosition}
                    onClose={() => setShowDueOverlay(false)}
                    bellButtonRef={bellButtonRef}
                  />
                )}
              </div>

              <button className="change-btn" type="button" onClick={handleAdd}>
                Add Task
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InputBar;