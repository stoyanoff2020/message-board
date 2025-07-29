import { Metadata } from 'next'
import { PageLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Terms of Service | Message Board',
  description: 'Terms of service for the message board application',
}

export default function TermsPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                By accessing and using this message board service, you accept and agree to be bound 
                by the terms and provision of this agreement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide accurate and truthful information in your messages</li>
                <li>Respect other users and maintain a civil tone</li>
                <li>Do not post spam, inappropriate, or illegal content</li>
                <li>Keep your account credentials secure</li>
                <li>Report any misuse or violations to administrators</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Prohibited Content</h3>
                  <p className="text-muted-foreground">
                    Content that is illegal, harmful, threatening, abusive, defamatory, 
                    or otherwise objectionable is not permitted.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Content Moderation</h3>
                  <p className="text-muted-foreground">
                    We reserve the right to remove any content that violates these terms 
                    or is deemed inappropriate by our moderation team.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We reserve the right to terminate or suspend accounts that violate these terms 
                or engage in behavior that is harmful to the community.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update these terms from time to time. Users will be notified of 
                significant changes, and continued use of the service constitutes acceptance 
                of the updated terms.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}