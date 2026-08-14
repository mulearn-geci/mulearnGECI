import { motion } from 'framer-motion';
import { Target, Eye, Heart, Users, Award } from 'lucide-react';
const Group = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop';

export function About() {
  const values = [
    {
      icon: Target,
      title: 'Innovation',
      description: 'We foster creativity and encourage innovative thinking to solve real-world problems.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'We believe in the power of teamwork and collective intelligence to achieve greater outcomes.'
    },
    {
      icon: Heart,
      title: 'Inclusivity',
      description: 'We create an environment where everyone feels welcome and valued, regardless of their background.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for the highest standards in everything we do and celebrate achievements.'
    }
  ];

  // const team = [
  //   {
  //     name: 'Arjun Krishnan',
  //     position: 'Community Lead',
  //     image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
  //     bio: 'Computer Science student passionate about building inclusive tech communities.'
  //   },
  //   {
  //     name: 'Priya Sharma',
  //     position: 'Technical Lead',
  //     image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
  //     bio: 'Full-stack developer with expertise in modern web technologies and AI.'
  //   },
  //   {
  //     name: 'Rahul Menon',
  //     position: 'Events Coordinator',
  //     image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
  //     bio: 'Event management specialist focused on creating engaging learning experiences.'
  //   },
  //   {
  //     name: 'Sneha Patel',
  //     position: 'Design Lead',
  //     image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400',
  //     bio: 'UI/UX designer passionate about creating beautiful and functional user experiences.'
  //   }
  // ];

  // const milestones = [
  //   { year: '2023', title: 'Foundation', description: 'µLearn community was established with 50 founding members.' },
  //   { year: '2023', title: 'First Event', description: 'Successfully hosted our first tech workshop with 100+ participants.' },
  //   { year: '2024', title: 'Growth', description: 'Expanded to 300+ members and launched multiple learning tracks.' },
  //   { year: '2024', title: 'Recognition', description: 'Received "Best Student Community" award from the institution.' },
  //   { year: '2025', title: 'Innovation', description: 'Launched industry partnerships and internship programs.' }
  // ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white dark:from-gray-900 dark:to-gray-900 dark:text-blue-100 py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About µLearn</h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto leading-relaxed">
              A vibrant community of students, learners, and innovators working together to create meaningful impact through technology and collaboration.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  To empower students with practical skills, foster innovation, and create a supportive ecosystem 
                  where learners can collaborate, grow, and make meaningful contributions to technology and society.
                </p>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <Eye className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  To be the leading student community that bridges the gap between academic learning and industry 
                  requirements, creating future-ready professionals and innovators.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img
                src={Group}
                alt="Team collaboration"
                className="rounded-xl shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The principles that guide our community and shape our approach to learning and collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      {/* <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Key milestones in our community's growth and achievements.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-900"></div>
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative flex items-center mb-8"
              >
                <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center z-10">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="ml-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex-1 transition-colors duration-300">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium mr-3">
                      {milestone.year}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{milestone.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
}