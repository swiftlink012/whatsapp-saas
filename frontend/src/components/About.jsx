import React from "react";

export default function About() {
  return (
    <div className="space-y-12 animate-fade-in pb-10">
      {/* 1. HERO SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          About Us
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed">
          We are <span className="text-white font-semibold">Harshith Sai</span>{" "}
          and <span className="text-white font-semibold">Mokshagna</span>—two
          friends from different corners of India’s top institutes, brought
          together by curiosity, ambition, and a shared drive to keep learning
          and building.
        </p>
      </div>

      {/* 2. PROFILES GRID */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* === MOKSHAGNA'S CARD === */}
        <div className="group relative bg-[#13131f] border border-white/5 rounded-3xl p-8 overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
          {/* Decorative Gradient Background (Appears on Hover) */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                M
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  Mokshagna
                </h2>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    IIT Patna '28
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">
                    Chemical Eng
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
              <p>
                I am currently pursuing my B.Tech in{" "}
                <span className="text-gray-200">Chemical Engineering</span> at
                IIT Patna. My academic journey has provided me with a strong
                foundation in core engineering principles, analytical thinking,
                and structured problem-solving.
              </p>
              <p>
                Outside academics, I have a strong inclination toward{" "}
                <span className="text-purple-400">
                  business, entrepreneurship, and coding
                </span>
                . I enjoy understanding how ideas grow—from conceptual thinking
                to execution. My interest in business allows me to analyze
                markets and think strategically about building solutions.
              </p>
              <p>
                Coding gives me a way to translate logical reasoning into
                practical outcomes. One of my strengths lies in combining
                technical knowledge with strategic insight. I believe in
                continuous learning, disciplined effort, and maintaining a
                balanced perspective toward growth.
              </p>
            </div>
          </div>
        </div>

        {/* === HARSHITH SAI'S CARD === */}
        <div className="group relative bg-[#13131f] border border-white/5 rounded-3xl p-8 overflow-hidden hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
          {/* Decorative Gradient Background (Appears on Hover) */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                H
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  Harshith Sai
                </h2>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    NIT Warangal '28
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">
                    EEE
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
              <p>
                I am pursuing my B.Tech in{" "}
                <span className="text-gray-200">
                  Electrical and Electronics Engineering
                </span>{" "}
                at NIT Warangal. My background equips me with a strong
                conceptual understanding of electrical systems and engineering
                fundamentals.
              </p>
              <p>
                Alongside my core field, I am deeply interested in{" "}
                <span className="text-blue-400">
                  Web Development and Machine Learning
                </span>
                . What began as curiosity evolved into a passion for creating
                functional digital solutions. Web development allows me to
                combine creativity with engineering logic.
              </p>
              <p>
                Machine learning fascinates me because of its potential to solve
                real-world problems through data-driven decision-making. I value
                consistency and structured learning, always pushing my abilities
                to contribute meaningfully to the evolving technological
                landscape.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SHARED VISION FOOTER */}
      <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-[#1a1a2e] to-[#161625] border border-white/5 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">
          Our Shared Vision
        </h3>
        <p className="text-gray-400 max-w-2xl mx-auto">
          "To bridge the gap between theoretical engineering and practical
          innovation, creating solutions that are not just functional, but
          scalable and impactful."
        </p>
      </div>
    </div>
  );
}
