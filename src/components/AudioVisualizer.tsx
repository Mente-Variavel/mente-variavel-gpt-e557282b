import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isActive: boolean;
  barCount?: number;
  className?: string;
}

const AudioVisualizer = ({ stream, isActive, barCount = 24, className = "" }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!stream || !isActive || !canvas) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.7;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      ctx.clearRect(0, 0, width, height);

      const gap = 2;
      const barWidth = (width / barCount) - gap;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * dataArray.length);
        const value = dataArray[dataIndex] || 0;
        const normalized = value / 255;

        const minH = 4;
        const barHeight = Math.max(minH, normalized * (height * 0.85));
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        const alpha = 0.4 + normalized * 0.6;
        // Use a cyan/teal color matching the theme
        ctx.fillStyle = `rgba(0, 200, 220, ${alpha})`;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
    };
  }, [stream, isActive, barCount]);

  if (!isActive || !stream) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-10 ${className}`}
      style={{ display: "block" }}
    />
  );
};

export default AudioVisualizer;
