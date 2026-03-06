// pages/PrivacyPolicy.tsx
import { Helmet } from 'react-helmet-async';
import { LegalLayout } from './LegalLayout';

const PrivacyPolicy = () => {
  return (
    <LegalLayout title="Privacy Policy">
      <Helmet>
        <title>Privacy Policy - BullFaucet</title>
        <meta name="description" content="Learn how BullFaucet collects, uses, and protects your personal information. Your privacy is our priority." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="p-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-zinc-500">Last updated: February 9, 2025</p>
          </div>

          {/* Intro */}
          <div className="mb-10 p-6 bg-orange-500/5 border border-orange-500/20 rounded-xl">
            <p className="text-zinc-300 leading-relaxed">
              This Privacy Policy describes how <span className="font-semibold text-orange-400">BullFaucet</span> collects, stores, and handles your personal information. By using our services, you agree to the terms outlined in this policy.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {/* Personal Information */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">Personal Information You Provide</h2>
              <p className="text-zinc-300">To create and maintain your account, we collect essential information including:</p>
              <ul className="space-y-3 pl-6">
                <li className="text-zinc-400 flex items-start gap-3">
                  <span className="text-orange-400 mt-1.5">•</span>
                  <span><span className="font-semibold text-white">Username, email, and password</span> for account security and authentication</span>
                </li>
                <li className="text-zinc-400 flex items-start gap-3">
                  <span className="text-orange-400 mt-1.5">•</span>
                  <span><span className="font-semibold text-white">Country, gender, and birthday</span> to ensure relevant advertisement targeting</span>
                </li>
                <li className="text-zinc-400 flex items-start gap-3">
                  <span className="text-orange-400 mt-1.5">•</span>
                  <span><span className="font-semibold text-white">Wallet address</span> for processing withdrawals and payments</span>
                </li>
              </ul>
            </section>

            {/* Automatically Collected Information */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">Automatically Collected Information</h2>
              <p className="text-zinc-300">We automatically collect usage data to enhance security and improve our services:</p>
              <ul className="space-y-3 pl-6">
                <li className="text-zinc-400 flex items-start gap-3">
                  <span className="text-orange-400 mt-1.5">•</span>
                  <span>IP address, geographic location, and internet service provider details</span>
                </li>
                <li className="text-zinc-400 flex items-start gap-3">
                  <span className="text-orange-400 mt-1.5">•</span>
                  <span>Browser type, device information, and operating system</span>
                </li>
                <li className="text-zinc-400 flex items-start gap-3">
                  <span className="text-orange-400 mt-1.5">•</span>
                  <span>Login timestamps and session duration</span>
                </li>
              </ul>
              <p className="text-zinc-400 mt-2">This data helps us prevent unauthorized access and maintain service quality.</p>
            </section>

            {/* Data Security */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">Data Security</h2>
              <p className="text-zinc-400 leading-relaxed">
                Your personal data is stored on secured servers with robust protection measures. While we implement industry-standard security protocols, no internet transmission method is 100% secure. We continuously work to protect your information but cannot guarantee absolute security.
              </p>
            </section>

            {/* Your Rights */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">Your Rights</h2>
              <p className="text-zinc-300">You have the right to:</p>
              <ul className="space-y-3 pl-6">
                <li className="text-zinc-400 flex items-start gap-3">
                  <span className="text-orange-400 mt-1.5">•</span>
                  <span><span className="font-semibold text-white">Access</span> your personal information</span>
                </li>
                <li className="text-zinc-400 flex items-start gap-3">
                  <span className="text-orange-400 mt-1.5">•</span>
                  <span><span className="font-semibold text-white">Request deletion</span> of your personal data</span>
                </li>
                <li className="text-zinc-400 flex items-start gap-3">
                  <span className="text-orange-400 mt-1.5">•</span>
                  <span><span className="font-semibold text-white">Verify identity</span> before processing sensitive requests</span>
                </li>
              </ul>
              <p className="text-zinc-400">To delete your account, please submit a support request through our platform.</p>
            </section>

            {/* Children's Privacy - Highlighted */}
            <section className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-xl space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">Children's Privacy</h2>
              <p className="text-orange-300 font-semibold">We do not knowingly collect information from anyone under 16.</p>
              <p className="text-zinc-400">If you're under 16, please do not use our services or provide any personal information. Parents or guardians who believe their child has provided personal information without consent should contact us immediately for removal.</p>
            </section>

            {/* Information Sharing */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">Information Sharing</h2>
              <p className="text-zinc-400">We do not share or disclose your personal information without your consent, except when required by law or to fulfill the purposes described in this policy.</p>
            </section>

            {/* Data Retention */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">Data Retention</h2>
              <p className="text-zinc-400">Usage data is retained for short periods for analytical purposes. Personal data is maintained until you request account deletion, after which it's promptly removed from our systems.</p>
            </section>

            {/* International Data Transfer */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">International Data Transfer</h2>
              <p className="text-zinc-400">Our servers are located in the USA, and some service providers may operate in non-EU countries. By using our services, you consent to these transfers. We ensure all providers maintain adequate data protection standards.</p>
            </section>

            {/* External Links */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">External Links</h2>
              <p className="text-zinc-400">Our platform may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of these external sites.</p>
            </section>

            {/* Cookies */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">Cookies</h2>
              <p className="text-zinc-400">We use cookies (small data files) to enhance your experience, remember your preferences, and maintain account functionality.</p>
            </section>

            {/* Contact Us */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">Contact Us</h2>
              <p className="text-zinc-400">For questions about this privacy policy or your personal data, please submit a support request through our platform.</p>
            </section>

            {/* Language & Translations */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">Language & Translations</h2>
              <p className="text-zinc-400">English is the primary language of this website. Translations are provided for convenience, but the English version prevails in case of discrepancies.</p>
            </section>

            {/* Policy Updates */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">Policy Updates</h2>
              <p className="text-zinc-400">We may update this policy periodically. Changes will be reflected on this page with an updated revision date.</p>
            </section>

            {/* Update Date */}
            <div className="mt-12 pt-6 border-t border-white/10 text-center">
              <p className="text-orange-400 font-semibold">This Privacy Policy was last updated on February 9, 2025.</p>
            </div>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
};

export default PrivacyPolicy;