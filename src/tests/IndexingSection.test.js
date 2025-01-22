import React from "react";
import useIndexMatching from "../hooks/useIndexMatching/useIndexMatching";
import { render, screen, fireEvent } from "@testing-library/react";
import IndexingSection from "../components/IndexingSection/IndexingSection";

// ✅ Correct way to mock a **default export**
jest.mock("../hooks/useIndexMatching/useIndexMatching", () => jest.fn());

let mockSites, mockUrls, mockRegexs, mockStringMatches, mockAddSite, mockRemoveSite, mockUpdateSite;

beforeEach(() => {
    mockSites = ["Site 1"];
    mockUrls = ["URL 1"];
    mockRegexs = ["Regex 1"];
    mockStringMatches = ["Match 1"];
  
    // Mock function implementations
    mockAddSite = jest.fn();
    mockRemoveSite = jest.fn();
    mockUpdateSite = jest.fn();
  
    useIndexMatching.mockReturnValue({
        sites: mockSites,
        urls: mockUrls,
        regexs: mockRegexs,
        stringMatches: mockStringMatches,
        addSite: mockAddSite,
        removeSite: mockRemoveSite,
        updateSite: mockUpdateSite,
        addRegex: jest.fn(),
        removeRegex: jest.fn(),
        updateRegex: jest.fn(),
        addUrl: jest.fn(),
        removeUrl: jest.fn(),
        updateUrl: jest.fn(),
        addStringMatch: jest.fn(),
        removeStringMatch: jest.fn(),
        updateStringMatch: jest.fn(),
        checkMatch: jest.fn(),
    });
});

test("renders IndexingSection component correctly", () => {
    render(<IndexingSection />);
    
    expect(screen.getByText(/showing sites list/i)).toBeInTheDocument();
});

test("switches tabs and updates displayed content", () => {
    render(<IndexingSection />);
    
    fireEvent.click(screen.getByText(/urls/i));
    expect(screen.getByText(/showing urls list/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/regex/i));
    expect(screen.getByText(/showing regex list/i)).toBeInTheDocument();
});

test("renders IndexInput and IndexList components", () => {
    render(<IndexingSection />);
    
    expect(screen.getByPlaceholderText(/enter value/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
});

test("adds a new item to the Sites section", () => {
    render(<IndexingSection />);
    
    fireEvent.change(screen.getByPlaceholderText(/enter value/i), { target: { value: "New Site" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(mockAddSite).toHaveBeenCalledWith("New Site");
});

