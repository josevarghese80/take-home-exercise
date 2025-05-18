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
                <h2 className="mb-1"><strong>Persona Assistant</strong></h2>
                <p className="text-muted small mb-0">Know your audience. Grow your business.</p>
              </div>
            </div>



            <ChatComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
