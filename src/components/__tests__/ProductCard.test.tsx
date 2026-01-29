import React from "react";
import { render, screen } from "@testing-library/react";
import ProductCard from "../ProductCard";

describe("ProductCard", () => {
    const mockProps = {
        partNumber: "PS12345678",
        name: "Test Refrigerator Part",
        url: "https://www.partselect.com/PS12345678-Test-Part.htm",
        description: "A test part description",
    };

    it("renders part number", () => {
        render(<ProductCard {...mockProps} />);
        expect(screen.getByText("PS12345678")).toBeInTheDocument();
    });

    it("renders part name", () => {
        render(<ProductCard {...mockProps} />);
        expect(screen.getByText("Test Refrigerator Part")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
        render(<ProductCard {...mockProps} />);
        expect(screen.getByText("A test part description")).toBeInTheDocument();
    });

    it("links to PartSelect", () => {
        render(<ProductCard {...mockProps} />);
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", mockProps.url);
        expect(link).toHaveAttribute("target", "_blank");
    });

    it("renders without description", () => {
        const { description, ...propsWithoutDesc } = mockProps;
        render(<ProductCard {...propsWithoutDesc} />);
        expect(screen.getByText("PS12345678")).toBeInTheDocument();
    });
});
