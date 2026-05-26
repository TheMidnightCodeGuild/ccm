import {
  auth,
  db,
  signInWithEmailAndPassword,
  updatePassword,
} from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

function mapAuthError(error) {
  const code = error?.code || "";
  if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return "Invalid current password.";
  }
  if (code === "auth/weak-password") {
    return "New password is too weak. Use at least 6 characters.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please try again later.";
  }
  return "Failed to update password. Please try again.";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = req.cookies?.session;
  if (!userId) {
    return res.status(401).json({ error: "Not signed in." });
  }

  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: "Current password and new password are required.",
    });
  }

  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return res.status(400).json({
      error: "New password must be at least 6 characters.",
    });
  }

  if (newPassword === currentPassword) {
    return res.status(400).json({
      error: "New password must be different from your current password.",
    });
  }

  try {
    const customerSnap = await getDoc(doc(db, "customers", userId));
    if (!customerSnap.exists()) {
      return res.status(404).json({ error: "Customer profile not found." });
    }

    const email = customerSnap.data()?.email;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Account email not found." });
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      currentPassword
    );

    await updatePassword(userCredential.user, newPassword);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    const status =
      error?.code === "auth/wrong-password" ||
      error?.code === "auth/invalid-credential"
        ? 401
        : 400;
    return res.status(status).json({ error: mapAuthError(error) });
  }
}
