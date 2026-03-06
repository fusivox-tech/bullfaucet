// pages/TermsOfService.tsx
import { Helmet } from 'react-helmet-async';
import { LegalLayout } from './LegalLayout';

const TermsOfService = () => {
  return (
    <LegalLayout title="Terms of Service">
      <Helmet>
        <title>Terms of Service - BullFaucet</title>
        <meta name="description" content="Read the BullFaucet Terms of Service to understand your rights and responsibilities when using our platform." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="p-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-zinc-500">Govern your use of BullFaucet</p>
          </div>

          {/* Intro */}
          <div className="mb-10 p-6 bg-orange-500/5 border border-orange-500/20 rounded-xl">
            <p className="text-zinc-300 leading-relaxed">
              These Terms of Service govern your use of <span className="font-semibold text-orange-400">BullFaucet</span> platform. By registering an account, you confirm that you have read, understood, and accepted these terms. If you disagree with any provision, you must not register or use our services.
            </p>
          </div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">1. User Account</h2>
              <div className="space-y-3 pl-4">
                <p className="text-zinc-400"><span className="font-semibold text-white">1.1.</span> You must be at least 18 years old to register an account.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">1.2.</span> You are responsible for keeping your password secure. BullFaucet is not liable for account losses due to compromised credentials.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">1.3.</span> Multiple accounts are strictly prohibited and will result in suspension.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">1.4.</span> Only one account per household and device is allowed.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">1.5.</span> For security reasons, users must manage their own account information.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">1.6.</span> Using bots, automation software, or any unauthorized methods to interact with our platform is forbidden.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">1.7.</span> Each user must maintain unique payment processor accounts.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">1.8.</span> Temporary or disposable email addresses are not permitted for registration.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">1.9.</span> Accessing our services through Proxy/VPN/TOR networks is prohibited.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">1.10.</span> Harassment, false accusations, or disrespectful behavior toward BullFaucet staff may result in account suspension.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">1.11.</span> Anti-bot verification may be required if suspicious activity is detected.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">2. Deposits and Purchases</h2>
              <div className="space-y-3 pl-4">
                <p className="text-zinc-400"><span className="font-semibold text-white">2.1.</span> All deposits are final and non-refundable.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">2.2.</span> Only use official payment methods provided on our platform.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">2.3.</span> Deposits below the minimum threshold will not be credited.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">2.4.</span> Unsupported payment methods will not be processed.</p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">3. Referrals</h2>
              <div className="space-y-3 pl-4">
                <p className="text-zinc-400"><span className="font-semibold text-white">3.1.</span> You may refer unlimited users to our platform.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">3.2.</span> Spam, unsolicited emails, or purchasing referrals from third parties is prohibited.</p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">4. Payments</h2>
              <div className="space-y-3 pl-4">
                <p className="text-zinc-400"><span className="font-semibold text-white">4.1.</span> Withdrawals require meeting the minimum payout threshold.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">4.2.</span> Payments are typically instant but may be delayed up to 7 days for security reviews.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">4.3.</span> Verify that your payment method is available and legal in your jurisdiction.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">4.4.</span> BullFaucet is not responsible for failed transactions due to incorrect payment details.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">4.5.</span> Anti-bot verification may be required before processing withdrawals.</p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">5. Promotion</h2>
              <div className="space-y-3 pl-4">
                <p className="text-zinc-400"><span className="font-semibold text-white">5.1.</span> We prohibit promotions containing malware, adult content, or illegal activities.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">5.2.</span> BullFaucet reserves the right to reject any advertisement deemed inappropriate.</p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">6. Account Suspension</h2>
              <div className="space-y-3 pl-4">
                <p className="text-zinc-400"><span className="font-semibold text-white">6.1.</span> We may suspend accounts for Terms of Service violations.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">6.2.</span> Accounts inactive for 2 years will be permanently deleted.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">6.3.</span> Suspension appeals require convincing justification.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">6.4.</span> Exploiting system bugs for unfair advantage will result in suspension.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">6.5.</span> Providing false personal information may lead to account suspension.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">6.6.</span> Suspended users may not create new accounts.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-400">7. Liability</h2>
              <div className="space-y-3 pl-4">
                <p className="text-zinc-400"><span className="font-semibold text-white">7.1.</span> We are not responsible for third-party promotion content.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">7.2.</span> BullFaucet is not liable for service interruptions beyond our control.</p>
                <p className="text-zinc-400"><span className="font-semibold text-white">7.3.</span> We reserve the right to modify these terms without prior notice.</p>
              </div>
            </section>

            {/* Closing Statement */}
            <div className="mt-12 pt-6 border-t border-white/10 text-center">
              <p className="text-orange-400 font-semibold">By using BullFaucet services, you acknowledge and agree to these Terms of Service.</p>
            </div>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
};

export default TermsOfService;