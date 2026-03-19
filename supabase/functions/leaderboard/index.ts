// @ts-nocheck
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "jsr:@supabase/supabase-js/cors";

interface LeaderboardEntry {
  id: number | null;
  name: string | null;
  score: number | null;
  rank: number | null;
}

const NUM_AROUND = 2;

function insertUser(entries: LeaderboardEntry[], userScore: number): number {
  const user: LeaderboardEntry = { id: null, name: null, score: userScore, rank: null };
  entries.push(user);
  entries.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const index = entries.findIndex((e) => e.name === null);
  const prev = entries[index - 1];
  const inBounds = index > 0 && index <= entries.length;
  entries[index].rank =
    inBounds && prev && prev.score === userScore ? (prev.rank ?? index + 1) : index + 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > index && entries[i].rank != null) {
      entries[i].rank! += 1;
    }
  }
  return index;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const headers = { ...corsHeaders, "Content-Type": "application/json" };

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { name, difficulty, ratio, score, devicetype } = body;
      if (!name || !difficulty || !ratio || score == null || !devicetype) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: name, difficulty, ratio, score, devicetype" }),
          { status: 400, headers }
        );
      }
      const { data, error } = await supabase
        .from("leaderboard_entries")
        .insert({ name, difficulty, ratio, score, devicetype })
        .select("id, name, score, difficulty")
        .single();
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers,
        });
      }
      return new Response(
        JSON.stringify({
          id: data.id,
          name: data.name,
          score: data.score,
          difficulty: data.difficulty,
          message: "Score submitted successfully",
        }),
        { headers }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : "Invalid JSON" }),
        { status: 400, headers }
      );
    }
  }

  // GET
  try {
    const url = new URL(req.url);
    const difficulty = url.searchParams.get("difficulty");
    const topN = Math.min(100, Math.max(1, parseInt(url.searchParams.get("top_n") ?? "5", 10) || 5));
    const userScoreParam = url.searchParams.get("user_score");
    const userScore = userScoreParam != null ? parseFloat(userScoreParam) : null;
    const userIdParam = url.searchParams.get("user_id");
    const userId = userIdParam != null ? parseInt(userIdParam, 10) : null;

    if (!difficulty) {
      return new Response(JSON.stringify({ error: "difficulty is required" }), {
        status: 400,
        headers,
      });
    }

    const { data: rows, error } = await supabase
      .from("leaderboard_entries")
      .select("id, name, score")
      .eq("difficulty", difficulty)
      .order("score", { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers,
      });
    }

    let entries: LeaderboardEntry[] = (rows ?? []).map((r, i) => ({
      id: r.id,
      name: r.name,
      score: r.score,
      rank: i + 1,
    }));

    let userIndex: number;
    if (userId != null) {
      userIndex = entries.findIndex((e) => e.id === userId);
      if (userIndex === -1) userIndex = userScore != null ? insertUser(entries, userScore) : -1;
    } else if (userScore != null) {
      userIndex = insertUser(entries, userScore);
    } else {
      userIndex = -1;
    }

    let response: LeaderboardEntry[] = entries.slice(0, topN);
    if (userIndex >= topN) {
      if (userIndex >= topN + NUM_AROUND) {
        response.push({ id: null, name: null, score: null, rank: null });
      }
      const start = Math.max(0, topN, userIndex - NUM_AROUND);
      const end = Math.min(entries.length, userIndex + NUM_AROUND + 1);
      response.push(...entries.slice(start, end));
    }

    return new Response(JSON.stringify(response), { headers });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers }
    );
  }
});
