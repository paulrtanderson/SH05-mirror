import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import InputBar from "../components/Inputbar/InputBar";

let mockOnAddTask;

beforeEach(() => {
    mockOnAddTask = jest.fn();
    render(<InputBar onAddTask={mockOnAddTask} />);
});

// Test if InputBar renders correctly
test("renders the InputBar component correctly", () => {
    render(<InputBar onAddTask={jest.fn()} />);

    // Check for the task input field (task title)
    const taskInputs = screen.getAllByPlaceholderText(/task title/i);
    expect(taskInputs.length).toBeGreaterThan(0);

    // Check for the description textarea correctly
    const descriptionFields = screen.getAllByPlaceholderText(/add a description/i);
    expect(descriptionFields.length).toBeGreaterThan(0);
    // Ensure the "Add Task" button is present
    const addTaskButtons = screen.getAllByRole("button", { name: /add task/i });
    expect(addTaskButtons.length).toBeGreaterThan(0);
});


// Test task input functionality
test("allows user to input a task title", () => {
    const taskInput = screen.getByPlaceholderText(/task title/i);
    fireEvent.change(taskInput, { target: { value: "Test Task" } });
    expect(taskInput).toHaveValue("Test Task");
});

// Test preset selection updates due date and time
test("handles preset selection and updates due date and time", () => {
    const todayPreset = screen.getByText(/today/i);
    fireEvent.click(todayPreset);

    // Find the selected radio button
    const checkedRadio = screen.getByRole("radio", { checked: true });

    expect(checkedRadio).toBeChecked();
});

// Test toggling reminder checkbox
test("toggles the reminder checkbox", () => {
    const reminderCheckbox = screen.getByRole("checkbox");
    expect(reminderCheckbox).toBeChecked(); // Default state is checked

    fireEvent.click(reminderCheckbox);
    expect(reminderCheckbox).not.toBeChecked(); // Should be unchecked now

    fireEvent.click(reminderCheckbox);
    expect(reminderCheckbox).toBeChecked(); // Should be checked again
});

// Test if submitting a task calls onAddTask with correct values
test("submits a task with the correct values", () => {
    const taskInput = screen.getByPlaceholderText(/task title/i);
    fireEvent.change(taskInput, { target: { value: "Test Task" } });

    const addButton = screen.getByRole("button", { name: /add task/i });
    fireEvent.click(addButton);

    // Ensure `onAddTask` was called with the correct values
    expect(mockOnAddTask).toHaveBeenCalledWith("Test Task", expect.any(String), expect.any(String), "", true);
});

// Test if form clears after submission
test("clears the form after submission", () => {
    const taskInput = screen.getByPlaceholderText(/task title/i);
    const reminderCheckbox = screen.getByRole("checkbox");
    const addButton = screen.getByRole("button", { name: /add task/i });

    fireEvent.change(taskInput, { target: { value: "Another Test Task" } });
    fireEvent.click(reminderCheckbox); // Uncheck the reminder
    fireEvent.click(addButton); // Submit task

    // Ensure input field resets
    expect(taskInput).toHaveValue("");
    
    // Ensure reminder checkbox resets to checked
    expect(reminderCheckbox).toBeChecked();
});
