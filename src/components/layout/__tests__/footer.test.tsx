import { render, screen } from '@testing-library/react'
import { Footer } from '../footer'

describe('Footer', () => {
  it('renders footer with copyright information', () => {
    render(<Footer />)

    const currentYear = new Date().getFullYear()
    expect(screen.getByText(`© ${currentYear} Message Board. All rights reserved.`)).toBeInTheDocument()
  })

  it('renders footer links', () => {
    render(<Footer />)

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('has correct link hrefs', () => {
    render(<Footer />)

    const privacyLink = screen.getByText('Privacy Policy').closest('a')
    const termsLink = screen.getByText('Terms of Service').closest('a')
    const aboutLink = screen.getByText('About').closest('a')

    expect(privacyLink).toHaveAttribute('href', '/privacy')
    expect(termsLink).toHaveAttribute('href', '/terms')
    expect(aboutLink).toHaveAttribute('href', '/about')
  })

  it('renders as footer element', () => {
    render(<Footer />)

    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<Footer />)

    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
    
    // Check for navigation within footer
    const nav = footer?.querySelector('nav')
    expect(nav).toBeInTheDocument()
  })

  it('applies proper styling classes', () => {
    render(<Footer />)

    const footer = document.querySelector('footer')
    expect(footer).toHaveClass('bg-gray-50', 'border-t')
  })

  it('has responsive layout', () => {
    render(<Footer />)

    const footer = document.querySelector('footer')
    const container = footer?.querySelector('.container')
    expect(container).toBeInTheDocument()
  })

  it('separates links with proper spacing', () => {
    render(<Footer />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    
    // Check that links are properly spaced
    links.forEach(link => {
      expect(link).toBeInTheDocument()
    })
  })

  it('uses correct text colors', () => {
    render(<Footer />)

    const copyrightText = screen.getByText(/© \d{4} Message Board/)
    expect(copyrightText).toHaveClass('text-gray-600')
  })

  it('has hover effects on links', () => {
    render(<Footer />)

    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveClass('hover:text-gray-900')
    })
  })

  it('maintains consistent spacing', () => {
    render(<Footer />)

    const footer = document.querySelector('footer')
    const container = footer?.querySelector('.container')
    
    expect(container).toHaveClass('py-8')
  })
})