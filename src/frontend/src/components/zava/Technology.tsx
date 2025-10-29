import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ActivityIcon as Activity,
  Heart as HeartStraight, 
  Thermometer, 
  ChartLineUp as ChartLine, 
  DeviceMobile as Smartphone, 
  CloudArrowUp,
  Sneaker,
  TShirt,
  BluetoothIcon as Bluetooth,
  BatteryFull as Battery
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface TechnologyProps {
  id: string
}

export function Technology({ id }: TechnologyProps) {
  const jerseyFeatures = [
    {
      icon: HeartStraight,
      title: 'Biometric Monitoring',
      description: 'Continuous heart rate, breathing rate, and stress level tracking through embedded sensors.'
    },
    {
      icon: Thermometer,
      title: 'Temperature Control',
      description: 'Smart fabric technology that regulates body temperature and moisture management.'
    },
    {
      icon: Activity,
      title: 'Motion Analysis',
      description: 'Advanced accelerometers track movement patterns, posture, and athletic form.'
    },
    {
      icon: ChartLine,
      title: 'Performance Analytics',
      description: 'Real-time data processing and insights delivered to your mobile device.'
    }
  ]

  const cleatsFeatures = [
    {
      icon: Activity,
      title: 'Pressure Mapping',
      description: 'Detailed foot pressure analysis to optimize stride and prevent injuries.'
    },
    {
      icon: ChartLine,
      title: 'Gait Analysis',
      description: 'Comprehensive running form analysis with personalized improvement suggestions.'
    },
    {
      icon: Sneaker,
      title: 'Balance Optimization',
      description: 'Center of gravity tracking to enhance stability and athletic performance.'
    },
    {
      icon: CloudArrowUp,
      title: 'Speed Metrics',
      description: 'Precise speed, acceleration, and direction change measurements.'
    }
  ]

  const techSpecs = [
    {
      icon: Bluetooth,
      title: 'Connectivity',
      value: 'Bluetooth 5.0 + WiFi',
      description: 'Seamless data transfer to mobile app'
    },
    {
      icon: Battery,
      title: 'Battery Life',
      value: 'Up to 72 hours',
      description: 'Long-lasting performance for extended training'
    },
    {
      icon: Smartphone,
      title: 'Mobile App',
      value: 'iOS & Android',
      description: 'Comprehensive analytics dashboard'
    },
    {
      icon: CloudArrowUp,
      title: 'Data Storage',
      value: 'Cloud Sync',
      description: 'Automatic backup and team sharing'
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
    <section id={id} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Revolutionary Smart Technology
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our proprietary sensors and analytics platform transform traditional sportswear 
            into intelligent performance enhancement tools.
          </p>
        </motion.div>

        {/* Technology Overview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {techSpecs.map((spec) => (
            <motion.div key={spec.title} variants={itemVariants}>
              <Card className="text-center h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="w-10 h-10 bg-tech-gradient rounded-lg flex items-center justify-center mx-auto mb-3">
                    <spec.icon className="w-5 h-5 text-white" weight="bold" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm">{spec.title}</h3>
                  <div className="text-xl font-bold text-accent mb-2">{spec.value}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{spec.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Jersey Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          {/* Handwritten Jersey Title */}
          <div className="relative mb-8">
            <h3 className="text-4xl md:text-5xl font-bold text-accent text-center transform -rotate-1 opacity-90" 
                style={{ 
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif', 
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)' 
                }}>
              Smart Jersey
            </h3>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {jerseyFeatures.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-tech-gradient rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" weight="bold" />
                    </div>
                    <Badge className="mb-2">Jersey Technology</Badge>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Cleats Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {/* Handwritten Cleats Title */}
          <div className="relative mb-8">
            <h3 className="text-4xl md:text-5xl font-bold text-accent text-center transform rotate-1 opacity-90" 
                style={{ 
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif', 
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)' 
                }}>
              Smart Cleats
            </h3>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {cleatsFeatures.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-tech-gradient rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" weight="bold" />
                    </div>
                    <Badge className="mb-2">Cleats Technology</Badge>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}