import React, { useState, useRef, useEffect } from "react";
import { Card, Row, Col, Form, Collapse, Button } from "react-bootstrap";
import { FaTrashAlt, FaBell, FaBellSlash } from "react-icons/fa";
import "../tooltip";
import "../base.css";
import DueOverlay from "../DueOverlay";
import "./TodoItem.css";
import { logToMessage } from "../../utils/Logger";

function TodoItem({ task, onDelete, onUpdateTask }) {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newText, setNewText] = useState(task.text || "");
  const [newDescription, setNewDescription] = useState(task.description || "");
  const [isChecked, setIsChecked] = useState(task.completed ?? false);
  const [hasReminder, setHasReminder] = useState(task.hasReminder || false);
  const [dueDate, setDueDate] = useState(task.dueDate || null);
  const [showDueOverlay, setShowDueOverlay] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });

  const bellButtonRef = useRef(null);
  const dueDateRef = useRef(null);
  const cardRef = useRef(null);
  const longPressTimer = useRef(null);

  useEffect(() => {
    if (newText !== task.text) setNewText(task.text || "");
    if (newDescription !== task.description) setNewDescription(task.description || "");
    if (hasReminder !== task.hasReminder) setHasReminder(task.hasReminder || false);
    if (dueDate !== task.dueDate) {
      const parsedDueDate = task.dueDate ? new Date(task.dueDate) : null;
      setDueDate(parsedDueDate && !isNaN(parsedDueDate.getTime()) ? parsedDueDate.toISOString() : null);
    }
    const taskCompleted = task.completed ?? false;
    if (isChecked !== taskCompleted) {
      logToMessage(0,`TodoItem ${task.id} - Setting isChecked to: ${taskCompleted}`);
      setIsChecked(taskCompleted);
    }
  }, [task]);

  const handleKeyPress = (event, saveFunction) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveFunction();
    }
  };

  const saveTitle = () => {
    setIsEditing(false);
    if (newText.trim() === "") {
      setNewText(task.text);
      return;
    }
    if (typeof onUpdateTask !== "function") {
      console.error(`TodoItem ${task.id} - onUpdateTask is not a function! Current value:`, onUpdateTask);
      return;
    }
    onUpdateTask(task.id, newText.trim(), newDescription, hasReminder, dueDate, isChecked);
  };

  const saveDescription = () => {
    setIsEditingDescription(false);
    if (typeof onUpdateTask !== "function") {
      console.error(`TodoItem ${task.id} - onUpdateTask is not a function! Current value:`, onUpdateTask);
      return;
    }
    onUpdateTask(task.id, newText, newDescription.trim(), hasReminder, dueDate, isChecked);
  };

  const handleCheckboxChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    if (typeof onUpdateTask !== "function") {
      console.error(`TodoItem ${task.id} - onUpdateTask is not a function! Current value:`, onUpdateTask);
      return;
    }
    onUpdateTask(task.id, newText, newDescription, hasReminder, dueDate, newCheckedState);
  };

  const handleReminderClick = (e) => {
    e.stopPropagation();
    setHasReminder(!hasReminder);
    if (typeof onUpdateTask !== "function") {
      console.error(`TodoItem ${task.id} - onUpdateTask is not a function! Current value:`, onUpdateTask);
      return;
    }
    onUpdateTask(task.id, newText, newDescription, !hasReminder, dueDate, isChecked);
  };

  const handleDueDateMouseDown = (e) => {
    e.stopPropagation();
    longPressTimer.current = setTimeout(() => {
      setShowDueOverlay(false);
    }, 500);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    logToMessage(0,"Delete clicked, task id:", task.id);
    setTimeout(() => {
      onDelete(task.id);
    }, 250);
  };

  const handleDueDateMouseUp = (e) => {
    e.stopPropagation();
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      if (dueDateRef.current) {
        const rect = dueDateRef.current.getBoundingClientRect();
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
    let newDueDate = null;
    if (preset && preset.time) {
      const parsedDate = new Date(preset.time);
      if (!isNaN(parsedDate.getTime())) {
        newDueDate = parsedDate.toISOString();
      }
    }
    setDueDate(newDueDate);
    setShowDueOverlay(false);
    if (typeof onUpdateTask !== "function") {
      console.error(`TodoItem ${task.id} - onUpdateTask is not a function! Current value:`, onUpdateTask);
      return;
    }
    onUpdateTask(task.id, newText, newDescription, hasReminder, newDueDate, isChecked);
  };

  const renderReminderIcon = () => {
    return (
      <Button
        ref={bellButtonRef}
        variant="link"
        onClick={handleReminderClick}
        className="reminder-btn"
        data-testid="reminder-button"

      >
        {hasReminder ? (
          <FaBell
            className="reminder-icon reminder-on"
            data-tooltip="Reminder on"
            data-tooltip-position="top"
            style={{ width: "24px", height: "24px" }}
          />
        ) : (
          <FaBellSlash
            className="reminder-icon reminder-off"
            data-tooltip="No Reminder"
            data-tooltip-position="top"
            style={{ width: "24px", height: "24px" }}
          />
        )}
      </Button>
    );
  };

  const renderDueDate = () => {
    const formatDateTime = (date) => {
      if (!date) return "No Due Date";
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
      <div
        ref={dueDateRef}
        className={`due-date-text ${!dueDate ? "no-due-date" : new Date(dueDate) < new Date() ? "overdue" : "due-date-set"}`}
        onMouseDown={handleDueDateMouseDown}
        onMouseUp={handleDueDateMouseUp}
        data-tooltip="Due Date"
        data-tooltip-position="top"
        data-testid="due-date"
      >
        {formatDateTime(dueDate)}
      </div>
    );
  };

  return (
    <Card
      ref={cardRef}
      className={`task-card ${isDescriptionVisible || isHovering || isEditingDescription ? "highlighted-border" : "default-border"}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        if (!isEditingDescription) {
          setIsHovering(false);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isEditingDescription) {
          setIsDescriptionVisible(!isDescriptionVisible);
        }
      }}
    >
      <Card.Body>
        <Row className="align-items-center">
          <Col xs="auto">
            <Form.Check
              type="checkbox"
              onChange={handleCheckboxChange}
              checked={isChecked}
              className="custom-checkbox"
              style={{ transform: "scale(1.5)", marginRight: "7px" }}
            />
          </Col>
          <Col>
            {isEditing ? (
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => handleKeyPress(e, saveTitle)}
                autoFocus
                className="edit-input"
              />
            ) : (
              <div
                className={`task-name ${isChecked ? "line-through" : ""}`}
                onDoubleClick={() => setIsEditing(true)}
              >
                {newText}
              </div>
            )}
            {renderDueDate()}
          </Col>
          <Col xs="auto" className="task-icons">
            {renderReminderIcon()}
            {showDueOverlay && (
              <DueOverlay
                onSelectPreset={handleDueDateSelect}
                targetPosition={overlayPosition}
                onClose={() => setShowDueOverlay(false)}
                bellButtonRef={bellButtonRef}
                cardRef={cardRef}
                targetRef={dueDateRef}
              />
            )}
            <Button
              variant="link"
              onClick={handleDelete}
              className="delete-btn"
              data-testid="delete-button"
              aria-label="delete"
            >
              <FaTrashAlt data-tooltip="Delete" data-tooltip-position="top" style={{ width: "20px", height: "20px" }} />
            </Button>
          </Col>
        </Row>

        <Collapse in={isDescriptionVisible || isHovering || isEditingDescription}>
          <div className="mt-2">
            {isEditingDescription ? (
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onBlur={saveDescription}
                onKeyDown={(e) => handleKeyPress(e, saveDescription)}
                autoFocus
                className="edit-description"
              />
            ) : (
              <Card.Text className="description-text" onDoubleClick={() => setIsEditingDescription(true)}>
                {newDescription || "No description"}
              </Card.Text>
            )}
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
}

export default TodoItem;