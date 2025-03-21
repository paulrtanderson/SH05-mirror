import React, { useState, useRef } from "react";
import { Card, Row, Col, Form, Collapse, Button, Nav } from "react-bootstrap";
import { FaRedo } from "react-icons/fa";
import { IoChevronBackOutline } from "react-icons/io5";
import "../tooltip"; // Assuming this contains the tooltip CSS logic
import "../base.css";
import "./RecoverDeletedTasks.css";

const RecoverDeletedTasks = ({
  deletedTasks = [],
  completedTasks = [],
  onRecoverDeleted,
  onRecoverCompleted,
  onBack,
}) => {
  const [activeSection, setActiveSection] = useState("completed");
  const safeDeletedTasks = Array.isArray(deletedTasks) ? deletedTasks : [];
  const safeCompletedTasks = Array.isArray(completedTasks) ? completedTasks.filter((task) => !task.hidden) : [];
  const currentItems = activeSection === "completed" ? safeCompletedTasks : safeDeletedTasks;

  const sections = {
    completed: { label: "Completed Tasks" },
    deleted: { label: "Deleted Tasks" },
  };

  const handleRecover = (index) => {
    setTimeout(() => {
      if (activeSection === "completed") {
        onRecoverCompleted(index);
      } else {
        onRecoverDeleted(index);
      }
    }, 500);
  };

  const formatDateTime = (date) => {
    if (!date) return "No Due Date";
    const dueDate = new Date(date);
    if (isNaN(dueDate.getTime())) return "Invalid Date";
    return dueDate.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).replace(/,/, "");
  };

  const RecoverTaskItem = ({ task, index }) => {
    const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const dueDateRef = useRef(null);

    const renderDueDate = () => (
      <div
        ref={dueDateRef}
        className={`due-date-text ${
          !task.dueDate
            ? "no-due-date"
            : new Date(task.dueDate) < new Date()
            ? "overdue"
            : "due-date-set"
        }`}
        data-tooltip="Due Date"
        data-tooltip-position="top"
      >
        {formatDateTime(task.dueDate)}
      </div>
    );

    return (
      <Card
        className={`task-card ${
          isDescriptionVisible || isHovering ? "highlighted-border" : "default-border"
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsDescriptionVisible(!isDescriptionVisible);
        }}
      >
        <Card.Body>
          <Row className="align-items-center">
            <Col xs="auto">
              <Form.Check
                type="checkbox"
                checked={task.completed ?? false}
                className="custom-checkbox"
                style={{ transform: "scale(1.5)", marginRight: "7px" }}
                disabled
              />
            </Col>
            <Col className="task-content">
              <div className={`task-name ${task.completed ? "line-through" : ""}`}>
                {task.text || "Untitled"}
              </div>
              {renderDueDate()}
            </Col>
            <Col xs="auto" className="task-icons">
              <Button
                variant="link"
                onClick={() => handleRecover(index)}
                className="recover-btn"
                data-tooltip="Recover task"
                data-tooltip-position="top"
                aria-label="recover"
                data-testid={`recover-deleted-task-${index}`}
              >
                <FaRedo style={{ width: "20px", height: "20px" }} />
              </Button>
            </Col>
          </Row>

          <Collapse in={isDescriptionVisible || isHovering}>
            <div className="mt-2">
              <Card.Text className="description-text">
                {task.description || "No description"}
              </Card.Text>
            </div>
          </Collapse>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div data-testid="recover-deleted-tasks-page" className="recover-tasks-container">
      <h2 className="section-title">{sections[activeSection].label}</h2>

      <Nav variant="tabs" activeKey={activeSection} onSelect={setActiveSection}>
        {Object.keys(sections).map((key) => (
          <Nav.Item key={key}>
            <Nav.Link
              eventKey={key}
              className={`subnav-link ${activeSection === key ? "active" : ""}`}
              data-tooltip={sections[key].label}
              data-tooltip-position="top"
            >
              {sections[key].label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <div className="recover-card-container">
        {currentItems.length === 0 ? (
          <p className="empty-message">
            No {sections[activeSection].label.toLowerCase()} to recover.
          </p>
        ) : (
          currentItems.map((task, index) => (
            <RecoverTaskItem task={task} index={index} key={index} />
          ))
        )}
      </div>

      <Button
        variant="secondary"
        onClick={onBack}
        className="back-btn1"
        data-tooltip="Back"
        data-tooltip-position="top"
        aria-label="Back"
      >
        <IoChevronBackOutline />
      </Button>
    </div>
  );
};

export default RecoverDeletedTasks;