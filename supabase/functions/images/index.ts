// @ts-nocheck
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "jsr:@supabase/supabase-js/cors";

const BUCKET = "Images";

function toBase64(bytes: Uint8Array): string {
  const chunkSize = 0x4000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

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

async function fetchAndEncode(
  supabase: ReturnType<typeof createClient>,
  path: string,
  isReal: boolean
): Promise<{ image_id: string; image_data: string; is_real: boolean } | null> {
  const { data: blob, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !blob) {
    console.error(`Failed to download ${path}:`, error);
    return null;
  }
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const base64 = toBase64(bytes);
  const stem = getStem(path);
  return {
    image_id: `${isReal ? "real" : "fake"}_${stem}`,
    image_data: `data:image/jpeg;base64,${base64}`,
    is_real: isReal,
  };
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
    const countReal = Math.min(50, Math.max(0, parseInt(url.searchParams.get("count_real") ?? "0", 10) || 0));
    const countFake = Math.min(50, Math.max(0, parseInt(url.searchParams.get("count_fake") ?? "0", 10) || 0));
    const count = Math.min(100, Math.max(1, parseInt(url.searchParams.get("count") ?? "8", 10) || 8));
    const realParam = url.searchParams.get("real");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const toFetch: { path: string; isReal: boolean }[] = [];

    if (countReal > 0 || countFake > 0) {
      const [realFiles, fakeFiles] = await Promise.all([
        supabase.storage.from(BUCKET).list("real", { limit: 1000 }),
        supabase.storage.from(BUCKET).list("fake", { limit: 1000 }),
      ]);

      const realPaths = (realFiles.data ?? [])
        .filter((f) => f.name && !f.name.startsWith(".") && isImageFile(f.name))
        .map((f) => `real/${f.name}`);
      const fakePaths = (fakeFiles.data ?? [])
        .filter((f) => f.name && !f.name.startsWith(".") && isImageFile(f.name))
        .map((f) => `fake/${f.name}`);

      if (countReal > 0 && realPaths.length < countReal) {
        return new Response(JSON.stringify({ error: `Not enough real images. Found ${realPaths.length}, requested ${countReal}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (countFake > 0 && fakePaths.length < countFake) {
        return new Response(JSON.stringify({ error: `Not enough fake images. Found ${fakePaths.length}, requested ${countFake}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      toFetch.push(...shuffle(realPaths).slice(0, countReal).map((p) => ({ path: p, isReal: true })));
      toFetch.push(...shuffle(fakePaths).slice(0, countFake).map((p) => ({ path: p, isReal: false })));
    } else {
      const real = realParam !== "false";
      const folder = real ? "real" : "fake";
      const { data: files, error: listError } = await supabase.storage.from(BUCKET).list(folder, { limit: 1000 });
      if (listError) {
        return new Response(JSON.stringify({ error: `Failed to list images: ${listError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const imagePaths = (files ?? [])
        .filter((f) => f.name && !f.name.startsWith(".") && isImageFile(f.name))
        .map((f) => `${folder}/${f.name}`);
      if (imagePaths.length < count) {
        return new Response(JSON.stringify({ error: `Not enough images. Found ${imagePaths.length}, requested ${count}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      toFetch.push(...shuffle(imagePaths).slice(0, count).map((p) => ({ path: p, isReal: real })));
    }

    const results = (await Promise.all(
      toFetch.map(({ path, isReal }) => fetchAndEncode(supabase, path, isReal))
    )).filter((r): r is NonNullable<typeof r> => r !== null);

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
