import Link from "next/link";
import Image from "next/image";

import { WalletConnectionPanel } from "@/components/WalletConnectionPanel";

const howItWorks = [
  {
    title: "Connect wallet",
    description: "Use Crossmark to access the demo with a real XRPL testnet wallet."
  },
  {
    title: "Mint asset",
    description: "Create a textbook NFT on XRPL and register the matching asset record."
  },
  {
    title: "Verify ownership",
    description: "Check token state against the database before presenting marketplace data."
  }
];

const featuredItems = [
  {
    name: "Lab Coat",
    course: "BIO101",
    price: "$25",
    tokenId: "0008...A19F",
    image: "/images/lab-coat.jpeg"
  },
  {
    name: "TI-84 Calculator",
    course: "MATH226",
    price: "$40",
    tokenId: "0008...C44D",
    image: "/images/calculator.jpeg"
  },
  {
    name: "Introduction to Algorithms",
    course: "CSU340",
    price: "$30",
    tokenId: "0008...F72B",
    image: "/images/textbook.jpg"
  }
];

const whyItMatters = [
  "Student demand for a campus marketplace is already strong.",
  "Most resale transactions land in the $20–$50 range.",
  "Frequent small trades benefit from fast, low-friction settlement."
];

const technology = [
  "XRPL for low fees and fast settlement",
  "Crossmark as the active wallet integration",
  "On-chain plus off-chain validation before trust is shown",
  "Protected demo access backed by auth and RLS-first data rules"
];

const roadmap = [
  "Phase 1: SFSU",
  "Phase 2: CSU system",
  "Phase 3: multi-campus marketplace"
];

const sectionLabelStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.16em",
  fontSize: 12,
  color: "#5b5b5b"
};

export default function HomePage() {
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
              Tokenized Campus Marketplace
            </h1>
            <p style={{ maxWidth: 620, margin: 0, fontSize: "1.08rem", lineHeight: 1.6, color: "#454545" }}>
              Buy, sell, and verify student assets using XRPL. FIN GatorLend turns everyday campus
              items into a fast, verifiable marketplace built for frequent student transactions.
            </p>
            <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap", marginTop: "2rem" }}>
              <Link
                href="/login"
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
                Enter App
              </Link>
              <Link
                href="/catalog"
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
                View Catalog
              </Link>
            </div>
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
              alt="SFSU library environment"
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
            <h2 style={{ margin: "0.55rem 0 0", fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>Marketplace preview</h2>
          </div>
          <p style={{ margin: 0, color: "#555555", maxWidth: 420 }}>
            Mock items reflect the kinds of low-value, high-frequency campus trades this product is built for.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {featuredItems.map((item) => (
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
                    {item.course}
                  </p>
                  <h3 style={{ margin: "0.45rem 0 0", fontSize: "1.1rem" }}>{item.name}</h3>
                </div>
                <p style={{ margin: 0, fontWeight: 700 }}>{item.price}</p>
              </div>
              <div style={{ marginTop: "1.2rem", paddingTop: "1rem", borderTop: "1px solid #efefef" }}>
                <p style={{ margin: 0, color: "#5a5a5a", fontSize: 13 }}>Token ID</p>
                <p style={{ margin: "0.3rem 0 0", fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 14 }}>
                  {item.tokenId}
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
          {howItWorks.map((item, index) => (
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
            <h2 style={{ margin: "0.55rem 0 0.8rem", fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>
              Built for the transaction pattern students already have
            </h2>
          </div>
          <div style={{ display: "grid", gap: "0.85rem" }}>
            {whyItMatters.map((item) => (
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
            <p style={sectionLabelStyle}>Technology</p>
            <h2 style={{ margin: "0.55rem 0 0.85rem", fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>
              Trust comes from matching wallet, chain, and database state
            </h2>
            <p style={{ margin: 0, color: "#525252", lineHeight: 1.65 }}>
              The demo uses Crossmark for wallet access, XRPL for settlement, and Supabase for
              protected marketplace data. Asset detail views reconcile on-chain and off-chain state
              before they present a trusted result.
            </p>
          </div>
          <div style={{ display: "grid", gap: "1rem" }}>
            <WalletConnectionPanel />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {technology.map((item) => (
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
        <div
          style={{
            display: "grid",
            gap: "1.5rem"
          }}
        >
          <div>
            <p style={sectionLabelStyle}>Roadmap</p>
            <h2 style={{ margin: "0.55rem 0 0.85rem", fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>
              Start with one campus, then expand the network
            </h2>
            <p style={{ margin: 0, maxWidth: 680, color: "#555555", lineHeight: 1.6 }}>
              The near-term path is a focused SFSU pilot, then a broader CSU rollout, then a
              connected student marketplace across campuses.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "0.85rem",
                alignItems: "stretch",
                marginTop: "1.75rem"
              }}
            >
              {roadmap.map((item, index) => (
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
                  {index < roadmap.length - 1 ? (
                    <span style={{ color: "#888888", fontSize: 22, lineHeight: 1 }} aria-hidden="true">
                      →
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Image
              src="/branding/csu-logo.png"
              alt="California State University"
              width={120}
              height={51}
              style={{ width: "auto", height: "auto" }}
            />
            <p style={{ margin: 0, color: "#5c5c5c" }}>SFSU pilot to CSU network expansion</p>
          </div>
        </div>
      </section>
    </main>
  );
}
