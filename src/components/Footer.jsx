import React from "react";
import { FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";
import CA2 from "../assets/Images/CA2.png"; // update path/filename to your actual logo

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com", icon: FaInstagram },
  { label: "YouTube", href: "https://youtube.com", icon: FaYoutube },
  { label: "Facebook", href: "https://facebook.com", icon: FaFacebook },
];

const COURSE_LINKS = [
  { label: "Live Courses", href: "/courses/live" },
  { label: "Recorded Courses", href: "/courses/recorded" },
  { label: "Short Term Courses", href: "/courses/short-term" },
];

const OTHER_LINKS = [
  { label: "About us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policies", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export default function Footer({
  logoSrc = CA2,
  logoAlt = "Creative Adhyayan",
  description = "We believe that quality education, practical skills, and the right guidance can transform anyone into a high-earning professional—and that's exactly what we deliver.",
}) {
  return (
    <footer className="w-full" style={{ background: "#3B1E8F" }}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:flex-row sm:justify-between sm:py-20">
        {/* logo + description + socials */}
        <div className="max-w-sm">
          <img src={logoSrc} alt={logoAlt} className="h-10 w-auto object-contain" />

          <p className="mt-4 text-sm leading-relaxed text-white/70">
            {description}
          </p>

          <div className="mt-6 flex items-center gap-3">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* link columns */}
        <div className="flex gap-16 sm:gap-24">
          <div>
            <h3 className="text-lg font-semibold text-white">Courses</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {COURSE_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-white/70 transition hover:text-white"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">Other Pages</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {OTHER_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-white/70 transition hover:text-white"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}