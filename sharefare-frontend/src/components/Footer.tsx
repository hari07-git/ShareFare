import { Link } from "react-router-dom";
import { cn } from "../lib/cn";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Logo } from "./Logo";

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("mt-10", className)}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-8 px-6 py-10 md:grid-cols-4 md:px-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Logo />
            <p className="text-sm text-slate-600 leading-relaxed">
              Affordable, safer ride sharing for campus routes. Split costs, travel smarter, and reduce traffic.
            </p>
            <div className="flex items-center gap-2 text-slate-500">
              <a className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50 transition" href="#" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50 transition" href="#" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50 transition" href="#" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50 transition" href="#" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="text-sm font-semibold text-slate-950">Quick links</div>
            <div className="mt-4 grid gap-2.5 text-sm text-slate-600">
              <Link to="/rides/find" className="hover:text-slate-950 transition-colors">Find Ride</Link>
              <Link to="/rides/offer" className="hover:text-slate-950 transition-colors">Offer Ride</Link>
              <Link to="/my-bookings" className="hover:text-slate-950 transition-colors">My Trips</Link>
              <Link to="/support" className="hover:text-slate-950 transition-colors">Support</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <div className="text-sm font-semibold text-slate-950">Legal</div>
            <div className="mt-4 grid gap-2.5 text-sm text-slate-600">
              <Link to="/terms" className="hover:text-slate-950 transition-colors">Terms of service</Link>
              <Link to="/privacy" className="hover:text-slate-950 transition-colors">Privacy policy</Link>
              <Link to="/data-protection" className="hover:text-slate-950 transition-colors">Safety Guidelines</Link>
            </div>
          </div>

          {/* Support Contacts */}
          <div>
            <div className="text-sm font-semibold text-slate-950">Support</div>
            <div className="mt-4 grid gap-2.5 text-sm text-slate-600">
              <Link to="/support" className="hover:text-slate-950 transition-colors font-medium text-blue-600">Help Center & FAQ</Link>
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 mt-1">
                Email: <span className="text-slate-950 font-semibold">sharefaree@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footnote */}
        <div className="border-t border-slate-200 px-6 py-5 text-xs text-slate-500 md:px-10">
          © {new Date().getFullYear()} ShareFare. Made for students in Hyderabad, India.
        </div>
      </div>
    </footer>
  );
}
