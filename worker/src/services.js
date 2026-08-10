// services.js
// 4 "complete deliverable" services — generic snippets ki jagah, jo $5 price ko justify
// karte hain (Fiverr per inki comparable price $10-30 hoti hai). Naye agent spawn hote
// waqt in mein se round-robin ek service assign hoti hai (brain.py dekhein).
//
// Request contract: POST body = { "input": "<main content>" }

export const SERVICES = {
  jobpack: {
    label: "Job Application Pack",
    price: "$5.00",
    description:
      "Job description + resume text dein -> tailored cover letter + 5 interview-prep questions milte hain. Body: { input: '<job description>\\n\\nRESUME:\\n<resume text>' }",
    buildPrompt: (body) => {
      const input = typeof body === "string" ? body : body.input || "";
      return `You are a career coach. Based on the job description and resume text below, write:\n1) A tailored, concise cover letter (max 200 words)\n2) 5 likely interview questions with one-line answer tips\n\nFormat clearly with headers "COVER LETTER:" and "INTERVIEW PREP:".\n\nINPUT:\n${input}`;
    },
  },
  listing: {
    label: "E-commerce Listing Writer",
    price: "$5.00",
    description:
      "Product details dein -> SEO title + description + 5 bullet points milte hain, ready to paste (Amazon/Daraz/Shopify). Body: { input: '<product name and details>' }",
    buildPrompt: (body) => {
      const input = typeof body === "string" ? body : body.input || "";
      return `You are an e-commerce copywriter. Based on the product details below, write:\n1) An SEO-friendly product title (max 15 words)\n2) A persuasive 2-3 sentence description\n3) 5 bullet points highlighting features/benefits\n\nFormat clearly with headers "TITLE:", "DESCRIPTION:", "BULLETS:".\n\nPRODUCT DETAILS:\n${input}`;
    },
  },
  social: {
    label: "Social Media Content Pack",
    price: "$5.00",
    description:
      "Business/topic dein -> 7 din ke captions + hashtags milte hain. Body: { input: '<business or topic description>' }",
    buildPrompt: (body) => {
      const input = typeof body === "string" ? body : body.input || "";
      return `You are a social media manager. Based on the business/topic below, write 7 short social media captions (one per day, numbered Day 1-7), each with 3-5 relevant hashtags.\n\nBUSINESS/TOPIC:\n${input}`;
    },
  },
  pitch: {
    label: "Business One-Pager",
    price: "$5.00",
    description:
      "Idea describe karein -> problem, solution, target market, aur ek pitch paragraph milta hai. Body: { input: '<idea description>' }",
    buildPrompt: (body) => {
      const input = typeof body === "string" ? body : body.input || "";
      return `You are a startup advisor. Based on the idea below, write a concise one-pager with these sections: "PROBLEM:", "SOLUTION:", "TARGET MARKET:", "PITCH:" (a punchy 3-sentence pitch paragraph).\n\nIDEA:\n${input}`;
    },
  },
  resume: {
    label: "AI Resume Rewriter",
    price: "$5.00",
    description:
      "Purana resume text dein -> professional, ATS-friendly bullet points milte hain, ready to paste. Body: { input: '<current resume text>' }",
    buildPrompt: (body) => {
      const input = typeof body === "string" ? body : body.input || "";
      return `You are a professional resume writer. Rewrite the resume text below into strong, ATS-friendly bullet points (action verb + achievement + result/number where possible). Keep the same jobs/sections, just improve the wording. Output ONLY the rewritten resume.\n\nRESUME:\n${input}`;
    },
  },
  linkedin: {
    label: "AI LinkedIn Profile Optimizer",
    price: "$5.00",
    description:
      "Apni current role/background batayein -> ek professional headline + About section milta hai. Body: { input: '<current role, experience, goals>' }",
    buildPrompt: (body) => {
      const input = typeof body === "string" ? body : body.input || "";
      return `You are a LinkedIn branding expert. Based on the background below, write: 1) A compelling LinkedIn headline (under 220 characters) 2) A LinkedIn "About" section (3 short paragraphs, first-person, engaging). Format with headers "HEADLINE:" and "ABOUT:".\n\nBACKGROUND:\n${input}`;
    },
  },
  speech: {
    label: "AI Wedding/Event Speech Writer",
    price: "$5.00",
    description:
      "Occasion aur relationship batayein -> ek heartfelt, ready-to-read speech milta hai. Body: { input: '<occasion, who is speaking, relationship, key memories/points to include>' }",
    buildPrompt: (body) => {
      const input = typeof body === "string" ? body : body.input || "";
      return `You are a professional speech writer. Based on the details below, write a warm, well-structured speech (300-400 words) suitable for reading aloud, with a clear opening, 2-3 personal anecdote placeholders, and a closing toast/blessing line.\n\nDETAILS:\n${input}`;
    },
  },
  script: {
    label: "AI YouTube Script Writer",
    price: "$5.00",
    description:
      "Video topic/idea batayein -> hook + full script (intro/body/outro) milta hai. Body: { input: '<video topic, target audience, video length>' }",
    buildPrompt: (body) => {
      const input = typeof body === "string" ? body : body.input || "";
      return `You are a YouTube scriptwriter. Based on the details below, write a video script with a strong 3-second hook, clear body sections, and a call-to-action outro. Format with headers "HOOK:", "SCRIPT:", "OUTRO:".\n\nDETAILS:\n${input}`;
    },
  },
  email: {
    label: "AI Email Sequence Writer",
    price: "$5.00",
    description:
      "Business/product batayein -> 3-email welcome/sales sequence milta hai. Body: { input: '<business, product, and goal of the emails>' }",
    buildPrompt: (body) => {
      const input = typeof body === "string" ? body : body.input || "";
      return `You are an email marketing copywriter. Based on the details below, write a 3-email sequence (Email 1: welcome, Email 2: value/story, Email 3: offer/CTA). Format each with "SUBJECT:" and "BODY:".\n\nDETAILS:\n${input}`;
    },
  },
  bio: {
    label: "AI Personal Bio Writer",
    price: "$5.00",
    description:
      "Apne baare mein batayein -> short aur long bio milte hain (Instagram, website, author bio ke liye). Body: { input: '<who you are, what you do, achievements>' }",
    buildPrompt: (body) => {
      const input = typeof body === "string" ? body : body.input || "";
      return `You are a professional bio writer. Based on the details below, write two versions: 1) A short bio (under 160 characters, for social media) 2) A long bio (100-150 words, for a website/author page). Format with headers "SHORT BIO:" and "LONG BIO:".\n\nDETAILS:\n${input}`;
    },
  },
};

// Round-robin order jab naye agents spawn hon
export const SERVICE_ORDER = Object.keys(SERVICES);
