import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { getSubjectColor } from "@/lib/utils";

interface CompanionsListProps {
  title: string;
  companions?: Companion[];
  classNames?: string;
  keyPrefix?: string;
  emptyStateType?: "sessions" | "bookmarks" | "companions" | "journey-sessions";
}

const CompanionsList = ({
  title,
  companions,
  classNames,
  keyPrefix = "companion",
  emptyStateType = "sessions",
}: CompanionsListProps) => {
  const getEmptyState = () => {
    switch (emptyStateType) {
      case "bookmarks":
        return {
          icon: "/icons/bookmark.svg",
          title: "No bookmarked companions yet",
          description:
            "Save your favorite companions for quick access by clicking the bookmark icon.",
          buttonText: "Browse Companions",
          buttonHref: "/companions",
        };
      case "companions":
        return {
          icon: "/icons/plus.svg",
          title: "No companions created yet",
          description:
            "Create your first AI companion to start personalized learning sessions.",
          buttonText: "Create Companion",
          buttonHref: "/companions/new",
        };
      case "journey-sessions":
        return {
          icon: "",
          title: "No sessions completed yet",
          description:
            "Start your learning journey! Complete your first lesson with any companion to see your progress here.",
          buttonText: "Browse Companions",
          buttonHref: "/companions",
        };
      case "sessions":
      default:
        return {
          icon: "/icons/cap.svg",
          title: "No sessions completed yet",
          description:
            "Start your learning journey! Complete your first lesson with any companion to see your progress here.",
          buttonText: "Browse Companions",
          buttonHref: "/companions",
        };
    }
  };

  const emptyState = getEmptyState();
  return (
    <article className={cn("companions-list", classNames)}>
      {title && <h2 className="font-bold text-3xl">{title}</h2>}

      {companions && companions.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-lg w-2/3">Lessons</TableHead>
              <TableHead className="text-lg">Subject</TableHead>
              <TableHead className="text-lg text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companions.map(({ id, subject, name, topic, duration }, index) => (
              <TableRow key={`${keyPrefix}-${id}-${index}`}>
                <TableCell>
                  <Link href={`/companions/${id}`}>
                    <div className="flex items-center gap-2">
                      <div
                        className="size-[72px] flex items-center justify-center rounded-lg max-md:hidden"
                        style={{ backgroundColor: getSubjectColor(subject) }}
                      >
                        <Image
                          src={`/icons/${subject}.svg`}
                          alt={subject}
                          width={35}
                          height={35}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="font-bold text-2xl">{name}</p>
                        <p className="text-lg">{topic}</p>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="subject-badge w-fit max-md:hidden">
                    {subject}
                  </div>
                  <div
                    className="flex items-center justify-center rounded-lg w-fit p-2 md:hidden"
                    style={{ backgroundColor: getSubjectColor(subject) }}
                  >
                    <Image
                      src={`/icons/${subject}.svg`}
                      alt={subject}
                      width={18}
                      height={18}
                    />
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2 w-full justify-end">
                    <p className="text-2xl">
                      {duration} <span className="max-md:hidden">mins</span>
                    </p>
                    <Image
                      src="/icons/clock.svg"
                      alt="minutes"
                      width={14}
                      height={14}
                      className="md:hidden"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          {emptyState.icon ? (
            <div className="mb-6">
              <Image
                src={emptyState.icon}
                alt={emptyState.title}
                width={64}
                height={64}
                className="opacity-50"
              />
            </div>
          ) : (
            <div className="mb-6 h-16"></div>
          )}
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {emptyState.title}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">
            {emptyState.description}
          </p>
          <Link
            href={emptyState.buttonHref}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold"
          >
            {emptyState.buttonText}
          </Link>
        </div>
      )}
    </article>
  );
};

export default CompanionsList;
