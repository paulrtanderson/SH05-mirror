import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TodoItem from "../components/TodoItem/TodoItem";
import "@testing-library/jest-dom"; // Provides matchers like toBeInTheDocument()
import { FaTrashAlt } from "react-icons/fa";

let mockTask, mockOnDelete, mockOnToggleReminder, mockOnUpdateTask;

beforeEach(() => {
  mockTask = {
    id: 1,
    text: "Sample Task",
    due: "2025-01-17T11:59:00Z",
    reminder: false,
    description: "This is a sample task description.",
  };
  mockOnDelete = jest.fn();
  mockOnToggleReminder = jest.fn();
  mockOnUpdateTask = jest.fn();
});

test("renders the task correctly", () => {
  render(
    <TodoItem
      task={mockTask}
      onDelete={mockOnDelete}
      onToggleReminder={mockOnToggleReminder}
      onUpdateTask={mockOnUpdateTask}
    />
  );

  expect(screen.getByText("Sample Task")).toBeInTheDocument();
  expect(screen.getByText("This is a sample task description.")).toBeInTheDocument();
  expect(screen.getByText("17 Jan")).toBeInTheDocument(); // Due date formatted
});

test("toggles checkbox correctly", () => {
  render(
    <TodoItem
      task={mockTask}
      onDelete={mockOnDelete}
      onToggleReminder={mockOnToggleReminder}
      onUpdateTask={mockOnUpdateTask}
    />
  );

  const checkbox = screen.getByRole("checkbox");
  expect(checkbox).not.toBeChecked();

  fireEvent.click(checkbox);
  expect(checkbox).toBeChecked();

  fireEvent.click(checkbox);
  expect(checkbox).not.toBeChecked();
});

test("handles task edit on double-click", () => {
  render(
    <TodoItem
      task={mockTask}
      onDelete={mockOnDelete}
      onToggleReminder={mockOnToggleReminder}
      onUpdateTask={mockOnUpdateTask}
    />
  );

  const taskText = screen.getByText("Sample Task");

  fireEvent.doubleClick(taskText);
  const inputField = screen.getByDisplayValue("Sample Task");

  fireEvent.change(inputField, { target: { value: "Updated Task" } });
  fireEvent.blur(inputField);

  expect(mockOnUpdateTask).toHaveBeenCalledWith(1, "Updated Task");
});

test("toggles reminder when bell icon is clicked", () => {
  render(
    <TodoItem
      task={mockTask}
      onDelete={mockOnDelete}
      onToggleReminder={mockOnToggleReminder}
      onUpdateTask={mockOnUpdateTask}
    />
  );

  const reminderButton = screen.getByRole("button", { name: /reminder/i });
  fireEvent.click(reminderButton);

  expect(mockOnToggleReminder).toHaveBeenCalledWith(1);
});

test("deletes task when delete button is clicked", () => {
  render(
    <TodoItem
      task={mockTask}
      onDelete={mockOnDelete}
      onToggleReminder={mockOnToggleReminder}
      onUpdateTask={mockOnUpdateTask}
    />
  );

  const deleteButton = screen.getByRole("button", { name: /delete task/i });
  fireEvent.click(deleteButton);

  expect(mockOnDelete).toHaveBeenCalledWith(1);
});
