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
};

// Round-robin order jab naye agents spawn hon
export const SERVICE_ORDER = Object.keys(SERVICES);
