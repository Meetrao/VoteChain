import React, { useState } from "react";
import FaceCaptureMulti from "./FaceCapture";

export default function Register() {
  const [showFace, setShowFace] = useState(false);

  return (
    <div style={{ padding: 40 }}>
      <h2>Register</h2>
      <button onClick={() => setShowFace(true)}>
        Capture Face for Registration
      </button>
      {showFace && (
        <FaceCaptureMulti
          frameCount={5}
          interval={400}
        />
      )}
    </div>
  );
}