import { Metadata } from 'next'
import { PageLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Privacy Policy | Message Board',
  description: 'Privacy policy for the message board application',
}

export default function PrivacyPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <p className="text-muted-foreground">
                  When you create an account, we collect your email address and name.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Message Content</h3>
                <p className="text-muted-foreground">
                  We store the messages you post, including titles, descriptions, and contact information.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>To provide and maintain the message board service</li>
                <li>To authenticate your account and ensure security</li>
                <li>To display your messages to other users</li>
                <li>To improve our service and user experience</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us through 
                the message board platform.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}