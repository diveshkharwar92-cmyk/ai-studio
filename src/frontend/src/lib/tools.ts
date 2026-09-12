import {
  Clapperboard,
  Film,
  GraduationCap,
  Image,
  Languages,
  Lightbulb,
  type LucideIcon,
  MessageSquare,
  Mic,
  Palette,
  PenLine,
  Scissors,
  Volume2,
  Wand2,
} from "lucide-react";

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  status: "available" | "coming-soon";
  accent: string;
}

export const tools: Tool[] = [
  {
    id: "chat",
    name: "AI Chat",
    description:
      "Have natural, context-aware conversations with a powerful assistant that remembers your work.",
    icon: MessageSquare,
    href: "/chat",
    status: "available",
    accent: "from-violet-500 to-indigo-500",
  },
  {
    id: "text-to-video",
    name: "Text to Video",
    description:
      "Turn written prompts into cinematic, high-quality video clips in minutes.",
    icon: Clapperboard,
    href: "/tools/text-to-video",
    status: "coming-soon",
    accent: "from-rose-500 to-pink-500",
  },
  {
    id: "image",
    name: "Text to Image",
    description:
      "Turn written prompts into stunning, high-quality images in seconds.",
    icon: Image,
    href: "/image",
    status: "available",
    accent: "from-cyan-500 to-blue-500",
  },
  {
    id: "image-to-video",
    name: "Image to Video",
    description:
      "Bring still images to life with smooth, animated motion sequences.",
    icon: Film,
    href: "/tools/image-to-video",
    status: "coming-soon",
    accent: "from-fuchsia-500 to-purple-500",
  },
  {
    id: "image-editor",
    name: "AI Image Editor",
    description:
      "Enhance, retouch, and transform your photos with intelligent editing tools.",
    icon: Wand2,
    href: "/tools/image-editor",
    status: "coming-soon",
    accent: "from-sky-500 to-indigo-500",
  },
  {
    id: "video-editor",
    name: "AI Video Editor",
    description:
      "Cut, refine, and polish your footage with automated, AI-assisted editing.",
    icon: Scissors,
    href: "/tools/video-editor",
    status: "coming-soon",
    accent: "from-orange-500 to-amber-500",
  },
  {
    id: "video-to-anime",
    name: "Video to Anime",
    description:
      "Reimagine your videos with a stunning anime art style in one click.",
    icon: Palette,
    href: "/tools/video-to-anime",
    status: "coming-soon",
    accent: "from-pink-500 to-rose-500",
  },
  {
    id: "text-to-speech",
    name: "Text to Speech",
    description:
      "Convert written text into natural, lifelike spoken audio instantly.",
    icon: Volume2,
    href: "/tools/text-to-speech",
    status: "coming-soon",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    id: "speech-to-text",
    name: "Speech to Text",
    description:
      "Transcribe spoken audio into accurate, editable written text.",
    icon: Mic,
    href: "/tools/speech-to-text",
    status: "coming-soon",
    accent: "from-lime-500 to-green-500",
  },
  {
    id: "writer",
    name: "AI Writer",
    description:
      "Generate polished articles, emails, and copy that match your voice.",
    icon: PenLine,
    href: "/tools/writer",
    status: "coming-soon",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    id: "translator",
    name: "AI Translator",
    description:
      "Translate text across dozens of languages while preserving meaning and tone.",
    icon: Languages,
    href: "/tools/translator",
    status: "coming-soon",
    accent: "from-teal-500 to-emerald-500",
  },
  {
    id: "study-assistant",
    name: "AI Study Assistant",
    description:
      "Summarize notes, quiz yourself, and master any subject with guided help.",
    icon: GraduationCap,
    href: "/tools/study-assistant",
    status: "coming-soon",
    accent: "from-amber-500 to-orange-500",
  },
  {
    id: "idea-generator",
    name: "AI Idea Generator",
    description:
      "Spark fresh concepts and creative directions whenever you feel stuck.",
    icon: Lightbulb,
    href: "/tools/idea-generator",
    status: "coming-soon",
    accent: "from-yellow-500 to-amber-500",
  },
];

export function getToolById(id: string): Tool | undefined {
  return tools.find((tool) => tool.id === id);
}
