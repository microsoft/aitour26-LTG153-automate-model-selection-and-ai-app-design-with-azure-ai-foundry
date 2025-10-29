import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarBlank, Users, Trophy, Lightbulb, Target, Rocket } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface AboutProps {
  id: string
}

export function About({ id }: AboutProps) {
  const milestones = [
    {
      year: '2019',
      title: 'Company Founded',
      description: 'Zava was born from a vision to revolutionize athletic performance through smart technology.'
    },
    {
      year: '2020',
      title: 'First Prototype',
      description: 'Developed our first smart jersey prototype with basic biometric monitoring capabilities.'
    },
    {
      year: '2021',
      title: 'Patent Filed',
      description: 'Secured patents for our proprietary sensor integration and analytics platform.'
    },
    {
      year: '2022',
      title: 'Pro Partnership',
      description: 'Partnered with professional teams to test and refine our smart sportswear technology.'
    },
    {
      year: '2023',
      title: 'Smart Cleats Launch',
      description: 'Launched revolutionary smart cleats with advanced pressure mapping and gait analysis.'
    },
    {
      year: '2024',
      title: 'Global Expansion',
      description: 'Expanded to serve athletes and teams worldwide with our complete smart sportswear line.'
    }
  ]

  const team = [
    {
      name: 'Dr. Sarah Chen',
      role: 'CEO & Co-Founder',
      image: '/api/placeholder/300/300',
      background: 'Former Olympic athlete turned tech entrepreneur. PhD in Sports Science from Stanford.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO & Co-Founder',
      image: '/api/placeholder/300/300',
      background: 'Ex-Apple engineer with 15 years in wearable technology and sensor development.'
    },
    {
      name: 'Dr. Elena Volkova',
      role: 'Head of Research',
      image: '/api/placeholder/300/300',
      background: 'Leading sports biomechanics researcher with 50+ published papers on athletic performance.'
    },
    {
      name: 'James Park',
      role: 'VP of Product',
      image: '/api/placeholder/300/300',
      background: 'Former Nike product manager with expertise in athletic apparel and consumer technology.'
    }
  ]

  const values = [
    {
      icon: Target,
      title: 'Performance Excellence',
      description: 'We believe every athlete deserves access to professional-grade performance insights.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation First',
      description: 'Pushing the boundaries of what\'s possible in smart sportswear technology.'
    },
    {
      icon: Users,
      title: 'Athlete-Centric',
      description: 'Every product decision is made with the athlete\'s needs and goals in mind.'
    },
    {
      icon: Trophy,
      title: 'Proven Results',
      description: 'Our technology has helped thousands of athletes achieve their personal bests.'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <section id={id} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            About Zava
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to unlock human athletic potential through innovative smart technology. 
            From our headquarters in Silicon Valley, we design and manufacture the world's most advanced smart sportswear.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-20"
        >
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-6 md:p-12 text-center">
              <Rocket className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 text-accent" weight="bold" />
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">Our Mission</h3>
              <p className="text-base md:text-lg lg:text-xl leading-relaxed">
                To democratize elite-level athletic performance insights by making cutting-edge 
                smart sportswear accessible to athletes at every level, from weekend warriors 
                to Olympic champions.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Company Values */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 md:mb-20"
        >
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-8 md:mb-12">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {values.map((value) => (
              <motion.div key={value.title} variants={itemVariants}>
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-tech-gradient rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <value.icon className="w-5 h-5 md:w-6 md:h-6 text-white" weight="bold" />
                    </div>
                    <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">{value.title}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">Our Journey</h3>
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-border hidden md:block"></div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <Badge className="mb-3 bg-accent text-accent-foreground">
                          <CalendarBlank className="w-4 h-4 mr-1" />
                          {milestone.year}
                        </Badge>
                        <h4 className="font-semibold text-lg mb-2">{milestone.title}</h4>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="hidden md:block w-4 h-4 bg-accent rounded-full border-4 border-background z-10 flex-shrink-0"></div>
                  
                  <div className="flex-1 hidden md:block"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Leadership Team */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-8 md:mb-12">Leadership Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {team.map((member) => (
              <motion.div key={member.name} variants={itemVariants}>
                <Card className="hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className="relative mb-3 md:mb-4">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <h4 className="font-semibold text-base md:text-lg mb-1">{member.name}</h4>
                    <p className="text-accent font-medium mb-2 md:mb-3 text-sm md:text-base">{member.role}</p>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{member.background}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}