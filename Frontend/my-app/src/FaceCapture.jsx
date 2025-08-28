import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function FaceCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      // Load models
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);

      // Start webcam
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setReady(true);
    }

    init();
  }, []);

  // Capture face and log embedding
  const captureFace = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const detection = await faceapi
      .detectSingleFace(canvas)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      console.log("No face detected");
      return;
    }

    console.log("Face embedding:", detection.descriptor); // 128-length Float32Array
  };

  return (
    <div style={{ padding: "20px" }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ border: "1px solid black", borderRadius: "8px" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <br />
      <button
        onClick={captureFace}
        disabled={!ready}
        style={{ padding: "8px 12px", marginTop: "10px", background: "black", color: "white", borderRadius: "4px" }}
      >
        {ready ? "Capture Face" : "Loading..."}
      </button>
    </div>
  );
}
