import Link from "next/link";
import { redirect } from "next/navigation";

import { GatorChase } from "@/components/GatorChase";
import { canAccessProtectedAppRoutes } from "@/lib/auth/access";
import { getCurrentUserProfile } from "@/lib/auth/profile";
import { profileNeedsSetup } from "@/lib/auth/profile-schema";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";

export default async function HomePage() {
  const supabase = await createSupabaseServerAuthClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (canAccessProtectedAppRoutes(user)) {
    const profile = await getCurrentUserProfile();
    redirect(profileNeedsSetup(profile) ? "/profile/setup" : "/marketplace");
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .hero-badge {
          animation: fadeUp 0.5s ease both;
        }
        .hero-title {
          animation: fadeUp 0.55s 0.08s ease both;
        }
        .hero-body {
          animation: fadeUp 0.55s 0.16s ease both;
        }
        .hero-ctas {
          animation: fadeUp 0.55s 0.24s ease both;
        }
        .hero-canvas {
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .stat-card {
          animation: fadeUp 0.5s ease both;
          transition: border-color 0.2s, background 0.2s;
        }
        .stat-card:hover {
          border-color: #2a2a2a;
          background: #161616;
        }
        .step-card {
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .step-card:hover {
          border-color: #2d2d2d;
          background: #141414;
          transform: translateY(-2px);
        }
        .cta-primary {
          transition: background 0.15s, box-shadow 0.15s, transform 0.15s;
        }
        .cta-primary:hover {
          background: #22c55e !important;
          box-shadow: 0 0 24px rgba(34,197,94,0.35);
          transform: translateY(-1px);
        }
        .cta-secondary {
          transition: border-color 0.15s, background 0.15s, transform 0.15s;
        }
        .cta-secondary:hover {
          border-color: #3a3a3a !important;
          background: #1a1a1a !important;
          transform: translateY(-1px);
        }
        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .glow-green {
          background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(34,197,94,0.12) 0%, transparent 70%);
        }
      `}</style>

      <main style={{ background: "#0a0a0a", color: "#e5e5e5", minHeight: "100vh" }}>

        {/* ── Hero ── */}
        <section
          className="grid-bg glow-green"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "5rem 1.5rem 4rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
            gap: "3rem",
            alignItems: "center",
          }}
        >
          <div>
            <div className="hero-badge" style={{ marginBottom: "1.5rem" }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.3rem 0.85rem",
                borderRadius: 999,
                border: "1px solid #1f2e1f",
                background: "rgba(34,197,94,0.08)",
                fontSize: 13,
                color: "#86efac",
                fontWeight: 500,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 6px #22c55e",
                  display: "inline-block",
                  flexShrink: 0,
                }} />
                Summer textbook season is open
              </span>
            </div>

            <h1
              className="hero-title"
              style={{
                margin: "0 0 1.25rem",
                fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                fontWeight: 800,
                color: "#f5f5f5",
              }}
            >
              Buy and sell<br />
              <span style={{
                background: "linear-gradient(90deg, #22c55e, #86efac)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                textbooks
              </span>
              <br />with Gators.
            </h1>

            <p
              className="hero-body"
              style={{
                margin: "0 0 2rem",
                fontSize: "1.1rem",
                lineHeight: 1.65,
                color: "#a3a3a3",
                maxWidth: 460,
              }}
            >
              GatorLend is the SFSU student marketplace for textbooks, calculators,
              lab coats, and course materials. No Craigslist risk. No bookstore markup.
              Just verified students trading directly.
            </p>

            <div
              className="hero-ctas"
              style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
            >
              <Link
                href="/marketplace"
                className="cta-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.75rem 1.4rem",
                  borderRadius: 8,
                  background: "#16a34a",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  border: "1px solid #15803d",
                }}
              >
                Browse marketplace →
              </Link>
              <Link
                href="/listings/new"
                className="cta-secondary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.75rem 1.4rem",
                  borderRadius: 8,
                  border: "1px solid #262626",
                  background: "#111",
                  color: "#d4d4d4",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
              >
                Sell something
              </Link>
            </div>

            <p style={{ margin: "1.5rem 0 0", fontSize: 12, color: "#525252", lineHeight: 1.6 }}>
              Requires an @sfsu.edu email. Independent student project — not affiliated with SFSU or CSU.
            </p>
          </div>

          {/* Animation panel */}
          <div
            className="hero-canvas"
            style={{
              borderRadius: 16,
              border: "1px solid #1a1a1a",
              background: "#0f0f0f",
              overflow: "hidden",
              padding: "1.5rem 1rem",
            }}
          >
            <p style={{
              margin: "0 0 0.5rem 0.5rem",
              fontSize: 11,
              color: "#3f3f3f",
              fontFamily: "ui-monospace, monospace",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
              live hunt
            </p>
            <GatorChase width={540} height={200} />
            <div style={{
              marginTop: "1rem",
              padding: "0.85rem 1rem",
              borderTop: "1px solid #1a1a1a",
              display: "flex",
              gap: "1.5rem",
              fontSize: 13,
              color: "#525252",
            }}>
              {["📚 Textbooks", "🧮 Calculators", "🥼 Lab Coats"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section style={{ borderTop: "1px solid #141414", borderBottom: "1px solid #141414" }}>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "1.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "1px",
            }}
          >
            {[
              { value: "128", label: "r/SFSU posts tracked" },
              { value: "53",  label: "Active listings found" },
              { value: "$0",  label: "Platform fees" },
              { value: "SFSU", label: "Verified emails only" },
            ].map((s, i) => (
              <div
                key={s.label}
                className="stat-card"
                style={{
                  padding: "1.25rem 1.5rem",
                  borderRadius: 0,
                  background: "#0a0a0a",
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.03em" }}>
                  {s.value}
                </p>
                <p style={{ margin: "0.2rem 0 0", fontSize: 13, color: "#525252" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 1.5rem" }}>
          <div style={{ marginBottom: "3rem" }}>
            <p style={{
              margin: "0 0 0.5rem",
              fontSize: 12,
              color: "#525252",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontFamily: "ui-monospace, monospace",
            }}>
              How it works
            </p>
            <h2 style={{
              margin: 0,
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              fontWeight: 700,
              color: "#f5f5f5",
              letterSpacing: "-0.03em",
            }}>
              Three steps. No friction.
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1px",
            background: "#141414",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid #141414",
          }}>
            {[
              {
                num: "01",
                icon: "🎓",
                title: "Sign in with @sfsu.edu",
                desc: "Verify your school email to access the marketplace. No wallet or credit card required.",
              },
              {
                num: "02",
                icon: "📋",
                title: "List or browse",
                desc: "Post what you're selling with photos and price, or search by course code to find what you need.",
              },
              {
                num: "03",
                icon: "🤝",
                title: "Meet and trade",
                desc: "Message the seller directly. Meet on campus and confirm the handoff. Done.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="step-card"
                style={{
                  padding: "2rem",
                  background: "#0a0a0a",
                  cursor: "default",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                  <span style={{ fontSize: "1.8rem" }}>{step.icon}</span>
                  <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#333", fontWeight: 600 }}>
                    {step.num}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 0.65rem", fontSize: "1.05rem", fontWeight: 600, color: "#e5e5e5" }}>
                  {step.title}
                </h3>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#737373", lineHeight: 1.65 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Summer callout ── */}
        <section style={{
          maxWidth: 1200,
          margin: "0 auto 5rem",
          padding: "0 1.5rem",
        }}>
          <div style={{
            borderRadius: 16,
            border: "1px solid #1a2e1a",
            background: "linear-gradient(135deg, #0a1a0a 0%, #0f2010 100%)",
            padding: "3rem 2.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "2rem",
            alignItems: "center",
          }}>
            <div>
              <p style={{ margin: "0 0 0.5rem", fontSize: 12, color: "#4ade80", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "ui-monospace, monospace" }}>
                Summer 2026
              </p>
              <h2 style={{ margin: "0 0 0.75rem", fontSize: "clamp(1.6rem, 3vw, 2rem)", fontWeight: 700, color: "#f0fdf4", letterSpacing: "-0.03em" }}>
                Selling before you leave?<br />Someone needs your books.
              </h2>
              <p style={{ margin: 0, color: "#86efac", lineHeight: 1.65, fontSize: "0.95rem", opacity: 0.8 }}>
                Summer is when students move out and incoming Gators start prepping for fall.
                List your textbooks now — demand spikes in July before the semester starts.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                "📚  List your end-of-semester books now",
                "🎯  Incoming freshmen buy in July–August",
                "💸  Keep the money, skip the bookstore fee",
              ].map((item) => (
                <div key={item} style={{
                  padding: "0.85rem 1.1rem",
                  borderRadius: 10,
                  border: "1px solid #1a3a1a",
                  background: "rgba(34,197,94,0.05)",
                  fontSize: "0.9rem",
                  color: "#bbf7d0",
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA footer ── */}
        <section style={{
          borderTop: "1px solid #141414",
          padding: "4rem 1.5rem",
          textAlign: "center",
        }}>
          <h2 style={{
            margin: "0 0 1rem",
            fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
            fontWeight: 700,
            color: "#f5f5f5",
            letterSpacing: "-0.03em",
          }}>
            Ready to trade?
          </h2>
          <p style={{ margin: "0 auto 2rem", maxWidth: 440, color: "#737373", lineHeight: 1.65 }}>
            Sign in with your @sfsu.edu email and start browsing or listing in under a minute.
          </p>
          <Link
            href="/marketplace"
            className="cta-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.85rem 2rem",
              borderRadius: 8,
              background: "#16a34a",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1rem",
              border: "1px solid #15803d",
            }}
          >
            Open GatorLend →
          </Link>
        </section>

      </main>
    </>
  );
}
