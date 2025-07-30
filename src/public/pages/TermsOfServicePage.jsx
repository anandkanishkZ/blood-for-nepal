import React from 'react';
import { FileText, Shield, Users, AlertTriangle, CheckCircle, Scale, Heart, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TermsOfServicePage = () => {
  const { t } = useLanguage();

  const sections = [
    {
      id: 'acceptance',
      icon: CheckCircle,
      title: 'Acceptance of Terms',
      content: [
        {
          subtitle: 'Agreement to Terms',
          items: [
            'By accessing and using Blood For Nepal, you accept and agree to be bound by these Terms of Service',
            'If you do not agree to these terms, you may not use our platform',
            'These terms apply to all users, including donors, recipients, and healthcare providers',
            'Continued use of the platform constitutes acceptance of any updated terms'
          ]
        },
        {
          subtitle: 'Eligibility',
          items: [
            'You must be at least 18 years old to use this platform',
            'You must provide accurate and complete information during registration',
            'You must have legal capacity to enter into binding agreements',
            'Healthcare providers must have valid medical licenses'
          ]
        }
      ]
    },
    {
      id: 'user-responsibilities',
      icon: Users,
      title: 'User Responsibilities',
      content: [
        {
          subtitle: 'Blood Donors',
          items: [
            'Provide accurate medical history and contact information',
            'Meet all medical eligibility requirements for blood donation',
            'Respond promptly to blood donation requests when available',
            'Maintain updated availability status on the platform',
            'Follow all safety protocols during donation processes'
          ]
        },
        {
          subtitle: 'Blood Recipients',
          items: [
            'Provide accurate information about blood type and medical needs',
            'Use the platform only for legitimate medical emergencies',
            'Respect donor privacy and contact preferences',
            'Follow up with donation completion status',
            'Express gratitude to donors who respond to requests'
          ]
        },
        {
          subtitle: 'Healthcare Providers',
          items: [
            'Maintain valid medical licenses and certifications',
            'Verify patient blood type and medical requirements',
            'Follow proper blood collection and storage protocols',
            'Protect patient confidentiality at all times',
            'Report donation completion and patient outcomes'
          ]
        }
      ]
    },
    {
      id: 'platform-usage',
      icon: Heart,
      title: 'Platform Usage Guidelines',
      content: [
        {
          subtitle: 'Permitted Uses',
          items: [
            'Connecting blood donors with recipients for medical purposes',
            'Emergency blood donation requests through verified channels',
            'Educational content sharing about blood donation',
            'Community building among donors and healthcare providers'
          ]
        },
        {
          subtitle: 'Prohibited Activities',
          items: [
            'Commercial sale or purchase of blood through the platform',
            'Providing false medical or personal information',
            'Harassment or inappropriate contact with other users',
            'Using the platform for non-medical purposes',
            'Attempting to hack or compromise platform security'
          ]
        }
      ]
    },
    {
      id: 'medical-disclaimers',
      icon: AlertTriangle,
      title: 'Medical Disclaimers',
      content: [
        {
          subtitle: 'No Medical Advice',
          items: [
            'Blood For Nepal does not provide medical advice or treatment',
            'All medical decisions should be made in consultation with qualified healthcare providers',
            'The platform serves only as a connection service between donors and recipients',
            'We do not guarantee the availability of donors or success of donation requests'
          ]
        },
        {
          subtitle: 'Health and Safety',
          items: [
            'All blood donations must follow established medical protocols',
            'Donors are responsible for their own health assessment before donating',
            'Recipients must verify blood compatibility through proper medical channels',
            'Emergency situations should always involve professional medical care'
          ]
        }
      ]
    },
    {
      id: 'privacy-data',
      icon: Shield,
      title: 'Privacy and Data Protection',
      content: [
        {
          subtitle: 'Information Collection',
          items: [
            'We collect only necessary information for blood donation matching',
            'Medical history is protected with highest security standards',
            'Location data is used only for proximity-based matching',
            'All data collection complies with privacy regulations'
          ]
        },
        {
          subtitle: 'Information Sharing',
          items: [
            'Personal information shared only with explicit consent',
            'Emergency situations may require sharing contact details',
            'Healthcare providers receive only relevant medical information',
            'No information sold to third parties for commercial purposes'
          ]
        }
      ]
    },
    {
      id: 'liability-limitations',
      icon: Scale,
      title: 'Liability and Limitations',
      content: [
        {
          subtitle: 'Platform Limitations',
          items: [
            'Blood For Nepal is a connecting service, not a medical provider',
            'We do not control or guarantee the actions of platform users',
            'Technical issues may occasionally affect platform availability',
            'We are not responsible for outcomes of individual donation arrangements'
          ]
        },
        {
          subtitle: 'User Responsibility',
          items: [
            'Users assume full responsibility for their donation decisions',
            'Medical complications from donations are not our liability',
            'Users must verify all medical information independently',
            'Legal disputes between users are their own responsibility'
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-blue-950 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Scale className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Understanding your rights and responsibilities on our platform
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-blue-100">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Last updated: July 30, 2025
              </div>
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Legally binding agreement
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
                Welcome to Blood For Nepal
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                These Terms of Service ("Terms") govern your use of the Blood For Nepal platform, 
                a life-saving service that connects blood donors with recipients across Nepal. 
                By using our platform, you enter into a legal agreement with us.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our mission is to save lives by facilitating blood donations in emergency situations. 
                These terms ensure that our platform operates safely, ethically, and in compliance 
                with medical and legal standards.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Important Notice
                    </h3>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      Blood For Nepal is a platform service that connects donors with recipients. 
                      We do not provide medical services, advice, or treatment. All medical decisions 
                      should be made in consultation with qualified healthcare professionals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div key={section.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl mr-4">
                        <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
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

      {/* Emergency Contact */}
      <section className="py-16 bg-red-50 dark:bg-red-900/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <Heart className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Emergency Blood Requests
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                In life-threatening emergencies, time is critical. While our platform connects 
                donors quickly, always ensure professional medical supervision for all blood donations.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Phone className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    Emergency Hotline
                  </h3>
                </div>
                <p className="text-red-800 dark:text-red-200 text-sm mb-2">
                  For immediate blood donation assistance:
                </p>
                <p className="text-red-900 dark:text-red-100 font-mono text-lg">
                  +977-1-4444444
                </p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Mail className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    Emergency Email
                  </h3>
                </div>
                <p className="text-red-800 dark:text-red-200 text-sm mb-2">
                  For urgent blood requests:
                </p>
                <p className="text-red-900 dark:text-red-100 font-mono">
                  emergency@bloodfornepal.org
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agreement and Contact */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Agreement and Updates
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                By using Blood For Nepal, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms of Service.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Terms Updates
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    We may update these terms to reflect changes in our services
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    Users will be notified of significant changes via email
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    Continued use constitutes acceptance of updated terms
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Legal Questions
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  If you have questions about these terms or need legal clarification, 
                  please contact our legal team:
                </p>
                <a 
                  href="mailto:legal@bloodfornepal.org" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  legal@bloodfornepal.org
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Effective Date */}
      <section className="py-12 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <FileText className="h-5 w-5 text-gray-500 mr-3" />
              <span className="text-gray-600 dark:text-gray-300">
                These Terms of Service are effective as of July 30, 2025
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfServicePage;
