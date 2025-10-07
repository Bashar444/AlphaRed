import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Calendar, GraduationCap } from "lucide-react";

const educationData = [
  {
    id: 1,
    degree: "Post Graduate Diploma in Management (Marketing)",
    institution: "Birla Institute of Management Technology (BIMTECH)",
    period: "July 2023 - May 2025",
    description: "Specialized in Marketing and Strategy",
    color: "border-l-blue-500",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
  },
  {
    id: 2,
    degree: "Bachelor of Pharmacy Sciences (B.Pharm)",
    institution: "Marwadi University - Chandarian Group of Institutions",
    period: "Nov 2018 - May 2022",
    description: "Specialization in diabetic diseases and novel drug research",
    color: "border-l-emerald-500",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
  },
  {
    id: 3,
    degree: "Doctor of Dental Surgery (D.D.S)",
    institution: "Damascus University of Dental Medicine",
    period: "June 2014 - October 2019",
    description: "Focus on cosmetic surgery and oral care, with research on crown and bridge preparation techniques",
    color: "border-l-purple-500",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
  }
];

export function Education() {
  return (
    <section id="education" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Education</h2>
          <div className="w-20 h-1 bg-primary mx-auto"></div>
        </motion.div>

        <div className="space-y-8">
          {educationData.map((education, index) => (
            <motion.div
              key={education.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`border-l-4 ${education.color} hover:shadow-lg transition-shadow`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">{education.degree}</h3>
                      </div>
                      <p className="text-primary font-medium mb-2">{education.institution}</p>
                      <p className="text-muted-foreground">{education.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary" className={education.badgeColor}>
                        {education.period}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
