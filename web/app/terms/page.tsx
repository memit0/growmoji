import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardContent className="p-8 prose prose-slate max-w-none">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: March 2024</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using GrowMoji, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily use GrowMoji for personal, non-commercial purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software contained in GrowMoji</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>

          <h2>3. User Account</h2>
          <p>
            To access certain features of GrowMoji, you must register for an account. You agree to provide accurate and complete information when creating your account and to keep your account credentials secure.
          </p>

          <h2>4. Privacy</h2>
          <p>
            Your use of GrowMoji is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices.
          </p>

          <h2>5. Disclaimer</h2>
          <p>
            The materials on GrowMoji are provided on an 'as is' basis. GrowMoji makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2>6. Limitations</h2>
          <p>
            In no event shall GrowMoji or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GrowMoji.
          </p>

          <h2>7. Revisions and Errata</h2>
          <p>
            The materials appearing on GrowMoji could include technical, typographical, or photographic errors. GrowMoji does not warrant that any of the materials on its website are accurate, complete, or current.
          </p>

          <h2>8. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at <a href="https://twitter.com/mebattll" target="_blank" rel="noopener noreferrer">@mebattll</a> on Twitter.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 