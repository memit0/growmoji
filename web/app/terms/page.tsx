import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <Card className="max-w-4xl mx-auto p-6">
      <CardContent>
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="text-2xl font-bold mb-6">Terms & Conditions</h1>
          
          <p>
            These terms and conditions apply to the Growmoji app (hereby referred to as &quot;Application&quot;) 
            for mobile devices that was created by Mehmet Battal (hereby referred to as &quot;Service Provider&quot;) 
            as a Freemium service.
          </p>

          <p className="mt-4">
            Upon downloading or utilizing the Application, you are automatically agreeing to the following terms. 
            It is strongly advised that you thoroughly read and understand these terms prior to using the Application. 
            Unauthorized copying, modification of the Application, any part of the Application, or our trademarks 
            is strictly prohibited. Any attempts to extract the source code of the Application, translate the 
            Application into other languages, or create derivative versions are not permitted. All trademarks, 
            copyrights, database rights, and other intellectual property rights related to the Application remain 
            the property of the Service Provider.
          </p>

          <p className="mt-4">
            The Service Provider is dedicated to ensuring that the Application is as beneficial and efficient as 
            possible. As such, they reserve the right to modify the Application or charge for their services at 
            any time and for any reason. The Service Provider assures you that any charges for the Application 
            or its services will be clearly communicated to you.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-4">Third-Party Services</h2>
          <p>
            Please note that the Application utilizes third-party services that have their own Terms and 
            Conditions. Below are the links to the Terms and Conditions of the third-party service providers 
            used by the Application:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><a href="https://expo.dev/terms" target="_blank" rel="noopener noreferrer">Expo</a></li>
            <li><a href="https://www.revenuecat.com/terms" target="_blank" rel="noopener noreferrer">RevenueCat</a></li>
            <li><a href="https://clerk.com/terms" target="_blank" rel="noopener noreferrer">Clerk</a></li>
          </ul>

          <h2 className="text-xl font-bold mt-6 mb-4">Internet and Network Connectivity</h2>
          <p>
            Please be aware that the Service Provider does not assume responsibility for certain aspects. Some 
            functions of the Application require an active internet connection, which can be Wi-Fi or provided 
            by your mobile network provider. The Service Provider cannot be held responsible if the Application 
            does not function at full capacity due to lack of access to Wi-Fi or if you have exhausted your 
            data allowance.
          </p>

          <p className="mt-4">
            If you are using the application outside of a Wi-Fi area, please be aware that your mobile network 
            provider&apos;s agreement terms still apply. Consequently, you may incur charges from your mobile provider 
            for data usage during the connection to the application, or other third-party charges. By using the 
            application, you accept responsibility for any such charges, including roaming data charges if you use 
            the application outside of your home territory (i.e., region or country) without disabling data roaming. 
            If you are not the bill payer for the device on which you are using the application, they assume that 
            you have obtained permission from the bill payer.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-4">Updates and Termination</h2>
          <p>
            The Service Provider may wish to update the application at some point. The application is currently 
            available as per the requirements for the operating system (and for any additional systems they decide 
            to extend the availability of the application to) may change, and you will need to download the updates 
            if you want to continue using the application. The Service Provider does not guarantee that it will 
            always update the application so that it is relevant to you and/or compatible with the particular 
            operating system version installed on your device.
          </p>

          <p className="mt-4">
            However, you agree to always accept updates to the application when offered to you. The Service Provider 
            may also wish to cease providing the application and may terminate its use at any time without providing 
            termination notice to you. Unless they inform you otherwise, upon any termination:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>The rights and licenses granted to you in these terms will end</li>
            <li>You must cease using the application, and (if necessary) delete it from your device</li>
          </ul>

          <h2 className="text-xl font-bold mt-6 mb-4">Changes to Terms and Conditions</h2>
          <p>
            The Service Provider may periodically update their Terms and Conditions. Therefore, you are advised 
            to review this page regularly for any changes. The Service Provider will notify you of any changes 
            by posting the new Terms and Conditions on this page.
          </p>

          <p className="mt-4">These terms and conditions are effective as of 2025-05-27</p>

          <h2 className="text-xl font-bold mt-6 mb-4">Contact Us</h2>
          <p>
            If you have any questions or suggestions about the Terms and Conditions, please do not hesitate to 
            contact the Service Provider at mebattll@gmail.com.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 