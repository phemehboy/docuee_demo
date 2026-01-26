import { UserType } from "@/lib/database/models/user.model";
import { BuildingLibraryIcon } from "@heroicons/react/20/solid";
import { getCode, getNames } from "country-list";

export const stageActions = [
  {
    label: "Generate outline for this stage",
    action: "GENERATE_OUTLINE",
    icon: ZapIcon, // or pick a different icon
  },
  {
    label: "Summarize what I've written so far",
    action: "SUMMARIZE_STAGE",
    icon: EyeIcon,
  },
  {
    label: "Find gaps in arguments across this stage",
    action: "FIND_STAGE_GAPS",
    icon: SearchIcon,
  },
  {
    label: "Check academic tone for entire stage",
    action: "CHECK_TONE",
    icon: CheckSquareIcon,
  },
];

export const actions = [
  {
    label: "Help me structure this section",
    action: "STRUCTURE_SECTION",
    icon: ZapIcon,
  },
  {
    label: "Explain what I should write here",
    action: "EXPLAIN_SECTION",
    icon: EyeIcon,
  },
  {
    label: "Improve clarity & academic tone",
    action: "IMPROVE_CLARITY",
    icon: CheckSquareIcon,
  },
  {
    label: "Find gaps or weak arguments",
    action: "FIND_GAPS",
    icon: SearchIcon,
  },
];

import {
  Users,
  CheckSquare,
  Edit3,
  TrendingUp,
  Cloud,
  DollarSign,
  GraduationCap,
  HomeIcon,
  Coins,
  ListOrderedIcon,
  BookOpenIcon,
  ClockIcon,
  Building2Icon,
  UserPlusIcon,
  FileTextIcon,
  CalendarIcon,
  MessageSquareText,
  MegaphoneIcon,
  ArrowUpCircle,
  LifeBuoy,
  ZapIcon,
  EyeIcon,
  CheckSquareIcon,
  SearchIcon,
} from "lucide-react";
import {
  FaClipboardList,
  FaCog,
  FaCreditCard,
  FaFolderOpen,
  FaUser,
  FaBookOpen,
  FaArchive,
  FaMoneyBillWave,
  FaHandHoldingUsd,
} from "react-icons/fa";

import { PiChalkboardTeacherLight } from "react-icons/pi"; // Instructor
import { GiTeacher } from "react-icons/gi"; // Supervisor
import { LuGraduationCap } from "react-icons/lu"; // Student
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { PiBookOpenTextLight } from "react-icons/pi";
import { CountryCode, getCountryCallingCode } from "libphonenumber-js";

export const gradingPolicy = {
  quiz: 1,
  assignment: 2,
  lab: 3,
  exam: 5,
  project: 8, // ✅ Final year project carries the most weight
};

export const defaultThumbnailUrl =
  "data:image/png;base64,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";

export const programTypes = [
  "B.A",
  "B.Ed",
  "B.Eng",
  "B.Sc",
  "Certificate",
  "Diploma",
  "Ed.D",
  "HND",
  "J.D",
  "LL.B",
  "LL.M",
  "M.A",
  "M.Ed",
  "M.Eng",
  "M.Sc",
  "MBA",
  "MBBS",
  "M.D",
  "NCE",
  "OND",
  "PGD",
  "Ph.D",
];
export const predefinedProgramTypes = [
  "B.A",
  "B.Ed",
  "B.Eng",
  "B.Sc",
  "Certificate",
  "Diploma",
  "Ed.D",
  "HND",
  "J.D",
  "LL.B",
  "LL.M",
  "M.A",
  "M.Ed",
  "M.Eng",
  "M.Sc",
  "MBA",
  "MBBS",
  "M.D",
  "NCE",
  "OND",
  "PGD",
  "Ph.D",
  "Other",
];
export const navbars = [
  {
    id: 1,
    name: "Home",
    link: "/",
  },
  {
    id: 2,
    name: "Doc",
    link: "/doc",
  },
];

export const GlobalSearchFilters = [
  { name: "Project", value: "project" },
  { name: "User", value: "user" },
];

export const pricing = [
  {
    id: "0",
    title: "Basic",
    description:
      "Start writing assignments, save your work securely, and access your assignments anytime.",
    icon: "/assets/icons/naira.svg",
    price: "0",
    priceText: "start for free",
    features: [
      "Write assignments",
      "Save to cloud",
      "Access assignments anytime",
    ],
  },
  {
    id: "1",
    title: "Premium",
    description:
      "Get everything you need to complete your project from start to finish, with real-time feedback and unlimited access.",
    icon: "/assets/icons/naira.svg",
    price: "3,000",
    priceText: "per month, cancel anytime",
    features: [
      "Supervisor Matching",
      "Topic Approval System",
      "In-App Project Editor",
      "Unlimited Project Submissions",
      "Real-Time Feedback",
    ],
  },
  {
    id: "2",
    title: "Pro",
    description:
      "Unlock AI-powered recommendations, personalized guidance, and advanced analytics to accelerate learning.",
    icon: "/assets/icons/naira.svg",
    price: "10,000",
    priceText: "per month, cancel anytime",
    features: [
      "All Premium Features",
      "AI-Powered Learning Recommendations",
      "Personalized Analytics & Feedback",
      "Priority Support",
    ],
  },
];

export const genderOptions = ["male", "female", "other"];
// export const isSupervisorOptions = [true, false];

export const isSupervisorOptions = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

export const userTypes = ["student", "supervisor", "instructor"];
// export const assignmentUserTypes = ["instructor", "student"];

export const socialMedia = [
  {
    id: 1,
    title: "X",
    img: "/assets/icons/x.svg",
    url: "https://x.com/FemiBuilds?t=UiILwMdl4K7Oi1HmLC6u1A&s=09",
  },
  {
    id: 2,
    title: "LinkedIn",
    img: "/assets/icons/linkedIn.svg",
    url: "https://www.linkedin.com/in/oluwafemi-okunade-a36215185?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
  },
  {
    id: 3,
    title: "YouTube",
    img: "/assets/icons/youtube.svg",
    url: "https://youtube.com/@bencept?si=5CKy3U9Tzn0S4ioL",
  },
];

export const StatusIcon = {
  approved: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  rejected: "/assets/icons/rejected.svg",
};

export const features = [
  {
    id: "0",
    title: "Instructor & Supervisor Assignment",
    text: "Get assigned to the right instructor or supervisor based on your academic level and field of study.",
    backgroundUrl: "/assets/benefits/card-1.svg",
    icon: Users,
    imageUrl: "/assets/images/saturatedProject.png",
    backgroundColor: "#2196F3",
  },
  {
    id: "1",
    title: "Project Topics & Coursework Submission",
    text: "Final-year students can submit project topics for supervisor review and approval, while all students can submit assignments, tests, exams, and quizzes for grading—all in one place.",
    backgroundUrl: "/assets/benefits/card-2.svg",
    icon: CheckSquare,
    imageUrl: "/assets/images/saturatedProject.png",
    light: true,
    backgroundColor: "#FF9800",
  },
  {
    id: "2",
    title: "In-App Writing & Collaboration",
    text: "Write and collaborate on approved projects in real time through the in-app editor, while submitting assignments, tests, exams, and quizzes normally for grading.",
    backgroundUrl: "/assets/benefits/card-3.svg",
    icon: Edit3,
    imageUrl: "/assets/images/saturatedProject.png",
    backgroundColor: "#673AB7",
  },
  {
    id: "3",
    title: "Track Progress with Milestones",
    text: "Stay on top of your academic work with clear milestones, deadlines, and real-time tracking.",
    backgroundUrl: "/assets/benefits/card-4.svg",
    icon: TrendingUp,
    imageUrl: "/assets/images/saturatedProject.png",
    light: true,
    backgroundColor: "#4CAF50",
  },
  {
    id: "4",
    title: "Secure Cloud Storage",
    text: "Keep your projects, assignments, and submissions safe—everything is automatically backed up in the cloud.",
    backgroundUrl: "/assets/benefits/card-5.svg",
    icon: Cloud,
    imageUrl: "/assets/images/saturatedProject.png",
    backgroundColor: "#FF5722",
  },
  {
    id: "5",
    title: "Simple, Affordable Access",
    text: "One low monthly subscription gives students full access to all features—no hidden fees or surprises.",
    backgroundUrl: "/assets/benefits/card-6.svg",
    icon: DollarSign,
    imageUrl: "/assets/images/saturatedProject.png",
    backgroundColor: "#00BCD4",
  },
];

export const howItWorks = [
  {
    id: 1,
    title: "Create Your Account",
    illustration: "/assets/how-it-works/createAccount.png",
    description: "Sign in and Sign up here",
  },
  {
    id: 2,
    title: "Make Payment",
    illustration: "/assets/how-it-works/payment.png",
    description: "Make payment to access exclusive features",
  },
  {
    id: 3,
    title: "Create Project",
    illustration: "/assets/how-it-works/createProject.png",
    description: "Submit your project topics here for approval",
  },
  {
    id: 4,
    title: "Collaborative Editor",
    illustration: "/assets/how-it-works/editor.png",
    description: "You can create a team here or work as a single entity",
  },
];

export const feedback = [
  {
    quote:
      "Having both assignments and projects in one place helps me stay organized. I can focus on writing and improving with my supervisor’s feedback.",
    name: "Ajayi Sarah Oluwatosin",
    title: "Microbiology Student",
    role: "Student",
    imageUrl: "/assets/images/sarah.jpeg",
    school: "OAU (Obafemi Awolowo University)",
  },
  // {
  //   quote:
  //     "Being able to invite other supervisors to co-monitor a project is a great touch. Collaboration is smooth.",
  //   name: "Dr. Musa Bello",
  //   title: "Lecturer, Dept. of Sociology",
  //   role: "Supervisor",
  //   imageUrl: "/assets/images/supervisor3.jpeg",
  //   school: "University of Ilorin",
  // },
  {
    quote:
      "This platform made it so easy to communicate with my supervisor. I submitted my project topic, got feedback the same day, and had clear directions to move forward. The process was smooth and stress-free!",
    name: "OSAHON DESTINY ESEOSA",
    title:
      "Political science and public administration & Former NAUS Chairman (Edo State, 2023–2024)",
    role: "Student",
    imageUrl: "/assets/images/stateman.jpeg",
    school: "UNIBEN (University of Benin)",
  },

  // {
  //   quote:
  //     "The dashboard is clean, secure, and gives me control over school-wide academic interactions. It’s the future of educational administration.",
  //   name: "Engr. Femi Adebayo",
  //   title: "Academic Affairs Admin",
  //   role: "School Admin",
  //   imageUrl: "/assets/images/admin2.jpeg",
  //   school: "Yaba College of Technology",
  // },
  // {
  //   quote:
  //     "As an instructor, I use this platform to monitor assignments and grade them effortlessly. The structure makes teaching more organized and collaborative.",
  //   name: "Mrs. Grace Ibe",
  //   title: "Instructor, Nursing Department",
  //   role: "Instructor",
  //   imageUrl: "/assets/images/instructor1.jpeg",
  //   school: "University of Nigeria, Nsukka",
  // },
  // {
  //   quote:
  //     "I use it to track assignment progress. It’s better than juggling emails or WhatsApp.",
  //   name: "Mr. Uche Ezenwa",
  //   title: "Senior Instructor, Mathematics Dept.",
  //   role: "Instructor",
  //   imageUrl: "/assets/images/instructor3.jpeg",
  //   school: "University of Abuja",
  // },
  // {
  //   quote:
  //     "I love how I can oversee student activity, manage accounts, and generate reports all from one admin panel. It has transformed how we handle academic records.",
  //   name: "Mrs. Olabisi Ojo",
  //   title: "School Administrator",
  //   role: "School Admin",
  //   imageUrl: "/assets/images/admin1.jpeg",
  //   school: "Federal Polytechnic, Ado-Ekiti",
  // },
  // {
  //   quote:
  //     "The platform supports a more engaging classroom experience. My students now submit work on time, and I can give feedback with ease.",
  //   name: "Mr. Emmanuel Okoro",
  //   title: "Computer Science Instructor",
  //   role: "Instructor",
  //   imageUrl: "/assets/images/instructor2.jpeg",
  //   school: "Federal University of Technology, Owerri",
  // },
  {
    quote:
      "The real-time writing feature makes me feel like I’m not alone. My supervisor can see my work and guide me before I make big mistakes.",
    name: "James Kingsley Danladi",
    title: "Economics Student",
    role: "Student",
    imageUrl: "/assets/images/kingsley.jpeg",
    school: "NOUN (National Open University of Nigeria)",
  },

  // {
  //   quote:
  //     "Having all the project drafts, comments, and approvals in one place has reduced administrative stress. It saves me hours every week.",
  //   name: "Prof. Yusuf Abubakar",
  //   title: "Final Year Project Supervisor",
  //   role: "Supervisor",
  //   imageUrl: "/assets/images/supervisor2.jpeg",
  //   school: "Ahmadu Bello University, Zaria",
  // },
  // {
  //   quote:
  //     "This platform has made supervising final-year projects so much easier. I can view student progress in real-time and leave feedback without the usual back-and-forth.",
  //   name: "Dr. Olufunmilayo Adeyemi",
  //   title: "Senior Lecturer, Department of Political Science",
  //   role: "Supervisor",
  //   imageUrl: "/assets/images/supervisor1.jpeg",
  //   school: "University of Lagos",
  // },
  {
    quote:
      "The cloud storage gives me peace of mind. I never worry about losing any work—whether it’s a project or an assignment. Plus, I can work from any device, anywhere.",
    name: "Alabi Omobola Ayomide",
    title: "Community Health Student",
    role: "Student",
    imageUrl: "/assets/images/ayomide.jpeg",
    school: "Titilola College of Health",
  },
  // {
  //   quote:
  //     "The reporting feature makes it easy to pull academic data for any department. We’ve become much more efficient.",
  //   name: "Dr. Grace Nnamdi",
  //   title: "Dean of Student Affairs",
  //   role: "School Admin",
  //   imageUrl: "/assets/images/admin3.jpeg",
  //   school: "University of Port Harcourt",
  // },
  {
    quote:
      "I appreciate the progress tracking—it kept me focused, motivated, and on top of both my projects and assignments. I always knew what was next and avoided last-minute stress.",
    name: "Okunade Timileyin Esther",
    title: "English Student",
    role: "Student",
    imageUrl: "/assets/images/timi.png",
    school: "OAU (Obafemi Awolowo University)",
  },
];

export const faqs = [
  {
    id: 1,
    question: "Is there a free trial available?",
    answer:
      "While we don’t offer a full free trial, students can access and submit assignments for free. Instructors assign the tasks, and students submit them for grading directly on the platform.",
  },
  {
    id: 2,
    question:
      "What happens if my project or assignment isn’t completed within the subscription period?",
    answer:
      "If your subscription expires before completing a project, assignment, test, exam, or quiz, you’ll need to renew your subscription to continue submitting and accessing your work. All previously submitted work remains safe and accessible in your account.",
  },
  {
    id: 3,
    question: "How do I contact my assigned supervisor or instructor?",
    answer:
      "You can message your assigned supervisor or instructor directly through the platform and also collaborate with them inside the in-app editor.",
  },

  {
    id: 4,
    question: "Can I change my assigned supervisor or instructor?",
    answer:
      "Yes. If you believe another supervisor or instructor would better support your work, please reach out to your school admin for assistance.",
  },

  {
    id: 5,
    question: "Is my data safe?",
    answer:
      "Absolutely. All your academic work—projects, assignments, tests, exams, and quizzes—is securely stored in the cloud with automatic backups.",
  },
  {
    id: 6,
    question: "Do I get a refund if I cancel early?",
    answer:
      "We don’t offer refunds for partial subscription periods, but you will retain full access until your current billing cycle ends.",
  },
  {
    id: 7,
    question: "How do I submit my project or coursework?",
    answer:
      "Final-year students can submit project topics for supervisor review. All assignments, tests, exams, and quizzes can be submitted directly on the platform for grading.",
  },

  {
    id: 8,
    question: "Can I access my work after the subscription expires?",
    answer:
      "Yes, your work is saved securely. You’ll need to renew your subscription to regain editing access.",
  },
  {
    id: 9,
    question: "What payment methods are accepted?",
    answer:
      "We accept major debit/credit cards. In the future, we’ll support crypto payments for cross-border users.",
  },
  {
    id: 10,
    question:
      "Do supervisors or instructors receive notifications when I submit topics?",
    answer:
      "Yes, they are notified instantly when you submit a project topic for approval or feedback.",
  },
];

export const quickLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  // { name: "Pricing", href: "/pricing" },
  { name: "FAQs", href: "#faqs" },
];

export const supportLinks = [
  { id: "contact", name: "Contact Us", href: "/dashboard/contact" },
  { id: "terms", name: "Terms of Service", href: "/dashboard/terms" },
  { id: "privacy", name: "Privacy Policy", href: "/dashboard/privacy" },
];

export const templates = [
  {
    id: "blank",
    label: "Blank Document",
    imageUrl: "/assets/images/documentImages/blank-document.svg",
    initialContent: ``,
    isFreeAccessible: true, // FREE template
  },
  {
    id: "software-proposal",
    label: "Software Development Proposal ",
    imageUrl: "/assets/images/documentImages/software-proposal.svg",
    initialContent: `
      <header>
    <h1>Software Development Proposal</h1>
    <p>Prepared for [Client Name]</p>
    <p>Date: [Insert Date]</p>
  </header>

  <section>
    <h2>1. Introduction</h2>
    <p>
      This proposal outlines the plan for the development of [Project Name], a software solution aimed at addressing [specific problem or goal]. The objective is to deliver a product that meets [client's requirements] while ensuring scalability, reliability, and user satisfaction.
    </p>
  </section>

  <section>
    <h2>2. Objectives</h2>
    <ul>
      <li>To design and develop a software application that [objective 1].</li>
      <li>To ensure seamless integration with [specific platforms/tools].</li>
      <li>To provide user-friendly interfaces and enhanced functionality.</li>
    </ul>
  </section>

  <section>
    <h2>3. Project Scope</h2>
    <p>The project will include the following deliverables:</p>
    <ul>
      <li>Requirement analysis and documentation.</li>
      <li>Wireframes and UI/UX design.</li>
      <li>Development of core functionalities.</li>
      <li>Testing and quality assurance.</li>
      <li>Deployment and post-launch support.</li>
    </ul>
  </section>

  <section>
    <h2>4. Timeline</h2>
    <p>The estimated timeline for the project is as follows:</p>
    <table border="1">
      <thead>
        <tr>
          <th>Phase</th>
          <th>Duration</th>
          <th>Start Date</th>
          <th>End Date</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Requirement Gathering</td>
          <td>2 weeks</td>
          <td>[Start Date]</td>
          <td>[End Date]</td>
        </tr>
        <tr>
          <td>Design</td>
          <td>3 weeks</td>
          <td>[Start Date]</td>
          <td>[End Date]</td>
        </tr>
        <tr>
          <td>Development</td>
          <td>6 weeks</td>
          <td>[Start Date]</td>
          <td>[End Date]</td>
        </tr>
        <tr>
          <td>Testing</td>
          <td>2 weeks</td>
          <td>[Start Date]</td>
          <td>[End Date]</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>5. Cost Estimate</h2>
    <p>The estimated cost for the project is:</p>
    <ul>
      <li>Design: [Amount]</li>
      <li>Development: [Amount]</li>
      <li>Testing: [Amount]</li>
      <li>Total: [Total Amount]</li>
    </ul>
  </section>

  <section>
    <h2>6. Conclusion</h2>
    <p>
      We are confident that our proposed solution will effectively address your requirements. We look forward to collaborating with you to bring this project to fruition. Please do not hesitate to reach out with questions or to discuss next steps.
    </p>
  </section>

  <footer>
    <p>Contact: [Your Name] | [Your Email] | [Your Phone]</p>
    <p>Thank you for considering our proposal.</p>
  </footer>
    `,
    isFreeAccessible: false, // PAID template
  },
  {
    id: "project-proposal",
    label: "Project Proposal ",
    imageUrl: "/assets/images/documentImages/project-proposal.svg",
    initialContent: `
      <h1>Project Proposal</h1>

  <header>
    <p>[Your Name]</p>
    <p>[Your Position]</p>
    <p>[Your Company]</p>
    <p>[Your Address]</p>
    <p>[City, State, ZIP Code]</p>
    <p>[Your Email Address]</p>
    <p>[Your Phone Number]</p>
    <p>[Date]</p>
  </header>

  <section>
    <h2>Project Overview</h2>
    <p>[Brief introduction to the project, including its purpose and objectives.]</p>
  </section>

  <section>
    <h2>Goals and Deliverables</h2>
    <ul>
      <li>[Goal or deliverable 1]</li>
      <li>[Goal or deliverable 2]</li>
      <li>[Goal or deliverable 3]</li>
    </ul>
  </section>

  <section>
    <h2>Timeline</h2>
    <p>[Brief description of the proposed timeline and key milestones for the project.]</p>
  </section>

  <section>
    <h2>Budget</h2>
    <p>[Estimated budget or financial requirements for the project.]</p>
  </section>

  <section>
    <h2>Conclusion</h2>
    <p>
      [Summarize the proposal and highlight the benefits of the project. Encourage the recipient to reach out for further details or discussion.]
    </p>
    <p>Sincerely,</p>
    <p>[Your Name]</p>
  </section>
    `,
    isFreeAccessible: false, // PAID template
  },
  {
    id: "business-letter",
    label: "Business Letter",
    imageUrl: "/assets/images/documentImages/business-letter.svg",
    initialContent: `
    <h1>Business Letter</h1>
    <header>
    <p>[Your Name]</p>
    <p>[Your Address]</p>
    <p>[City, State, ZIP Code]</p>
    <p>[Date]</p>
  </header>

  <section>
    <p>[Recipient Name]</p>
    <p>[Recipient Position]</p>
    <p>[Company Name]</p>
    <p>[Company Address]</p>
    <p>[City, State, ZIP Code]</p>
  </section>

  <section>
    <p>Dear [Recipient Name],</p>

    <p>
      I am writing to [state the purpose of your letter briefly, e.g., "inquire about", "express interest in", or "provide information regarding"].
    </p>

    <p>
      [Include a concise paragraph detailing your main point, e.g., "We believe our services can help your company achieve X goals." or "I am seeking clarification on Y topic."]
    </p>

    <p>
      Thank you for your time and consideration. Please feel free to contact me at [your phone number] or [your email address] if you need further information.
    </p>

    <p>Sincerely,</p>
    <p>[Your Name]</p>
    <p>[Your Position, if applicable]</p>
  </section>
    `,
    isFreeAccessible: false, // PAID template
  },
  {
    id: "resume",
    label: "Resume",
    imageUrl: "/assets/images/documentImages/resume.svg",
    initialContent: `
    <h1>Resume</h1>
      <header>
    <h1>[Your Full Name]</h1>
    <p>[Your Address]</p>
    <p>[City, State, ZIP Code]</p>
    <p>[Your Phone Number]</p>
    <p>[Your Email Address]</p>
  </header>

  <section>
    <h2>Objective</h2>
    <p>
      [A brief statement about your career goals and what you aim to achieve in the role you are applying for.]
    </p>
  </section>

  <section>
    <h2>Experience</h2>
    <p><strong>[Job Title]</strong> - [Company Name]</p>
    <p>[Start Date] - [End Date]</p>
    <ul>
      <li>[Responsibility or achievement 1]</li>
      <li>[Responsibility or achievement 2]</li>
      <li>[Responsibility or achievement 3]</li>
    </ul>
  </section>

  <section>
    <h2>Education</h2>
    <p><strong>[Degree]</strong> - [Institution Name]</p>
    <p>[Year of Graduation]</p>
  </section>

  <section>
    <h2>Skills</h2>
    <ul>
      <li>[Skill 1]</li>
      <li>[Skill 2]</li>
      <li>[Skill 3]</li>
    </ul>
  </section>

  <footer>
    <p>References available upon request.</p>
  </footer>
    `,
    isFreeAccessible: false, // PAID template
  },
  {
    id: "cover-letter",
    label: "Cover Letter",
    imageUrl: "/assets/images/documentImages/cover-letter.svg",
    initialContent: `
    <h1>Cover Letter</h1>
      <header>
    <p>[Your Name]</p>
    <p>[Your Address]</p>
    <p>[City, State, ZIP Code]</p>
    <p>[Your Email Address]</p>
    <p>[Your Phone Number]</p>
    <p>[Date]</p>
  </header>

  <section>
    <p>[Hiring Manager's Name]</p>
    <p>[Company Name]</p>
    <p>[Company Address]</p>
    <p>[City, State, ZIP Code]</p>
  </section>

  <section>
    <p>Dear [Hiring Manager's Name],</p>

    <p>
      I am excited to apply for the [Position Title] role at [Company Name]. With my background in [your field or expertise], I am confident that my skills and experiences align well with the requirements of this position.
    </p>

    <p>
      In my previous role as [Your Previous Position] at [Previous Company], I [briefly describe a key achievement or responsibility that demonstrates your qualifications]. This experience has equipped me with [specific skills or knowledge relevant to the new role].
    </p>

    <p>
      I am particularly drawn to [Company Name]'s commitment to [specific company value or mission], and I am eager to contribute my expertise to [how you can add value to the company].
    </p>

    <p>
      Thank you for considering my application. I would welcome the opportunity to discuss how my background and skills can contribute to the success of [Company Name]. Please feel free to contact me at [Your Phone Number] or [Your Email Address].
    </p>

    <p>Sincerely,</p>
    <p>[Your Name]</p>
  </section>
    `,
    isFreeAccessible: false, // PAID template
  },
  {
    id: "letter",
    label: "Letter",
    imageUrl: "/assets/images/documentImages/letter.svg",
    initialContent: `
    <h1>Business Letter</h1>
      <section>
    <p>[Recipient's Name]</p>
    <p>[Recipient's Position]</p>
    <p>[Recipient's Company]</p>
    <p>[Recipient's Address]</p>
    <p>[City, State, ZIP Code]</p>
  </section>

  <section>
    <p>Dear [Recipient's Name],</p>

    <p>
      I am writing to [state the purpose of the letter, e.g., "follow up on our previous discussion about..."]. [Briefly introduce the subject and provide necessary details.]
    </p>

    <p>
      [Expand on the purpose of the letter, outlining key points and providing additional context if necessary. Keep the content clear and concise.]
    </p>

    <p>
      Thank you for your time and attention. I look forward to your response and am happy to provide additional information if needed. Please feel free to reach out to me at [Your Phone Number] or [Your Email Address].
    </p>

    <p>Sincerely,</p>
    <p>[Your Name]</p>
  </section>
    `,
    isFreeAccessible: false, // PAID template
  },
];

export const assignmentTemplates = [
  {
    id: "blank",
    label: "Blank Document",
    imageUrl: "/assets/images/assignmentImages/blank-document.svg",
    initialContent: ``,
  },
  {
    id: "report",
    label: "Report",
    imageUrl: "/assets/images/assignmentImages/report.svg",
    initialContent: `
      <h1>Title of Report</h1>
      <h2>Introduction</h2>
      <p>[Add your introduction here...]</p>
      <h2>Objective</h2>
      <p>[State the objective here...]</p>
      <h2>Methods</h2>
      <p>[Describe the methods used...]</p>
      <h2>Results</h2>
      <p>[Summarize the findings here...]</p>
      <h2>Conclusion</h2>
      <p>[Provide your conclusion here...]</p>
    `,
  },
  {
    id: "essay",
    label: "Essay",
    imageUrl: "/assets/images/assignmentImages/essay.svg",
    initialContent: `
      <h1>Title of Essay</h1>
      <h2>Introduction</h2>
      <p>[Write your introduction here...]</p>
      <h2>Main Body</h2>
      <p>[Develop your arguments here...]</p>
      <h2>Conclusion</h2>
      <p>[Summarize your key points here...]</p>
    `,
  },
  {
    id: "research-proposal",
    label: "Research Proposal",
    imageUrl: "/assets/images/assignmentImages/research-proposal.svg",
    initialContent: `
      <h1>Title of Research Proposal</h1>
      <h2>Abstract</h2>
      <p>[Write the abstract here...]</p>
      <h2>Introduction</h2>
      <p>[Provide an introduction to the research topic...]</p>
      <h2>Methodology</h2>
      <p>[Outline the methodology...]</p>
      <h2>Expected Results</h2>
      <p>[Describe the expected results...]</p>
    `,
  },
  {
    id: "case-study",
    label: "Case Study Analysis",
    imageUrl: "/assets/images/assignmentImages/case-study.svg",
    initialContent: `
      <h1>Title of Case Study</h1>
      <h2>Problem Statement</h2>
      <p>[State the problem being analyzed...]</p>
      <h2>Analysis</h2>
      <p>[Provide an analysis of the problem...]</p>
      <h2>Proposed Solutions</h2>
      <p>[Offer solutions based on your analysis...]</p>
      <h2>Conclusion</h2>
      <p>[Summarize your findings...]</p>
    `,
  },
  {
    id: "lab-report",
    label: "Lab Report",
    imageUrl: "/assets/images/assignmentImages/lab-report.svg",
    initialContent: `
      <h1>Title of Lab Report</h1>
      <h2>Objective</h2>
      <p>[State the objective of the experiment...]</p>
      <h2>Materials</h2>
      <p>[List the materials used...]</p>
      <h2>Procedure</h2>
      <p>[Describe the procedure followed...]</p>
      <h2>Results</h2>
      <p>[Summarize the results...]</p>
    `,
  },
  {
    id: "presentation-outline",
    label: "Presentation Outline",
    imageUrl: "/assets/images/assignmentImages/presentation-outline.svg",
    initialContent: `
      <h1>Title of Presentation</h1>
      <h2>Introduction</h2>
      <p>[Introduce the topic and provide an overview...]</p>
      <h2>Main Points</h2>
      <ul>
        <li>[Main Point 1]</li>
        <li>[Main Point 2]</li>
        <li>[Main Point 3]</li>
      </ul>
      <h2>Conclusion</h2>
      <p>[Summarize the key takeaways and provide closing remarks...]</p>
    `,
  },
];

export const adminSidebar = [
  {
    name: "school admins",
    route: "",
    icon: FaFolderOpen,
  },
  {
    name: "Feedbacks",
    route: "feedbacks",
    icon: FaFolderOpen,
  },
  {
    name: "Billing",
    route: "billing",
    icon: FaMoneyBillWave,
  },
  {
    name: "Withdrawals",
    route: "withdrawals",
    icon: FaHandHoldingUsd,
  },
  {
    name: "cancellations",
    route: "cancellations",
    icon: FaClipboardList,
    disabled: true,
  },
  {
    name: "Platform Settings",
    route: "platform-settings",
    icon: FaCog,
  },
  { name: "Support", route: "support", icon: LifeBuoy },
];

export const getSidebar = () => {
  const commonItems = [
    {
      section: "General",
      items: [
        { name: "Support", route: "support", icon: LifeBuoy },
        { name: "Profile", route: "profile", icon: FaUser },
        { name: "Settings", route: "settings", icon: FaCog },
      ],
    },
  ];

  const studentItems = [
    {
      section: "Main",
      items: [
        { name: "Home", route: "", icon: HomeIcon },
        { name: "My Project", route: "project", icon: FaFolderOpen },
      ],
    },
  ];

  return [...studentItems, ...commonItems];
};

export const AnotherGlobalSearchFilters = Object.freeze([
  { name: "Projects", value: "project", icon: FaFolderOpen },
  { name: "Assignments", value: "assignment", icon: FaClipboardList },
  { name: "Users", value: "user", icon: FaUser },
  { name: "Courses", value: "course", icon: FaBookOpen },
]);

export const countryOptions = getNames().map((name) => {
  const isoCode = getCode(name); // e.g. "NG"
  let dialCode = "";

  try {
    if (isoCode) {
      dialCode = `+${getCountryCallingCode(isoCode as CountryCode)}`;
    }
  } catch (e) {
    dialCode = "";
  }

  return {
    label: name, // "Nigeria"
    value: isoCode || name, // ✅ use "NG"
    code: dialCode, // "+234"
  };
});
