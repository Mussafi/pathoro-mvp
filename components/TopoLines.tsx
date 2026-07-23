function buildContour(seed: number, width: number, height: number, baseY: number) {
  const steps = 10;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (width / steps) * i;
    const y =
      baseY +
      Math.sin(i * 0.9 + seed) * 22 +
      Math.sin(i * 0.37 + seed * 1.7) * 12;
    pts.push([x, y]);
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const mx = (px + cx) / 2;
    const my = (py + cy) / 2;
    d += ` Q ${px} ${py} ${mx} ${my}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  d += ` T ${lx} ${ly}`;
  return d;
}

export function TopoLines({
  className = "",
  count = 14,
  width = 800,
  height = 700,
  stroke = "currentColor",
  opacityRange = [0.06, 0.22],
}: {
  className?: string;
  count?: number;
  width?: number;
  height?: number;
  stroke?: string;
  opacityRange?: [number, number];
}) {
  const lines = Array.from({ length: count }, (_, i) => {
    const baseY = (height / (count - 1)) * i;
    return {
      d: buildContour(i * 1.31 + 0.4, width, height, baseY),
      opacity:
        opacityRange[0] +
        ((opacityRange[1] - opacityRange[0]) * (i % 5)) / 5,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      {lines.map((line, i) => (
        <path
          key={i}
          d={line.d}
          fill="none"
          stroke={stroke}
          strokeWidth={1}
          opacity={line.opacity}
        />
      ))}
    </svg>
  );
}
