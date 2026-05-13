import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { WalletConnectionPanel } from "@/components/WalletConnectionPanel";
import { canAccessProtectedAppRoutes } from "@/lib/auth/access";
import { getCurrentUserProfile } from "@/lib/auth/profile";
import { profileNeedsSetup } from "@/lib/auth/profile-schema";
import {
  ADVANCED_LAYER_LINE,
  CURRENT_MVP_LINE,
  LANDING_FEATURED_ITEMS,
  LANDING_HERO_BODY,
  LANDING_HERO_TITLE,
  LANDING_HOW_IT_WORKS,
  LANDING_ROADMAP,
  LANDING_TOKENIZATION_POINTS,
  LANDING_WHY_IT_MATTERS,
  PILOT_DISCLAIMER
} from "@/lib/marketing/publicContent";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";

const sectionLabelStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.16em",
  fontSize: 12,
  color: "#5b5b5b"
};

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
    <main style={{ padding: "0 1.5rem 5rem" }}>
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "5.5rem 0 4rem",
          borderBottom: "1px solid #ebebeb"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 0.92fr)",
            gap: "2rem",
            alignItems: "center"
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 1rem",
                fontSize: "clamp(3rem, 7vw, 5rem)",
                lineHeight: 0.96,
                letterSpacing: "-0.05em"
              }}
            >
              {LANDING_HERO_TITLE}
            </h1>
            <p style={{ maxWidth: 620, margin: 0, fontSize: "1.08rem", lineHeight: 1.6, color: "#454545" }}>
              {LANDING_HERO_BODY}
            </p>
            <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap", marginTop: "2rem" }}>
              <Link
                href="/marketplace"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.9rem 1.2rem",
                  borderRadius: 999,
                  background: "#111111",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 600
                }}
              >
                Open Marketplace
              </Link>
              <Link
                href="/listings/new"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.9rem 1.2rem",
                  borderRadius: 999,
                  border: "1px solid #d7d7d7",
                  color: "#111111",
                  textDecoration: "none",
                  fontWeight: 600
                }}
              >
                Create Listing
              </Link>
            </div>
            <div style={{ marginTop: "1.5rem", display: "grid", gap: "0.45rem", color: "#4e4e4e" }}>
              <p style={{ margin: 0 }}><strong>{CURRENT_MVP_LINE}</strong></p>
              <p style={{ margin: 0 }}><strong>{ADVANCED_LAYER_LINE}</strong></p>
            </div>
            <p style={{ margin: "1rem 0 0", fontSize: 14, color: "#555555", lineHeight: 1.6 }}>
              {PILOT_DISCLAIMER}
            </p>
          </div>

          <div
            style={{
              overflow: "hidden",
              border: "1px solid #ebebeb",
              borderRadius: 20,
              background: "#fafafa"
            }}
          >
            <Image
              src="/branding/sfsu-library.jpg"
              alt="Campus library environment"
              width={1200}
              height={900}
              priority
              style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", aspectRatio: "1.15 / 1" }}
            />
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "4rem 0", borderBottom: "1px solid #ebebeb" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div>
            <p style={sectionLabelStyle}>Featured Items</p>
            <h2 style={{ margin: "0.55rem 0 0", fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>Example categories</h2>
          </div>
          <p style={{ margin: 0, color: "#555555", maxWidth: 420 }}>
            The first release focuses on simple academic items that are easy to understand, easy to verify visually, and useful for testing the request and handoff flow.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {LANDING_FEATURED_ITEMS.map((item) => (
            <article
              key={item.name}
              style={{
                padding: "1rem",
                border: "1px solid #ebebeb",
                borderRadius: 18,
                background: "#ffffff"
              }}
            >
              <div
                style={{
                  overflow: "hidden",
                  borderRadius: 14,
                  border: "1px solid #efefef",
                  background: "#f7f7f7",
                  aspectRatio: "1.4 / 1",
                  position: "relative",
                  marginBottom: "1rem"
                }}
              >
                <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, 320px" style={{ objectFit: "cover" }} />
              </div>
              <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <p style={{ margin: 0, color: "#6b6b6b", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {item.context}
                  </p>
                  <h3 style={{ margin: "0.45rem 0 0", fontSize: "1.1rem" }}>{item.name}</h3>
                </div>
                <p style={{ margin: 0, fontWeight: 700 }}>{item.label}</p>
              </div>
              <div style={{ marginTop: "1.2rem", paddingTop: "1rem", borderTop: "1px solid #efefef" }}>
                <p style={{ margin: 0, color: "#5a5a5a", fontSize: 13 }}>{item.recordLabel}</p>
                <p style={{ margin: "0.3rem 0 0", fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 14 }}>
                  {item.recordId}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "4rem 0", borderBottom: "1px solid #ebebeb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Image src="/branding/fin-globe-black.png" alt="FIN globe" width={20} height={20} />
          <p style={sectionLabelStyle}>How it works</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", alignItems: "start" }}>
          {LANDING_HOW_IT_WORKS.map((item, index) => (
            <article
              key={item.title}
              style={{
                padding: "1.5rem",
                border: "1px solid #ebebeb",
                borderRadius: 18,
                background: "#ffffff"
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "#6b6b6b" }}>0{index + 1}</p>
              <h2 style={{ margin: "0.5rem 0", fontSize: "1.25rem" }}>{item.title}</h2>
              <p style={{ margin: 0, color: "#4a4a4a", lineHeight: 1.6 }}>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "4rem 0", borderBottom: "1px solid #ebebeb" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 0.88fr)",
            gap: "2rem",
            alignItems: "start"
          }}
        >
          <div>
            <p style={sectionLabelStyle}>Why this matters</p>
            <h2 style={{ margin: "0.55rem 0 0.8rem", fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>Built to learn from real pilot usage</h2>
          </div>
          <div style={{ display: "grid", gap: "0.85rem" }}>
            {LANDING_WHY_IT_MATTERS.map((item) => (
              <div key={item} style={{ display: "flex", gap: "0.75rem", alignItems: "start" }}>
                <span style={{ marginTop: 8, width: 6, height: 6, borderRadius: 999, background: "#111111", flexShrink: 0 }} />
                <p style={{ margin: 0, color: "#434343", lineHeight: 1.6 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "4rem 0", borderBottom: "1px solid #ebebeb" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.95fr) minmax(320px, 1fr)",
            gap: "2rem",
            alignItems: "start"
          }}
        >
          <div>
            <p style={sectionLabelStyle}>Future of tokenization</p>
            <h2 style={{ margin: "0.55rem 0 0.85rem", fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>
              Tokenization is an optional verification layer, not a first step.
            </h2>
            <p style={{ margin: 0, color: "#525252", lineHeight: 1.65 }}>
              The marketplace flow works with school-email access and tracked ownership. For selected demo assets, the XRPL testnet flow can mint an XLS-20 NFT and compare on-chain state against marketplace metadata. This is used for learning, verification experiments, and technical demonstration.
            </p>
          </div>
          <div style={{ display: "grid", gap: "1rem" }}>
            <WalletConnectionPanel />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {LANDING_TOKENIZATION_POINTS.map((item) => (
                <article
                  key={item}
                  style={{
                    padding: "1.15rem 1.25rem",
                    border: "1px solid #ebebeb",
                    borderRadius: 18,
                    background: "#ffffff"
                  }}
                >
                  <p style={{ margin: 0, lineHeight: 1.6 }}>{item}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "4rem 0 0" }}>
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <div>
            <p style={sectionLabelStyle}>Roadmap</p>
            <h2 style={{ margin: "0.55rem 0 0.85rem", fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>
              Roadmap: learn first, expand carefully
            </h2>
            <p style={{ margin: 0, maxWidth: 680, color: "#555555", lineHeight: 1.6 }}>
              The next steps focus on improving the request and handoff flow, then evaluating where optional tokenization is actually useful.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "0.85rem", alignItems: "stretch", marginTop: "1.75rem" }}>
            {LANDING_ROADMAP.map((item, index) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem"
                }}
              >
                <article
                  style={{
                    flex: 1,
                    padding: "1rem 1.1rem",
                    border: "1px solid #ebebeb",
                    borderRadius: 16,
                    background: "#ffffff"
                  }}
                >
                  <p style={{ margin: 0, fontSize: 12, color: "#6a6a6a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Step {index + 1}
                  </p>
                  <p style={{ margin: "0.35rem 0 0" }}>{item}</p>
                </article>
                {index < LANDING_ROADMAP.length - 1 ? (
                  <span style={{ color: "#888888", fontSize: 22, lineHeight: 1 }} aria-hidden="true">
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
