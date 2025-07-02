import React from 'react';
import { BookOpen, ExternalLink, Award, FileText, Video, ThumbsUp, AlertTriangle, HelpCircle, Droplets } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const EducationPage = () => {
  const { t } = useLanguage();
  
  const faqItems = [
    {
      question: "Who can donate blood?",
      answer: "Generally, most healthy adults between 18-65 years who weigh at least 50kg can donate blood. However, specific criteria may vary based on health conditions, recent travel, and other factors."
    },
    {
      question: "How often can I donate blood?",
      answer: "In Nepal, whole blood donors can donate every 3 months (4 times a year). This allows your body sufficient time to replenish the donated blood."
    },
    {
      question: "How long does the donation process take?",
      answer: "The actual blood donation takes only about 8-10 minutes. However, the entire process, including registration, screening, and recovery, typically takes about 1 hour."
    },
    {
      question: "Is blood donation painful?",
      answer: "Most donors feel only a brief sting when the needle is inserted. The actual donation process is usually painless. Some people may experience mild discomfort."
    },
    {
      question: "What should I do before donating blood?",
      answer: "Get a good night's sleep, have a healthy meal, drink plenty of fluids, and avoid alcohol and fatty foods before donation. Bring a valid ID and list of medications you're taking."
    },
    {
      question: "Are there any side effects after donating blood?",
      answer: "Most donors feel fine after donation. Some may experience lightheadedness, dizziness, or fatigue. These symptoms usually resolve quickly with rest and hydration."
    }
  ];
  
  const bloodComponents = [
    {
      name: "Red Blood Cells",
      description: "Carry oxygen from the lungs to the body tissues and take carbon dioxide back to the lungs",
      usage: "Anemia, surgery, blood loss, kidney failure",
      shelf_life: "42 days"
    },
    {
      name: "Platelets",
      description: "Tiny cell fragments that help blood clot to stop bleeding",
      usage: "Cancer treatments, surgery, transplants, blood disorders",
      shelf_life: "5 days"
    },
    {
      name: "Plasma",
      description: "Liquid portion of blood containing proteins, antibodies and clotting factors",
      usage: "Burns, shock, bleeding disorders, liver diseases",
      shelf_life: "1 year (frozen)"
    },
    {
      name: "Whole Blood",
      description: "Contains all blood components: red cells, white cells, platelets, and plasma",
      usage: "Trauma, surgery, blood loss",
      shelf_life: "35 days"
    }
  ];
  
  const eligibilityCriteria = [
    {
      criterion: "Age",
      requirement: "18-65 years (some exceptions may apply)",
      icon: <FileText className="h-5 w-5 text-red-600 dark:text-red-500" />
    },
    {
      criterion: "Weight",
      requirement: "At least 50 kg",
      icon: <FileText className="h-5 w-5 text-red-600 dark:text-red-500" />
    },
    {
      criterion: "Hemoglobin",
      requirement: "Men: 13.5g/dl or higher, Women: 12.5g/dl or higher",
      icon: <FileText className="h-5 w-5 text-red-600 dark:text-red-500" />
    },
    {
      criterion: "Pulse",
      requirement: "Between 60-100 beats per minute",
      icon: <FileText className="h-5 w-5 text-red-600 dark:text-red-500" />
    },
    {
      criterion: "Blood Pressure",
      requirement: "Systolic: 100-180 mmHg, Diastolic: 60-100 mmHg",
      icon: <FileText className="h-5 w-5 text-red-600 dark:text-red-500" />
    },
    {
      criterion: "Temperature",
      requirement: "Should not exceed 37.5°C",
      icon: <FileText className="h-5 w-5 text-red-600 dark:text-red-500" />
    },
  ];
  
  const myths = [
    {
      myth: "Blood donation makes you weak",
      fact: "The body replaces the fluid lost during donation within 24 hours. Red blood cells are replaced within a few weeks. Most donors resume normal activities the same day.",
      icon: <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-500" />
    },
    {
      myth: "Blood donation causes weight gain or loss",
      fact: "Blood donation has no effect on weight. The amount of blood donated (usually 350-450ml) is quickly replaced by the body.",
      icon: <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-500" />
    },
    {
      myth: "You can contract diseases by donating blood",
      fact: "Blood donation is completely safe. New, sterile equipment is used for each donor, eliminating any risk of contracting diseases.",
      icon: <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-500" />
    },
    {
      myth: "People with diabetes cannot donate blood",
      fact: "People with controlled diabetes can donate blood if they are in good health and their diabetes is well-managed with diet or oral medication.",
      icon: <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-500" />
    },
    {
      myth: "Women cannot donate during menstruation",
      fact: "Women can donate blood during menstruation if they feel well and meet all other eligibility criteria including hemoglobin levels.",
      icon: <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-500" />
    },
    {
      myth: "Vegetarians cannot donate blood",
      fact: "Vegetarians can donate blood as long as their hemoglobin levels meet the minimum requirements. Iron-rich vegetarian foods can help maintain adequate hemoglobin.",
      icon: <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-500" />
    }
  ];
  
  const resources = [
    {
      title: "Nepal Red Cross Society - Blood Service",
      description: "Official blood service provider in Nepal with information on donation centers and blood drives.",
      link: "https://www.nrcs.org/resources/blood-service/",
      icon: <ExternalLink className="h-5 w-5" />
    },
    {
      title: "WHO Blood Safety Guidelines",
      description: "World Health Organization's comprehensive guidelines on blood donation safety.",
      link: "https://www.who.int/health-topics/blood-transfusion-safety",
      icon: <ExternalLink className="h-5 w-5" />
    },
    {
      title: "Nepal Blood Bank Society",
      description: "Information on blood donation centers, upcoming blood drives, and educational materials.",
      link: "https://www.nrcs.org",
      icon: <ExternalLink className="h-5 w-5" />
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Blood Donation Education
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 sm:mt-4">
            Learn about blood donation, eligibility criteria, and the life-saving impact of your contribution
          </p>
        </div>
        
        {/* Hero Section */}
        <div className="bg-red-700 dark:bg-red-800 rounded-xl shadow-xl overflow-hidden mb-16">
          <div className="px-6 py-12 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white">Why Donate Blood?</h2>
                <p className="mt-4 text-lg text-red-100">
                  Your blood donation can save up to 3 lives. In Nepal, blood is needed every 2 seconds for surgeries, cancer treatments, chronic illnesses, and traumatic injuries.
                </p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-start">
                    <Award className="h-6 w-6 text-red-300 mt-0.5 mr-3" />
                    <p className="text-white">Every donation can save up to 3 lives</p>
                  </div>
                  <div className="flex items-start">
                    <Award className="h-6 w-6 text-red-300 mt-0.5 mr-3" />
                    <p className="text-white">Blood cannot be manufactured; it can only come from generous donors</p>
                  </div>
                  <div className="flex items-start">
                    <Award className="h-6 w-6 text-red-300 mt-0.5 mr-3" />
                    <p className="text-white">Regular donation allows for fresh, high-quality blood supply</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block relative h-64">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <Droplets className="h-16 w-16 text-white" />
                  </div>
                </div>
                <div className="absolute top-0 left-1/4 w-16 h-16 bg-red-500 rounded-full"></div>
                <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-red-800 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Eligibility Criteria */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            <div className="flex items-center">
              <FileText className="h-7 w-7 mr-2 text-red-600 dark:text-red-500" />
              Blood Donation Eligibility
            </div>
          </h2>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                To ensure the safety of both donors and recipients, blood donors must meet certain criteria. Here are the basic eligibility requirements:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eligibilityCriteria.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      {item.icon}
                      <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">{item.criterion}</h3>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{item.requirement}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-base font-medium text-yellow-800 dark:text-yellow-200">Temporary Deferrals</h3>
                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                      You may be temporarily unable to donate if you:
                    </p>
                    <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                      <li>Have a cold, flu, or fever</li>
                      <li>Are pregnant or have given birth in the last 6 months</li>
                      <li>Have recently had certain vaccinations</li>
                      <li>Have traveled to areas with high risk of certain infections</li>
                      <li>Have recently had surgery or dental work</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Blood Components */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            <div className="flex items-center">
              <Droplets className="h-7 w-7 mr-2 text-red-600 dark:text-red-500" />
              Blood Components and Their Uses
            </div>
          </h2>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
              <p className="text-gray-600 dark:text-gray-400">
                After collection, whole blood can be separated into several components. Each component serves different medical needs:
              </p>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Component
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Medical Uses
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Shelf Life
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {bloodComponents.map((component, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {component.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {component.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {component.usage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {component.shelf_life}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Myths and Facts */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            <div className="flex items-center">
              <HelpCircle className="h-7 w-7 mr-2 text-red-600 dark:text-red-500" />
              Common Myths About Blood Donation
            </div>
          </h2>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myths.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">Myth: {item.myth}</h3>
                        <div className="mt-2 flex items-start">
                          <div className="flex-shrink-0 pt-0.5">
                            {item.icon}
                          </div>
                          <p className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-green-600 dark:text-green-500">Fact:</span> {item.fact}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            <div className="flex items-center">
              <HelpCircle className="h-7 w-7 mr-2 text-red-600 dark:text-red-500" />
              Frequently Asked Questions
            </div>
          </h2>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {faqItems.map((item, index) => (
                <div key={index} className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.question}</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Resources */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            <div className="flex items-center">
              <BookOpen className="h-7 w-7 mr-2 text-red-600 dark:text-red-500" />
              Additional Resources
            </div>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{resource.title}</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">{resource.description}</p>
                  <div className="mt-4">
                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 transition-colors"
                    >
                      Learn more {resource.icon}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 dark:from-red-700 dark:to-red-900 rounded-xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 lg:px-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white">Ready to Save Lives?</h2>
              <p className="mt-4 text-lg text-red-100 max-w-2xl mx-auto">
                Your blood donation can make a life-saving difference for someone in need. Register as a donor today.
              </p>
              <div className="mt-8 flex justify-center">
                <a
                  href="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Become a Donor
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationPage;
