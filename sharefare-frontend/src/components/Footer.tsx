import { Link } from "react-router-dom";
import { cn } from "../lib/cn";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const links = [
  { label: "Find a ride", to: "/rides/find" },
  { label: "Offer a ride", to: "/rides/offer" },
  { label: "Dashboard", to: "/home" },
  { label: "Admin", to: "/admin/login" }
];

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("mt-10", className)}>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#060a12]/70 shadow-[0_40px_120px_-70px_rgba(2,6,23,0.9)] backdrop-blur-xl">
        <div className="grid gap-8 px-6 py-10 md:grid-cols-4 md:px-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white">
                SF
              </span>
              <div>
                <div className="text-base font-semibold text-white">ShareFare</div>
                <div className="text-xs text-slate-300/80">Mobility for Hyderabad students</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-300/90">
              Affordable, safer ride sharing for campus routes. Split costs, travel smarter, and reduce traffic.
            </p>
            <div className="mt-5 flex items-center gap-2 text-slate-300/90">
              <a className="rounded-2xl border border-white/10 bg-white/5 p-2 hover:bg-white/10" href="#" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a className="rounded-2xl border border-white/10 bg-white/5 p-2 hover:bg-white/10" href="#" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a className="rounded-2xl border border-white/10 bg-white/5 p-2 hover:bg-white/10" href="#" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a className="rounded-2xl border border-white/10 bg-white/5 p-2 hover:bg-white/10" href="#" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">Quick links</div>
            <div className="mt-4 grid gap-2 text-sm text-slate-300/90">
              {links.map((l) => (
                <Link key={l.to} to={l.to} className="hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">Legal</div>
            <div className="mt-4 grid gap-2 text-sm text-slate-300/90">
              <span className="opacity-70">Terms of service</span>
              <span className="opacity-70">Privacy policy</span>
              <span className="opacity-70">Cookie policy</span>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">Support</div>
            <div className="mt-4 text-sm text-slate-300/90">
              <div>
                Email: <span className="text-white">biyyanihari7@gmail.com</span>
              </div>
              <div className="mt-2 opacity-80">
                For booking and ride help, reach out any time.
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-6 py-5 text-xs text-slate-400 md:px-10">
          © {new Date().getFullYear()} ShareFare. Made for students in Hyderabad, India.
        </div>
      </div>
    </footer>
  );
}

