import React, { useState, useEffect, useRef } from "react";
import languagesData from "./languages.json"; // Adjust the path as needed
import "./SpeechRecognition.css"; // Import the CSS file
import jsPDF from "jspdf"; // For generating PDFs
import { saveAs } from "file-saver"; // For saving files
import * as docx from "docx"; // For generating DOCX files
const SpeechRecognition = () => {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lang, setLang] = useState("pt-BR");
  const [languages, setLanguages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const recognitionRef = useRef(null);
  useEffect(() => {
    // Initialize the languages from the imported JSON
    setLanguages(languagesData.languages);
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.onresult = (e) => {
        const newTranscript = e.results[0][0].transcript;
        setTranscript((prev) => prev + newTranscript);
      };
      recognition.onend = () => {
        if (isRecognizing) {
          recognition.start();
        }
      };
      recognition.onerror = (e) => {
        alert(`Error occurred: ${e.error}`);
        recognition.stop();
        setIsRecognizing(false);
      };
      recognitionRef.current = recognition;
    } else {
      alert("SpeechRecognition is not supported in this browser.");
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecognizing, lang]);
  const toggleRecognition = () => {
    if (isRecognizing) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsRecognizing(!isRecognizing);
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript);
  };
  const handleLangChange = (e) => {
    setLang(e.target.value);
  };
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(transcript, 10, 10);
    doc.save("transcript.pdf");
  };
  const downloadTXT = () => {
    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "transcript.txt");
  };
  const downloadDOCX = () => {
    const doc = new docx.Document({
      sections: [
        {
          properties: {},
          children: [new docx.Paragraph({ text: transcript })],
        },
      ],
    });
    docx.Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "transcript.docx");
    });
  };
  return (
    <main>
      <section className="container">
        <h1>Web Speech APP Using React JS</h1>
        <h2>
          Allow microphone access, select a language, click the recognition
          button, and speak...
        </h2>
        <select name="lang" id="lang" value={lang} onChange={handleLangChange}>
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name}
            </option>
          ))}
        </select>
        <div className="transcript">
          <div
            className={`button ${isRecognizing ? "active" : ""}`}
            id="toggleRecognition"
            title="Start/Stop Recognition"
            onClick={toggleRecognition}
          >
            <span className="icon">
              <i className="material-symbols-rounded">mic</i>
            </span>
          </div>
          <div className="output">
            {transcript.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
        <div className="btn-wrapper">
          <div
            className="button"
            id="copy"
            title="Copy Content"
            onClick={copyToClipboard}
          >
            <span className="icon">
              <i className="material-symbols-rounded">content_copy</i>
            </span>
          </div>
          <div
            className="button"
            id="download"
            title="Download"
            onClick={() => setShowModal(true)}
          >
            <span className="icon">
              <i className="material-symbols-rounded">download</i>
            </span>
          </div>
        </div>
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <div className="button-wrapper">
                <h3>Download Options</h3>{" "}
                <button onClick={downloadPDF}>Download PDF</button>
                <button onClick={downloadTXT}>Download TXT</button>
                <button onClick={downloadDOCX}>Download DOCX</button>
                <button onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
export default SpeechRecognition;
