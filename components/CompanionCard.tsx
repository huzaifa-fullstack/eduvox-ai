"use client";

import Link from "next/link";
import Image from "next/image";
import { addBookmark, removeBookmark } from "@/lib/actions/companion.actions";
import { useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import Toast from "@/components/ui/toast";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  bookmarked?: boolean;
}

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  bookmarked = false,
}: CompanionCardProps) => {
  const { isSignedIn } = useUser();
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleBookmarkToggle = () => {
    if (!isSignedIn) {
      return;
    }

    const previousState = isBookmarked;
    setIsBookmarked(!isBookmarked);

    startTransition(async () => {
      try {
        if (previousState) {
          await removeBookmark(id);
          setToast({ message: "Bookmark removed!", type: "success" });
        } else {
          await addBookmark(id);
          setToast({ message: "Bookmark added!", type: "success" });
        }
      } catch (error) {
        console.error("Error toggling bookmark:", error);
        setIsBookmarked(previousState);
        setToast({
          message:
            error instanceof Error
              ? error.message
              : "Failed to update bookmark",
          type: "error",
        });
      }
    });
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <article className="companion-card" style={{ backgroundColor: color }}>
        <div className="flex justify-between items-center">
          <div className="subject-badge">{subject}</div>
          <button
            className={`companion-bookmark ${
              !isSignedIn ? "cursor-default" : ""
            }`}
            onClick={handleBookmarkToggle}
            disabled={isPending || !isSignedIn}
            title={
              !isSignedIn
                ? "Sign in to bookmark companions"
                : isBookmarked
                ? "Remove bookmark"
                : "Add bookmark"
            }
          >
            <Image
              src={
                isSignedIn && isBookmarked
                  ? "/icons/bookmark-filled.svg"
                  : "/icons/bookmark.svg"
              }
              alt="Bookmark"
              width={12.5}
              height={15}
            />
          </button>
        </div>

        <div className="flex-grow flex flex-col gap-3">
          <h2 className="text-2xl font-bold line-clamp-2 min-h-[3rem]">
            {name}
          </h2>
          <p className="text-sm line-clamp-2 min-h-[2.5rem]">{topic}</p>
          <div className="flex items-center gap-2 mt-auto">
            <Image
              src="/icons/clock.svg"
              alt="Duration"
              width={13.5}
              height={13.5}
            />
            <p className="text-sm">{duration} minutes</p>
          </div>
        </div>

        <Link href={`/companions/${id}`} className="w-full">
          <button className="btn-primary w-full justify-center">
            Launch Lesson
          </button>
        </Link>
      </article>
    </>
  );
};

export default CompanionCard;
