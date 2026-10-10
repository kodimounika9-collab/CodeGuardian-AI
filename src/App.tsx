
import { useState } from "react";
import "./App.css";

function App() {
  const [language, setLanguage] = useState("Java");
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [reviewHistory, setReviewHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [issueCount, setIssueCount] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [explanation, setExplanation] = useState("");

 
function reviewCode() {
  if (!code.trim()) {
    setResult("Please paste your code before starting the review.");
    setScore(null);
    setIssueCount(0);
    setExplanation("");
    return;
  }

  setLoading(true);
  setResult("");
  setExplanation("");

  window.setTimeout(() => {
    const issues: string[] = [];
    let qualityScore = 100;
    const trimmedCode = code.trim();

    // Check TODO and FIXME comments
    if (/\bTODO\b/.test(code)) {
      issues.push(
        "Incomplete task: review your TODO comments.\n" +
        "Suggested fix: complete the task and remove the TODO comment."
      );
      qualityScore -= 10;
    }

    if (/\bFIXME\b/.test(code)) {
      issues.push(
        "Incomplete fix: review your FIXME comment.\n" +
        "Suggested fix: correct the marked problem and remove the FIXME comment."
      );
      qualityScore -= 10;
    }

    // Check debugging output in JavaScript and TypeScript
    if (
      (language === "JavaScript" || language === "TypeScript") &&
      code.includes("console.log(")
    ) {
      issues.push(
        "Code quality: review console.log statements and remove unnecessary debugging output before production."
      );
      qualityScore -= 5;
    }

    // Check for a single = in Python if/elif conditions
    if (language === "Python") {
      for (const line of code.split("\n")) {
        const match = line.match(
          /^\s*(?:if|elif)\s+(.+):\s*(?:#.*)?$/
        );

        if (match && /(^|[^=!<>])=(?!=)/.test(match[1])) {
          issues.push(
            "Possible Python syntax error: a single = appears in an if/elif condition.\n" +
            "Suggested fix: use == when comparing values."
          );
          qualityScore -= 15;
          break;
        }
      }
    }

    // Check for possibly unused variables in JavaScript/TypeScript
    if (
      language === "JavaScript" ||
      language === "TypeScript"
    ) {
      const variablePattern =
        /\b(?:const|let)\s+([a-zA-Z_$][\w$]*)\s*=/g;

      let match: RegExpExecArray | null;

      while ((match = variablePattern.exec(code)) !== null) {
        const variableName = match[1];
        const escapedName = variableName.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        const occurrences = code.match(
          new RegExp(`\\b${escapedName}\\b`, "g")
        );

        if (occurrences && occurrences.length === 1) {
          issues.push(
            `Possible unused variable: "${variableName}" is declared but not used elsewhere.\n` +
            `Suggested fix: use "${variableName}" or remove it if unnecessary.`
          );
          qualityScore -= 5;
        }
      }
    }

    // Check possible Java String comparison mistakes
    if (
      language === "Java" &&
      /(?:\b\w+\s*==\s*"[^"]*"|"[^"]*"\s*==\s*\b\w+)/.test(code)
    ) {
      issues.push(
        "Possible Java bug: use .equals() to compare String contents instead of ==."
      );
      qualityScore -= 15;
    }

    // Check for hard-coded passwords
    
const passwordLines = code.split("\n");

const passwordLineIndex = passwordLines.findIndex((line) =>
  /\bpassword\s*=\s*["'][^"']+["']/i.test(line)
);

if (passwordLineIndex !== -1) {
  issues.push(
    `Line ${passwordLineIndex + 1}: Security warning: a hard-coded password may expose sensitive information.\n` +
    "Suggested fix: do not store real passwords directly in source code."
  );
  qualityScore -= 25;
}
 

    // Check whether a Java program has an output statement
    if (
      language === "Java" &&
      !code.includes("System.out.println") &&
      !code.includes("System.out.print")
    ) {
      issues.push(
        "Suggestion: check whether your Java program needs an output statement."
      );
    }

    // Check loose equality in JavaScript/TypeScript
    if (
      (language === "JavaScript" || language === "TypeScript") &&
      /(^|[^=!])==(?!=)/.test(code)
    ) {
      issues.push(
        "Review equality checks: consider === for strict comparison where appropriate."
      );
    }

    // Count actual findings, excluding informational messages
    const findings = issues.filter(
      (issue) =>
        !issue.startsWith("Suggestion:") &&
        !issue.startsWith("Code length:")
    );

    const lines = trimmedCode.split("\n").length;

    const report = [
      "CODE REVIEW REPORT",
      "",
      `Language: ${language}`,
      `Code length: ${lines} line(s)`,
      `Potential issues found: ${findings.length}`,
      "",
      ...(issues.length > 0
        ? issues.map((issue) => "• " + issue)
        : [
            "No issues detected by these basic checks.",
            "This does not guarantee that your code is bug-free."
          ])
    ].join("\n");

    setScore(Math.max(0, qualityScore));
    setIssueCount(findings.length);
    setResult(report);
    setReviewHistory((previous) => [
  `${language} — ${new Date().toLocaleString()}\n${report}`,
  ...previous,
].slice(0, 5));
    setLoading(false);
  }, 400);
}


function explainCode() {
  if (!code.trim()) {
    setExplanation("Please paste some code first.");
    return;
  }

  const lines = code.split("\n").filter(
    (line) => line.trim()
  );
  const concepts: string[] = [];

  if (code.includes("class ")) {
    concepts.push("A class organizes related code.");
  }

  if (language === "Java" && code.includes("main(")) {
    concepts.push(
      "The main method is an entry point in many Java programs."
    );
  }

  if (code.includes("System.out.println")) {
    concepts.push("System.out.println prints output in Java.");
  }

  if (code.includes("if ") || code.includes("if(")) {
    concepts.push("An if statement checks a condition.");
  }

  if (code.includes("for ") || code.includes("for(")) {
    concepts.push("A for loop repeats a block of code.");
  }

  if (code.includes("while ") || code.includes("while(")) {
    concepts.push(
      "A while loop repeats while its condition is true."
    );
  }

  if (
    language === "JavaScript" ||
    language === "TypeScript"
  ) {
    if (code.includes("function ")) {
      concepts.push(
        "A function is a reusable block of code that performs a task."
      );
    }

    if (code.includes("console.log(")) {
      concepts.push(
        "console.log() displays information in the developer console."
      );
    }

    if (code.includes("return ")) {
      concepts.push(
        "The return statement sends a value back from a function."
      );
    }

    if (code.includes("=>")) {
      concepts.push(
        "The => symbol defines an arrow function."
      );
    }

    if (code.includes("const ")) {
      concepts.push(
        "const declares a variable that cannot be reassigned."
      );
    }

    if (code.includes("let ")) {
      concepts.push(
        "let declares a variable whose value can be reassigned."
      );
    }
  }

  if (language === "Python") {
    if (code.includes("def ")) {
      concepts.push("def is used to define a function in Python.");
    }

    if (code.includes("print(")) {
      concepts.push("print() displays output in Python.");
    }

    if (code.includes("import ")) {
      concepts.push(
        "import allows you to use modules and libraries."
      );
    }

    if (/^\s*[a-zA-Z_]\w*\s*=/m.test(code)) {
      concepts.push(
        "Variables in Python store values for later use."
      );
    }

    if (/^\s*def\s+\w+\s*\(/m.test(code)) {
      concepts.push(
        "A Python function can accept parameters to work with different inputs."
      );
    }
  }

  setExplanation(
    `Language: ${language}\n` +
    `Non-empty lines: ${lines.length}\n\n` +
    (concepts.length
      ? concepts.map((item) => "• " + item).join("\n")
      : "No supported code patterns were recognized.")
  );
}



async function copyReport() {
  if (!result) {
    alert("Please review your code first.");
    return;
  }

  try {
    await navigator.clipboard.writeText(result);
    alert("Review report copied!");
  } catch {
    alert("Could not copy the report. Please try again.");
  }
}


function downloadReport() {
  if (!result) {
    alert("Please review your code first.");
    return;
  }

  const reportContent = `CodeGuardian AI - Code Review Report

Language: ${language}
Code Quality Score: ${score ?? "Not available"}/100
Issues Found: ${issueCount}

${result}

ORIGINAL SOURCE CODE:
---------------------
${code}

Generated on: ${new Date().toLocaleString()}
`;

  const blob = new Blob([reportContent], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "CodeGuardian-Report.txt";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}



function clearCode() {
  setCode("");
  setResult("");
  setExplanation("");
  setScore(null);
  setIssueCount(0);
}
  return (
    <main className="app">
      <nav className="navbar">
        <div className="brand">🛡 CodeGuardian<span> AI</span></div>
        <span className="status">● Developer workspace</span>
      </nav>

      <header className="hero">
        <p className="eyebrow">YOUR SMART CODE REVIEW WORKSPACE</p>
        <h1>
          Write better code.
          <br />
          <span>Build with confidence.</span>
        </h1>
        <p className="subtitle">
          Detect potential issues, understand your code,
          and discover ways to improve.
        </p>
      </header>

      <section className="workspace">
        <div className="panel">
          <div className="panel-heading">
            <h2>Code Editor</h2>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option>Java</option>
              <option>Python</option>
              <option>JavaScript</option>
              <option>TypeScript</option>
              <option>C++</option>
            </select>
          </div>

          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="// Paste your code here..."
            spellCheck={false}
          />

          
<div className="action-buttons">
  <button onClick={reviewCode} disabled={loading}>
    {loading ? "Reviewing..." : "✦ Review My Code"}
  </button>

  <button
    className="secondary-button"
    onClick={explainCode}
  >
    📖 Explain My Code
  </button>
</div>


        </div>

        <div className="panel results">
  <div className="results-header">
    <div>
      <p className="eyebrow">ANALYSIS SUMMARY</p>
      <h2>Review Results</h2>
    </div>
    <div className="result-icon">✧</div>
  </div>

  {score !== null && (
    <div className="score-card">
      <p>Code Quality Score</p>

      <div className="score-number">{score}/100</div>

      <div className="score-progress">
        <div
          className="score-progress-fill"
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="score-meta">
        <span>Issues Found</span>
        <strong>{issueCount}</strong>
      </div>

      <p className="score-message">
        {score >= 80
          ? "Good progress! Review the suggestions below."
          : score >= 50
          ? "Some improvements may be needed."
          : "Review the potential issues carefully."}
      </p>
    </div>
  )}

  {!result && (
    <div className="empty-state">
      <div className="sparkle">⌘</div>
      <h3>Ready to analyze your code</h3>
      <p>Paste your code and start a review to see your results here.</p>
    </div>
  )}

  {result && (
    <div className="findings-section">
      <h3>Review Report</h3>

      <div className="report-meta">
        {result
          .split("\n")
          .filter(
            (line) =>
              line.startsWith("Language:") ||
              line.startsWith("Code length:") ||
              line.startsWith("Potential issues found:")
          )
          .map((line, index) => (
            <div className="report-meta-item" key={index}>
              {line}
            </div>
          ))}
      </div>

      
<div className="finding-list">
  {result
    .split("\n")
    .map((line, index, lines) => ({ line, index, lines }))
    .filter(({ line }) => line.startsWith("• "))
    .map(({ line, index, lines }) => {
      const suggestion = lines[index + 1]?.startsWith("Suggested fix:")
        ? lines[index + 1]
        : "";

      return (
        <div className="finding-card" key={index}>
          <div className="finding-marker">!</div>
          <p style={{ whiteSpace: "pre-wrap" }}>
            {line.slice(2)}
            {suggestion ? `\n${suggestion}` : ""}
          </p>
        </div>
      );
    })}

  {result.includes("No issues detected") && (
    <div className="finding-card success-card">
      <div className="finding-marker">✓</div>
      <p>
        {result
          .split("\n")
          .find((line) => line.includes("No issues detected"))}
      </p>
    </div>
  )}
</div>


      <details className="full-report">
        <summary>View full report</summary>
        <pre className="result-text">{result}</pre>
      </details>
    </div>
  )}

  {explanation && (
    <div className="explanation">
      <h3>📖 Code Explanation</h3>
      <pre>{explanation}</pre>
    </div>
  )}

<div className="history-section">
  
<div className="history-heading">
  <h3>Recent Reviews</h3>
  <button
    className="secondary-button"
    onClick={() => setReviewHistory([])}
    disabled={reviewHistory.length === 0}
  >
    Clear History
  </button>
</div>

  {reviewHistory.length === 0 ? (
    <p>No review history yet. Review some code to see it here.</p>
  ) : (
    reviewHistory.map((item, index) => (
      <details key={index} className="history-item">
        <summary>Review {index + 1}</summary>
        <pre>{item}</pre>
      </details>
    ))
  )}
</div>

  <div className="result-actions">
    <button
      className="secondary-button"
      onClick={copyReport}
    >
      📋 Copy Report
    </button>

<button
  className="secondary-button"
  onClick={downloadReport}
  disabled={!result}
>
  ⬇️ Download Report
</button>

    <button
      className="secondary-button"
      onClick={clearCode}
    >
      🗑 Clear Code
    </button>
  </div>
</div>
      </section>

      <footer>CodeGuardian AI · Your coding improvement partner</footer>
    </main>
  );
}

export default App;