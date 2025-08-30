import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const neonBlue = "#00f6ff";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen py-2">
      <DotLottieReact
        src="/Live chatbot.lottie"
        loop
        autoplay
        style={{ width: 200, height: 200 }}
      />
      <div className="mt-3 text-center">
        <span
          className="text-xl font-semibold"
          style={{
            color: neonBlue,
            letterSpacing: "0.08em",
            filter: "brightness(1.6)",
            textShadow: "0 0 8px #00f6ff, 0 0 16px #00f6ff80",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}