"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";

// Default companions for unauthenticated users
const DEFAULT_COMPANIONS = [
  {
    id: "default-1",
    name: "AlgebraBot Pro",
    topic: "Algebra Fundamentals",
    subject: "maths",
    duration: 8,
    description:
      "Master the basics of algebra with interactive problem-solving sessions.",
    personality:
      "Patient and encouraging, breaks down complex problems into simple steps.",
    created_at: new Date().toISOString(),
    author: "system",
    bookmarked: false,
  },
  {
    id: "default-2",
    name: "Cell Explorer AI",
    topic: "Cell Biology",
    subject: "science",
    duration: 12,
    description: "Explore the fascinating world of cells and their functions.",
    personality:
      "Enthusiastic and detail-oriented, uses real-world examples to explain concepts.",
    created_at: new Date().toISOString(),
    author: "system",
    bookmarked: false,
  },
  {
    id: "default-3",
    name: "History Master",
    topic: "World War II",
    subject: "history",
    duration: 15,
    description:
      "Understand the causes, events, and consequences of World War II.",
    personality: "Engaging storyteller who brings historical events to life.",
    created_at: new Date().toISOString(),
    author: "system",
    bookmarked: false,
  },
  {
    id: "default-4",
    name: "WordCraft Mentor",
    topic: "Creative Writing",
    subject: "language",
    duration: 10,
    description:
      "Develop your writing skills through creative exercises and feedback.",
    personality: "Inspiring and supportive, encourages creative expression.",
    created_at: new Date().toISOString(),
    author: "system",
    bookmarked: false,
  },
  {
    id: "default-5",
    name: "CodeGenius AI",
    topic: "Programming Basics",
    subject: "coding",
    duration: 20,
    description:
      "Learn the fundamentals of programming with hands-on practice.",
    personality: "Logical and systematic, builds understanding step by step.",
    created_at: new Date().toISOString(),
    author: "system",
    bookmarked: false,
  },
  {
    id: "default-6",
    name: "EconoWiz",
    topic: "Microeconomics",
    subject: "economics",
    duration: 14,
    description:
      "Understand how individuals and businesses make economic decisions.",
    personality:
      "Analytical and practical, connects theory to real-world applications.",
    created_at: new Date().toISOString(),
    author: "system",
    bookmarked: false,
  },
  {
    id: "default-7",
    name: "Physics Quantum",
    topic: "Physics Laws",
    subject: "science",
    duration: 18,
    description: "Explore the fundamental laws that govern our universe.",
    personality:
      "Curious and experimental, loves demonstrating concepts through examples.",
    created_at: new Date().toISOString(),
    author: "system",
    bookmarked: false,
  },
  {
    id: "default-8",
    name: "LinguaChat Bot",
    topic: "Spanish Conversation",
    subject: "language",
    duration: 6,
    description:
      "Practice Spanish conversation skills in a comfortable environment.",
    personality:
      "Friendly and patient, creates a supportive learning atmosphere.",
    created_at: new Date().toISOString(),
    author: "system",
    bookmarked: false,
  },
  {
    id: "default-9",
    name: "Calculus Wizard",
    topic: "Calculus Concepts",
    subject: "maths",
    duration: 25,
    description:
      "Master calculus concepts with guided practice and clear explanations.",
    personality:
      "Methodical and encouraging, helps students overcome math anxiety.",
    created_at: new Date().toISOString(),
    author: "system",
    bookmarked: false,
  },
];

export const createCompanion = async (formData: CreateCompanion) => {
  const { userId: author } = await auth();

  // CHECK SUBSCRIPTION LIMITS FIRST
  const canCreateCompanion = await newCompanionPermissions();
  if (!canCreateCompanion) {
    throw new Error(
      "You have reached your companion creation limit for your current subscription plan."
    );
  }

  const supabase = createSupabaseClient();

  // Check current companion count for this user
  const { data: existingCompanions, error: countError } = await supabase
    .from("companions")
    .select("id, created_at")
    .eq("author", author)
    .order("created_at", { ascending: true }); // Oldest first

  if (countError) throw new Error(countError.message);

  // If user has 9 or more companions, delete the oldest one
  if (existingCompanions && existingCompanions.length >= 9) {
    const oldestCompanion = existingCompanions[0];
    const { error: deleteError } = await supabase
      .from("companions")
      .delete()
      .eq("id", oldestCompanion.id);

    if (deleteError) throw new Error(deleteError.message);
  }

  // Create the new companion
  const { data, error } = await supabase
    .from("companions")
    .insert({
      ...formData,
      author,
    })
    .select();

  if (error || !data)
    throw new Error(error?.message || "Failed to create a companion");

  // 🆕 INCREMENT LIFETIME STATS - Track total companions created
  try {
    await incrementCompanionCount(author!);
  } catch (statsError) {
    console.error("⚠️ Failed to update lifetime stats:", statsError);
    // Don't fail the companion creation if stats update fails
  }

  return data[0];
};

export const getPopularCompanions = async (limit = 3) => {
  const { userId } = await auth();

  // If user is not authenticated, return specific popular companions
  if (!userId) {
    const popularCompanions = [
      DEFAULT_COMPANIONS[8], // Calculus Wizard
      DEFAULT_COMPANIONS[4], // CodeGenius AI
      DEFAULT_COMPANIONS[6], // Physics Quantum
    ];
    return popularCompanions.slice(0, limit);
  }

  // For authenticated users, get their most recent companions
  const supabase = createSupabaseClient();
  const { data: companions, error } = await supabase
    .from("companions")
    .select()
    .eq("author", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  if (companions) {
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

export const getAllCompanions = async ({
  limit = 10,
  page = 1,
  subject,
  topic,
}: GetAllCompanions) => {
  const { userId } = await auth();

  // If user is not authenticated, return default companions
  if (!userId) {
    let filteredCompanions = DEFAULT_COMPANIONS;

    // Convert subject and topic to strings for comparison
    const subjectStr = Array.isArray(subject) ? subject[0] : subject;
    const topicStr = Array.isArray(topic) ? topic[0] : topic;

    // Apply filters if provided
    if (subjectStr && topicStr) {
      filteredCompanions = filteredCompanions.filter(
        (companion) =>
          companion.subject.toLowerCase().includes(subjectStr.toLowerCase()) &&
          (companion.topic.toLowerCase().includes(topicStr.toLowerCase()) ||
            companion.name.toLowerCase().includes(topicStr.toLowerCase()))
      );
    } else if (subjectStr) {
      filteredCompanions = filteredCompanions.filter((companion) =>
        companion.subject.toLowerCase().includes(subjectStr.toLowerCase())
      );
    } else if (topicStr) {
      filteredCompanions = filteredCompanions.filter(
        (companion) =>
          companion.topic.toLowerCase().includes(topicStr.toLowerCase()) ||
          companion.name.toLowerCase().includes(topicStr.toLowerCase())
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return filteredCompanions.slice(startIndex, endIndex);
  }

  // For authenticated users, get their own companions
  const supabase = createSupabaseClient();
  let query = supabase.from("companions").select().eq("author", userId);

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

  if (companions) {
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

  // Check current session count BEFORE adding new one
  const { data: existingSessions, error: countError } = await supabase
    .from("session_history")
    .select("id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true }); // Oldest first

  if (countError) throw new Error(countError.message);

  // If we already have 10 sessions, delete the oldest ONE to make room for the new one
  if (existingSessions && existingSessions.length >= 10) {
    const oldestSession = existingSessions[0];

    const { error: deleteError } = await supabase
      .from("session_history")
      .delete()
      .eq("id", oldestSession.id);

    if (deleteError) throw new Error(deleteError.message);
  }

  // Now add the new session
  const { data, error } = await supabase.from("session_history").insert({
    companion_id: companionId,
    user_id: userId,
  });

  if (error) throw new Error(error.message);

  // INCREMENT LIFETIME STATS - Track total sessions completed
  try {
    await incrementSessionCount(userId);
  } catch (statsError) {
    console.error("⚠️ Failed to update session lifetime stats:", statsError);
    // Don't fail the session creation if stats update fails
  }

  // 🆕 INCREMENT MONTHLY CONVERSATIONS - Track monthly usage for Basic plan limits
  try {
    await incrementMonthlyConversations(userId);
  } catch (monthlyError) {
    console.error(
      "⚠️ Failed to update monthly conversation count:",
      monthlyError
    );
    // Don't fail the session creation if monthly tracking fails
  }

  return data;
};

export const getRecentSessions = async (limit = 10) => {
  const { userId } = await auth();

  // If user is not authenticated, return empty array
  if (!userId) {
    return [];
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("session_history")
    .select(`companions:companion_id (*)`)
    .eq("user_id", userId) // Only get sessions for the authenticated user
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

  let limit = 3; // Default to Basic plan (3 companions)

  if (has({ plan: "pro" })) {
    return true; // Unlimited for Pro plan
  } else if (has({ feature: "10_companion_limit" })) {
    limit = 10; // Core plan
  } else if (has({ feature: "3_companion_limit" })) {
    limit = 3; // Basic plan (explicit)
  }
  // If no features match, default to Basic plan (3 companions)

  // Get lifetime stats instead of counting current companions
  const lifetimeStats = await getUserLifetimeStats(userId!);
  const totalCompanionsCreated = lifetimeStats.totalCompanionsCreated;

  console.log(
    `🔍 Permission Check: User has created ${totalCompanionsCreated}/${limit} companions`
  );

  if (totalCompanionsCreated >= limit) {
    return false; // Limit reached
  } else {
    return true; // Can create more companions
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

// NEW: Lifetime tracking functions
export const getUserLifetimeStats = async (userId: string) => {
  const supabase = createSupabaseClient();

  try {
    // First, try to get from user_lifetime_stats table
    const { data: lifetimeData, error: lifetimeError } = await supabase
      .from("user_lifetime_stats")
      .select("total_companions_created, total_sessions_completed")
      .eq("user_id", userId)
      .single();

    if (lifetimeError && lifetimeError.code !== "PGRST116") {
      console.error("Error fetching lifetime stats:", lifetimeError);
      throw new Error(lifetimeError.message);
    }

    // If no record exists, initialize it with current counts
    if (!lifetimeData) {
      await initializeUserLifetimeStats(userId);

      // Try again after initialization
      const { data: newLifetimeData, error: newError } = await supabase
        .from("user_lifetime_stats")
        .select("total_companions_created, total_sessions_completed")
        .eq("user_id", userId)
        .single();

      if (newError) {
        console.error("Error after initialization:", newError);
        return { totalCompanionsCreated: 0, totalSessionsCompleted: 0 };
      }

      return {
        totalCompanionsCreated: newLifetimeData.total_companions_created || 0,
        totalSessionsCompleted: newLifetimeData.total_sessions_completed || 0,
      };
    }

    return {
      totalCompanionsCreated: lifetimeData.total_companions_created || 0,
      totalSessionsCompleted: lifetimeData.total_sessions_completed || 0,
    };
  } catch (error) {
    console.error("Error in getUserLifetimeStats:", error);
    // Return fallback values
    return {
      totalCompanionsCreated: 0,
      totalSessionsCompleted: 0,
    };
  }
};

// Initialize lifetime stats for a user with current counts
export const initializeUserLifetimeStats = async (userId: string) => {
  const supabase = createSupabaseClient();

  try {
    // Count current companions
    const { count: companionsCount, error: companionsError } = await supabase
      .from("companions")
      .select("*", { count: "exact", head: true })
      .eq("author", userId);

    if (companionsError) throw new Error(companionsError.message);

    // Count current sessions
    const { count: sessionsCount, error: sessionsError } = await supabase
      .from("session_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (sessionsError) throw new Error(sessionsError.message);

    // Insert initial record
    const { error: insertError } = await supabase
      .from("user_lifetime_stats")
      .insert({
        user_id: userId,
        total_companions_created: companionsCount || 0,
        total_sessions_completed: sessionsCount || 0,
      });

    if (insertError) {
      console.error("Error initializing lifetime stats:", insertError);
      throw new Error(insertError.message);
    }
  } catch (error) {
    console.error("Error in initializeUserLifetimeStats:", error);
    throw error;
  }
};

// Increment companion count in lifetime stats
export const incrementCompanionCount = async (userId: string) => {
  const supabase = createSupabaseClient();

  try {
    const { error } = await supabase.rpc("increment_companion_count", {
      user_id_param: userId,
    });

    if (error) {
      console.error("Error incrementing companion count:", error);
      // Fallback: manual update
      const { error: updateError } = await supabase
        .from("user_lifetime_stats")
        .update({
          total_companions_created: supabase.rpc(
            "increment_companion_count_fallback",
            { user_id_param: userId }
          ),
        })
        .eq("user_id", userId);

      if (updateError) throw new Error(updateError.message);
    }
  } catch (error) {
    console.error("Error in incrementCompanionCount:", error);
  }
};

// Increment session count in lifetime stats
export const incrementSessionCount = async (userId: string) => {
  const supabase = createSupabaseClient();

  try {
    const { error } = await supabase.rpc("increment_session_count", {
      user_id_param: userId,
    });

    if (error) {
      console.error("Error incrementing session count:", error);
      // Fallback: manual update with current value + 1
      const { data: current, error: fetchError } = await supabase
        .from("user_lifetime_stats")
        .select("total_sessions_completed")
        .eq("user_id", userId)
        .single();

      if (!fetchError && current) {
        const { error: updateError } = await supabase
          .from("user_lifetime_stats")
          .update({
            total_sessions_completed:
              (current.total_sessions_completed || 0) + 1,
          })
          .eq("user_id", userId);

        if (updateError) throw new Error(updateError.message);
      }
    }
  } catch (error) {
    console.error("Error in incrementSessionCount:", error);
  }
};

export const getTotalCompanionsCreated = async (userId: string) => {
  const supabase = createSupabaseClient();

  const { count, error } = await supabase
    .from("companions")
    .select("*", { count: "exact", head: true })
    .eq("author", userId);

  if (error) throw new Error(error.message);

  return count || 0;
};

export const getTotalSessionsCompleted = async (userId: string) => {
  const supabase = createSupabaseClient();

  const { count, error } = await supabase
    .from("session_history")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  return count || 0;
};

// Monthly conversation limit functions
export const checkMonthlyConversationLimit = async (
  userId: string
): Promise<boolean> => {
  const { has } = await auth();
  const supabase = createSupabaseClient();

  // Check if user has unlimited conversations (Core/Pro plans)
  if (has({ feature: "10_companion_limit" }) || has({ plan: "pro" })) {
    return true;
  }

  // For Basic plan users, check monthly limit (10 conversations/month)
  const limit = 10;

  try {
    // Check and reset monthly count if needed, then get current count
    const { data, error } = await supabase.rpc(
      "check_and_reset_monthly_conversations",
      {
        user_id_param: userId,
      }
    );

    if (error) {
      console.error("Error checking monthly conversations:", error);
      return false;
    }

    const currentCount = data || 0;
    return currentCount < limit;
  } catch (error) {
    console.error("Error in checkMonthlyConversationLimit:", error);
    return false;
  }
};

export const getMonthlyConversationCount = async (
  userId: string
): Promise<number> => {
  const supabase = createSupabaseClient();

  try {
    const { data, error } = await supabase.rpc(
      "check_and_reset_monthly_conversations",
      {
        user_id_param: userId,
      }
    );

    if (error) {
      console.error("Error getting monthly conversation count:", error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error("Error in getMonthlyConversationCount:", error);
    return 0;
  }
};

export const incrementMonthlyConversations = async (
  userId: string
): Promise<void> => {
  const supabase = createSupabaseClient();

  try {
    const { error } = await supabase.rpc("increment_monthly_conversations", {
      user_id_param: userId,
    });

    if (error) {
      console.error("Error incrementing monthly conversations:", error);
    }
  } catch (error) {
    console.error("Error in incrementMonthlyConversations:", error);
  }
};
