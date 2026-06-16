import { auth } from "../lib/auth";

async function seedAdmin() {
  const result = await auth.api.signUpEmail({
    body: {
      name: "Admin BlyAnalytics",
      email: "admin@blyanalytics.com",
      password: "changeme123",
    },
  });

  if (result.user) {
    console.log("✓ Compte créé :", result.user.email);
  } else {
    console.error("Erreur lors de la création du compte");
  }
}

seedAdmin().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
