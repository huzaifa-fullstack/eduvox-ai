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
      <section className="flex justify-between gap-4 max-sm:flex-col items-center">
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
            <p className="text-sm text-muted-foreground">
              {user.emailAddresses[0].emailAddress}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="border border-black rounded-lg p-3 gap-2 flex flex-col h-fit">
            <div className="flex gap-2 items-center">
              <Image
                src="/icons/check.svg"
                alt="checkmark"
                width={22}
                height={22}
              />
              <p className="text-2xl font-bold">{sessionHistory.length}</p>
            </div>
            <div>Lessons completed</div>
          </div>

          <div className="border border-black rounded-lg p-3 gap-2 flex flex-col h-fit">
            <div className="flex gap-2 items-center">
              <Image src="/icons/cap.svg" alt="cap" width={22} height={22} />
              <p className="text-2xl font-bold">{companions.length}</p>
            </div>
            <div>Companions created</div>
          </div>

          <div className="border border-black rounded-lg p-3 gap-2 flex flex-col h-fit">
            <div className="flex gap-2 items-center">
              <Image
                src="/icons/bookmark-filled.svg"
                alt="bookmark"
                width={22}
                height={22}
              />
              <p className="text-2xl font-bold">
                {bookmarkedCompanions.length}
              </p>
            </div>
            <div>Bookmarked</div>
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
