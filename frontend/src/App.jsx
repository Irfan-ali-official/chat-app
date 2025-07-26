import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import Chat from "./Pages/Chat";
import SignIn from "./components/Signin";
import SignUp from "./components/Singup";

function App() {
  const [user] = useAuthState(auth);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (authFunction, credentials) => {
    try {
      setError("");
      const userCredential = await authFunction(
        auth,
        credentials.email,
        credentials.password
      );

      // Update profile with display name after signup
      if (authFunction === createUserWithEmailAndPassword) {
        await updateProfile(userCredential.user, {
          displayName: credentials.name,
        });
      }

      return userCredential;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  if (user) {
    return <Chat user={user} onSignOut={() => signOut(auth)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {isSignUp ? (
        <SignUp
          onSwitchToSignIn={() => setIsSignUp(false)}
          onSignUp={(credentials) =>
            handleAuth(createUserWithEmailAndPassword, credentials)
          }
          error={error}
        />
      ) : (
        <SignIn
          onSwitchToSignUp={() => setIsSignUp(true)}
          onSignIn={(credentials) =>
            handleAuth(signInWithEmailAndPassword, credentials)
          }
          error={error}
        />
      )}
    </div>
  );
}

export default App;
