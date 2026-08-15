import React from "react";
import { Play, Share2, Clock } from "lucide-react";
import crew from "../assets/Images/crew.png";
import study from "../assets/Images/study.png";

/**
 * LearningEnvironmentSection
 *
 * 3-up row (2 photo cards + 1 video card) + a full-width banner underneath.
 * Palette pulled back from the harsh orange/indigo to a soft lavender +
 * deep-violet text combo that matches the Creative Adhyayan brand purple.
 */

const cardRadius = { borderRadius: "clamp(16px, 2.5vw, 28px)" };

// Softened versions of the original orange + indigo — pastel fills with a
// deep-tinted text/accent color instead of white-on-saturated.
const PALETTE = {
  orange: { bg: "#FCE3D6", text: "#B4552B", accent: "#F0854D" },
  indigo: { bg: "#E4E1F8", text: "#453C86", accent: "#6C5DD3" },
};

function PhotoCard({ image, caption, tone = "orange" }) {
  const c = PALETTE[tone];
  return (
    <div
      style={{ ...cardRadius, backgroundColor: c.bg }}
      className="overflow-hidden shadow-sm"
    >
      <img
        src={image}
        alt={caption}
        className="h-56 w-full object-cover sm:h-64"
      />
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <p
          className="text-lg font-semibold leading-snug sm:text-xl"
          style={{ color: c.text }}
        >
          {caption}
        </p>
      </div>
    </div>
  );
}

function VideoCard({ heading, videoUrl, thumbnail, tone = "indigo" }) {
  const c = PALETTE[tone];
  return (
    <div
      style={{ ...cardRadius, backgroundColor: c.bg }}
      className="flex flex-col p-5 shadow-sm sm:p-6"
    >
      <h3
        className="text-xl font-bold leading-snug sm:text-2xl"
        style={{ color: c.text }}
      >
        {heading}
      </h3>

      <div
        style={cardRadius}
        className="relative mt-5 flex-1 overflow-hidden bg-[#2C2743]"
      >
        {videoUrl ? (
          <iframe
            src={videoUrl}
            title={heading}
            className="h-64 w-full sm:h-72"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {thumbnail && (
              <img
                src={thumbnail}
                alt=""
                className="h-64 w-full object-cover opacity-60 sm:h-72"
              />
            )}
            <button
              type="button"
              aria-label="Play video"
              style={{ backgroundColor: c.accent }}
              className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
            >
              <Play size={22} className="ml-0.5 fill-white" />
            </button>
            <div className="absolute bottom-4 left-4 flex gap-3 text-white/80">
              <Share2 size={18} />
              <Clock size={18} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LearningEnvironmentSection() {
  return (
    <section className="w-full bg-white px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <PhotoCard
            tone="orange"
            image={study}
            caption="1000+ Students Trained in Digital Marketing and AI Excellence."
          />
          <PhotoCard
            tone="indigo"
            image={crew}
            caption="100% Practical Training & Internship Opportunities"
          />
          <VideoCard
            tone="orange"
            heading="A Great Learning Environment Powered by Expert-Led Training & Modern Infrastructure."
            videoUrl="" // e.g. "https://www.youtube.com/embed/VIDEO_ID"
            thumbnail=""
          />
        </div>

        {/* full-width banner */}
        <div
          style={{ ...cardRadius, backgroundColor: PALETTE.indigo.bg }}
          className="mt-3 px-8 py-8 text-center shadow-sm sm:py-10"
        >
          <p
            className="text-2xl font-bold sm:text-3xl"
            style={{ color: PALETTE.indigo.text }}
          >
            Empowering India With Digital Skills.
          </p>
        </div>
      </div>
    </section>
  );
}