import React, { useState } from "react";
import { X, RotateCcw, Calculator as CalcIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GateScientificCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GateScientificCalculator({ isOpen, onClose }: GateScientificCalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [isRad, setIsRad] = useState(true);
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<string>("");

  if (!isOpen) return null;

  const handleDigit = (d: string) => {
    if (display === "0" || display === "Error") {
      setDisplay(d);
    } else {
      setDisplay(display + d);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setHistory("");
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const evaluateExpression = (expr: string): number => {
    // Basic safe evaluator for calculator math
    let sanitized = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, `${Math.PI}`)
      .replace(/e/g, `${Math.E}`);

    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${sanitized})`)();
  };

  const handleEquals = () => {
    try {
      const result = evaluateExpression(display);
      setHistory(display + " =");
      setDisplay(Number.isInteger(result) ? result.toString() : result.toFixed(6).replace(/\.?0+$/, ""));
    } catch {
      setDisplay("Error");
    }
  };

  const handleUnary = (fn: (x: number) => number, label: string) => {
    try {
      const val = parseFloat(display);
      let angle = val;
      if (!isRad && (label.startsWith("sin") || label.startsWith("cos") || label.startsWith("tan"))) {
        angle = (val * Math.PI) / 180;
      }
      const res = fn(angle);
      setHistory(`${label}(${display}) =`);
      setDisplay(Number.isInteger(res) ? res.toString() : res.toFixed(6).replace(/\.?0+$/, ""));
    } catch {
      setDisplay("Error");
    }
  };

  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden font-mono text-white text-xs">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-950 px-4 py-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CalcIcon className="h-4 w-4 text-emerald-400" />
            <span className="font-bold tracking-wider text-slate-200">GATE VIRTUAL SCIENTIFIC CALCULATOR</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-sans">Official Exam Standard</span>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div className="bg-slate-950 p-4 border-b border-slate-800">
          <div className="text-right text-[11px] text-slate-500 h-4 truncate">{history}</div>
          <div className="text-right text-2xl font-bold text-emerald-400 tracking-wider truncate py-1">
            {display}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRad(!isRad)}
                className={`px-2 py-0.5 rounded font-bold ${
                  isRad ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {isRad ? "RAD" : "DEG"}
              </button>
              <span>{isRad ? "Radian Mode" : "Degree Mode"}</span>
            </div>
            {memory !== 0 && <span className="text-amber-400 font-bold">M = {memory}</span>}
          </div>
        </div>

        {/* Calculator Keypad */}
        <div className="p-3 bg-slate-900 grid grid-cols-6 gap-1.5 text-center">
          {/* Row 1 - Memory & Special */}
          <button onClick={() => setMemory(0)} className="calc-btn-func">MC</button>
          <button onClick={() => setDisplay(memory.toString())} className="calc-btn-func">MR</button>
          <button onClick={() => setMemory(parseFloat(display) || 0)} className="calc-btn-func">MS</button>
          <button onClick={() => setMemory(memory + (parseFloat(display) || 0))} className="calc-btn-func">M+</button>
          <button onClick={handleBackspace} className="calc-btn-warn col-span-1">DEL</button>
          <button onClick={handleClear} className="calc-btn-warn col-span-1">C</button>

          {/* Row 2 - Trig */}
          <button onClick={() => handleUnary(Math.sin, "sin")} className="calc-btn-sci">sin</button>
          <button onClick={() => handleUnary(Math.cos, "cos")} className="calc-btn-sci">cos</button>
          <button onClick={() => handleUnary(Math.tan, "tan")} className="calc-btn-sci">tan</button>
          <button onClick={() => handleDigit("(")} className="calc-btn-num">(</button>
          <button onClick={() => handleDigit(")")} className="calc-btn-num">)</button>
          <button onClick={() => handleDigit("/")} className="calc-btn-op">÷</button>

          {/* Row 3 - Inverse Trig */}
          <button onClick={() => handleUnary(Math.asin, "asin")} className="calc-btn-sci">sin⁻¹</button>
          <button onClick={() => handleUnary(Math.acos, "acos")} className="calc-btn-sci">cos⁻¹</button>
          <button onClick={() => handleUnary(Math.atan, "atan")} className="calc-btn-sci">tan⁻¹</button>
          <button onClick={() => handleDigit("7")} className="calc-btn-num font-bold">7</button>
          <button onClick={() => handleDigit("8")} className="calc-btn-num font-bold">8</button>
          <button onClick={() => handleDigit("9")} className="calc-btn-num font-bold">9</button>

          {/* Row 4 - Logs & Exp */}
          <button onClick={() => handleUnary(Math.log, "ln")} className="calc-btn-sci">ln</button>
          <button onClick={() => handleUnary(Math.log10, "log₁₀")} className="calc-btn-sci">log₁₀</button>
          <button onClick={() => handleUnary(Math.exp, "e^x")} className="calc-btn-sci">eˣ</button>
          <button onClick={() => handleDigit("4")} className="calc-btn-num font-bold">4</button>
          <button onClick={() => handleDigit("5")} className="calc-btn-num font-bold">5</button>
          <button onClick={() => handleDigit("6")} className="calc-btn-num font-bold">6</button>

          {/* Row 5 - Powers & Roots */}
          <button onClick={() => handleUnary(Math.sqrt, "sqrt")} className="calc-btn-sci">√x</button>
          <button onClick={() => handleUnary((x) => Math.pow(x, 2), "sqr")} className="calc-btn-sci">x²</button>
          <button onClick={() => handleUnary((x) => 1 / x, "1/x")} className="calc-btn-sci">1/x</button>
          <button onClick={() => handleDigit("1")} className="calc-btn-num font-bold">1</button>
          <button onClick={() => handleDigit("2")} className="calc-btn-num font-bold">2</button>
          <button onClick={() => handleDigit("3")} className="calc-btn-num font-bold">3</button>

          {/* Row 6 - Constants, Zero, Equals */}
          <button onClick={() => handleUnary(factorial, "n!")} className="calc-btn-sci">n!</button>
          <button onClick={() => handleDigit(`${Math.PI}`)} className="calc-btn-sci">π</button>
          <button onClick={() => handleDigit(`${Math.E}`)} className="calc-btn-sci">e</button>
          <button onClick={() => handleDigit(".")} className="calc-btn-num font-bold">.</button>
          <button onClick={() => handleDigit("0")} className="calc-btn-num font-bold">0</button>
          <button onClick={() => handleDigit("*")} className="calc-btn-op">×</button>

          {/* Row 7 - Signs & Operations */}
          <button onClick={() => handleUnary((x) => -x, "neg")} className="calc-btn-sci">±</button>
          <button onClick={() => handleDigit("%")} className="calc-btn-sci">mod</button>
          <button onClick={() => handleDigit("+")} className="calc-btn-op">+</button>
          <button onClick={() => handleDigit("-")} className="calc-btn-op">-</button>
          <button
            onClick={handleEquals}
            className="col-span-2 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wider shadow-md transition"
          >
            =
          </button>
        </div>

        {/* Footer Note */}
        <div className="bg-slate-950 px-4 py-2 text-[10px] text-slate-500 border-t border-slate-800 flex justify-between">
          <span>Official GATE Keyboard & Virtual Numpad Enabled</span>
          <span className="text-slate-400">Strictly Non-Programmable Mode</span>
        </div>
      </div>
    </div>
  );
}
