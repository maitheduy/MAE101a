import React, { useState } from 'react';
import { MathView } from './MathView';
import { Calculator, Play } from 'lucide-react';

export const Calculators: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'newton' | 'det' | 'distance' | 'proj'>('newton');

  // State for Newton's Method
  const [newtonX1, setNewtonX1] = useState<number>(2);
  const [newtonSteps, setNewtonSteps] = useState<{ n: number; xn: number; fx: number; fpx: number }[]>([]);

  // State for Matrix Det
  const [matrix3, setMatrix3] = useState<number[][]>([
    [2, 1, 0],
    [1, 3, 1],
    [0, 1, 2]
  ]);
  const [scalarK, setScalarK] = useState<number>(2);

  // State for Distance
  const [point, setPoint] = useState<{ x: number; y: number; z: number }>({ x: 1, y: 3, z: -2 });
  const [plane, setPlane] = useState<{ a: number; b: number; c: number; d: number }>({ a: 2, b: -1, c: 2, d: 1 });

  // State for Projection
  const [vecU, setVecU] = useState<[number, number, number]>([4, -1, 3]);
  const [vecV, setVecV] = useState<[number, number, number]>([1, 1, 1]);

  // Run Newton for x^3 - x - 3 = 0
  const runNewton = () => {
    const f = (x: number) => x * x * x - x - 3;
    const fp = (x: number) => 3 * x * x - 1;

    const steps = [];
    let currentX = Number(newtonX1);

    for (let i = 1; i <= 5; i++) {
      const fx = f(currentX);
      const fpx = fp(currentX);
      steps.push({
        n: i,
        xn: currentX,
        fx,
        fpx
      });
      if (Math.abs(fpx) < 1e-12) break;
      currentX = currentX - fx / fpx;
    }
    setNewtonSteps(steps);
  };

  // Compute 3x3 Determinant
  const computeDet3 = (m: number[][]) => {
    return (
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
  };

  const detA = computeDet3(matrix3);
  const detKInv = detA !== 0 ? Math.pow(scalarK, 3) * (1 / detA) : 0;

  // Compute Distance Point to Plane
  const distNum = Math.abs(plane.a * point.x + plane.b * point.y + plane.c * point.z - plane.d);
  const distDenom = Math.sqrt(plane.a * plane.a + plane.b * plane.b + plane.c * plane.c);
  const distance = distDenom > 0 ? distNum / distDenom : 0;

  // Compute Vector Projection
  const dotUV = vecU[0] * vecV[0] + vecU[1] * vecV[1] + vecU[2] * vecV[2];
  const magV2 = vecV[0] * vecV[0] + vecV[1] * vecV[1] + vecV[2] * vecV[2];
  const projScalar = magV2 > 0 ? dotUV / magV2 : 0;
  const projVec = [
    projScalar * vecV[0],
    projScalar * vecV[1],
    projScalar * vecV[2]
  ];

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-700/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Máy Tính Hỗ Trợ Giải Nhanh MAE101</h2>
            <p className="text-xs sm:text-sm text-slate-400">Mô phỏng và kiểm tra các bài toán phức tạp theo thời gian thực</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-700/60 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('newton')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'newton' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lặp Newton (Câu 13)
          </button>
          <button
            onClick={() => setActiveTab('det')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'det' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Định thức ma trận (Câu 23)
          </button>
          <button
            onClick={() => setActiveTab('distance')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'distance' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Khoảng cách (Câu 26)
          </button>
          <button
            onClick={() => setActiveTab('proj')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'proj' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hình chiếu Vector (Câu 27)
          </button>
        </div>
      </div>

      {/* NEWTON TAB */}
      {activeTab === 'newton' && (
        <div className="space-y-5">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
            <h3 className="font-semibold text-slate-200 text-sm mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Phương pháp Newton giải phương trình <MathView math="f(x) = x^3 - x - 3 = 0" /></span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 flex items-center gap-2 flex-wrap">
              <span>Công thức lặp:</span>
              <MathView math="x_{n+1} = x_n - \frac{x_n^3 - x_n - 3}{3x_n^2 - 1}" />
              <span>(Chọn xấp xỉ đầu $x_1$ rồi nhấn Chạy lặp)</span>
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <label className="text-xs sm:text-sm font-medium text-slate-300">
                Giá trị khởi tạo $x_1$:
                <input
                  type="number"
                  step="0.1"
                  value={newtonX1}
                  onChange={(e) => setNewtonX1(parseFloat(e.target.value) || 0)}
                  className="ml-2 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white font-mono w-24 focus:outline-none focus:border-indigo-500"
                />
              </label>
              <button
                onClick={runNewton}
                className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all"
              >
                <Play className="w-4 h-4" /> Tính xấp xỉ các bước
              </button>
            </div>
          </div>

          {newtonSteps.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full text-left text-xs sm:text-sm font-mono text-slate-300">
                <thead className="bg-slate-900/90 text-indigo-300 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="py-2.5 px-4">Bước (n)</th>
                    <th className="py-2.5 px-4">Xấp xỉ <MathView math="x_n" /></th>
                    <th className="py-2.5 px-4"><MathView math="f(x_n)" /></th>
                    <th className="py-2.5 px-4"><MathView math="f'(x_n)" /></th>
                    <th className="py-2.5 px-4">Bước tiếp theo <MathView math="x_{n+1}" /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 bg-slate-800/40">
                  {newtonSteps.map((st, i) => {
                    const nextVal = st.xn - st.fx / st.fpx;
                    const isTargetX3 = st.n === 3;
                    return (
                      <tr key={i} className={isTargetX3 ? 'bg-emerald-950/40 text-emerald-300 font-bold' : ''}>
                        <td className="py-2.5 px-4">n = {st.n}</td>
                        <td className="py-2.5 px-4">{st.xn.toFixed(6)}</td>
                        <td className="py-2.5 px-4">{st.fx.toFixed(6)}</td>
                        <td className="py-2.5 px-4">{st.fpx.toFixed(6)}</td>
                        <td className="py-2.5 px-4">
                          {nextVal.toFixed(6)}
                          {isTargetX3 && (
                            <span className="ml-2 inline-flex items-center text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Đáp án $x_3 \approx {st.xn.toFixed(4)}$
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DETERMINANT TAB */}
      {activeTab === 'det' && (
        <div className="space-y-5">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
            <h3 className="font-semibold text-slate-200 text-sm mb-2 flex items-center gap-2 flex-wrap">
              <span>Tính định thức</span>
              <MathView math="\det(A)" />
              <span>và công thức</span>
              <MathView math="\det(k A^{-1}) = k^n \frac{1}{\det(A)}" />
              <span>(Câu 23)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Nhập các phần tử của ma trận vuông cấp 3 và hệ số vô hướng $k$:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-xs text-slate-300 mb-2 block font-medium">Ma trận $A$ (3x3):</span>
                <div className="grid grid-cols-3 gap-2 max-w-xs">
                  {matrix3.map((row, r) =>
                    row.map((val, c) => (
                      <input
                        key={`${r}-${c}`}
                        type="number"
                        value={val}
                        onChange={(e) => {
                          const updated = matrix3.map((rArr, ri) =>
                            rArr.map((v, ci) => (ri === r && ci === c ? parseFloat(e.target.value) || 0 : v))
                          );
                          setMatrix3(updated);
                        }}
                        className="px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-center text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Hệ số $k$ (trong bài là $k = 2$):</label>
                  <input
                    type="number"
                    value={scalarK}
                    onChange={(e) => setScalarK(parseFloat(e.target.value) || 1)}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-white font-mono w-28 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-indigo-500/30 text-xs sm:text-sm space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Định thức $\det(A)$:</span>
                    <span className="font-mono font-bold text-indigo-400">{detA}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Hệ số lũy thừa $k^n = {scalarK}^3$:</span>
                    <span className="font-mono text-slate-200">{Math.pow(scalarK, 3)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400 font-bold border-t border-slate-700/60 pt-2">
                    <span>Kết quả $\det({scalarK}A^{-1})$:</span>
                    <span className="font-mono text-base">{detKInv.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISTANCE TAB */}
      {activeTab === 'distance' && (
        <div className="space-y-5">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
            <h3 className="font-semibold text-slate-200 text-sm mb-2">
              Khoảng cách từ điểm $M(x_0, y_0, z_0)$ đến mặt phẳng $Ax + By + Cz = D$ (Câu 26)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Phương trình dạng chuẩn: $Ax + By + Cz - D = 0$.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <span className="text-xs text-slate-300 font-medium block">Tọa độ điểm $M$:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">x₀</label>
                    <input
                      type="number"
                      value={point.x}
                      onChange={(e) => setPoint({ ...point, x: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">y₀</label>
                    <input
                      type="number"
                      value={point.y}
                      onChange={(e) => setPoint({ ...point, y: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">z₀</label>
                    <input
                      type="number"
                      value={point.z}
                      onChange={(e) => setPoint({ ...point, z: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-white font-mono"
                    />
                  </div>
                </div>

                <span className="text-xs text-slate-300 font-medium block pt-2">Hệ số mặt phẳng $Ax + By + Cz = D$:</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">A</label>
                    <input
                      type="number"
                      value={plane.a}
                      onChange={(e) => setPlane({ ...plane, a: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">B</label>
                    <input
                      type="number"
                      value={plane.b}
                      onChange={(e) => setPlane({ ...plane, b: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">C</label>
                    <input
                      type="number"
                      value={plane.c}
                      onChange={(e) => setPlane({ ...plane, c: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">= D</label>
                    <input
                      type="number"
                      value={plane.d}
                      onChange={(e) => setPlane({ ...plane, d: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-indigo-500/30 text-xs sm:text-sm space-y-2 flex flex-col justify-center">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Tử số <MathView math="|Ax_0 + By_0 + Cz_0 - D|" />:</span>
                  <span className="font-mono text-indigo-400">{distNum}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Mẫu số <MathView math="\sqrt{A^2 + B^2 + C^2}" />:</span>
                  <span className="font-mono text-slate-200">{distDenom.toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 font-bold border-t border-slate-700/60 pt-2">
                  <span>Khoảng cách <MathView math="d" />:</span>
                  <span className="font-mono text-lg">{distance.toFixed(4)} ({distance === 2 ? '2 nguyên' : distance.toFixed(2)})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROJECTION TAB */}
      {activeTab === 'proj' && (
        <div className="space-y-5">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
            <h3 className="font-semibold text-slate-200 text-sm mb-2 flex items-center gap-2 flex-wrap">
              <span>Hình chiếu trực giao của Vector</span>
              <MathView math="\text{proj}_v u = \frac{u \cdot v}{\|v\|^2} v" />
              <span>(Câu 27)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5 flex-wrap">
              <span>Nhập tọa độ 2 vector</span>
              <MathView math="u" />
              <span>và</span>
              <MathView math="v" />
              <span>trong không gian</span>
              <MathView math="\mathbb{R}^3" />:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <span className="text-xs text-slate-300 font-medium block">Vector <MathView math="u = (u_1, u_2, u_3)" />:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => (
                    <input
                      key={`u-${i}`}
                      type="number"
                      value={vecU[i]}
                      onChange={(e) => {
                        const copy = [...vecU] as [number, number, number];
                        copy[i] = parseFloat(e.target.value) || 0;
                        setVecU(copy);
                      }}
                      className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-white font-mono"
                    />
                  ))}
                </div>

                <span className="text-xs text-slate-300 font-medium block pt-2">Vector chiếu <MathView math="v = (v_1, v_2, v_3)" />:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => (
                    <input
                      key={`v-${i}`}
                      type="number"
                      value={vecV[i]}
                      onChange={(e) => {
                        const copy = [...vecV] as [number, number, number];
                        copy[i] = parseFloat(e.target.value) || 0;
                        setVecV(copy);
                      }}
                      className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-white font-mono"
                    />
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-indigo-500/30 text-xs sm:text-sm space-y-2 flex flex-col justify-center">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Tích vô hướng <MathView math="u \cdot v" />:</span>
                  <span className="font-mono text-indigo-400">{dotUV}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Độ dài bình phương <MathView math="\|v\|^2" />:</span>
                  <span className="font-mono text-slate-200">{magV2}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Hệ số tỉ lệ <MathView math="\frac{u \cdot v}{\|v\|^2}" />:</span>
                  <span className="font-mono text-amber-300">{projScalar.toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 font-bold border-t border-slate-700/60 pt-2">
                  <span>Vector hình chiếu <MathView math="\text{proj}_v u" />:</span>
                  <span className="font-mono text-base">
                    ({projVec.map((c) => c.toFixed(2)).join(', ')})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
