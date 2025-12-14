import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import HomePage from '../routes/index.jsx'

describe('HomePage Component Unit Tests', () => {
    it('should mount without errors', () => {
        // **Requirements: 2.1, 2.2**
        expect(() => {
            render(React.createElement(HomePage))
        }).not.toThrow()
    })

    it('should display placeholder content indicating application readiness', () => {
        // **Requirements: 2.1, 2.2**
        render(React.createElement(HomePage))

        // Check for main heading
        expect(screen.getByText('ClearClause AI')).toBeInTheDocument()

        // Check for readiness message
        expect(screen.getByText('Application is ready for development')).toBeInTheDocument()

        // Check for status indicator
        expect(screen.getByText('✓ React frontend foundation is working')).toBeInTheDocument()
    })

    it('should have proper component structure and handle props', () => {
        // **Requirements: 2.1, 2.2**
        const { container } = render(React.createElement(HomePage))

        // Component should render a container div
        expect(container.firstChild).toBeInTheDocument()
        expect(container.firstChild.tagName).toBe('DIV')

        // Should have proper CSS classes for styling
        expect(container.firstChild).toHaveClass('min-h-screen')

        // Component should handle being rendered multiple times
        const { container: container2 } = render(React.createElement(HomePage))
        expect(container2.firstChild).toBeInTheDocument()
    })

    it('should render with proper HTML structure', () => {
        // **Requirements: 2.1, 2.2**
        const { container } = render(React.createElement(HomePage))

        // Should contain heading elements
        const heading = container.querySelector('h1')
        expect(heading).toBeInTheDocument()
        expect(heading).toHaveClass('text-4xl', 'font-bold')

        // Should contain paragraph elements
        const paragraph = container.querySelector('p')
        expect(paragraph).toBeInTheDocument()
        expect(paragraph).toHaveClass('text-lg')

        // Should contain status indicator div
        const statusDiv = container.querySelector('.bg-green-100')
        expect(statusDiv).toBeInTheDocument()
    })
})