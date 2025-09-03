import React, { useState } from "react";
import FaceCaptureMulti from "./FaceCapture";

export default function Login() {
  const [showFace, setShowFace] = useState(false);

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>
      <button onClick={() => setShowFace(true)}>
        Capture Face for Login
      </button>
      {showFace && (
        <FaceCaptureMulti
          frameCount={3}
          interval={400}
        />
      )}
    </div>
  );
}