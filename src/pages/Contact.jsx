import React, { useState } from "react";
import { MapPin, Mail, Phone, Send, Loader2, ArrowRight } from "lucide-react";

/**
 * Contact Us section — Creative Adhyayan (advanced layout)
 * Same brand system as About: deep violet (#2E1A55) + indigo (#6D3FC0) + amber (#E8A33D)
 *
 * Layout inspiration: dark hero band → two-column "get in touch" with a glass-morphism
 * form card that overlaps down into the map below it → a solid CTA bar under the map.
 * Content is unchanged from the previous version — only the structure/finish is upgraded.
 */

const contactPoints = [
  {
    icon: MapPin,
    label: "Head Office",
    lines: [
      "Building No. 532/1, First Floor,",
      "Bank Colony Deoli Village, New Delhi-110062",
      "Near by Shani Bazar Bandh Road.",
    ],
  },
  {
    icon: Mail,
    label: "Email Support",
    lines: ["contact@creativeadhyayan.com"],
  },
  {
    icon: Phone,
    label: "Let's Talk",
    lines: ["+91 9910232927", "+91 9910232941"],
  },
];

const MAP_QUERY = encodeURIComponent(
  "Building No. 532/1, First Floor, Bank Colony Deoli Village, New Delhi-110062"
);

function DotGrid({ className = "", dot = "fill-white/25" }) {
  return (
    <svg
      className={className}
      width="140"
      height="140"
      viewBox="0 0 140 140"
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: 7 }).map((_, row) =>
        Array.from({ length: 7 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 20} r="2.5" className={dot} />
        ))
      )}
    </svg>
  );
}

function Field({ label, id, type = "text", placeholder, value, onChange, textarea, dark }) {
  const shared = dark
    ? "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none backdrop-blur-sm transition-colors focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/30"
    : "w-full rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm text-[#1F1533] placeholder:text-[#A79BC4] outline-none transition-colors focus:border-[#6D3FC0] focus:ring-2 focus:ring-[#6D3FC0]/20";

  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${dark ? "text-white/70" : "text-[#4A3D66]"
          }`}
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={4}
          className={`${shared} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={shared}
        />
      )}
    </div>
  );
}

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    // TODO: wire this up to your actual endpoint / API call
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStatus("sent");
    setForm({ name: "", surname: "", phone: "", email: "", subject: "", message: "" });
    setTimeout(() => setStatus("idle"), 3000);
  };

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("sending");
    // TODO: wire this up to your actual newsletter endpoint
    await new Promise((resolve) => setTimeout(resolve, 700));
    setNewsletterStatus("sent");
    setNewsletterEmail("");
    setTimeout(() => setNewsletterStatus("idle"), 3000);
  };

  return (
    <section className="relative bg-[#F8F6FC] text-[#1F1533]">
      {/* ================= DARK HERO ================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1B0F38] via-[#2E1A55] to-[#3A2170] pb-10 sm:pb-40 pt-24 text-white sm:pt-32">
        <DotGrid className="pointer-events-none absolute right-8 top-10 hidden sm:block" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-1/3 h-[380px] w-[380px] rounded-full opacity-40 blur-3xl"
          style={{
            background: "radial-gradient(circle, #6D3FC0 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <span className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
            Contact Creative Adhyayan
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">Contact Us</h1>
          <p className="mt-2 text-lg text-white/60">We're just a message away</p>
        </div>

        {/* ================= GET IN TOUCH + FLOATING FORM ================= */}
        <div className="relative mx-auto mt-10 max-w-6xl px-6 py-10">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-10">
            {/* left: info */}
            <div className="lg:col-span-2 lg:pt-4">
              <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                Your questions matter — reach out anytime.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                Have a question about a course, admissions, or partnering with
                us? Send a message and our team will get back to you.
              </p>

              <div className="mt-10 space-y-6">
                {contactPoints.map(({ icon: Icon, label, lines }) => (
                  <div key={label} className="flex gap-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "linear-gradient(135deg, #6D3FC0, #E8A33D)" }}
                    >
                      <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-bold text-white">{label}</p>
                      {lines.map((line) => (
                        <p key={line} className="text-sm leading-relaxed text-white/60">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* right: glass form card — overlaps down over the map below */}
            <div className="lg:col-span-3">
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10 lg:-mb-56"
              >
                <h3 className="text-2xl font-black tracking-tight text-white">
                  Send us a message
                </h3>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field dark label="Name" id="name" placeholder="Name" value={form.name} onChange={handleChange} />
                  <Field dark label="Surname" id="surname" placeholder="Surname" value={form.surname} onChange={handleChange} />
                  <Field dark label="Phone" id="phone" type="tel" placeholder="Phone" value={form.phone} onChange={handleChange} />
                  <Field dark label="Email" id="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
                  <div className="sm:col-span-2">
                    <Field dark label="Subject" id="subject" placeholder="Subject" value={form.subject} onChange={handleChange} />
                  </div>
                  <div className="sm:col-span-2">
                    <Field
                      dark
                      label="Message"
                      id="message"
                      placeholder="Message"
                      value={form.message}
                      onChange={handleChange}
                      textarea
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-[#2E1A55] shadow-lg shadow-black/20 transition-transform active:scale-[0.98] disabled:opacity-70"
                  style={{ background: "linear-gradient(135deg, #F5C878, #E8A33D)" }}
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : status === "sent" ? (
                    "Message sent ✓"
                  ) : (
                    <>
                      Send message
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAP (form card overlaps its top edge on desktop) ================= */}
      <div className="relative">
        <iframe
          title="Creative Adhyayan — Head Office location"
          src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
          className="h-[420px] w-full grayscale-[20%]"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* ================= NEWSLETTER CTA BAR ================= */}
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <form
          onSubmit={handleNewsletter}
          className="flex flex-col items-center justify-between gap-6 rounded-3xl px-8 py-10 sm:flex-row sm:px-12"
          style={{ background: "linear-gradient(120deg, #6D3FC0, #2E1A55)" }}
        >
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Stay updated on new courses
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Get batch openings and career tips straight to your inbox.
            </p>
          </div>

          <div className="flex w-full max-w-md items-center gap-2 rounded-xl bg-white/10 p-1.5 backdrop-blur-sm">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/50 outline-none"
            />
            <button
              type="submit"
              disabled={newsletterStatus === "sending"}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-[#2E1A55] transition-transform active:scale-[0.97] disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #F5C878, #E8A33D)" }}
            >
              {newsletterStatus === "sending" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : newsletterStatus === "sent" ? (
                "Done ✓"
              ) : (
                <>
                  Submit
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}