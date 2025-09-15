import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import {
  getPopularCompanions,
  getRecentSessions,
} from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";
import Image from "next/image";

const Page = async () => {
  const companions = await getPopularCompanions(3);
  const recentSessionsCompanions = await getRecentSessions(10);

  return (
    <main>
      <h1>Popular Companions</h1>

      <section className="w-full mb-0 md:mb-4">
        {companions && companions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companions.map((companion) => (
              <CompanionCard
                key={companion.id}
                {...companion}
                color={getSubjectColor(companion.subject)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="mb-6">
              <Image
                src="/icons/plus.svg"
                alt="No companions"
                width={64}
                height={64}
                className="opacity-50"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No popular companions yet
            </h3>
            <p className="text-gray-500 mb-0 max-w-md">
              Discover our featured AI companions designed to enhance your
              learning experience across different subjects.
            </p>
          </div>
        )}
      </section>

      <section className="home-section">
        <CompanionsList
          title="Recently completed sessions"
          companions={recentSessionsCompanions}
          classNames="w-2/3 max-lg:w-full"
          emptyStateType="sessions"
        />
        <CTA />
      </section>
    </main>
  );
};

export default Page;
