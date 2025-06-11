import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image generation
export async function GET() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: "linear-gradient(to bottom right, #ffffff, #f8fafc)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        {/* Main content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            maxWidth: "1000px",
          }}
        >
          {/* Logo and app name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              marginBottom: "40px",
            }}
          >
            <img
              width="120"
              height="120"
              src={`https://growmoji.app/icon.png`}
              style={{
                borderRadius: "24px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              }}
            />
            <h1
              style={{
                fontSize: "72px",
                fontWeight: "bold",
                background: "linear-gradient(to right, #3B82F6, #8B5CF6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
                lineHeight: 1,
              }}
            >
              Growmoji
            </h1>
          </div>

          {/* Tagline */}
          <h2
            style={{
              fontSize: "48px",
              fontWeight: "600",
              color: "#1F2937",
              margin: "0 0 24px 0",
              lineHeight: 1.2,
            }}
          >
            Build Better Habits
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: "32px",
              color: "#4B5563",
              margin: "0 0 40px 0",
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            Transform your life with beautiful habit tracking
          </p>

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              backgroundColor: "#F3F4F6",
              borderRadius: "9999px",
              fontSize: "24px",
              fontWeight: "500",
              color: "#4B5563",
              boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
            }}
          >
            <span role="img" aria-label="sparkles">✨</span>
            The Beautiful Habit Tracker
          </div>
        </div>
      </div>
    ),
    // ImageResponse options
    {
      width: 1200,
      height: 630,
    }
  );
} 