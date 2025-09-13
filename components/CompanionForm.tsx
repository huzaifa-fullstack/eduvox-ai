"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { subjects } from "@/constants";
import { Textarea } from "./ui/textarea";
import { createCompanion } from "@/lib/actions/companion.actions";
import { redirect } from "next/navigation";

const formSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "Companion name is required." })
      .max(50, { message: "Companion name must be less than 50 characters." })
      .refine((val) => !containsInappropriateContent(val), {
        message: "Companion name contains inappropriate content.",
      }),
    subject: z.string().min(1, { message: "Subject is required." }),
    topic: z
      .string()
      .min(1, { message: "Topic is required." })
      .max(200, { message: "Topic must be less than 200 characters." }),
    voice: z.string().min(1, { message: "Voice is required." }),
    style: z.string().min(1, { message: "Style is required." }),
    duration: z.number().min(1, { message: "Duration is required." }),
  })
  .refine((data) => isTopicRelevantToSubject(data.subject, data.topic), {
    message:
      "Topic doesn't seem clearly related to the selected subject. If this is educational content, please add words like 'learn', 'study', or be more descriptive about the educational goal.",
    path: ["topic"],
  })
  .refine(
    (data) => !containsContextualInappropriateContent(data.topic, data.subject),
    {
      message: "This content is not appropriate for educational purposes.",
      path: ["topic"],
    }
  );

// Strictly prohibited content - never allowed
const strictlyProhibitedWords = [
  "sex",
  "porn",
  "pornography",
  "rape",
  "sexual",
  "nude",
  "naked",
  "explicit",
  "prostitution",
  "brothel",
  "orgasm",
  "masturbation",
  "erotic",
  "adult",
  "xxx",
  "nsfw",
  "fetish",
  "bdsm",
  "escort",
  "stripper",
  "hooker",
  "drug",
  "cocaine",
  "heroin",
  "marijuana",
  "meth",
  "weed",
  "cannabis",
  "illegal drugs",
  "narcotics",
  "trafficking",
  "dealer",
  "junkie",
  "weapon",
  "gun",
  "bomb",
  "explosive",
  "terrorist",
  "kill",
  "murder",
  "suicide",
  "self-harm",
  "violence",
  "assault",
  "abuse",
  "torture",
  "hate",
  "racism",
  "nazi",
  "supremacist",
  "discrimination",
  "bigotry",
];

// Context-sensitive words (only allowed for specific subjects)
const contextualWords = {
  history: [
    "war",
    "battle",
    "dead",
    "death",
    "blood",
    "revolution",
    "conflict",
    "genocide",
    "holocaust",
    "slavery",
    "civil war",
    "world war",
    "battlefield",
    "casualties",
    "plague",
    "disease outbreak",
  ],
};

const containsInappropriateContent = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return strictlyProhibitedWords.some((word) => lowerText.includes(word));
};

const containsContextualInappropriateContent = (
  text: string,
  subject: string
): boolean => {
  const lowerText = text.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  // First check strictly prohibited content
  if (containsInappropriateContent(text)) {
    return true;
  }

  // Check context-sensitive words
  for (const [allowedSubject, words] of Object.entries(contextualWords)) {
    const foundRestrictedWord = words.some((word) => lowerText.includes(word));

    if (foundRestrictedWord && lowerSubject !== allowedSubject) {
      return true; // Word found but not in appropriate subject context
    }
  }

  return false;
};

const subjectKeywords = {
  maths: [
    "algebra",
    "geometry",
    "calculus",
    "trigonometry",
    "statistics",
    "numbers",
    "equations",
    "formulas",
    "mathematical",
    "arithmetic",
    "derivatives",
    "integrals",
    "probability",
  ],
  science: [
    "physics",
    "chemistry",
    "biology",
    "laboratory",
    "experiment",
    "molecule",
    "atom",
    "cell",
    "evolution",
    "gravity",
    "energy",
    "scientific",
  ],
  coding: [
    "programming",
    "javascript",
    "python",
    "algorithm",
    "software",
    "development",
    "code",
    "function",
    "variable",
    "loop",
    "debugging",
    "syntax",
  ],
  language: [
    "grammar",
    "vocabulary",
    "writing",
    "reading",
    "literature",
    "essay",
    "poetry",
    "linguistics",
    "syntax",
    "pronunciation",
    "communication",
  ],
  history: [
    "historical",
    "ancient",
    "war",
    "civilization",
    "culture",
    "timeline",
    "events",
    "empire",
    "revolution",
    "historical figures",
    "archaeology",
  ],
  economics: [
    "economy",
    "market",
    "trade",
    "business",
    "finance",
    "money",
    "investment",
    "supply",
    "demand",
    "inflation",
    "economics",
  ],
};

const isTopicRelevantToSubject = (subject: string, topic: string): boolean => {
  if (!subject || !topic) return true; // Allow validation to pass if either is empty

  const lowerTopic = topic.toLowerCase();
  const lowerSubject = subject.toLowerCase();
  const keywords =
    subjectKeywords[lowerSubject as keyof typeof subjectKeywords] || [];

  // More flexible validation approach:

  // 1. Direct subject name match
  if (lowerTopic.includes(lowerSubject)) {
    return true;
  }

  // 2. Keyword matching (existing)
  if (keywords.some((keyword) => lowerTopic.includes(keyword))) {
    return true;
  }

  // 3. Educational context indicators - general academic terms
  const educationalTerms = [
    "learn",
    "study",
    "understand",
    "explain",
    "analyze",
    "solve",
    "practice",
    "concept",
    "theory",
    "principle",
    "method",
    "technique",
    "strategy",
    "introduction",
    "basics",
    "fundamentals",
    "advanced",
    "intermediate",
    "tutorial",
    "lesson",
    "exercise",
    "problem",
    "question",
    "homework",
    "exam",
    "test",
    "quiz",
    "review",
    "research",
    "exploration",
  ];

  if (educationalTerms.some((term) => lowerTopic.includes(term))) {
    return true;
  }

  // 4. Academic level indicators
  const academicLevels = [
    "elementary",
    "basic",
    "beginner",
    "intermediate",
    "advanced",
    "college",
    "university",
    "high school",
    "grade",
    "level",
    "course",
    "curriculum",
  ];

  if (academicLevels.some((level) => lowerTopic.includes(level))) {
    return true;
  }

  // 5. Length-based flexibility - longer descriptions are likely educational
  if (topic.trim().length > 50) {
    return true; // Assume detailed descriptions are educational
  }

  // 6. Question format detection - educational questions
  if (
    lowerTopic.includes("how") ||
    lowerTopic.includes("what") ||
    lowerTopic.includes("why") ||
    lowerTopic.includes("when") ||
    lowerTopic.includes("where") ||
    lowerTopic.includes("which")
  ) {
    return true;
  }

  return false;
};

type FormSchema = z.infer<typeof formSchema>;

const CompanionForm = () => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      topic: "",
      voice: "",
      style: "",
      duration: 15,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const companion = await createCompanion(values);

    if (companion) {
      redirect(`/companions/${companion.id}`);
    } else {
      console.log("Failed to create a companion");
      redirect("/");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Companion name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the companion name"
                  {...field}
                  className="input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="input capitalize">
                    <SelectValue placeholder="Select the subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject}
                        value={subject}
                        className="capitalize"
                      >
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What should the companion help with?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex. Derivatives & Integrals"
                  {...field}
                  className="input"
                />
              </FormControl>
              <FormDescription className="text-sm text-gray-600">
                Be specific about what you want to learn. Example: "Learn
                calculus derivatives"
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="voice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voice</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="input">
                    <SelectValue placeholder="Select the voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Style</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="input">
                    <SelectValue placeholder="Select the style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated session duration in minutes</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="15"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full cursor-pointer py-4 text-base"
        >
          Build Your Companion
        </Button>
      </form>
    </Form>
  );
};

export default CompanionForm;
