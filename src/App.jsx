import React, { useMemo, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy, Lock, BookOpen, GraduationCap } from "lucide-react";
import data from "./questions_demo.json";
import "./style.css";

const PASS_PERCENT = data.passingPercent || 60;

function getType(q) {
  if (q.type) return q.type;
  return (q.correct || []).length === 1 ? "single_choice" : "multiple_choice";
}

function typeLabel(q) {
  const t = getType(q);
  if (t === "combination") return "Kombinationsfrage";
  if (t === "single_choice") return "Single Choice";
  return "Multiple Choice";
}

function isSingle(q) {
  const t = getType(q);
  return t === "single_choice" || t === "combination";
}

function arrayEquals(a, b) {
  const aa = [...a].sort((x, y) => x - y);
  const bb = [...b].sort((x, y) => x - y);
  return aa.length === bb.length && aa.every((v, i) => v === bb[i]);
}

function OptionButton({ active, checked, children, onClick, disabled }) {
  return (
    <button
      className={`option ${checked ? "selected" : ""} ${active ? "active" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default function App() {
  const questions = data.questions || [];
  const [mode, setMode] = useState("start");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(Array.from({ length: questions.length }, () => []));
  const [checked, setChecked] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const current = questions[index] || {};
  const selected = answers[index] || [];
  const correct = current.correct || [];
  const currentCorrect = arrayEquals(selected, correct);

  const stats = useMemo(() => {
    let answered = 0;
    let right = 0;
    questions.forEach((q, i) => {
      const ans = answers[i] || [];
      if (ans.length > 0) answered++;
      if (arrayEquals(ans, q.correct || [])) right++;
    });
    const percent = questions.length ? Math.round((right / questions.length) * 100) : 0;
    return { answered, right, wrong: questions.length - right, percent, passed: percent >= PASS_PERCENT };
  }, [answers, questions]);

  function startExam() {
    setMode("exam");
    setIndex(0);
    setAnswers(Array.from({ length: questions.length }, () => []));
    setChecked(false);
    setShowResult(false);
  }

  function toggleOption(i) {
    if (checked) return;
    setAnswers(prev => {
      const next = prev.map(a => [...a]);
      if (isSingle(current)) {
        next[index] = [i];
      } else {
        next[index] = next[index].includes(i)
          ? next[index].filter(x => x !== i)
          : [...next[index], i];
      }
      return next;
    });
  }

  function checkAnswer() {
    if (!selected.length) return;
    setChecked(true);
  }

  function next() {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setChecked(false);
    } else {
      setShowResult(true);
      setMode("result");
    }
  }

  function prev() {
    if (index > 0) {
      setIndex(index - 1);
      setChecked(false);
    }
  }

  const correctText = (current.correct || [])
    .map(i => `${i + 1}. ${current.options?.[i] || ""}`)
    .join("\n");

  if (mode === "start") {
    return (
      <main className="page">
        <section className="hero">
          <div className="badge">FREE Demo · 20 Fragen</div>
          <h1>LernLoop §34a</h1>
          <p>Teste den Prüfungssimulator direkt im Browser. Keine EXE, kein Download, kein Risiko.</p>

          <div className="heroActions">
            <button className="primary" onClick={startExam}>
              Demo starten
            </button>
            <a className="ghost" href="#vollversion">Vollversion ansehen</a>
          </div>
        </section>

        <section className="cards">
          <div className="infoCard">
            <GraduationCap />
            <h3>Prüfungsnah</h3>
            <p>Single Choice, Multiple Choice und Kombinationsfragen.</p>
          </div>
          <div className="infoCard">
            <BookOpen />
            <h3>Lernmodus</h3>
            <p>Antwort auswählen, prüfen und Erklärung lesen.</p>
          </div>
          <div className="infoCard">
            <Lock />
            <h3>Vollversion</h3>
            <p>472+ Fragen, Mischprüfungen, Statistik und Fehlerbank.</p>
          </div>
        </section>

        <section id="vollversion" className="upgrade">
          <h2>Vollversion</h2>
          <p>
            Die Demo enthält 20 Fragen. Die Vollversion enthält 472+ Fragen, 82-Fragen-Prüfungen,
            sehr schwere Mischprüfungen, Fehlerbank, Statistik und Lernmodus.
          </p>
        </section>
      </main>
    );
  }

  if (mode === "result") {
    return (
      <main className="page resultPage">
        <section className={`resultBox ${stats.passed ? "passed" : "failed"}`}>
          {stats.passed ? <Trophy size={56} /> : <XCircle size={56} />}
          <h1>{stats.passed ? "Bestanden" : "Nicht bestanden"}</h1>
          <p>{stats.percent}% erreicht · Bestehensgrenze {PASS_PERCENT}%</p>

          <div className="resultGrid">
            <div><strong>{questions.length}</strong><span>Fragen</span></div>
            <div><strong>{stats.answered}</strong><span>Beantwortet</span></div>
            <div><strong>{stats.right}</strong><span>Richtig</span></div>
            <div><strong>{stats.wrong}</strong><span>Falsch/offen</span></div>
          </div>

          <div className="heroActions">
            <button className="primary" onClick={startExam}>
              <RotateCcw size={18} /> Neu starten
            </button>
            <button className="ghostButton" onClick={() => setMode("start")}>Zur Startseite</button>
          </div>

          <p className="smallUpgrade">
            Demo abgeschlossen. Die Vollversion enthält 472+ Fragen und schwere Mischprüfungen.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="examHeader">
        <div>
          <div className="badge">{typeLabel(current)}</div>
          <h1>Frage {index + 1} von {questions.length}</h1>
        </div>
        <div className="score">{stats.right}/{questions.length} richtig</div>
      </header>

      <div className="progress">
        <div style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      <section className="questionCard">
        <h2>{current.question}</h2>

        {getType(current) === "combination" && current.statements?.length > 0 && (
          <div className="statements">
            <strong>Aussagen:</strong>
            {current.statements.map((s, i) => (
              <p key={i}>{i + 1}. {s}</p>
            ))}
            <strong>Kombinationsmöglichkeiten:</strong>
          </div>
        )}

        <div className="options">
          {(current.options || []).map((option, i) => {
            const isCorrect = correct.includes(i);
            const isSelected = selected.includes(i);
            const reveal = checked;
            return (
              <OptionButton
                key={i}
                checked={isSelected}
                active={reveal && isCorrect}
                disabled={checked}
                onClick={() => toggleOption(i)}
              >
                <span>{i + 1}. {option}</span>
                {reveal && isCorrect && <CheckCircle2 className="ok" />}
                {reveal && isSelected && !isCorrect && <XCircle className="bad" />}
              </OptionButton>
            );
          })}
        </div>

        {checked && (
          <div className={`feedback ${currentCorrect ? "good" : "wrong"}`}>
            <strong>{currentCorrect ? "✅ Richtig!" : "❌ Falsch."}</strong>
            <p><b>Richtige Antwort(en):</b></p>
            <pre>{correctText || "Keine Lösung hinterlegt."}</pre>
            {current.explanation && (
              <>
                <p><b>Erklärung:</b></p>
                <p>{current.explanation}</p>
              </>
            )}
          </div>
        )}
      </section>

      <footer className="bottomBar">
        <button className="ghostButton" onClick={prev} disabled={index === 0}>Zurück</button>
        <button className="primary" onClick={checkAnswer} disabled={!selected.length || checked}>Prüfen</button>
        <button className="ghostButton" onClick={next}>{index < questions.length - 1 ? "Weiter" : "Auswertung"}</button>
      </footer>
    </main>
  );
}
