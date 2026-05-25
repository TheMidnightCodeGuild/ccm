import {
  auth,
  signInWithEmailAndPassword,
} from "../../../../lib/firebase";
const cookie = require("cookie");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const sessionCookie = cookie.serialize("session", user.uid, {
      httpOnly: false,
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      path: "/",
    });

    res.setHeader("Set-Cookie", sessionCookie);
    res.status(200).json({ message: "Sign-in successful", userId: user.uid });
  } catch (error) {
    console.error("Sign-in error:", error);
    res.status(401).json({ error: error.message });
  }
}
