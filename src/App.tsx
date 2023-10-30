import "./App.css";

import firebase from "firebase/app";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import {
  collection,
  query,
  orderBy,
  limit,
  getFirestore,
} from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { FormEvent, useState, useRef } from "react";
import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

//initialize firebase
const app = initializeApp({
  apiKey: "AIzaSyDmgTwJybxuBptV2ElwWX46lkCvVv2TdgM",
  authDomain: "apix-chat-app.firebaseapp.com",
  projectId: "apix-chat-app",
  storageBucket: "apix-chat-app.appspot.com",
  messagingSenderId: "274699928184",
  appId: "1:274699928184:web:38086d34e9e9fa3bb2a38d",
  measurementId: "G-65F5RGJL9S",
});

const auth = getAuth();
const db = getFirestore(app);
// const currentUser = auth.currentUser

function App() {
  const [user] = useAuthState(auth);

  return (
    <>
      <div className="App">
        <header>
          <h1>Title</h1>
          <SignOut />
        </header>
        <section>{user ? <ChatRoom /> : <SignIn />}</section>
      </div>
    </>
  );
}

type User = {
  uid: String;
  photoURL: String;
};

function ChatRoom() {
  const dummy = useRef<HTMLDivElement | null>(null);

  const messagesRef = collection(db, "messages");
  const q = query(messagesRef, orderBy("createdAt"), limit(25));
  // didn't use {idField: 'id'} since it does't work rn
  const [messages] = useCollectionData(q);

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e: FormEvent) => {
    //prevent from refreshing the page
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser as User;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">submit</button>
      </form>
    </>
  );
}

function ChatMessage(props: any) {
  const { text, uid, photoURL } = props.message;
  // POSSIBLY BROKEN
  const messageClass = uid === auth.currentUser?.uid ? "sent" : "recieved";
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL}></img>
      <p>{text}</p>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    // firebase.auth().signInWithPopup(provider);
    signInWithPopup(auth, provider);
  };
  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

export default App;
