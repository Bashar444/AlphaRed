import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Calendar, MapPin, Building, ChevronRight } from "lucide-react";

const experienceData = [
  {
    id: 1,
    title: "Founder & Chief Executive Officer",
    company: "Omnium - Professional Ecosystem Platform",
    period: "2024 - Present",
    location: "Remote",
    type: "Full-time",
    responsibilities: [
      "Founded and leading Omnium, a virtual company building a comprehensive professional ecosystem",
      "Developing innovative solutions for professional networking and career development",
      "Creating integrated platforms for healthcare professionals and business leaders",
      "Driving digital transformation in professional services and ecosystem development"
    ],
    icon: "🚀",
    color: "border-l-purple-500"
  },
  {
    id: 2,
    title: "Dental Surgeon & Practice Owner",
    company: "Private Dental Practice Center",
    period: "June 2022 - May 2023",
    location: "Damascus, Syria",
    type: "Full-time",
    responsibilities: [
      "Provided comprehensive dental treatments for general surgery cases",
      "Oversaw operational needs of dental health center in Damascus suburb",
      "Led team specializing in complex dental surgeries including implants and wisdom teeth extractions",
      "Collaborated with Dental Syndicate of Syria and Health Ministry for conferences and workshops"
    ],
    icon: "🦷",
    color: "border-l-blue-500"
  },
  {
    id: 3,
    title: "Dental Surgeon & Pharmaceutical Manager",
    company: "COVID-19 Healthcare Response",
    period: "Jan 2020 - Dec 2021",
    location: "Damascus, Syria",
    type: "Full-time",
    responsibilities: [
      "Full-time scheduled work during COVID-19 pandemic",
      "Online consultant services under Damascus Central Dental Syndicate",
      "Managed pharmaceutical products and protocols during health crisis"
    ],
    icon: "💊",
    color: "border-l-emerald-500"
  }
];

const internshipData = [
  {
    id: 1,
    title: "Marketing Intern",
    company: "British Medical Journal India",
    period: "May 2023 - July 2023",
    type: "On-site",
    description: "Marketing channels and editorial work for BMJ India group, focusing on innovation courses to improve medical education practices for MBBS doctors in India.",
    icon: "📰",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
  },
  {
    id: 2,
    title: "Marketing & Sales Intern",
    company: "Navrik Software Solutions",
    period: "May 2023 - July 2023",
    type: "Online",
    description: "Telemedicine app development and advanced communication solutions for institutions and health organizations.",
    icon: "💻",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
  }
];

export function Experience() {
  return (
    <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Professional Experience</h2>
          <div className="w-20 h-1 bg-primary mx-auto"></div>
        </motion.div>

        <div className="space-y-12">
          {/* Main Experience */}
          <div className="space-y-8">
            <h3 className="text-2xl font-semibold flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              Professional Roles
            </h3>
            {experienceData.map((experience, index) => (
              <motion.div
                key={experience.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className={`border-l-4 ${experience.color} hover:shadow-lg transition-shadow`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{experience.icon}</div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                          <div>
                            <h4 className="text-xl font-semibold">{experience.title}</h4>
                            <p className="text-primary font-medium">{experience.company}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {experience.period}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {experience.location}
                              </div>
                              <Badge variant="secondary">{experience.type}</Badge>
                            </div>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {experience.responsibilities.map((responsibility, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                              <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{responsibility}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Internships */}
          <div className="space-y-8">
            <h3 className="text-2xl font-semibold">Internships & Research Positions</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {internshipData.map((internship, index) => (
                <motion.div
                  key={internship.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-2xl">{internship.icon}</div>
                        <div>
                          <h4 className="text-lg font-semibold">{internship.title}</h4>
                          <p className="text-primary font-medium text-sm">{internship.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{internship.period}</span>
                        <Badge variant="secondary" className={internship.color}>
                          {internship.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{internship.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
