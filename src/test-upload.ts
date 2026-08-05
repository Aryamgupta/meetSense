import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  console.log("Starting upload test...");
  const { data, error } = await supabase.storage.from("user-exports").upload("test.txt", "hello world", { upsert: true });
  console.log("Upload result:", data, error);
  
  if (data) {
    const { data: urlData } = supabase.storage.from("user-exports").getPublicUrl("test.txt");
    console.log("Public URL:", urlData.publicUrl);
    
    // Fetch it to see if it works
    const res = await fetch(urlData.publicUrl);
    console.log("Fetch status:", res.status);
    console.log("Fetch text:", await res.text());
  }
}

run();
