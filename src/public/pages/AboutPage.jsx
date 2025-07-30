import React from 'react';
import { Heart, Users, Target, Shield, MapPin, Phone, Mail, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AboutPage = () => {
  const { t } = useLanguage();

  const stats = [
    { icon: Users, label: "Volunteers", value: "500+" },
    { icon: Heart, label: "Lives Saved", value: "1000+" },
    { icon: Shield, label: "Years of Service", value: "6+" },
    { icon: Target, label: "Districts Covered", value: "15+" }
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "We turn compassion into action to help people in their time of need"
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a strong network of volunteers and donors across Nepal"
    },
    {
      icon: Shield,
      title: "Trust",
      description: "Maintaining transparency and reliability in all our operations"
    },
    {
      icon: Target,
      title: "Impact",
      description: "Creating meaningful change that saves lives and brings hope"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 dark:from-red-800 dark:via-red-900 dark:to-red-950 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Blood For Nepal
            </h1>
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto leading-relaxed">
              We Help To Get Blood Easily
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <div className="prose prose-lg text-gray-600 dark:text-gray-300 space-y-4">
                <p>
                  Blood For Nepal, the mega project of Leo Club of Kathmandu Matribhumi was inaugurated during the AGM of Leo Club of Kathmandu Matribhumi in 2018/2019. It was established with the purpose to save the lives of the people all over Nepal with the motto of <strong>"We share we care"</strong> (Let's Manage the blood for a reason, let the reason to be life).
                </p>
                <p>
                  Blood For Nepal prevents and alleviates human suffering in the face of emergencies due to blood by mobilizing the power of volunteers and the generosity of donors to donate their blood.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl p-8 text-center">
                <Heart className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  "We Share, We Care"
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Let's Manage the blood for a reason, let the reason to be life
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission & Objectives
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <Target className="w-12 h-12 text-red-600 dark:text-red-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                To work as a mediator between patient and blood donors. Our aim is to provide blood either from the blood bank or manage blood donors in case of an emergency. Also, to maintain a strong database of donors so that no patient will suffer from blood scarcity.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <Award className="w-12 h-12 text-red-600 dark:text-red-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Goals</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                To provide awareness by presenting posters, booklets, other reading materials, and awareness videos, and also maintain programs for motivating youth with the collaboration of national and international organizations for a social cause.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Making a difference across Nepal
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The principles that guide our work
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Vision
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto">
              Blood For Nepal has its strong network of volunteers & blood donors and is always there in times of need. We aspire to turn compassion into action so that all the people of Nepal don't have to face problems due to a crisis of blood and try to make blood available where it is needed. Also, we aim to raise awareness and motivate people to donate their blood regularly.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Ready to join our mission? Contact us today
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg">
              <Phone className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Call Us</h3>
              <p className="text-gray-600 dark:text-gray-300">+977 1234 567 890</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg">
              <Mail className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Us</h3>
              <p className="text-gray-600 dark:text-gray-300">info@bloodfornepal.org</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg">
              <MapPin className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Visit Us</h3>
              <p className="text-gray-600 dark:text-gray-300">Kathmandu, Nepal</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join Our Life-Saving Mission
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Be part of our community of volunteers and donors making a difference across Nepal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register-donor"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-red-600 bg-white hover:bg-gray-50 dark:text-red-400 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors shadow-lg"
            >
              <Heart className="w-5 h-5 mr-2" />
              Become a Donor
            </a>
            <a
              href="/request"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-red-600 dark:hover:bg-gray-800 dark:hover:text-red-400 transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              Request Blood
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
