// @ts-nocheck
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "jsr:@supabase/supabase-js/cors";

const BUCKET = "Images";
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

function isImageFile(name: string): boolean {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

function getStem(path: string): string {
  const name = path.split("/").pop() ?? path;
  return name.slice(0, name.lastIndexOf(".")) || name;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const count = Math.min(100, Math.max(1, parseInt(url.searchParams.get("count") ?? "8", 10) || 8));
    const real = url.searchParams.get("real") !== "false";

    const folder = real ? "real" : "fake";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET)
      .list(folder, { limit: 1000 });

    if (listError) {
      return new Response(
        JSON.stringify({ error: `Failed to list images: ${listError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imagePaths = (files ?? [])
      .filter((f) => f.name && !f.name.startsWith(".") && isImageFile(f.name))
      .map((f) => `${folder}/${f.name}`);

    if (imagePaths.length < count) {
      return new Response(
        JSON.stringify({
          error: `Not enough images. Found ${imagePaths.length}, requested ${count}`,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const selected = shuffle(imagePaths).slice(0, count);
    const results: { image_id: string; image_data: string; is_real: boolean }[] = [];

    for (const path of selected) {
      const { data: blob, error: downloadError } = await supabase.storage
        .from(BUCKET)
        .download(path);

      if (downloadError || !blob) {
        console.error(`Failed to download ${path}:`, downloadError);
        continue;
      }

      const bytes = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
      const stem = getStem(path);
      results.push({
        image_id: `${real ? "real" : "fake"}_${stem}`,
        image_data: `data:image/jpeg;base64,${base64}`,
        is_real: real,
      });
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
