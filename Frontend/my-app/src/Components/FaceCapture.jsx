// FaceCaptureMulti.jsx
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function FaceCaptureMulti({ frameCount = 5, interval = 400, onCaptureComplete }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function init() {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setReady(true);
    }
    init();
    // Cleanup: stop webcam on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const detectDescriptor = async () => {
    if (!videoRef.current) return null;
    const result = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!result) return null;
    return Array.from(result.descriptor); // convert Float32Array -> normal Array
  };

  const averageVectors = (vecs) => {
    if (!vecs.length) return null;
    const len = vecs[0].length;
    const avg = new Array(len).fill(0);
    vecs.forEach((v) => {
      for (let i = 0; i < len; i++) avg[i] += v[i];
    });
    for (let i = 0; i < len; i++) avg[i] /= vecs.length;
    return avg;
  };

  // Multi-frame capture and log
  const captureAndLog = async () => {
    if (!ready) return;
    setStatus("Capturing frames, stay still...");
    const descriptors = [];
    for (let i = 0; i < frameCount; i++) {
      const d = await detectDescriptor();
      if (d) descriptors.push(d);
      else console.log("frame", i, "no face detected");
      await sleep(interval);
    }
    if (!descriptors.length) {
      setStatus("No face detected — try again.");
      return;
    }
    const averaged = averageVectors(descriptors);
    setStatus("Embedding captured!");

    console.log("All embeddings:", descriptors);
    console.log("Averaged embedding:", averaged);

    // ✅ Send averaged embedding to parent
    if (onCaptureComplete) {
      onCaptureComplete(averaged);
    }

    // 🚩 Stop the camera after capturing
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setReady(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <video ref={videoRef} autoPlay muted playsInline style={{ width: 320, height: 240 }} />
      <div style={{ marginTop: 10 }}>
        <button className="border border-gray-200 rounded-full px-20 py-3 text-sm" onClick={captureAndLog} disabled={!ready}>
          Capture Face Embedding
        </button>
      </div>
      <div style={{ marginTop: 8 }}>{status}</div>
    </div>
  );
}
