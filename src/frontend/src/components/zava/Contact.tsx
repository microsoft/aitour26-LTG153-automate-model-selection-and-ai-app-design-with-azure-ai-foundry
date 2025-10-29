import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Phone, Envelope, Clock, CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

interface ContactProps {
  id: string
}

interface FormData {
  name: string
  email: string
  subject: string
  message: string
  inquiryType: string
}

export function Contact({ id }: ContactProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissions, setSubmissions] = useState<any[]>([])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive"
      })
      return false
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      })
      return false
    }
    if (!formData.subject.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject",
        variant: "destructive"
      })
      return false
    }
    if (!formData.message.trim()) {
      toast({
        title: "Error",
        description: "Please enter your message",
        variant: "destructive"
      })
      return false
    }
    if (!formData.inquiryType) {
      toast({
        title: "Error",
        description: "Please select an inquiry type",
        variant: "destructive"
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const submission = {
        ...formData,
        id: Date.now(),
        timestamp: new Date().toISOString()
      }
      
      setSubmissions(current => [submission, ...current])
      
      toast({
        title: "Success",
        description: "Thank you! Your message has been sent successfully."
      })
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: ''
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Headquarters',
      details: ['1 Hacker Way', 'Palo Alto, CA 94301', 'United States']
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['+1 (555) 123-ZAVA', 'Mon-Fri 9AM-6PM PST']
    },
    {
      icon: Envelope,
      title: 'Email',
      details: ['hello@zava.com', 'support@zava.com']
    },
    {
      icon: Clock,
      title: 'Support Hours',
      details: ['Monday - Friday: 9AM - 6PM PST', 'Saturday: 10AM - 4PM PST', 'Sunday: Closed']
    }
  ]

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
            Get in Touch
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to revolutionize your athletic performance? Contact us to learn more about 
            our smart sportswear technology or to discuss partnership opportunities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your full name"
                        className="h-9"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        className="h-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inquiry-type" className="text-sm">Inquiry Type *</Label>
                    <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange('inquiryType', value)}>
                      <SelectTrigger id="inquiry-type" className="h-9">
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Information</SelectItem>
                        <SelectItem value="product">Product Questions</SelectItem>
                        <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="press">Press & Media</SelectItem>
                        <SelectItem value="careers">Careers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief subject of your inquiry"
                      className="h-9"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Tell us more about your inquiry..."
                      rows={4}
                      className="resize-none"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-accent hover:bg-accent/90 h-10"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Envelope className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4 md:space-y-6"
          >
            {contactInfo.map((info) => (
              <Card key={info.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-tech-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 md:w-6 md:h-6 text-white" weight="bold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2">{info.title}</h3>
                      {info.details.map((detail, index) => (
                        <p key={index} className="text-sm md:text-base text-muted-foreground mb-1">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Interactive Map Placeholder */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="h-48 md:h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-10 h-10 md:w-12 md:h-12 text-accent mx-auto mb-2 md:mb-3" weight="bold" />
                    <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2">Visit Our HQ</h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Interactive map coming soon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4 text-center">Why Choose Zava?</h3>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-accent flex-shrink-0" weight="fill" />
                    <span className="text-sm md:text-base">Trusted by 500+ professional athletes</span>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-accent flex-shrink-0" weight="fill" />
                    <span className="text-sm md:text-base">24/7 technical support</span>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-accent flex-shrink-0" weight="fill" />
                    <span className="text-sm md:text-base">30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-accent flex-shrink-0" weight="fill" />
                    <span className="text-sm md:text-base">Worldwide shipping available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}