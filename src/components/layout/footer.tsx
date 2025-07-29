import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        {/* Brand and Copyright */}
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span className="font-bold">Message Board</span>
          </div>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {currentYear} Message Board. Built for sharing information.
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <Link 
            href="/about" 
            className="hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link 
            href="/privacy" 
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <Link 
            href="/terms" 
            className="hover:text-foreground transition-colors"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}