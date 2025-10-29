import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface HeroProps {
  id: string
  onExploreClick: () => void
}

export function Hero({ id, onExploreClick }: HeroProps) {
  return (
    <section id={id} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 hero-gradient" />
      


      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Unleash Your Potential
            <br />
            <span className="text-accent">with Smart Sportswear</span>
          </motion.h1>
          
          <motion.p
            className="text-base md:text-lg lg:text-xl text-white/80 mb-6 md:mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Experience the future of athletic performance with Zava's revolutionary 
            smart jerseys and cleats designed for elite athletes.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg font-semibold w-full sm:w-auto"
              onClick={onExploreClick}
            >
              Shop Now
              <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" weight="bold" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg font-semibold w-full sm:w-auto bg-transparent"
            >
              <Play className="mr-2 w-4 h-4 md:w-5 md:h-5" weight="fill" />
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
