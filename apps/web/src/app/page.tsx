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
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10%       { transform: translate(-2%, -3%); }
          30%       { transform: translate(3%, 2%); }
          50%       { transform: translate(-1%, 4%); }
          70%       { transform: translate(2%, -2%); }
          90%       { transform: translate(-3%, 1%); }
        }
        .hero-title  { animation: fadeUp 0.7s 0.05s cubic-bezier(0.16,1,0.3,1) both; }
        .hero-body   { animation: fadeUp 0.7s 0.15s cubic-bezier(0.16,1,0.3,1) both; }
        .hero-ctas   { animation: fadeUp 0.7s 0.25s cubic-bezier(0.16,1,0.3,1) both; }
        .hero-canvas { animation: fadeUp 0.9s 0.1s  cubic-bezier(0.16,1,0.3,1) both; }
        .cta-primary {
          transition: background 0.15s, box-shadow 0.2s, transform 0.15s;
        }
        .cta-primary:hover {
          background: #22c55e !important;
          box-shadow: 0 0 28px rgba(34,197,94,0.3);
          transform: translateY(-1px);
        }
        .cta-secondary {
          transition: border-color 0.15s, background 0.15s, transform 0.15s;
        }
        .cta-secondary:hover {
          border-color: #333 !important;
          background: #161616 !important;
          transform: translateY(-1px);
        }
        .step-card {
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .step-card:hover {
          border-color: #222 !important;
          background: #111 !important;
          transform: translateY(-3px);
        }
        .stat-item {
          transition: color 0.2s;
        }
        .stat-item:hover .stat-value {
          color: #22c55e;
        }
        .grain-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px;
          animation: grain 8s steps(1) infinite;
        }
      `}</style>

      <main style={{ background: "#080808", color: "#e5e5e5", minHeight: "100vh" }}>

        {/* ── Hero ── */}
        <section style={{ position: "relative", overflow: "hidden" }}>
          <div className="grain-overlay" />

          {/* Radial glow */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 60% 60% at 50% 80%, rgba(34,197,94,0.07) 0%, transparent 65%)",
          }} />

          {/* Centered copy */}
          <div style={{
            position: "relative",
            maxWidth: 760,
            margin: "0 auto",
            padding: "6rem 1.5rem 4rem",
            textAlign: "center",
          }}>
            <h1
              className="hero-title"
              style={{
                margin: "0 0 1.5rem",
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                lineHeight: 0.92,
                letterSpacing: "-0.045em",
                fontWeight: 800,
                color: "#f2f2f2",
              }}
            >
              Buy and sell{" "}
              <span style={{
                background: "linear-gradient(95deg, #22c55e 0%, #86efac 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                textbooks
              </span>
              <br />
              with Gators.
            </h1>

            <p
              className="hero-body"
              style={{
                margin: "0 auto 2.5rem",
                fontSize: "1.1rem",
                lineHeight: 1.7,
                color: "#737373",
                maxWidth: 500,
              }}
            >
              GatorLend is the SFSU student marketplace for textbooks,
              calculators, lab coats, and course materials. No Craigslist risk.
              No bookstore markup.
            </p>

            <div
              className="hero-ctas"
              style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}
            >
              <Link
                href="/marketplace"
                className="cta-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.8rem 1.5rem",
                  borderRadius: 8,
                  background: "#16a34a",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  border: "1px solid #15803d",
                  letterSpacing: "-0.01em",
                }}
              >
                Browse marketplace
              </Link>
              <Link
                href="/listings/new"
                className="cta-secondary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.8rem 1.5rem",
                  borderRadius: 8,
                  border: "1px solid #1f1f1f",
                  background: "#0e0e0e",
                  color: "#a3a3a3",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  letterSpacing: "-0.01em",
                }}
              >
                Sell something
              </Link>
            </div>

            <p style={{ margin: "1.75rem 0 0", fontSize: 12, color: "#3a3a3a", lineHeight: 1.6, letterSpacing: "0.01em" }}>
              Requires an @sfsu.edu email &mdash; independent student project, not affiliated with SFSU or CSU.
            </p>
          </div>

          {/* Full-width animation panel */}
          <div
            className="hero-canvas"
            style={{
              position: "relative",
              borderTop: "1px solid #141414",
              background: "#0b0b0b",
            }}
          >
            {/* Panel header bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1.5rem",
              borderBottom: "1px solid #141414",
            }}>
              <span style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 13,
                fontWeight: 700,
                color: "#e5e5e5",
                letterSpacing: "0.04em",
              }}>
                GatorLend
              </span>
              <div style={{
                display: "flex",
                gap: "1.25rem",
                fontSize: 11,
                color: "#2a2a2a",
                fontFamily: "ui-monospace, monospace",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                {["Textbooks", "Calculators", "Lab Coats"].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
            <GatorChase width={1400} height={380} />
          </div>
        </section>

        {/* ── Divider stats ── */}
        <section style={{ borderTop: "1px solid #111", borderBottom: "1px solid #111" }}>
          <div style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          }}>
            {[
              { value: "$0",    label: "Platform fees" },
              { value: "Free",  label: "To list" },
              { value: "SFSU",  label: "Verified only" },
              { value: "P2P",   label: "Direct trades" },
            ].map((s) => (
              <div
                key={s.label}
                className="stat-item"
                style={{
                  padding: "1.75rem 1.5rem",
                  borderRight: "1px solid #111",
                }}
              >
                <p className="stat-value" style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "#e5e5e5", letterSpacing: "-0.04em", transition: "color 0.2s" }}>
                  {s.value}
                </p>
                <p style={{ margin: "0.25rem 0 0", fontSize: 12, color: "#3d3d3d", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "ui-monospace, monospace" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "6rem 1.5rem" }}>
          <div style={{ marginBottom: "3.5rem" }}>
            <p style={{
              margin: "0 0 0.75rem",
              fontSize: 11,
              color: "#3a3a3a",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontFamily: "ui-monospace, monospace",
            }}>
              How it works
            </p>
            <h2 style={{
              margin: 0,
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 700,
              color: "#f0f0f0",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}>
              Three steps.<br />No friction.
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1px",
            background: "#111",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid #111",
          }}>
            {[
              {
                num: "01",
                title: "Sign in with @sfsu.edu",
                desc: "Verify your school email to access the marketplace. No wallet or credit card required.",
              },
              {
                num: "02",
                title: "List or browse",
                desc: "Post what you're selling with photos and price, or search by course code to find what you need.",
              },
              {
                num: "03",
                title: "Meet and trade",
                desc: "Message the seller directly. Meet on campus and confirm the handoff. Done.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="step-card"
                style={{
                  padding: "2.5rem 2rem",
                  background: "#080808",
                }}
              >
                <p style={{
                  margin: "0 0 1.5rem",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 11,
                  color: "#2a2a2a",
                  letterSpacing: "0.15em",
                }}>
                  {step.num}
                </p>
                <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.05rem", fontWeight: 600, color: "#e5e5e5", letterSpacing: "-0.02em" }}>
                  {step.title}
                </h3>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "#525252", lineHeight: 1.7 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Summer callout ── */}
        <section style={{ maxWidth: 1200, margin: "0 auto 6rem", padding: "0 1.5rem" }}>
          <div style={{
            borderRadius: 16,
            border: "1px solid #141a14",
            background: "#090d09",
            padding: "3.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "3rem",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(ellipse 50% 80% at 0% 50%, rgba(34,197,94,0.06) 0%, transparent 60%)",
            }} />
            <div style={{ position: "relative" }}>
              <p style={{ margin: "0 0 0.75rem", fontSize: 11, color: "#2d5a2d", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "ui-monospace, monospace" }}>
                Summer 2026
              </p>
              <h2 style={{ margin: "0 0 1rem", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, color: "#d4f7d4", letterSpacing: "-0.035em", lineHeight: 1.15 }}>
                Selling before<br />you leave?
              </h2>
              <p style={{ margin: 0, color: "#3d6b3d", lineHeight: 1.7, fontSize: "0.9rem" }}>
                Summer is when students move out and incoming Gators start prepping for fall.
                List now — demand peaks in July before the semester starts.
              </p>
            </div>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {[
                "List your end-of-semester books now",
                "Incoming freshmen buy in July and August",
                "Keep the money, skip the bookstore fee",
              ].map((item) => (
                <div key={item} style={{
                  padding: "1rem 1.25rem",
                  borderRadius: 10,
                  border: "1px solid #1a2e1a",
                  background: "rgba(34,197,94,0.03)",
                  fontSize: "0.88rem",
                  color: "#4a7a4a",
                  lineHeight: 1.5,
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section style={{
          borderTop: "1px solid #111",
          padding: "5rem 1.5rem 6rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 40% 60% at 50% 100%, rgba(34,197,94,0.06) 0%, transparent 70%)",
          }} />
          <h2 style={{
            position: "relative",
            margin: "0 0 1rem",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 700,
            color: "#f0f0f0",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}>
            Ready to trade?
          </h2>
          <p style={{ position: "relative", margin: "0 auto 2.5rem", maxWidth: 380, color: "#525252", lineHeight: 1.7, fontSize: "0.95rem" }}>
            Sign in with your @sfsu.edu email and start browsing or listing in under a minute.
          </p>
          <Link
            href="/marketplace"
            className="cta-primary"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              padding: "0.9rem 2.25rem",
              borderRadius: 8,
              background: "#16a34a",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1rem",
              border: "1px solid #15803d",
              letterSpacing: "-0.01em",
            }}
          >
            Open GatorLend
          </Link>
        </section>

      </main>
    </>
  );
}
