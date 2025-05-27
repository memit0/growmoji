import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <Card className="max-w-4xl mx-auto p-6">
      <CardContent>
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
          
          <p>This privacy policy applies to the Growmoji app (hereby referred to as &quot;Application&quot;) for mobile devices that was created by Mehmet Battal (hereby referred to as &quot;Service Provider&quot;) as a Freemium service. This service is intended for use &quot;AS IS&quot;.</p>
          
          <h2 className="text-xl font-bold mt-6 mb-4">Information Collection and Use</h2>
          <p>The Application collects information when you download and use it. This information may include information such as:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your device&apos;s Internet Protocol address (e.g. IP address)</li>
            <li>The pages of the Application that you visit, the time and date of your visit, the time spent on those pages</li>
            <li>The time spent on the Application</li>
            <li>The operating system you use on your mobile device</li>
          </ul>

          <p>The Application does not gather precise information about the location of your mobile device.</p>

          <p>The Service Provider may use the information you provided to contact you from time to time to provide you with important information, required notices and marketing promotions.</p>

          <h2 className="text-xl font-bold mt-6 mb-4">Third Party Access</h2>
          <p>Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service. The Service Provider may share your information with third parties in the ways that are described in this privacy statement.</p>

          <p>Please note that the Application utilizes third-party services that have their own Privacy Policy about handling data. Below are the links to the Privacy Policy of the third-party service providers used by the Application:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><a href="https://expo.io/privacy" target="_blank" rel="noopener noreferrer">Expo</a></li>
            <li><a href="https://www.revenuecat.com/privacy" target="_blank" rel="noopener noreferrer">RevenueCat</a></li>
            <li><a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer">Clerk</a></li>
          </ul>

          <h2 className="text-xl font-bold mt-6 mb-4">Data Retention Policy</h2>
          <p>The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. If you&apos;d like them to delete User Provided Data that you have provided via the Application, please contact them at mebattll@gmail.com and they will respond in a reasonable time.</p>

          <h2 className="text-xl font-bold mt-6 mb-4">Children</h2>
          <p>The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.</p>

          <h2 className="text-xl font-bold mt-6 mb-4">Security</h2>
          <p>The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains.</p>

          <h2 className="text-xl font-bold mt-6 mb-4">Changes</h2>
          <p>This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.</p>

          <p className="mt-4">This privacy policy is effective as of 2025-05-27</p>

          <h2 className="text-xl font-bold mt-6 mb-4">Contact Us</h2>
          <p>If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at mebattll@gmail.com.</p>
        </div>
      </CardContent>
    </Card>
  );
} 