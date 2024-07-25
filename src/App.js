import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Image from './component/Image';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<Image />} />
        </Routes>
    </Router>
  );
}

export default App;
