import {
  auth,
  db,
  createUserWithEmailAndPassword,
} from "../../../../lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
const cookie = require("cookie");

async function existsInCustomers(field, value) {
  const customersRef = collection(db, "customers");
  const q = query(customersRef, where(field, "==", value));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, name, mobile } = req.body;

  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  const trimmedName = typeof name === "string" ? name.trim() : "";
  const mobileDigits =
    typeof mobile === "string"
      ? mobile.replace(/\D/g, "")
      : String(mobile ?? "").replace(/\D/g, "");

  if (!trimmedEmail || !password || !trimmedName || !mobileDigits) {
    return res.status(400).json({
      error:
        "Missing required fields: email, password, name, and mobile are required",
    });
  }

  if (mobileDigits.length !== 10) {
    return res.status(400).json({ error: "Mobile must be a valid 10-digit number" });
  }

  try {
    if (await existsInCustomers("mobile", mobileDigits)) {
      return res.status(409).json({ error: "This mobile number is already registered" });
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      trimmedEmail,
      password
    );
    const user = userCredential.user;

    await setDoc(doc(db, "customers", user.uid), {
      userId: user.uid,
      email: user.email,
      name: trimmedName,
      mobile: mobileDigits,
      cases: [],
      createdAt: new Date().toISOString(),
    });

    const sessionCookie = cookie.serialize("session", user.uid, {
      httpOnly: false,
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      path: "/",
    });

    res.setHeader("Set-Cookie", sessionCookie);
    res.status(200).json({ message: "Sign-up successful", userId: user.uid });
  } catch (error) {
    console.error("Sign-up error:", error);
    res.status(400).json({ error: error.message });
  }
}
