import { Metadata } from 'next'
import { PageLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'About | Message Board',
  description: 'Learn more about the message board application',
}

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">About Message Board</h1>
          <p className="text-lg text-muted-foreground">
            A platform for sharing information and connecting with others.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>
                Connecting people through shared information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Message Board provides a simple and effective way for users to share information, 
                connect with others, and build communities around shared interests and needs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                What makes our platform special
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Easy message posting with contact information</li>
                <li>Powerful search functionality</li>
                <li>User authentication and security</li>
                <li>Admin moderation tools</li>
                <li>Responsive design for all devices</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technology</CardTitle>
              <CardDescription>
                Built with modern web technologies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our platform is built using Next.js, React, TypeScript, Tailwind CSS, and Supabase 
                to provide a fast, secure, and reliable experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}