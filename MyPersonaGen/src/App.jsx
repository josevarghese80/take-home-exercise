import React from "react";
import ChatComponent from "./components/ChatComponent";
import logo from './assets/logo.png';
export default function App() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg p-4 rounded-4">

            <div className="mb-4 d-flex justify-content-center align-items-center gap-3">
              {/* Logo on the left */}
              <img
                src={logo}
                alt="Logo"
                width="60"
                height="60"
              />

              {/* Title + Subtitle as one vertical block */}
              <div className="text-center">
                <div className="d-inline-flex align-items-baseline gap-2 flex-wrap justify-content-center">
                  <h2 className="mb-0"><strong>Persona Assistant</strong></h2>
                  <small className="text-muted">
                    powered by <a href="https://cadime.ai" target="_blank" rel="noopener noreferrer">cadime.ai</a>
                  </small>
                </div>
                {/* <h2 className="mb-1"><strong>Persona Assistant</strong></h2>
                <small className="text-muted">
                  powered by <a href="https://cadime.ai" target="_blank" rel="noopener noreferrer">cadime.ai</a>
                </small> */}
                <p className="text-muted small mb-0">Know your audience. Grow your business.</p>
                {/* <p className="text-muted small mb-0">
                  Visit <a href="https://cadime.ai" target="_blank" rel="noopener noreferrer">https://cadime.ai</a>
                </p> */}
              </div>
            </div>



            <ChatComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
