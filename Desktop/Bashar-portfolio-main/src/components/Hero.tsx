import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Download, Mail } from "lucide-react";
import { motion } from "framer-motion";
import portfolioPhoto from "@assets/portfolio photo _1749475678640.jpg";

export function Hero() {
  const handleContactClick = () => {
    const contactSection = document.querySelector("#contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDownloadCV = () => {
    // Create a download link for the CV file
    const link = document.createElement("a");
    link.href = "/cv-dr-bashar-al-agha.docx";
    link.download = "CV-Dr-Bashar-Al-Agha.docx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="home" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              <span className="gradient-text">Dr. Bashar Al Agha</span>
            </h1>
            <h2 className="text-xl sm:text-2xl text-muted-foreground mb-6">
              Founder & CEO at Omnium | Healthcare & Management Professional
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              Dentist, Pharmacist, and Management Graduate driving innovation in healthcare, education, and professional ecosystem development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button onClick={handleContactClick} className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Get In Touch
              </Button>
              <Button variant="outline" onClick={handleDownloadCV} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download CV
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <Avatar className="w-64 h-64 border-4 border-background shadow-2xl">
              <AvatarImage
                src={portfolioPhoto}
                alt="Dr. Bashar Al Agha"
                className="object-cover"
              />
              <AvatarFallback className="text-4xl font-bold">BA</AvatarFallback>
            </Avatar>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
