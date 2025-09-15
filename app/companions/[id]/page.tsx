import CompanionComponent from "@/components/CompanionComponent";
import {
  getCompanion,
  checkMonthlyConversationLimit,
  getMonthlyConversationCount,
} from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

interface CompanionSessionPageProps {
  params: Promise<{ id: string }>;
}

const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
  const { id } = await params;
  const user = await currentUser();

  // Check authentication first, before fetching companion data
  if (!user) redirect("/sign-in?redirect_url=/companions");

  const companion = await getCompanion(id);

  // If companion doesn't exist, redirect to companions page
  if (!companion) redirect("/companions");

  // CHECK MONTHLY CONVERSATION LIMITS
  const canStartConversation = await checkMonthlyConversationLimit(user.id);
  const currentConversationCount = await getMonthlyConversationCount(user.id);

  const { name, subject, topic, duration } = companion;

  // If user has reached conversation limits, show upgrade message
  if (!canStartConversation) {
    return (
      <main>
        <article className="flex rounded-border justify-between p-6 max-md:flex-col">
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
              <div className="flex items-center gap-2">
                <p className="font-bold text-2xl">{name}</p>
                <div className="subject-badge max-sm:hidden">{subject}</div>
              </div>
              <p className="text-lg">{topic}</p>
            </div>
          </div>
          <div className="items-start text-2xl max-md:hidden">
            {duration} minutes
          </div>
        </article>

        <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 mt-6">
          <h3 className="text-2xl font-bold text-red-600 mb-3">
            Monthly Conversation Limit Reached
          </h3>
          <p className="text-gray-700 mb-6 max-w-md leading-relaxed">
            You&apos;ve completed {currentConversationCount} out of 10 conversations
            this month with your Basic plan. Upgrade to Core or Pro for
            unlimited conversations!
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link
              href="/subscription"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold"
            >
              Upgrade Plan
            </Link>
            <Link
              href="/companions"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold"
            >
              Browse Companions
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <article className="flex rounded-border justify-between p-6 max-md:flex-col">
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
            <div className="flex items-center gap-2">
              <p className="font-bold text-2xl">{name}</p>
              <div className="subject-badge max-sm:hidden">{subject}</div>
            </div>
            <p className="text-lg">{topic}</p>
          </div>
        </div>
        <div className="items-start text-2xl max-md:hidden">
          {duration} minutes
        </div>
      </article>
      <CompanionComponent
        {...companion}
        companionId={id}
        userName={user.firstName!}
        userImage={user.imageUrl!}
      />
    </main>
  );
};

export default CompanionSession;
