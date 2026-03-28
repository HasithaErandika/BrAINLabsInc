// AuthCallback is no longer needed — OAuth flow was removed.
// This component exists only to redirect any stray /auth/callback visits to the login page.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/login", { replace: true });
  }, [navigate]);
  return null;
}
