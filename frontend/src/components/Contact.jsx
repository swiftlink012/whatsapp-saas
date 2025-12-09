import React from "react";

export default function Contact() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Contact Support</h1>
        <p className="text-gray-400 mt-2">
          Choose a department below to connect with us.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 1. EMAILS CARD */}
        <div className="bg-[#13131f] border border-white/5 p-8 rounded-2xl relative overflow-hidden group">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:bg-purple-600/20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Email Us</h3>
            </div>

            <div className="space-y-4">
              {/* Email 1 mokshu709331@gmail.com */}
              <a
                href="mailto:mokshu709331@gmail.com"
                className="block group/link"
              >
                <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">
                  Technical Support
                </p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group-hover/link:border-purple-500/30 group-hover/link:bg-purple-500/5 transition-all">
                  <span className="text-gray-300 font-mono text-sm">
                    mokshu709331@gmail.com
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-500 group-hover/link:text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </a>

              {/* Email 2 */}
              <a
                href="mailto:harshithsai301@gmail.com"
                className="block group/link"
              >
                <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">
                  Sales & Inquiry
                </p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group-hover/link:border-purple-500/30 group-hover/link:bg-purple-500/5 transition-all">
                  <span className="text-gray-300 font-mono text-sm">
                    harshithsai301@gmail.com
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-500 group-hover/link:text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* 2. PHONES CARD */}
        <div className="bg-[#13131f] border border-white/5 p-8 rounded-2xl relative overflow-hidden group">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:bg-blue-600/20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Call Us</h3>
            </div>

            <div className="space-y-4">
              {/* Phone 1 +91 70933 11049 */}
              <a href="tel:+917093311049" className="block group/link">
                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">
                  Phone 1
                </p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group-hover/link:border-blue-500/30 group-hover/link:bg-blue-500/5 transition-all">
                  <span className="text-gray-300 font-mono text-sm">
                    +91 709 331 1049
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-500 group-hover/link:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </a>

              {/* Phone 2 */}
              <a href="tel:+917331176808" className="block group/link">
                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">
                  Phone 2
                </p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group-hover/link:border-blue-500/30 group-hover/link:bg-blue-500/5 transition-all">
                  <span className="text-gray-300 font-mono text-sm">
                    +91 733 117 6808
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-500 group-hover/link:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
