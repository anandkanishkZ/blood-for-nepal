import React from 'react';
import { Shield, Eye, Lock, FileText, Users, Server, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PrivacyPolicyPage = () => {
  const { t } = useLanguage();

  const sections = [
    {
      id: 'information-collection',
      icon: Eye,
      title: 'Information We Collect',
      content: [
        {
          subtitle: 'Personal Information',
          items: [
            'Full name, email address, and phone number',
            'Blood type, age, and medical history relevant to blood donation',
            'Location information (district, municipality)',
            'Emergency contact details',
            'Profile photos and verification documents'
          ]
        },
        {
          subtitle: 'Usage Information',
          items: [
            'Device information and IP address',
            'Browser type and operating system',
            'Pages visited and time spent on our platform',
            'Blood donation and request history'
          ]
        }
      ]
    },
    {
      id: 'information-use',
      icon: FileText,
      title: 'How We Use Your Information',
      content: [
        {
          subtitle: 'Primary Uses',
          items: [
            'Matching blood donors with recipients',
            'Sending notifications about blood donation requests',
            'Verifying donor eligibility and safety',
            'Maintaining donation history and records'
          ]
        },
        {
          subtitle: 'Communications',
          items: [
            'Emergency blood request notifications',
            'Platform updates and important announcements',
            'Educational content about blood donation',
            'Account security notifications'
          ]
        }
      ]
    },
    {
      id: 'information-sharing',
      icon: Users,
      title: 'Information Sharing',
      content: [
        {
          subtitle: 'We Share Information With',
          items: [
            'Healthcare institutions and blood banks (with consent)',
            'Emergency services during critical situations',
            'Verified blood recipients (limited contact information)',
            'Legal authorities when required by law'
          ]
        },
        {
          subtitle: 'We Do NOT Share',
          items: [
            'Personal information with advertisers',
            'Medical history with unauthorized parties',
            'Contact details for marketing purposes',
            'Location data beyond district level'
          ]
        }
      ]
    },
    {
      id: 'data-security',
      icon: Lock,
      title: 'Data Security',
      content: [
        {
          subtitle: 'Security Measures',
          items: [
            'End-to-end encryption for sensitive data',
            'Secure server infrastructure with regular updates',
            'Multi-factor authentication for account access',
            'Regular security audits and monitoring'
          ]
        },
        {
          subtitle: 'Data Storage',
          items: [
            'Data stored on secure servers in compliance with international standards',
            'Regular backups to prevent data loss',
            'Access controls limiting who can view your information',
            'Automatic logout for inactive sessions'
          ]
        }
      ]
    },
    {
      id: 'user-rights',
      icon: Shield,
      title: 'Your Rights',
      content: [
        {
          subtitle: 'You Have the Right To',
          items: [
            'Access and download your personal data',
            'Correct inaccurate information in your profile',
            'Delete your account and associated data',
            'Control notification preferences'
          ]
        },
        {
          subtitle: 'Data Portability',
          items: [
            'Export your donation history',
            'Transfer your data to another platform',
            'Receive data in a machine-readable format',
            'Request data deletion (right to be forgotten)'
          ]
        }
      ]
    },
    {
      id: 'cookies',
      icon: Server,
      title: 'Cookies and Tracking',
      content: [
        {
          subtitle: 'Essential Cookies',
          items: [
            'Authentication and session management',
            'Security and fraud prevention',
            'Language and accessibility preferences',
            'Platform functionality'
          ]
        },
        {
          subtitle: 'Optional Cookies',
          items: [
            'Analytics to improve user experience',
            'Performance monitoring',
            'User preference storage',
            'Geographic location for nearby donor matching'
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 dark:from-red-800 dark:via-red-900 dark:to-red-950 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Shield className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto leading-relaxed">
              Your privacy and data security are our top priorities
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-red-100">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Last updated: July 30, 2025
              </div>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Effective immediately
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Our Commitment to Your Privacy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                At Blood For Nepal, we understand that your personal information is sensitive and valuable. 
                This Privacy Policy explains how we collect, use, protect, and share your information when 
                you use our blood donation platform.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                We are committed to maintaining the trust and confidence of our users. We do not sell, 
                trade, or rent your personal information to third parties for marketing purposes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Sections */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div key={section.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl mr-4">
                        <Icon className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {section.title}
                      </h2>
                    </div>
                    
                    <div className="space-y-8">
                      {section.content.map((subsection, subIndex) => (
                        <div key={subIndex}>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            {subsection.subtitle}
                          </h3>
                          <ul className="space-y-3">
                            {subsection.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-300">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Questions About Your Privacy?
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                If you have any questions about this Privacy Policy or how we handle your data, 
                please don't hesitate to contact us.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Data Requests
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Request access to your data or data deletion
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Security Concerns
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Report security issues or data breaches
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  General Inquiries
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Questions about our privacy practices
                </p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Contact our Privacy Team:
              </p>
              <a 
                href="mailto:privacy@bloodfornepal.org" 
                className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors duration-200"
              >
                <FileText className="h-5 w-5 mr-2" />
                privacy@bloodfornepal.org
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Updates */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8">
            <div className="flex items-start">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl mr-4">
                <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Policy Updates
                </h3>
                <p className="text-blue-800 dark:text-blue-200 mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our practices 
                  or for other operational, legal, or regulatory reasons.
                </p>
                <ul className="text-blue-700 dark:text-blue-300 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    We will notify users of significant changes via email or platform notifications
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Updated policies will be posted on this page with a new effective date
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Continued use of our platform constitutes acceptance of updated terms
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
