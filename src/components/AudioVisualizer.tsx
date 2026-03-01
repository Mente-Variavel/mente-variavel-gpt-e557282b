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
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream || !isActive || !canvasRef.current) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.75;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Get CSS variables for theming
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryHSL = computedStyle.getPropertyValue("--primary").trim();

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

      const barWidth = width / barCount;
      const gap = 2;
      const usableBarWidth = barWidth - gap;

      for (let i = 0; i < barCount; i++) {
        // Map bar index to frequency data
        const dataIndex = Math.floor((i / barCount) * dataArray.length);
        const value = dataArray[dataIndex] || 0;
        const normalizedValue = value / 255;

        // Minimum bar height for idle animation
        const minHeight = 3;
        const barHeight = Math.max(minHeight, normalizedValue * (height * 0.85));

        const x = i * barWidth + gap / 2;
        const y = (height - barHeight) / 2;

        // Use primary color with varying opacity based on intensity
        const opacity = 0.4 + normalizedValue * 0.6;
        ctx.fillStyle = `hsl(${primaryHSL} / ${opacity})`;
        ctx.beginPath();
        ctx.roundRect(x, y, usableBarWidth, barHeight, 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    };
  }, [stream, isActive, barCount]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-10 ${className}`}
      style={{ display: "block" }}
    />
  );
};

export default AudioVisualizer;
