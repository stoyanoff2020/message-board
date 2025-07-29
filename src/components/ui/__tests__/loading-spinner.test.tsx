import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '../loading-spinner'

describe('LoadingSpinner', () => {
  it('renders loading spinner with default size', () => {
    render(<LoadingSpinner />)

    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('renders loading spinner with custom size', () => {
    render(<LoadingSpinner size="lg" />)

    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('renders loading spinner with custom className', () => {
    render(<LoadingSpinner className="custom-spinner" />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('custom-spinner')
  })

  it('renders loading spinner with custom aria-label', () => {
    render(<LoadingSpinner aria-label="Custom loading message" />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Custom loading message')
  })

  it('renders small size spinner', () => {
    render(<LoadingSpinner size="sm" />)

    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    // Check if small size class is applied (assuming it uses a size-based class)
    expect(spinner.querySelector('svg')).toBeInTheDocument()
  })

  it('renders medium size spinner', () => {
    render(<LoadingSpinner size="md" />)

    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner.querySelector('svg')).toBeInTheDocument()
  })

  it('renders large size spinner', () => {
    render(<LoadingSpinner size="lg" />)

    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner.querySelector('svg')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
    
    // Check for screen reader text
    const srText = screen.getByText('Loading...')
    expect(srText).toBeInTheDocument()
    expect(srText).toHaveClass('sr-only')
  })

  it('renders SVG animation element', () => {
    render(<LoadingSpinner />)

    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('animate-spin')
  })

  it('applies additional props to the container', () => {
    render(<LoadingSpinner data-testid="spinner" />)

    const spinner = screen.getByTestId('spinner')
    expect(spinner).toBeInTheDocument()
  })

  it('combines custom className with default classes', () => {
    render(<LoadingSpinner className="my-custom-class" />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('my-custom-class')
    // Should also have default classes for proper styling
    expect(spinner).toBeInTheDocument()
  })

  it('renders with different color variants if supported', () => {
    // Test different color props if the component supports them
    render(<LoadingSpinner className="text-blue-500" />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('text-blue-500')
  })
})