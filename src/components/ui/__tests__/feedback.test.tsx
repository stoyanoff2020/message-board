import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { 
  Feedback, 
  InlineFeedback, 
  FormFeedback, 
  SuccessMessage, 
  ErrorMessage, 
  WarningMessage, 
  InfoMessage 
} from '../feedback'

describe('Feedback', () => {
  it('should render success feedback', () => {
    render(
      <Feedback 
        type="success" 
        message="Operation completed successfully" 
      />
    )
    
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument()
    
    // Check for success icon
    const successIcon = document.querySelector('.text-green-500')
    expect(successIcon).toBeInTheDocument()
  })

  it('should render error feedback', () => {
    render(
      <Feedback 
        type="error" 
        message="Something went wrong" 
      />
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    // Check for error icon
    const errorIcon = document.querySelector('.text-red-500')
    expect(errorIcon).toBeInTheDocument()
  })

  it('should render warning feedback', () => {
    render(
      <Feedback 
        type="warning" 
        message="Please be careful" 
      />
    )
    
    expect(screen.getByText('Please be careful')).toBeInTheDocument()
    
    // Check for warning icon
    const warningIcon = document.querySelector('.text-yellow-500')
    expect(warningIcon).toBeInTheDocument()
  })

  it('should render info feedback', () => {
    render(
      <Feedback 
        type="info" 
        message="Here's some information" 
      />
    )
    
    expect(screen.getByText("Here's some information")).toBeInTheDocument()
    
    // Check for info icon
    const infoIcon = document.querySelector('.text-blue-500')
    expect(infoIcon).toBeInTheDocument()
  })

  it('should render with title', () => {
    render(
      <Feedback 
        type="success" 
        title="Success!" 
        message="Operation completed" 
      />
    )
    
    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText('Operation completed')).toBeInTheDocument()
  })

  it('should handle dismiss action', () => {
    const onDismiss = vi.fn()
    
    render(
      <Feedback 
        type="info" 
        message="Dismissible message" 
        onDismiss={onDismiss}
      />
    )
    
    const dismissButton = screen.getByLabelText('Dismiss')
    fireEvent.click(dismissButton)
    
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('should handle action button', () => {
    const onAction = vi.fn()
    
    render(
      <Feedback 
        type="error" 
        message="Something failed" 
        action={{
          label: 'Retry',
          onClick: onAction
        }}
      />
    )
    
    const actionButton = screen.getByText('Retry')
    fireEvent.click(actionButton)
    
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('should apply custom className', () => {
    render(
      <Feedback 
        type="info" 
        message="Test message" 
        className="custom-feedback"
      />
    )
    
    expect(document.querySelector('.custom-feedback')).toBeInTheDocument()
  })
})

describe('InlineFeedback', () => {
  it('should render inline feedback', () => {
    render(
      <InlineFeedback 
        type="success" 
        message="Inline success message" 
      />
    )
    
    expect(screen.getByText('Inline success message')).toBeInTheDocument()
    
    // Should have flex layout
    const container = document.querySelector('.flex.items-center')
    expect(container).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(
      <InlineFeedback 
        type="error" 
        message="Inline error" 
        className="custom-inline"
      />
    )
    
    expect(document.querySelector('.custom-inline')).toBeInTheDocument()
  })
})

describe('FormFeedback', () => {
  it('should render form feedback', () => {
    render(
      <FormFeedback 
        type="error" 
        message="Form validation error" 
      />
    )
    
    expect(screen.getByText('Form validation error')).toBeInTheDocument()
    
    // Should have padding and rounded corners
    const container = document.querySelector('.p-3.rounded-md')
    expect(container).toBeInTheDocument()
  })

  it('should apply type-specific styling', () => {
    render(
      <FormFeedback 
        type="success" 
        message="Form success" 
      />
    )
    
    // Should have success background
    const container = document.querySelector('.bg-green-50')
    expect(container).toBeInTheDocument()
  })
})

describe('Convenience Components', () => {
  it('should render SuccessMessage', () => {
    render(<SuccessMessage message="Success!" />)
    
    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(document.querySelector('.text-green-500')).toBeInTheDocument()
  })

  it('should render ErrorMessage', () => {
    render(<ErrorMessage message="Error occurred" />)
    
    expect(screen.getByText('Error occurred')).toBeInTheDocument()
    expect(document.querySelector('.text-red-500')).toBeInTheDocument()
  })

  it('should render WarningMessage', () => {
    render(<WarningMessage message="Warning!" />)
    
    expect(screen.getByText('Warning!')).toBeInTheDocument()
    expect(document.querySelector('.text-yellow-500')).toBeInTheDocument()
  })

  it('should render InfoMessage', () => {
    render(<InfoMessage message="Information" />)
    
    expect(screen.getByText('Information')).toBeInTheDocument()
    expect(document.querySelector('.text-blue-500')).toBeInTheDocument()
  })

  it('should pass through all props to base Feedback component', () => {
    const onDismiss = vi.fn()
    const onAction = vi.fn()
    
    render(
      <SuccessMessage 
        title="Success Title"
        message="Success message" 
        onDismiss={onDismiss}
        action={{
          label: 'Continue',
          onClick: onAction
        }}
      />
    )
    
    expect(screen.getByText('Success Title')).toBeInTheDocument()
    expect(screen.getByText('Success message')).toBeInTheDocument()
    expect(screen.getByText('Continue')).toBeInTheDocument()
    expect(screen.getByLabelText('Dismiss')).toBeInTheDocument()
  })
})