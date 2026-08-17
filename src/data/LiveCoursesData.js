import {
    Megaphone,
    Clapperboard,
    Code2,
    PenTool,
    Cpu,
    Calculator,
    Users,
    CalendarRange,
    BadgeCheck,
    Infinity as InfinityIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Real course images — adjust these paths if your files live        */
/*  somewhere other than src/assets/LiveImages/                       */
/* ------------------------------------------------------------------ */
import DMBPG from "../assets/LiveImages/DMBPG.png"; // Digital Marketing Basic Programme
import DMAPG from "../assets/LiveImages/DMAPG.png"; // Digital Marketing Advanced Programme
import CGD from "../assets/LiveImages/CGD.png";
import SDMA from "../assets/LiveImages/SDMA.png";
import ADMA from "../assets/LiveImages/ADMA.png";
import MDMA from "../assets/LiveImages/MDMA.png";
import FED from "../assets/LiveImages/FED.png";
import FSD from "../assets/LiveImages/FSD.png";
import UIUX from "../assets/LiveImages/UIUX.png";
import PDSE from "../assets/LiveImages/PDSE.png";
import ADSE from "../assets/LiveImages/ADSE.png";
import MDSE from "../assets/LiveImages/MDSE.png";
import CIFA from "../assets/LiveImages/CIFA.png";
import SDEA from "../assets/LiveImages/SDEA.png";
import MDEA from "../assets/LiveImages/MDEA.png";

/* ------------------------------------------------------------------ */
/*  Category → icon mapping (falls back to a generic book icon in     */
/*  the component if a category isn't listed here).                   */
/* ------------------------------------------------------------------ */
export const CATEGORY_ICONS = {
    "Digital Marketing": Megaphone,
    Multimedia: Clapperboard,
    "Web Development": Code2,
    "UI/UX Design": PenTool,
    "Software Development": Cpu,
    "E-Accounting": Calculator,
};

export const TRUST_POINTS = [
    { icon: Users, label: "Expert Instructors", sub: "Learn from industry pros" },
    { icon: CalendarRange, label: "Flexible Learning", sub: "Study at your own pace" },
    { icon: BadgeCheck, label: "Certificates", sub: "Earn recognized certificates" },
    { icon: InfinityIcon, label: "Lifetime Access", sub: "Learn anytime, anywhere" },
];

export const CATEGORIES = [
    "Digital Marketing",
    "Multimedia",
    "Web Development",
    "UI/UX Design",
    "Software Development",
    "E-Accounting",
];

export const POPUP_LINK =
    "https://creativeadhyayan.com/#elementor-action%3Aaction%3Dpopup%3Aopen%26settings%3DeyJpZCI6IjEwNzAiLCJ0b2dnbGUiOmZhbHNlfQ%3D%3D";

export const COURSES_BY_CATEGORY = {
    /* ---------------------------- Digital Marketing --------------------------- */
    "Digital Marketing": [
        {
            id: "dm-basic",
            title: "Digital Marketing Basic Programme",
            images: [DMBPG],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "Start your digital journey. Learn the basics of SEO, social media, content, and branding in a fun and practical program designed for beginners.",
            features: [
                "High-demand career opportunities",
                "Freelancing and remote work options",
                "Financial independence",
                "Strong personal branding skills",
            ],
            duration: "4 Months",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
        {
            id: "dm-advanced",
            title: "Digital Marketing Advanced Programme",
            images: [DMAPG],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "Go from basic to badass marketer! Learn advanced ads, SEO, email automation, and data-driven strategies to scale brands and get real results.",
            features: [
                "High-demand career opportunities",
                "Freelancing and remote work options",
                "Financial independence",
                "Support for starting their own business",
                "Strong personal branding skills",
                "Free Internship",
            ],
            duration: "1 Year",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
    ],

    /* ------------------------------- Multimedia -------------------------------- */
    Multimedia: [
        {
            id: "cgd",
            title: "(CGD) Certificate in Graphic Design",
            images: [CGD],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "Turn ideas into stunning visuals! Learn graphic tools, branding basics, and modern design skills to become a confident designer.",
            features: [
                "Turns Creativity into a Career",
                "Teaches Practical & Job-Oriented Skills",
                "Perfect for Freelancing & Online Earning",
                "Wide Job Opportunities",
            ],
            duration: "6 Months",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
        {
            id: "sdma",
            title: "(SDMA) Specialized Diploma in Multimedia and Animation",
            images: [SDMA],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "Create the magic you watch on screen! Learn animation, 3D design, motion graphics, VFX, and creative media skills used in movies, gaming, and digital content.",
            features: [
                "Turns Creativity into a Career",
                "Teaches Practical & Job-Oriented Skills",
                "Perfect for Freelancing & Online Earning",
                "Wide Job Opportunities",
                "Free Internship",
            ],
            duration: "1 Year",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
        {
            id: "adma",
            title: "(ADMA) Advance Diploma in Multimedia and Animation",
            images: [ADMA],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "A complete advanced diploma designed for students aiming for professional careers in animation studios, film production, gaming, VFX houses, and creative media companies.",
            features: [
                "Turns Creativity into a Career",
                "Teaches Practical & Job-Oriented Skills",
                "Perfect for Freelancing & Online Earning",
                "Wide Job Opportunities",
                "Free Internship",
                "Freelancing Projects",
            ],
            duration: "2.5 Years",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
        {
            id: "mdma",
            title: "(MDMA) Master Diploma in Multimedia and Animation",
            images: [MDMA],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "Master the world of animation and multimedia with expert-level training in 3D, VFX, CGI, film editing, and high-end digital content creation.",
            features: [
                "Turns Creativity into a Career",
                "Teaches Practical & Job-Oriented Skills",
                "Perfect for Freelancing & Online Earning",
                "Wide Job Opportunities",
                "Free Internship",
                "Freelancing Projects",
            ],
            duration: "3 Years",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
    ],

    /* ----------------------------- Web Development ----------------------------- */
    "Web Development": [
        {
            id: "frontend-dev",
            title: "Front-End Development",
            images: [FED],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "A complete front-end development course covering web fundamentals, interactive UI design, and modern frameworks for industry-ready skills.",
            features: [
                "Builds digital skills",
                "Increases creativity",
                "Improves problem-solving",
                "Creates job opportunities",
                "Supports freelancing income",
            ],
            duration: "1 Year",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
        {
            id: "fullstack-dev",
            title: "Full-Stack Development",
            images: [FSD],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "Become a job-ready full-stack developer. Learn UI design, server-side coding, databases, APIs, and cloud deployment through real-world projects.",
            features: [
                "Builds digital skills",
                "Increases creativity",
                "Improves problem-solving",
                "Creates job opportunities",
                "Supports freelancing income",
                "Freelancing Projects",
                "Free Internship",
            ],
            duration: "2 Years",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
    ],

    /* ------------------------------- UI/UX Design ------------------------------- */
    "UI/UX Design": [
        {
            id: "uiux-diploma",
            title: "Diploma in UI/UX Design",
            images: [UIUX],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "Build a career in UI/UX with hands-on training in user research, design thinking, interface creation, prototyping, and portfolio development for real-world projects.",
            features: [
                "Boosts creative and visual thinking skills",
                "Enhances problem-solving through user understanding",
                "Improves attention to detail and quality",
                "Encourages innovation and new ideas",
                "Free Internship",
                "Freelancing Projects",
            ],
            duration: "1 Year",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
    ],

    /* --------------------------- Software Development --------------------------- */
    "Software Development": [
        {
            id: "pdse",
            title: "(PDSE) Professional Diploma in Software Engineering",
            images: [PDSE],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "Master coding, software development, and real-world engineering skills to build modern applications from scratch.",
            features: [
                "Builds strong coding and technical skills",
                "Improves creativity and logical thinking",
                "High demand in almost every industry",
                "Useful for jobs, freelancing, and startups",
            ],
            duration: "1 Year",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
        {
            id: "adse",
            title: "(ADSE) Advance Diploma in Software Engineering",
            images: [ADSE],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "Level up your software engineering skills with advanced coding, system design, cloud deployment, and scalable application development.",
            features: [
                "Builds strong coding and technical skills",
                "Improves creativity and logical thinking",
                "High demand in almost every industry",
                "Useful for jobs, freelancing, and startups",
                "Free Internship",
                "Freelancing Projects",
            ],
            duration: "2.5 Years",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
        {
            id: "mdse",
            title: "(MDSE) Master Diploma in Software Engineering",
            images: [MDSE],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "Master software engineering with advanced programming, system design, cloud technologies, and enterprise-grade application development.",
            features: [
                "Builds strong coding and technical skills",
                "Improves creativity and logical thinking",
                "High demand in almost every industry",
                "Useful for jobs, freelancing, and startups",
                "Free Internship",
                "Freelancing Projects",
            ],
            duration: "3 Years",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
    ],

    /* -------------------------------- E-Accounting -------------------------------- */
    "E-Accounting": [
        {
            id: "cifa",
            title: "(CIFA) Certificate in Financial Accounting",
            images: [CIFA],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "Start your accounting career with hands-on training in bookkeeping, ledger management, and financial statement preparation. Ideal for students, entrepreneurs, and professionals.",
            features: [
                "Builds strong coding and technical skills",
                "Improves creativity and logical thinking",
                "High demand in almost every industry",
                "Useful for jobs, freelancing, and startups",
            ],
            duration: "4 Months",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
        {
            id: "sdea",
            title: "(SDEA) Specialized Diploma in E-Accounting",
            images: [SDEA],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "Build a career in e-accounting with hands-on training in Tally Prime, GST, automated accounting workflows, and real-world financial management.",
            features: [
                "Builds strong coding and technical skills",
                "Improves creativity and logical thinking",
                "High demand in almost every industry",
                "Useful for jobs, freelancing, and startups",
                "Free Internship",
            ],
            duration: "1 Year",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
        {
            id: "mdea",
            title: "(MDEA) Master Diploma in E-Accounting",
            images: [MDEA],
            tags: ["Beginner friendly", "Flexible Batches", "Hands-On Projects"],
            description:
                "Lead the future of finance! Learn advanced e-accounting, automation, ERP systems, and real-world financial management skills for high-level careers.",
            features: [
                "Builds strong coding and technical skills",
                "Improves creativity and logical thinking",
                "High demand in almost every industry",
                "Useful for jobs, freelancing, and startups",
                "Free Internship",
            ],
            duration: "2 Years",
            mode: "Online & Offline Both available",
            link: POPUP_LINK,
        },
    ],
};