import React from 'react';
import { render, screen } from '@testing-library/react';
import TodoList from '../components/TodoList/TodoList';

test('renders tasks correctly', () => {
    const tasks = [
        { id: 1, text: 'Task 1' },
        { id: 2, text: 'Task 2' }
    ];

    render(<TodoList tasks={tasks} onDeleteTask={() => {}} onToggleReminder={() => {}} />);
    // Check if each task is in the document
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();

});
