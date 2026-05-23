import { Link } from "react-router-dom";
import { cn } from "../lib/cn";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const links = [
  { label: "Find a ride", to: "/rides/find" },
  { label: "Offer a ride", to: "/rides/offer" },
  { label: "Dashboard", to: "/home" }
];

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("mt-10", className)}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-8 px-6 py-10 md:grid-cols-4 md:px-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-white">
                SF
              </span>
              <div>
                <div className="text-base font-semibold text-slate-950">ShareFare</div>
                <div className="text-xs text-slate-500">Mobility for Hyderabad students</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Affordable, safer ride sharing for campus routes. Split costs, travel smarter, and reduce traffic.
            </p>
            <div className="mt-5 flex items-center gap-2 text-slate-500">
              <a className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50" href="#" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50" href="#" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50" href="#" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50" href="#" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-950">Quick links</div>
            <div className="mt-4 grid gap-2 text-sm text-slate-600">
              {links.map((l) => (
                <Link key={l.to} to={l.to} className="hover:text-slate-950">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-950">Legal</div>
            <div className="mt-4 grid gap-2 text-sm text-slate-600">
              <Link to="/terms" className="hover:text-slate-950 transition-colors">Terms of service</Link>
              <Link to="/privacy" className="hover:text-slate-950 transition-colors">Privacy policy</Link>
              <Link to="/cookies" className="hover:text-slate-950 transition-colors">Cookie policy</Link>
              <Link to="/data-protection" className="hover:text-slate-950 transition-colors">Data protection</Link>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-950">Support</div>
            <div className="mt-4 grid gap-2 text-sm text-slate-600">
              <Link to="/support" className="hover:text-slate-950 transition-colors">Help Center & FAQ</Link>
              <Link to="/rate-app" className="hover:text-slate-950 transition-colors">Rate the App</Link>
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 mt-1">
                Email: <span className="text-slate-950 font-medium">sharefaree@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 px-6 py-5 text-xs text-slate-500 md:px-10">
          © {new Date().getFullYear()} ShareFare. Made for students in Hyderabad, India.
        </div>
      </div>
    </footer>
  );
}
