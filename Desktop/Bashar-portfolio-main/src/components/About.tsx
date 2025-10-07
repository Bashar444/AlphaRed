import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle, Award, Globe } from "lucide-react";

const skills = [
  { name: "Marketing Analytics", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { name: "Social Media Marketing", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { name: "Excel", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  { name: "Healthcare Management", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  { name: "Research Methodology", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" },
  { name: "International Sales", color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300" },
  { name: "Business Audit", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  { name: "Data Analytics", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
];

const certifications = [
  { name: "Marketing Analytics", issuer: "University of Virginia (Coursera)" },
  { name: "Social Media Marketing", issuer: "Meta Certification" },
  { name: "Research Methodology", issuer: "SOAS University of London" },
  { name: "Licensed Dentist", issuer: "Syria Dental Syndicate (Permanent)" },
  { name: "Registered Pharmacist", issuer: "Pharmacy Council of India (Permanent)" },
  { name: "Stock Market", issuer: "BIMTECH Workshop" },
];

const registrations = [
  "Syria Dental Syndicate (Permanent)",
  "India Dental Council (Temporary)",
  "Pharmacy Council of India (Permanent)",
];

const achievements = [
  "Founder & CEO of Omnium - Professional Ecosystem Platform",
  "International Biotechnology Conferences",
  "IIM Nagpur Case Publications",
  "5+ Research Publications in SDG 3",
];

export function About() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">About Me</h2>
          <div className="w-20 h-1 bg-primary mx-auto"></div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <Card>
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Motivated expert with a background in dentistry, a bachelor's degree in pharmacy and a master's degree in management. 
                  As Founder & CEO of <a href="https://omn-omega.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Omnium</a>, 
                  I'm building a comprehensive professional ecosystem platform that transforms how professionals connect, collaborate, and grow. 
                  Experienced in Medical and data science research and multidisciplinary healthcare studies. Thrilled to have the opportunity 
                  to use my varied academic experiences to propel innovation and achievement in a fast-paced, international environment.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Languages
                </h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>English (Fluent)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Arabic (Native)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className={skill.color}>
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  Professional Registrations
                </h3>
                <ul className="space-y-3">
                  {registrations.map((registration, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-muted-foreground">{registration}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Key Achievements
                </h3>
                <ul className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-muted-foreground">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Certifications</h3>
                <div className="grid gap-3">
                  {certifications.map((cert, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h4 className="font-medium">{cert.name}</h4>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
