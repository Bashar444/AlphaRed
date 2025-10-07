import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Heart, 
  Pill, 
  TrendingUp, 
  Building, 
  Dna, 
  Laptop, 
  Leaf, 
  GraduationCap,
  Filter
} from "lucide-react";

const researchProjects = [
  {
    id: 1,
    title: "Healthcare Funding Allocation Analysis",
    description: "Quantitative research using Analytical Hierarchy Process (AHP) to prioritize healthcare funding allocation strategies.",
    category: "health",
    institution: "BIMTECH Research Center",
    icon: Heart,
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
  },
  {
    id: 2,
    title: "One Health Concept Awareness",
    description: "Qualitative research exploring awareness of One Health concept addressing SDG3 and biodiversity preservation.",
    category: "health",
    institution: "BIMTECH Research Center",
    icon: Heart,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
  },
  {
    id: 3,
    title: "Healthcare Consumerism Analysis",
    description: "Qualitative review research analyzing healthcare consumerism in managerial settings using qualitative methods.",
    category: "health",
    institution: "BIMTECH Research Center",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
  },
  {
    id: 4,
    title: "Dapagliflozin & Rosuvastatin Protection",
    description: "Research study on protective effects against in vitro albumin glycation using novel drug combinations.",
    category: "pharma",
    institution: "Marwadi University",
    icon: Pill,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
  },
  {
    id: 5,
    title: "Nanotechnology in DNA Genotyping",
    description: "Applications of nanotechnology in DNA genotyping and phenotype analysis using SNP and PEGE molecular methods.",
    category: "pharma",
    institution: "Marwadi University",
    icon: Dna,
    color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
  },
  {
    id: 6,
    title: "Telemedicine Market Research",
    description: "Market research and lead generation for telemedicine solutions targeting international healthcare markets.",
    category: "pharma",
    institution: "Navrik Company Research",
    icon: Laptop,
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
  },
  {
    id: 7,
    title: "Sustainable Automobile Supply Chain",
    description: "Quantitative research on sustainable supply chain management in automobile industry using AHP methodology.",
    category: "management",
    institution: "BIMTECH Research Center",
    icon: Building,
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  },
  {
    id: 8,
    title: "Biomass Gasification Research",
    description: "Qualitative research on gasification of lignocellulosic biomass in supercritical fluid media for biofuel production.",
    category: "management",
    institution: "BIMTECH Research Center",
    icon: Leaf,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
  },
  {
    id: 9,
    title: "Medical Education Best Practices",
    description: "Innovation courses research to improve medical education practices for MBBS doctors in India.",
    category: "management",
    institution: "BMJ India Research",
    icon: GraduationCap,
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
  }
];

const filterOptions = [
  { value: "all", label: "All Projects", icon: Filter },
  { value: "health", label: "Healthcare", icon: Heart },
  { value: "pharma", label: "Pharmaceutical", icon: Pill },
  { value: "management", label: "Management", icon: Building }
];

export function Research() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredProjects = researchProjects.filter(
    project => activeFilter === "all" || project.category === activeFilter
  );

  return (
    <section id="research" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Research Projects</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {filterOptions.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <Button
                  key={filter.value}
                  variant={activeFilter === filter.value ? "default" : "outline"}
                  onClick={() => setActiveFilter(filter.value)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => {
            const IconComponent = project.icon;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                layout
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className={project.color}>
                        {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-3 line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="text-xs text-muted-foreground font-medium">
                      {project.institution}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects found for the selected category.</p>
          </div>
        )}
      </div>
    </section>
  );
}
