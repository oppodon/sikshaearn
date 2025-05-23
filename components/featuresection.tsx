import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Award, Target } from 'lucide-react';
import {Badge} from './ui/badge';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Lightbulb className="h-12 w-12 text-amber-500" />,
      title: "Innovative Learning",
      description: "Our courses use cutting-edge teaching methods and technologies for effective learning.",
      image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
      gradient: "from-amber-500/20 to-amber-600/20"
    },
    {
      icon: <Award className="h-12 w-12 text-emerald-500" />,
      title: "Industry Recognized",
      description: "Earn certificates that are recognized and valued by employers across industries.",
      image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
      gradient: "from-emerald-500/20 to-emerald-600/20"
    },
    {
      icon: <Target className="h-12 w-12 text-blue-500" />,
      title: "Career-Focused",
      description: "Our programs are designed to help you achieve specific career goals and advancement.",
      image: "https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg",
      gradient: "from-blue-500/20 to-blue-600/20"
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
            Why Choose Us
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Features That Set Us Apart
          </h2>
          <p className="text-gray-600 text-lg">
            We provide comprehensive learning experiences designed to help you achieve your goals and advance your
            career in the digital world.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative h-64">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                    <div className="absolute top-4 left-4">
                      <div className="p-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg">
                        {feature.icon}
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="mt-4 inline-flex items-center text-blue-600 font-medium cursor-pointer"
                  >
                    Learn more
                    <svg
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;