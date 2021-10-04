import { useEffect, useRef, useState } from 'react';
import './App.css';
// 30 deg
const GAP = Math.PI / 6;
const numbers = new Array(10).fill(null).map((_, i) => {
  const { x, y } = polar2Cartesian((i + 4) * GAP, 200);
  return {
    n: i,
    x,
    y,
    range: [i * 30 + 15, i * 30 + 35],
  };
});

function App() {
  const [degree, setDegree] = useState(0);
  const [displayNumbers, setDisplayNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [isAnimate, setIsAnimate] = useState(false);
  const isMouseDown = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<SVGAnimateTransformElement>(null);
  const startingDegree = useRef(0);

  const renderNumbers = () => {
    return numbers.map(({ x, y, n }) => {
      return (
        <span
          key={n}
          className="number"
          style={{
            top: x + 250,
            left: y + 250,
            transform: 'translate(-50%,-50%)',
          }}
        >
          {n}
        </span>
      );
    });
  };

  const renderHole = () => {
    return numbers.map(({ x, y, n }) => {
      return <circle key={n} r="7" cx={(y + 250) / 5} cy={(x + 250) / 5} />;
    });
  };

  const calcSvgDegree = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const { x, y } = svgRef.current.getBoundingClientRect();
    const mx = clientX - (x + 250);
    const my = clientY - (y + 250);

    const radian = Math.atan2(mx, my);
    const d = (radian * -180) / Math.PI + 90;
    // normalize
    return d < 0 ? 360 + d : d;
  };

  useEffect(() => {
    document.body.addEventListener('mousemove', (e) => {
      if (!isMouseDown.current) return;
      const normalizedDegree = calcSvgDegree(e.clientX, e.clientY);
      if (!normalizedDegree) return;

      const val = normalizedDegree - startingDegree.current;
      setDegree((prev) => {
        const res = val > prev ? val : prev;

        const num = numbers.find(({ range }) => {
          if (res > range[0] && res < range[1]) {
            return true;
          }
          return false;
        });

        setCurrentNumber(num?.n ?? null);
        return res;
      });
    });

    document.body.addEventListener('mousedown', (e) => {
      isMouseDown.current = true;
      startingDegree.current = calcSvgDegree(e.clientX, e.clientY) || 0;
    });

    document.body.addEventListener('mouseup', () => {
      setIsAnimate(true);
    });
  }, []);

  useEffect(() => {
    if (!isAnimate || !animationRef.current) return;
    document.body.style.pointerEvents = 'none';
    isMouseDown.current = false;
    const duration = degree / 100;
    animationRef.current.setAttribute('dur', String(duration));
    animationRef.current.beginElement();

    setTimeout(() => {
      document.body.style.pointerEvents = 'unset';
      setIsAnimate(false);
      setDegree(0);
    }, duration * 1000 + 100);

    if (currentNumber === null) return;
    setDisplayNumbers([...displayNumbers, currentNumber]);
    setCurrentNumber(null);
  }, [isAnimate]);
  return (
    <>
      <h1>
        {displayNumbers.map((n, i) => (
          <span key={i}>{n}</span>
        ))}
        <span>{currentNumber}</span>
      </h1>
      <svg ref={svgRef} viewBox="0 0 100 100" width="500" height="500">
        <mask id="circles">
          <rect width="100" height="100" fill="white" />
          {renderHole()}
        </mask>
        <circle
          mask="url(#circles)"
          cx="50"
          cy="50"
          r="50"
          transform={`rotate(${degree})`}
          style={{ transformOrigin: 'center' }}
        >
          {isAnimate && (
            <animateTransform
              ref={animationRef}
              attributeName="transform"
              type="rotate"
              begin="indefinite"
              to="0"
              fill="freeze"
            />
          )}
        </circle>
        <rect
          x="50"
          y="47"
          style={{ transformOrigin: 'center', pointerEvents: 'none' }}
          width="50"
          height="6"
          fill="#444"
        />
      </svg>
      <div>{renderNumbers()}</div>
    </>
  );
}

export default App;

function polar2Cartesian(radian: number, radius: number) {
  return {
    x: Math.cos(radian) * radius,
    y: Math.sin(radian) * radius,
  };
}
