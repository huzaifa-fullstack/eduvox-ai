import CompanionCard from "@/components/CompanionCard";
import SearchInput from "@/components/SearchInput";
import SubjectFilter from "@/components/SubjectFilter";
import { getAllCompanions } from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const CompanionsLibrary = async ({ searchParams }: SearchParams) => {
  const filters = await searchParams;
  const subject = filters.subject ? filters.subject : "";
  const topic = filters.topic ? filters.topic : "";

  const companions = await getAllCompanions({ subject, topic });

  console.log(companions);

  return (
    <main>
      <section className="flex justify-between gap-4 max-sm:flex-col">
        <h1>Companion Library</h1>
        <div className="flex gap-4">
          <SearchInput />
          <SubjectFilter />
        </div>
      </section>
      {companions && companions.length > 0 ? (
        <section className="companions-grid">
          {companions.map((companion) => (
            <CompanionCard
              key={companion.id}
              {...companion}
              color={getSubjectColor(companion.subject)}
            />
          ))}
        </section>
      ) : (
        <section className="flex justify-center items-center w-full mt-8">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 max-w-2xl w-full">
            <div className="mb-6">
              <Image
                src="/icons/search.svg"
                alt="No companions found"
                width={64}
                height={64}
                className="opacity-50"
              />
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-3">
              No companions found
            </h3>
            <p className="text-gray-500 mb-6 max-w-md leading-relaxed">
              {subject || topic
                ? "Try adjusting your search filters or browse all companions to find the perfect learning partner."
                : "Be the first to create an AI companion! Start building your personalized learning experience."}
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <Link
                href="/companions/new"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold"
              >
                Create Companion
              </Link>
              {(subject || topic) && (
                <Link
                  href="/companions"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  Clear Filters
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default CompanionsLibrary;
