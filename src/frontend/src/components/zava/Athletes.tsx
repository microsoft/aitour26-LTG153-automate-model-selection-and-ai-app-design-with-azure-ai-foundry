import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CaretLeft, CaretRight, Play, Quotes, Star } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface Athlete {
  id: string
  name: string
  sport: string
  team: string
  image: string
  quote: string
  video?: string
  stats: {
    improvement: string
    metric: string
  }
  testimony: string
}

interface AthletesProps {
  id: string
}

export function Athletes({ id }: AthletesProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const athletes: Athlete[] = [
    {
      id: '1',
      name: 'Marcus Johnson',
      sport: 'Football',
      team: 'Pro League Champions',
      image: '/images/zava/marcus-johnson.jpg',
      quote: "Zava's smart jersey helped me optimize my training and prevent injuries. The real-time feedback is incredible.",
      video: '/api/placeholder/video/athlete1.mp4',
      stats: {
        improvement: '23%',
        metric: 'Performance Increase'
      },
      testimony: "Since switching to Zava gear, I've seen remarkable improvements in my game. The data insights help me train smarter, not just harder."
    },
    {
      id: '2',
      name: 'Sofia Rodriguez',
      sport: 'Soccer',
      team: 'International Women\'s Team',
      image: '/images/zava/sofia-rodriguez.jpg',
      quote: "The smart cleats revolutionized how I understand my running patterns and ball control.",
      video: '/api/placeholder/video/athlete2.mp4',
      stats: {
        improvement: '31%',
        metric: 'Sprint Speed'
      },
      testimony: "Zava's technology gives me the competitive edge I need. The pressure mapping in the cleats is phenomenal for improving my technique."
    },
    {
      id: '3',
      name: 'James Chen',
      sport: 'Basketball',
      team: 'Metropolitan University',
      image: '/images/zava/james-chen.jpg',
      quote: "Training with Zava gear feels like having a personal coach analyzing every move I make.",
      video: '/api/placeholder/video/athlete3.mp4',
      stats: {
        improvement: '18%',
        metric: 'Jump Height'
      },
      testimony: "The biometric monitoring helped me identify when I was overtraining. Now I perform consistently at my peak level."
    },
    {
      id: '4',
      name: 'Emma Thompson',
      sport: 'Track & Field',
      team: 'Olympic Training Center',
      image: '/images/zava/emma-thompson.jpg',
      quote: "Zava's analytics platform helped me break my personal record by identifying inefficiencies in my form.",
      video: '/api/placeholder/video/athlete4.mp4',
      stats: {
        improvement: '12%',
        metric: 'Race Time'
      },
      testimony: "The precision of the motion tracking is unmatched. Every training session is now data-driven and purposeful."
    }
  ]

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % athletes.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + athletes.length) % athletes.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
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
            Athletes Trust Zava
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how professional athletes and teams are using Zava's smart technology 
            to push the boundaries of human performance.
          </p>
        </motion.div>

        {/* Main Carousel */}
        <div className="relative max-w-6xl mx-auto mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Athlete Image/Video */}
                    <div className="relative h-80 lg:h-auto overflow-hidden">
                      <img
                        src={athletes[currentIndex].image}
                        alt={athletes[currentIndex].name}
                        className="w-full h-[150%] object-cover"
                        style={{ objectPosition: 'center top' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          size="lg"
                          className="bg-accent/90 hover:bg-accent text-accent-foreground rounded-full w-14 h-14 p-0"
                        >
                          <Play className="w-5 h-5" weight="fill" />
                        </Button>
                      </div>

                      {/* Athlete Info Overlay */}
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl lg:text-2xl font-bold mb-1">{athletes[currentIndex].name}</h3>
                        <p className="text-white/90 text-sm lg:text-base">{athletes[currentIndex].sport}</p>
                        <p className="text-xs lg:text-sm text-white/70">{athletes[currentIndex].team}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 lg:p-8 flex flex-col justify-center">
                      <Quotes className="w-6 h-6 lg:w-8 lg:h-8 text-accent mb-3 lg:mb-4" weight="fill" />
                      
                      <blockquote className="text-lg lg:text-xl font-medium text-foreground mb-4 lg:mb-6 leading-relaxed">
                        "{athletes[currentIndex].quote}"
                      </blockquote>
                      
                      <p className="text-sm lg:text-base text-muted-foreground mb-6 lg:mb-8">
                        {athletes[currentIndex].testimony}
                      </p>

                      {/* Performance Stats */}
                      <div className="flex items-center space-x-4 lg:space-x-6 mb-4 lg:mb-6">
                        <div className="text-center">
                          <div className="text-2xl lg:text-3xl font-bold text-accent">
                            {athletes[currentIndex].stats.improvement}
                          </div>
                          <div className="text-xs lg:text-sm text-muted-foreground">
                            {athletes[currentIndex].stats.metric}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400" weight="fill" />
                          ))}
                        </div>
                      </div>

                      <Badge variant="secondary" className="w-fit text-xs lg:text-sm">
                        {athletes[currentIndex].sport} Athlete
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/90 backdrop-blur-sm"
            onClick={prevSlide}
          >
            <CaretLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/90 backdrop-blur-sm"
            onClick={nextSlide}
          >
            <CaretRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="flex justify-center space-x-2 md:space-x-4 mb-12">
          {athletes.map((athlete, index) => (
            <button
              key={athlete.id}
              onClick={() => goToSlide(index)}
              className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 transition-all ${
                index === currentIndex 
                  ? 'border-accent scale-110' 
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <img
                src={athlete.image}
                alt={athlete.name}
                className="w-full h-[150%] object-cover"
                style={{ objectPosition: 'center top' }}
              />
            </button>
          ))}
        </div>

        {/* Additional Testimonials Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
        >
          {athletes.slice(0, 3).map((athlete) => (
            <Card key={athlete.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                  <img
                    src={athlete.image}
                    alt={athlete.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                    style={{ objectPosition: 'center top' }}
                  />
                  <div>
                    <h4 className="font-semibold text-sm md:text-base">{athlete.name}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">{athlete.sport}</p>
                  </div>
                </div>
                
                <Quotes className="w-5 h-5 md:w-6 md:h-6 text-accent mb-2" weight="fill" />
                <p className="text-xs md:text-sm text-muted-foreground italic line-clamp-3">
                  "{athlete.quote}"
                </p>
                
                <div className="flex justify-between items-center mt-3 md:mt-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" weight="fill" />
                    ))}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Verified Athlete
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  )
}