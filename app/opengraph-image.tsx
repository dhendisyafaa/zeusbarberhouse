import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} - ${siteConfig.tagline}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const checkerBlocks = Array.from({ length: 30 }, (_, index) => index);

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#09090b",
          color: "#fafafa",
          padding: "64px 72px 56px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 20,
            display: "flex",
          }}
        >
          {checkerBlocks.map((block) => (
            <div
              key={block}
              style={{
                flex: 1,
                height: "100%",
                background: block % 2 === 0 ? "#ff2a2a" : "#fafafa",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid #ff2a2a",
              background: "#1a1a1d",
              fontSize: 36,
              fontWeight: 800,
              color: "#ff2a2a",
            }}
          >
            Z
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              color: "#ff2a2a",
            }}
          >
            BANDUNG RAYA • EST. 2024
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 0.95,
            }}
          >
            ZEUS BARBERHOUSE
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: 1,
              color: "#fafafa",
            }}
          >
            FEEL AT HOME.
            <span style={{ color: "#ff2a2a", marginLeft: 16 }}>
              LEAVE REFRESHED.
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #27272a",
            paddingTop: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 600,
              color: "#a1a1aa",
              letterSpacing: 1,
            }}
          >
            POTONG RAMBUT PRESISI • CAPSTER ANDALAN
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0033a0",
              color: "#fafafa",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              padding: "14px 24px",
            }}
          >
            BOOKING ONLINE
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 12,
            display: "flex",
          }}
        >
          {checkerBlocks.map((block) => (
            <div
              key={block}
              style={{
                flex: 1,
                height: "100%",
                background: block % 2 === 0 ? "#fafafa" : "#ff2a2a",
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
