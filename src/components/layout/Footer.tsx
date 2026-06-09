
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="container-custom py-16 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-primary-foreground">
                Tonys Estate
              </h2>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-xs">
              Connecting you with premier real estate properties across Nigeria. Your trusted partner in finding the perfect home.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-accent hover:bg-primary-foreground/10 rounded-full transition-all duration-300">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-accent hover:bg-primary-foreground/10 rounded-full transition-all duration-300">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-accent hover:bg-primary-foreground/10 rounded-full transition-all duration-300">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-accent hover:bg-primary-foreground/10 rounded-full transition-all duration-300">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 relative inline-block">
              <span>Quick Links</span>
              <span className="absolute -bottom-1 left-0 w-1/3 h-0.5 bg-accent"></span>
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/properties" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Market Trends
                </Link>
              </li>
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 relative inline-block">
              <span>Contact Us</span>
              <span className="absolute -bottom-1 left-0 w-1/3 h-0.5 bg-accent"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex">
                <MapPin className="h-5 w-5 text-primary-foreground/80 mr-2 flex-shrink-0" />
                <span className="text-primary-foreground/80">
                  Enugu Office:<br />
                  123 Independence Avenue,<br />
                  Enugu, Nigeria
                </span>
              </li>
              <li className="flex mt-2">
                <MapPin className="h-5 w-5 text-primary-foreground/80 mr-2 flex-shrink-0" />
                <span className="text-primary-foreground/80">
                  Calabar Office:<br />
                  45 Marina Road,<br />
                  Calabar, Nigeria
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary-foreground/80 mr-2 flex-shrink-0" />
                <span className="text-primary-foreground/80">(+234) 7085101983</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary-foreground/80 mr-2 flex-shrink-0" />
                <span className="text-primary-foreground/80">info@tonysestate.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 relative inline-block">
              <span>Newsletter</span>
              <span className="absolute -bottom-1 left-0 w-1/3 h-0.5 bg-accent"></span>
            </h3>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Subscribe to our newsletter for the latest student housing updates.
            </p>
            <form className="space-y-3">
              <div className="relative group">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 pr-12 h-10 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                />
                <Button
                  type="submit"
                  className="absolute right-0 top-0 bottom-0 bg-accent hover:bg-accent/90 text-accent-foreground rounded-r-md transition-all duration-300 hover:shadow-md"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-xs text-primary-foreground/70">
          <p>© {new Date().getFullYear()} Tonys Estate. All rights reserved.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link to="/" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-accent transition-colors">Terms of Service</Link>
            <Link to="/" className="hover:text-accent transition-colors">Cookies</Link>
            <Link to="/" className="hover:text-accent transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
