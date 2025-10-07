import { motion } from "framer-motion";
import { Mail, Linkedin, Phone, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold gradient-text mb-4">Dr. Bashar Al Agha</h3>
          <p className="text-muted-foreground mb-2">Founder & CEO at Omnium</p>
          <p className="text-muted-foreground mb-6">Healthcare & Management Professional</p>
          
          <div className="flex justify-center space-x-6 mb-8">
            <a
              href="mailto:bashar.agha25@bimtech.ac.in"
              className="w-10 h-10 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-colors"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/in/bashar-al-agha"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-muted hover:bg-blue-600 hover:text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="tel:+919667605190"
              className="w-10 h-10 bg-muted hover:bg-emerald-600 hover:text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Phone"
            >
              <Phone className="h-5 w-5" />
            </a>
            <a
              href="https://omn-omega.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-muted hover:bg-purple-600 hover:text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Omnium"
            >
              <Globe className="h-5 w-5" />
            </a>
          </div>
          
          <div className="border-t pt-8">
            <p className="text-muted-foreground mb-2">
              © 2025 Dr. Bashar Al Agha. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Powered by <a href="https://omn-omega.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Omnium</a>
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
