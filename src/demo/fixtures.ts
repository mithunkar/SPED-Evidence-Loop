export type DemoStrategy = {
  name: string;
  reminder: string;
  fidelityPrompt: string;
};

export type DemoGoal = {
  id: string;
  title: string;
  domain: string;
  objective: string;
  strategy: DemoStrategy | null;
};

export type DemoSession = {
  student: {
    id: string;
    displayName: string;
  };
  sessionType: string;
  scorerLabel: string;
  goals: readonly DemoGoal[];
};

export const DEMO_SESSION = {
  student: {
    id: "synthetic-student-river",
    displayName: "River",
  },
  sessionType: "Morning centers",
  scorerLabel: "Demo assistant",
  goals: [
    {
      id: "synthetic-goal-directions",
      title: "Following directions",
      domain: "Classroom routines",
      objective:
        "Follow a one- or two-step classroom direction during a familiar routine.",
      strategy: {
        name: "Visual cue and wait time",
        reminder:
          "Show one visual cue, give the direction once, then wait five seconds.",
        fidelityPrompt: "Was the visual cue and wait time used as planned?",
      },
    },
    {
      id: "synthetic-goal-help",
      title: "Requesting help",
      domain: "Communication",
      objective:
        "Use a word, sign, or communication tool to request help during a challenging activity.",
      strategy: {
        name: "Pause, model, invite",
        reminder:
          "Pause before helping, model the request once, then invite River to respond.",
        fidelityPrompt: "Was pause, model, invite used as planned?",
      },
    },
    {
      id: "synthetic-goal-play",
      title: "Joining play",
      domain: "Social interaction",
      objective:
        "Approach a peer activity and participate for at least one exchange.",
      strategy: null,
    },
  ],
} as const satisfies DemoSession;
