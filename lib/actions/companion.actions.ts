"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";

export const createCompanion = async (formData: CreateCompanion) => {
  const { userId: author } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .insert({
      ...formData,
      author,
    })
    .select();

  if (error || !data)
    throw new Error(error?.message || "Failed to create a companion");

  return data[0];
};

export const getAllCompanions = async ({
  limit = 10,
  page = 1,
  subject,
  topic,
}: GetAllCompanions) => {
  const { userId } = await auth();
  const supabase = createSupabaseClient();

  let query = supabase.from("companions").select();

  if (subject && topic) {
    query = query
      .ilike("subject", `%${subject}%`)
      .or(`topic.ilike.%${topic}%, name.ilike.%${topic}%`);
  } else if (subject) {
    query = query.ilike("subject", `%${subject}%`);
  } else if (topic) {
    query = query.or(`topic.ilike.%${topic}%, name.ilike.%${topic}%`);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data: companions, error } = await query;

  if (error) throw new Error(error.message);

  if (userId && companions) {
    const companionIds = companions.map((companion) => companion.id);

    const { data: bookmarks, error: bookmarkError } = await supabase
      .from("bookmarks")
      .select("companion_id")
      .eq("user_id", userId)
      .in("companion_id", companionIds);

    if (!bookmarkError && bookmarks) {
      const bookmarkedIds = new Set(
        bookmarks.map((bookmark) => bookmark.companion_id)
      );

      return companions.map((companion) => ({
        ...companion,
        bookmarked: bookmarkedIds.has(companion.id),
      }));
    }
  }

  return (
    companions?.map((companion) => ({
      ...companion,
      bookmarked: false,
    })) || []
  );
};

export const getCompanion = async (id: string) => {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("id", id);

  if (error) return console.log(error);

  return data[0];
};

export const addToSessionHistory = async (companionId: string) => {
  const { userId } = await auth();

  if (!userId || !companionId) {
    throw new Error("User ID and Companion ID are required");
  }

  const supabase = createSupabaseClient();

  const { data: companion, error: companionError } = await supabase
    .from("companions")
    .select("id")
    .eq("id", companionId)
    .single();

  if (companionError || !companion) {
    throw new Error(`Companion with ID ${companionId} not found`);
  }

  const { data, error } = await supabase.from("session_history").insert({
    companion_id: companionId,
    user_id: userId,
  });

  if (error) throw new Error(error.message);

  return data;
};

export const getRecentSessions = async (limit = 10) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("session_history")
    .select(`companions:companion_id (*)`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return data.map(({ companions }) => companions);
};

export const getUserSessions = async (userId: string, limit = 10) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("session_history")
    .select(`companions:companion_id (*)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return data.map(({ companions }) => companions);
};

export const getUserCompanions = async (userId: string) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("author", userId);

  if (error) throw new Error(error.message);

  return data;
};

export const newCompanionPermissions = async () => {
  const { userId, has } = await auth();
  const supabase = createSupabaseClient();

  let limit = 0;

  if (has({ plan: "pro" })) {
    return true;
  } else if (has({ feature: "3_companion_limit" })) {
    limit = 3;
  } else if (has({ feature: "10_companion_limit" })) {
    limit = 10;
  }

  const { data, error } = await supabase
    .from("companions")
    .select("id", { count: "exact" })
    .eq("author", userId!);

  if (error) throw new Error(error.message);

  const companionCount = data?.length;

  if (companionCount >= limit) {
    return false;
  } else {
    return true;
  }
};

export const addBookmark = async (companionId: string) => {
  const { userId } = await auth();

  if (!userId || !companionId) {
    throw new Error("User ID and Companion ID are required");
  }

  const supabase = createSupabaseClient();

  const { data: companion, error: companionError } = await supabase
    .from("companions")
    .select("id")
    .eq("id", companionId)
    .single();

  if (companionError || !companion) {
    throw new Error(`Companion with ID ${companionId} not found`);
  }

  const { data: existingBookmark, error: checkError } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("companion_id", companionId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    throw new Error(checkError.message);
  }

  if (existingBookmark) {
    throw new Error("Companion is already bookmarked");
  }

  const { data, error } = await supabase.from("bookmarks").insert({
    companion_id: companionId,
    user_id: userId,
  });

  if (error) throw new Error(error.message);

  return data;
};

export const removeBookmark = async (companionId: string) => {
  const { userId } = await auth();

  if (!userId || !companionId) {
    throw new Error("User ID and Companion ID are required");
  }

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("companion_id", companionId);

  if (error) throw new Error(error.message);

  return data;
};

export const getUserBookmarks = async (userId: string, limit = 10) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`companions:companion_id (*)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return data.map(({ companions }) => companions);
};
