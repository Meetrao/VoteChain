import React, { useState } from "react";
import Register from "./Register";
import Login from "./Login";

function App() {
  const [page, setPage] = useState("register");

  return (
    <div>
      <div style={{ margin: 20 }}>
        <button onClick={() => setPage("register")}>Register</button>
        <button onClick={() => setPage("login")}>Login</button>
      </div>
      {page === "register" ? <Register /> : <Login />}
    </div>
  );
}

export default App;
