import React from "react";
import { render, screen } from "@testing-library/react";
import IndexList from "../components/IndexList/IndexList";

test("renders the IndexList component correctly", () => {
    // Mock data
    const mockItems = ["Item 1", "Item 2", "Item 3"];

    // Render the component with mock data
    render(<IndexList items={mockItems} />);

    // Ensure the list is rendered
    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();

    // Ensure all items appear in the list
    mockItems.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
    });
});
