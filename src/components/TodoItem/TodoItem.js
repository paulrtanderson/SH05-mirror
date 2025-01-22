import React, { useState, useRef, useEffect } from "react";
import { Card, Row, Col, Form, Collapse, Button } from "react-bootstrap";
import "./TodoItem.css";
import { FaTrashAlt } from "react-icons/fa";

const isOverdue = (dueDate) => new Date(dueDate) < new Date();

const formatDate = (date) => {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  }
};

function TodoItem({ task, onDelete, onToggleReminder, onUpdateTask }) {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState(task.text);
  const [isChecked, setIsChecked] = useState(false);

  const cardRef = useRef(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setNewText(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdateTask(task.id, newText);
  };

  const handleClickOutside = (event) => {
    if (cardRef.current && !cardRef.current.contains(event.target)) {
      setIsDescriptionVisible(false);
    }
  };

  const handleDescriptionToggle = () => {
    setIsDescriptionVisible(true);
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <Card
      ref={cardRef}
      className={`mt-2 ${
        isDescriptionVisible ? "highlighted-border" : "default-border"
      }`}
      onClick={handleDescriptionToggle}
      style={{
        cursor: "pointer",
      }}
    >
      <Card.Body style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
        <Row>
          <Col xs="auto" className="d-flex align-items-center">
            <Form.Check
              type="checkbox"
              onChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
              checked={isChecked}
              className="custom-checkbox"
              style={{
                transform: "scale(1.5)",
                cursor: "pointer",
              }}
            />
          </Col>
          <Col>
            <Row>
              <Col
                xs
                className="d-flex align-items-center"
                style={{ wordBreak: "break-word" }}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={newText}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoFocus
                    style={{
                      border: "none",
                      background: "none",
                      width: "100%",
                      padding: 0,
                      margin: 0,
                      outline: "none",
                      boxShadow: "none",
                    }}
                  />
                ) : (
                  <div
                    onDoubleClick={handleDoubleClick}
                    style={{
                      textDecoration: isChecked ? "line-through" : "none",
                    }}
                  >
                    {task.text}
                  </div>
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                {task.due && (
                  <div
                    className={`due-date ${
                      isOverdue(task.due) ? "overdue" : ""
                    }`}
                  >
                    {formatDate(new Date(task.due))}
                  </div>
                )}
              </Col>
            </Row>
          </Col>

          {/* Bell Icon */}
          <Col xs="auto" className="d-flex align-items-center">
            <Button
              variant="link"
              onClick={(e) => {
                e.stopPropagation(); // Prevent description toggle
                onToggleReminder(task.id);
              }}
              style={{ padding: 0 }}
              aria-label="Toggle Reminder"
            >
              <img
                src={
                  task.reminder
                    ? `/vector_arts/checked_bell.png`
                    : `/vector_arts/bell.png`
                }
                alt="Reminder"
                style={{ width: "20px", height: "20px" }}
              />
            </Button>
          </Col>
          <Col xs="auto" className="d-flex align-items-center">
            <Button
              variant="link"
              onClick={(e) => {
                e.stopPropagation(); // Prevent description toggle
                onDelete(task.id);
              }}
              style={{ padding: 0 }}
            >
              <FaTrashAlt
                style={{
                  width: "20px",
                  height: "20px",
                  color: "#dc3545",
                }}
                aria-label="Delete Task"
              />
            </Button>
          </Col>
        </Row>
        {/* Collapsible Description */}
        {task.description && (
          <Collapse in={isDescriptionVisible}>
            <div className="mt-2">
              <Card.Text style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                {task.description}
              </Card.Text>
            </div>
          </Collapse>
        )}
      </Card.Body>
    </Card>
  );
}

export default TodoItem;
