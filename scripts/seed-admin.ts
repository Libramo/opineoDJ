import { auth } from "../lib/auth";
import { db } from "../db";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";

const USERS = [
  {
    name: "Admin BlyAnalytics",
    email: "admin@blyanalytics.com",
    password: "changeme123",
  },
  // Add more users here as needed:
  {
    name: "Bilan Yonis",
    email: "bilan.barwako@gmail.com",
    password: "secret123",
  },
];

async function seedAdmin() {
  for (const u of USERS) {
    const [existing] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, u.email));

    if (existing) {
      console.log("— Déjà existant :", u.email);
      continue;
    }

    const result = await auth.api.signUpEmail({ body: u });

    if (result.user) {
      console.log("✓ Créé :", result.user.email);
    } else {
      console.error("✗ Erreur pour :", u.email);
    }
  }
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
