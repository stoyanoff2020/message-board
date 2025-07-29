import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { Button } from './button'

export type FeedbackType = 'success' | 'error' | 'warning' | 'info'

interface FeedbackProps {
  type: FeedbackType
  title?: string
  message: string
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const feedbackStyles = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-500'
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-500'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500'
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: Info,
    iconColor: 'text-blue-500'
  }
}

export function Feedback({ type, title, message, onDismiss, action, className }: FeedbackProps) {
  const styles = feedbackStyles[type]
  const Icon = styles.icon

  return (
    <div className={cn(
      'border rounded-lg p-4',
      styles.container,
      className
    )}>
      <div className="flex items-start">
        <Icon className={cn('h-5 w-5 mt-0.5 mr-3 flex-shrink-0', styles.iconColor)} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-medium mb-1">{title}</h3>
          )}
          <p className="text-sm">{message}</p>
          
          {action && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className="text-current border-current hover:bg-current hover:text-white"
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-3 text-current hover:opacity-70 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

interface InlineFeedbackProps {
  type: FeedbackType
  message: string
  className?: string
}

export function InlineFeedback({ type, message, className }: InlineFeedbackProps) {
  const styles = feedbackStyles[type]
  const Icon = styles.icon

  return (
    <div className={cn('flex items-center space-x-2 text-sm', className)}>
      <Icon className={cn('h-4 w-4 flex-shrink-0', styles.iconColor)} />
      <span className={styles.iconColor.replace('text-', 'text-')}>{message}</span>
    </div>
  )
}

interface FormFeedbackProps {
  type: FeedbackType
  message: string
  className?: string
}

export function FormFeedback({ type, message, className }: FormFeedbackProps) {
  const styles = feedbackStyles[type]
  const Icon = styles.icon

  return (
    <div className={cn(
      'flex items-start space-x-2 text-sm p-3 rounded-md',
      styles.container,
      className
    )}>
      <Icon className={cn('h-4 w-4 flex-shrink-0 mt-0.5', styles.iconColor)} />
      <span>{message}</span>
    </div>
  )
}

interface SuccessMessageProps {
  title?: string
  message: string
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function SuccessMessage(props: SuccessMessageProps) {
  return <Feedback type="success" {...props} />
}

interface ErrorMessageProps {
  title?: string
  message: string
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function ErrorMessage(props: ErrorMessageProps) {
  return <Feedback type="error" {...props} />
}

interface WarningMessageProps {
  title?: string
  message: string
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function WarningMessage(props: WarningMessageProps) {
  return <Feedback type="warning" {...props} />
}

interface InfoMessageProps {
  title?: string
  message: string
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function InfoMessage(props: InfoMessageProps) {
  return <Feedback type="info" {...props} />
}