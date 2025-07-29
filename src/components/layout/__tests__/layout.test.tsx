import { render, screen } from '@testing-library/react'
import { Layout } from '../layout'
import { vi } from 'vitest'

// Mock the Header and Footer components
vi.mock('../header', () => ({
  Header: () => <header data-testid="header">Header</header>
}))

vi.mock('../footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>
}))

describe('Layout', () => {
  it('renders header, main content, and footer', () => {
    render(
      <Layout>
        <div>Main Content</div>
      </Layout>
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders children in main element', () => {
    render(
      <Layout>
        <div data-testid="child-content">Child Content</div>
      </Layout>
    )

    const main = document.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main).toContainElement(screen.getByTestId('child-content'))
  })

  it('applies proper layout structure', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )

    const layoutContainer = document.querySelector('.min-h-screen')
    expect(layoutContainer).toBeInTheDocument()
    expect(layoutContainer).toHaveClass('flex', 'flex-col')
  })

  it('makes main content flexible', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )

    const main = document.querySelector('main')
    expect(main).toHaveClass('flex-1')
  })

  it('applies container styling to main content', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )

    const main = document.querySelector('main')
    expect(main).toHaveClass('container', 'mx-auto', 'px-4', 'py-8')
  })

  it('renders multiple children correctly', () => {
    render(
      <Layout>
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </Layout>
    )

    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
    expect(screen.getByText('Third Child')).toBeInTheDocument()
  })

  it('handles empty children', () => {
    render(<Layout />)

    const main = document.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main).toBeEmptyDOMElement()
  })

  it('preserves child component props and structure', () => {
    render(
      <Layout>
        <div className="custom-class" data-testid="custom-div">
          <span>Nested content</span>
        </div>
      </Layout>
    )

    const customDiv = screen.getByTestId('custom-div')
    expect(customDiv).toHaveClass('custom-class')
    expect(screen.getByText('Nested content')).toBeInTheDocument()
  })

  it('maintains semantic HTML structure', () => {
    render(
      <Layout>
        <article>Article content</article>
      </Layout>
    )

    // Check for proper semantic structure
    expect(document.querySelector('header')).toBeInTheDocument()
    expect(document.querySelector('main')).toBeInTheDocument()
    expect(document.querySelector('footer')).toBeInTheDocument()
    expect(document.querySelector('article')).toBeInTheDocument()
  })

  it('applies responsive design classes', () => {
    render(
      <Layout>
        <div>Responsive content</div>
      </Layout>
    )

    const main = document.querySelector('main')
    expect(main).toHaveClass('container', 'mx-auto', 'px-4')
  })

  it('ensures proper stacking order', () => {
    render(
      <Layout>
        <div>Content between header and footer</div>
      </Layout>
    )

    const container = document.querySelector('.min-h-screen')
    const children = container?.children

    expect(children?.[0]).toHaveAttribute('data-testid', 'header')
    expect(children?.[1]?.tagName.toLowerCase()).toBe('main')
    expect(children?.[2]).toHaveAttribute('data-testid', 'footer')
  })
})