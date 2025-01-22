import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskSection from '../components/TaskSection/TaskSection';
import TodoItem from '../components/TodoItem/TodoItem';
import { useTodoList } from '../hooks/useTodoList/useTodoList';

// Mock `useTodoList` to isolate TaskSection
jest.mock('../hooks/useTodoList/useTodoList');

let mockTasks, mockAddTask, mockDeleteTask, mockToggleReminder, mockUpdateTask;

beforeEach(() => {
    // Mock the return values of `useTodoList`
    mockTasks = [{ id: 1, text: 'Sample Task', reminder: false }];
    mockAddTask = jest.fn();
    mockDeleteTask = jest.fn();
    mockToggleReminder = jest.fn();
    mockUpdateTask = jest.fn();

    useTodoList.mockReturnValue({
        tasks: mockTasks,
        addTask: mockAddTask,
        deleteTask: mockDeleteTask,
        toggleReminder: mockToggleReminder,
        updateTask: mockUpdateTask,
        saveTasks: jest.fn(),
        loadTasks: jest.fn(),
    });
});

// Test if TaskSection renders correctly
test('renders TaskSection with InputBar and TodoList', () => {
    render(<TaskSection />);
    
    expect(screen.getByTestId('task-section')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/task title/i)).toBeInTheDocument();
    expect(screen.getByTestId('todo-list')).toBeInTheDocument();
});

// Test adding a task
test('adds a task and renders it in the task list', async () => {
    render(<TaskSection />);

    // Type task title
    const taskInput = screen.getByPlaceholderText(/task title/i);
    fireEvent.change(taskInput, { target: { value: 'New Task' } });

    // Click Add Task button
    const addButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.click(addButton);

    // Ensure mockAddTask is called with all expected parameters
    await waitFor(() => {
        expect(mockAddTask).toHaveBeenCalledWith(
            'New Task',
            expect.any(String), // Due Date (e.g., "2025-01-20")
            expect.any(String), // Due Time (e.g., "15:53")
            expect.any(String), // Description ("" if empty)
            expect.any(Boolean) // Reminder status (true/false)
        );
    });
});

// Test toggling task reminder
test('toggles task reminder correctly', async () => {
    render(<TodoItem task={mockTasks[0]} onToggleReminder={mockToggleReminder} />);
    
    // Find the button by accessible name
    const reminderButton = screen.getByRole('button', { name: /toggle reminder/i });

    // Click to turn reminder ON
    fireEvent.click(reminderButton);
    expect(mockToggleReminder).toHaveBeenCalledWith(mockTasks[0].id);

    // Click again to turn reminder OFF
    fireEvent.click(reminderButton);
    expect(mockToggleReminder).toHaveBeenCalledTimes(2);
});

// Test deleting a task
test('deletes a task correctly', async () => {
    render(<TaskSection />);

    // Find the delete button
    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
        expect(mockDeleteTask).toHaveBeenCalledWith(1);
    });
});
