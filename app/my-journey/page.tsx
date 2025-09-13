import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getUserCompanions,
  getUserSessions,
  getUserBookmarks,
} from "@/lib/actions/companion.actions";
import Image from "next/image";
import CompanionsList from "@/components/CompanionsList";

const Profile = async () => {
  const user = await currentUser();

  if (!user) redirect("/sign-in?redirect_url=/my-journey");

  const companions = await getUserCompanions(user.id);
  const sessionHistory = await getUserSessions(user.id);
  const bookmarkedCompanions = await getUserBookmarks(user.id);

  // Debug: Check for duplicates
  console.log("Companions count:", companions.length);
  console.log("Session history count:", sessionHistory.length);
  console.log("Bookmarked count:", bookmarkedCompanions.length);

  // Check for duplicate IDs in companions array
  const companionIds = companions.map((c) => c.id);
  const duplicateCompanionIds = companionIds.filter(
    (id, index) => companionIds.indexOf(id) !== index
  );
  if (duplicateCompanionIds.length > 0) {
    console.log("Duplicate companion IDs found:", duplicateCompanionIds);
  }

  return (
    <main className="min-lg:w-3/4">
      <section className="flex justify-between gap-4 max-lg:flex-col max-lg:items-start max-sm:flex-col items-center">
        <div className="flex gap-4 items-center">
          <Image
            src={user.imageUrl}
            alt={user.firstName!}
            width={110}
            height={110}
          />

          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-2xl">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-muted-foreground break-all">
              {user.emailAddresses[0].emailAddress}
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full max-w-md max-lg:max-w-full max-lg:justify-center">
          <div className="stat-box">
            <div className="flex gap-2 items-center justify-center">
              <Image
                src="/icons/check.svg"
                alt="checkmark"
                width={22}
                height={22}
              />
              <p className="stat-number">{sessionHistory.length}</p>
            </div>
            <div className="stat-label">Lessons completed</div>
          </div>

          <div className="stat-box">
            <div className="flex gap-2 items-center justify-center">
              <Image src="/icons/cap.svg" alt="cap" width={22} height={22} />
              <p className="stat-number">{companions.length}</p>
            </div>
            <div className="stat-label">Companions created</div>
          </div>

          <div className="stat-box">
            <div className="flex gap-2 items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="bookmarkGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#ff4444", stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#ff6b35", stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M6 2C5.44772 2 5 2.44772 5 3V21C5 21.3688 5.20656 21.7077 5.53553 21.8536C5.86449 21.9994 6.24558 21.9329 6.50735 21.6889L12 16.7639L17.4926 21.6889C17.7544 21.9329 18.1355 21.9994 18.4645 21.8536C18.7934 21.7077 19 21.3688 19 21V3C19 2.44772 18.5523 2 18 2H6Z"
                  fill="none"
                  stroke="url(#bookmarkGradient)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="stat-number">{bookmarkedCompanions.length}</p>
            </div>
            <div className="stat-label">Bookmarked</div>
          </div>
        </div>
      </section>
      <Accordion type="multiple">
        <AccordionItem value="bookmarks">
          <AccordionTrigger className="text-2xl font-bold">
            Bookmarked Companions
          </AccordionTrigger>

          <AccordionContent>
            <CompanionsList
              title="Bookmarked Companions"
              companions={bookmarkedCompanions}
              keyPrefix="bookmarked"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="recent">
          <AccordionTrigger className="text-2xl font-bold">
            Recent Sessions
          </AccordionTrigger>

          <AccordionContent>
            <CompanionsList
              title="Recent Sessions"
              companions={sessionHistory}
              keyPrefix="recent"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="companions">
          <AccordionTrigger className="text-2xl font-bold">
            My Companions {`(${companions.length})`}
          </AccordionTrigger>

          <AccordionContent>
            <CompanionsList
              title="My Companions"
              companions={companions}
              keyPrefix="my-companions"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
};

export default Profile;
