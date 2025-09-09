import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Target, Linkedin, Mail, Github } from 'lucide-react';

export function Execom() {
  const execomMembers = [
    {
      name: 'Prof. Rejin R',
      position: 'Campus Enabler',
      image: './src/img/Rejin.jpg',
      bio: 'Supporting the community with vision and dedication to foster innovation and collaboration.',
      linkedin: 'https://www.linkedin.com/in/rejin-rajan-779841113/',
      email: 'rejin@gecidukki.ac.in',
      github: 'https://github.com/rejinr89'
    },
    {
      name: 'Albert George',
      position: 'Campus Lead',
      image: './src/img/albert.JPEG',
      bio: 'Supporting strategic initiatives and driving technical excellence across all projects.',
      linkedin: 'https://www.linkedin.com/in/albert-george-a40101231',
      email: 'albertkavil@gmail.com',
      github: 'https://github.com/albertgrge'
    },
    {
      name: 'Anandhu S Uthaman',
      position: 'Technical Lead',
      image: './src/img/anandhu.jpg',
      bio: 'Leading the technical team and driving innovation in our projects.',
      linkedin: 'https://www.linkedin.com/in/anandhu-s-uthaman-a44bb3309?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app',
      email: 'anandhuuthaman@gmail.com',
      github: 'https://github.com/AnandhusUthaman'
    },
    {
      name: 'Navya Mariam John',
      position: 'Women In Tech Lead',
      image: './src/img/NavyaMariamJohn.jpg',
      bio: 'Empowering women in tech and fostering a supportive environment for their growth.',
      linkedin: 'https://www.linkedin.com/in/navya-mariam-john-72b905315?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      email: 'navyamariam16@gmail.com',
      github: 'https://github.com/NavyaMariamJohn'
    },
    {
      name: 'Nicholas Roy',
      position: 'Community Lead',
      image: './src/img/nicho.jpg',
      bio: 'Organizing engaging events and workshops to enhance learning experiences.',
      linkedin: 'https://www.linkedin.com/in/karthik-nair-0000000000?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      email: 'Rizzupnick@gmail.com',
      github: '#'
    },
    {
      name: 'Nidhin Gireesh',
      position: 'Community Lead 2 ',
      image: './src/img/Nidhin.jpg',
      bio: 'Organizing engaging events and workshops to enhance learning experiences.',
      linkedin: 'https://www.linkedin.com/in/nidhingireesh?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      email: 'nidhingireesh12345@gmail.com',
      github: 'https://github.com/NidhinGireesh'
    },
    {
      name: 'Shimna B',
      position: 'Creative Lead',
      image: './src/img/shimna.jpg',
      bio: 'Creating visual identity and ensuring consistent design across all platforms.',
      linkedin: 'https://www.linkedin.com/in/shimna-b-b26a502aa?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      email: 'shimna1701@gmail.com',
      github: 'https://github.com/shim07'
    },
    {
      name: 'K S Mohammed Ihsaan',
      position: 'Interest Group Lead',
      image: './src/img/ihsaan.jpg',
      bio: 'Leading interest groups and fostering collaboration across diverse areas.',
      linkedin: 'www.linkedin.com/in/ihsaanmoh',
      email: 'ihsaanmoh8@gmail.com',
      github: 'https://github.com/Ihsaan-Moh'
    },
    {
      name: 'Adithyan VS',
      position: 'Discord Lead',
      image: './src/img/steam.jpg',
      bio: 'Managing the Discord server and fostering a vibrant community.',
      linkedin: '',
      email: 'adithyanvs107@gmail.com',
      github: 'https://github.com/Adithyan-101'
    },   
   
    {
      name: 'Avani M U',
      position: 'Content Lead',
      image: './src/img/avani.jpg',
      bio: 'Creating engaging content and managing social media presence.',
      linkedin: 'https://www.linkedin.com/in/avani-m-u-630882305?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      email: 'Avanimu2005@gmail.com',
      github: 'https://github.com/avani333'
    },
    {
      name: 'Jeevan Prakash',
      position: 'Media Lead',
      image: './src/img/JEEVANPRAKASH.JPEG',
      bio: 'Creating engaging content and managing social media presence.',
      linkedin: 'https://www.linkedin.com/in/jeevanpksh/',
      email: 'J3257p@gmail.com',
      github: 'https://github.com/jeev3257'
    }
  ];

  const responsibilities = [
    {
      icon: Target,
      title: 'Strategic Planning',
      description: 'Developing long-term vision and strategic roadmap for community growth and impact.'
    },
    {
      icon: Users,
      title: 'Community Building',
      description: 'Fostering an inclusive environment where all members can learn, grow, and collaborate.'
    },
    {
      icon: Award,
      title: 'Excellence in Execution',
      description: 'Ensuring high-quality delivery of events, projects, and community initiatives.'
    }
  ];

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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Executive Committee</h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto leading-relaxed">
              Meet the dedicated leaders who drive µLearn's mission forward and create opportunities for our community to thrive.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Responsibilities */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Responsibilities</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The executive committee works together to ensure µLearn continues to be a thriving community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {responsibilities.map((responsibility, index) => (
              <motion.div
                key={responsibility.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <responsibility.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{responsibility.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{responsibility.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive Committee Members */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Meet the Team</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our executive committee brings together diverse talents and expertise to lead µLearn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {execomMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                  <p className="text-blue-600 dark:text-blue-300 font-medium mb-3">{member.position}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{member.bio}</p>
                  
                  <div className="flex items-center space-x-3">
                    <a
                      href={member.linkedin}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      aria-label="Email"
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                    <a
                      href={member.github}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      aria-label="GitHub"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Access Note */}
      <section className="py-16 bg-blue-600 dark:bg-gray-900 text-white dark:text-blue-100 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Want to Join the Team?</h2>
            <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 leading-relaxed">
              We're always looking for passionate individuals to join our executive committee and help shape the future of µLearn.
            </p>
            
            <a
              href="/contact"
              className="bg-white dark:bg-blue-600 text-blue-600 dark:text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-700 transition-colors duration-200"
            >
              Get in Touch
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}