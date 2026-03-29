require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get("/", (req, res) => {
  res.send("CuidarBem API is running");
});

// Proxy for updating carers to bypass missing UPDATE RLS policy
app.patch("/api/carers/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  // Validate user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user || user.id !== req.params.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Use service role to update
  const { data, error } = await supabase
    .from("carers")
    .update(req.body)
    .eq("id", req.params.id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
