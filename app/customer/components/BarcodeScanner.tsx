"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let controls: any;

    const startScanner = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();

        if (devices.length === 0) {
          setError("No se encontró cámara");
          return;
        }

        const selectedDeviceId = devices[0].deviceId;

        controls = await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, err) => {
            if (result) {
              setResult(result.getText());
            }
          },
        );
      } catch (err) {
        setError("Error al iniciar la cámara");
        console.error(err);
      }
    };

    startScanner();

    return () => {
      if (controls) {
        controls.stop(); // 👈 así se detiene ahora
      }
    };
  }, []);

  return (
    <div>
      <h2>Escanear código de barras</h2>

      <video ref={videoRef} style={{ width: "100%", maxWidth: 400 }} />

      {result && (
        <p>
          Código detectado: <strong>{result}</strong>
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
