import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import IndexInput from "../components/IndexInput/IndexInput";

test("renders IndexInput component correctly", () => {
    render(<IndexInput add={jest.fn()} />);

    // Ensure the input field is present
    const inputField = screen.getByPlaceholderText(/enter value/i);
    expect(inputField).toBeInTheDocument();

    // Ensure the "Add" button is present
    const addButton = screen.getByRole("button", { name: /add/i });
    expect(addButton).toBeInTheDocument();
});

test("allows user to enter input and calls add function on submit", () => {
    const mockAdd = jest.fn();
    render(<IndexInput add={mockAdd} />);

    const inputField = screen.getByPlaceholderText(/enter value/i);
    const addButton = screen.getByRole("button", { name: /add/i });

    // Type into the input field
    fireEvent.change(inputField, { target: { value: "Test Value" } });
    expect(inputField.value).toBe("Test Value");

    // Click the "Add" button
    fireEvent.click(addButton);

    // Ensure the add function is called with the correct value
    expect(mockAdd).toHaveBeenCalledWith("Test Value");

    // Ensure the input field is cleared
    expect(inputField.value).toBe("");
});
