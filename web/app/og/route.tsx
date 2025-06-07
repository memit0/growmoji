import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Growmoji - Build Better Habits";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            justifyItems: "center",
          }}
        >
          <img
            width="256"
            height="256"
            src={`https://growmoji.app/icon.png`}
            style={{
              borderRadius: 128,
            }}
          />
        </div>

        {/* Text container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            justifyItems: "center",
            marginTop: 40,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: 60,
              fontWeight: "bold",
              background: "linear-gradient(to right, #3B82F6, #8B5CF6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Build Better Habits
          </h1>
          <h1
            style={{
              fontSize: 60,
              fontWeight: "bold",
              background: "linear-gradient(to right, #3B82F6, #8B5CF6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Achieve Your Goals
          </h1>
        </div>

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 30,
            padding: "10px 20px",
            backgroundColor: "#F3F4F6", // Equivalent to bg-gray-100
            borderRadius: "9999px",
            fontSize: 20,
            fontWeight: 500,
            color: "#4B5563", // Equivalent to text-gray-600
          }}
        >
          The Beautiful Habit Tracker with Emojis
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
    }
  );
} 