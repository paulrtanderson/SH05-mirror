import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../components/Sidebar/Sidebar";
import TaskSection from "../components/TaskSection/TaskSection";
import IndexingSection from "../components/IndexingSection/IndexingSection";
import "@testing-library/jest-dom";

// Mock child components to isolate Sidebar testing
jest.mock("../components/TaskSection/TaskSection", () => () => <div data-testid="task-section">Task Section</div>);
jest.mock("../components/IndexingSection/IndexingSection", () => () => <div data-testid="indexing-section">Indexing Section</div>);

test("renders Sidebar with default Tasks section", () => {
    render(<Sidebar />);

    // "Task Section" should be visible by default
    expect(screen.getByTestId("task-section")).toBeInTheDocument();
    
    // "Indexing" and "Settings" should NOT be visible initially
    expect(screen.queryByTestId("indexing-section")).not.toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
});

test("navigates to Indexing section when Indexing tab is clicked", () => {
    render(<Sidebar />);
    
    // Click on "Indexing" tab (match text instead of role)
    fireEvent.click(screen.getByText(/indexing/i));

    // "Indexing Section" should now be visible
    expect(screen.getByTestId("indexing-section")).toBeInTheDocument();
    
    // "Task Section" and "Settings" should NOT be visible
    expect(screen.queryByTestId("task-section")).not.toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
});

test("navigates to Settings section when Settings tab is clicked", () => {
    render(<Sidebar />);
    
    // Click on the Settings icon (Gear Icon)
    fireEvent.click(document.querySelector("[data-rr-ui-event-key='settings']"));

    // "Settings" section should now be visible
    expect(screen.getByText("Settings")).toBeInTheDocument();
    
    // "Task" and "Indexing" sections should NOT be visible
    expect(screen.queryByTestId("task-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("indexing-section")).not.toBeInTheDocument();
});