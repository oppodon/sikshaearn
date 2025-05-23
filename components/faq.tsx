"use client"; // Add this directive at the very top

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Badge } from './badge'; // Assuming this path is correct

// Define a type for individual FAQ items for better type safety (optional but good practice)
interface FaqItem {
  question: string;
  answer: string;
}
const FaqSection: React.FC = () => {
  const faqs = [
    {
      question: "How do I get started with the courses?",
      answer: "Simply browse our course catalog, select your desired course, and click 'Enroll'. You'll get immediate access to the course materials after registration."
    },
    {
      question: "Are the certificates internationally recognized?",
      answer: "Yes, our certificates are recognized by leading industry partners and employers worldwide. They validate your skills and knowledge in the respective field."
    },
    {
      question: "What support do you offer to students?",
      answer: "We provide 24/7 technical support, dedicated mentors, interactive discussion forums, and live Q&A sessions to ensure you have all the help you need."
    },
    {
      question: "Can I access the courses on mobile devices?",
      answer: "Yes, our platform is fully responsive. You can access all course content on any device - desktop, tablet, or mobile phone."
    },
    {
      question: "What is your refund policy?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied with the course, you can request a full refund within the first 30 days of enrollment."
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-gray-900/[0.02] -z-10" />
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200">
            FAQ
          </Badge>
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-lg">
            Find answers to common questions about our courses and learning platform
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* FAQ Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
                alt="Students learning"
                className="w-full h-[600px] object-cover"
              />
            </div>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <details className="group p-6">
                    <summary className="flex justify-between items-center cursor-pointer list-none">
                      <span className="text-lg font-semibold text-gray-800">{faq.question}</span>
                      <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;