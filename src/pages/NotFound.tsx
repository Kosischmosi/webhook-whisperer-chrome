
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Bei Chrome Extension zur Hauptseite zurückleiten nach 2 Sekunden
    if (typeof chrome !== 'undefined' && !!chrome?.runtime?.id) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Seite nicht gefunden</p>
        <button 
          onClick={() => navigate('/')} 
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Zurück zur Hauptseite
        </button>
      </div>
    </div>
  );
};

export default NotFound;
