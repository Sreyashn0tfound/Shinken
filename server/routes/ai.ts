import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';

export const aiRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

interface ParsedQuestion {
    questionText: string;
    options: string[];
    correctAnswer: string;
}

interface ParsedSection {
    sectionTitle: string;
    questions: ParsedQuestion[];
}

/**
 * Parses raw exam text deterministically without external AI models.
 */
function parseExamText(rawText: string): ParsedSection[] {
    // Normalize newlines and whitespace
    const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 1. Extract Answer Key if present at the end (e.g., "Answer Key: 1. A, 2. B" or "1: A\n2: B")
    const answerKeyMap = new Map<number, string>();
    const answerKeyRegex = /(?:answer\s*key|answers?|solutions?)[\s\S]*$/i;
    const answerKeyMatch = text.match(answerKeyRegex);

    let mainContent = text;
    if (answerKeyMatch && answerKeyMatch.index !== undefined) {
        const keyBlock = text.slice(answerKeyMatch.index);
        mainContent = text.slice(0, answerKeyMatch.index);

        // Match patterns like: 1. A or Q1: B or 1 - C or (1) D
        const keyItemRegex = /(?:Q\s*)?(\d+)[\s.:)-]+([A-Da-d])/g;
        let match: RegExpExecArray | null;
        while ((match = keyItemRegex.exec(keyBlock)) !== null) {
            const qNum = parseInt(match[1], 10);
            answerKeyMap.set(qNum, match[2].toUpperCase());
        }
    }

    // 2. Identify Sections (e.g. "SECTION 1", "PART A", "MODULE 1")
    // If no section headers exist, default to a single master section.
    const sectionHeaderRegex = /(?:^|\n)(SECTION\s+[A-Z0-9]+[^\n]*|PART\s+[A-Z0-9]+[^\n]*|MODULE\s+[A-Z0-9]+[^\n]*)/gi;
    const sectionSplits = mainContent.split(sectionHeaderRegex).map(s => s.trim()).filter(Boolean);

    let rawSections: { title: string; body: string }[] = [];

    if (sectionSplits.length <= 1) {
        rawSections.push({ title: "SECTION 1 - GENERAL", body: mainContent });
    } else {
        // If the first block didn't start with a header
        let startIndex = 0;
        if (!sectionSplits[0].toUpperCase().startsWith("SECTION") &&
            !sectionSplits[0].toUpperCase().startsWith("PART") &&
            !sectionSplits[0].toUpperCase().startsWith("MODULE")) {
            rawSections.push({ title: "SECTION 1 - GENERAL", body: sectionSplits[0] });
            startIndex = 1;
        }

        for (let i = startIndex; i < sectionSplits.length; i += 2) {
            const title = sectionSplits[i];
            const body = sectionSplits[i + 1] || "";
            rawSections.push({ title: title.toUpperCase(), body });
        }
    }

    // 3. Parse Questions and Options inside each section
    const parsedSections: ParsedSection[] = [];
    let globalQuestionCounter = 1;

    for (const sec of rawSections) {
        const questions: ParsedQuestion[] = [];

        // Split text by numbered questions: "1.", "1)", "Q1.", "Question 1:"
        const qBlockRegex = /(?:^|\n)(?:Q\s*)?(\d+)[\.\)]\s+/g;
        const parts = sec.body.split(qBlockRegex);

        // parts[0] is text before question 1
        for (let i = 1; i < parts.length; i += 2) {
            const qNum = parseInt(parts[i], 10) || globalQuestionCounter;
            const qContent = parts[i + 1]?.trim() || "";
            if (!qContent) continue;

            // Look for options A), B), C), D) or A., B., C., D.
            const optionRegex = /(?:^|\n|\s+)(?:[\(\[]?([A-Da-d])[\)\].])\s+/g;
            const optSplits = qContent.split(optionRegex);

            const questionText = optSplits[0]?.trim() || `Question ${qNum}`;
            const options: string[] = [];
            let inlineAnswerLetter: string | null = null;

            for (let j = 1; j < optSplits.length; j += 2) {
                const letter = optSplits[j]?.toUpperCase();
                let optText = optSplits[j + 1]?.trim() || "";

                // Check for inline answer flag inside option (e.g. "printf() [Ans]")
                if (/(?:\[ans\]|\[correct\]|\(correct\)|✅)/i.test(optText)) {
                    inlineAnswerLetter = letter;
                    optText = optText.replace(/(?:\[ans\]|\[correct\]|\(correct\)|✅)/gi, '').trim();
                }

                options.push(`${letter}) ${optText}`);
            }

            // Check if there is an inline "Answer: B" below the options
            const inlineMatch = qContent.match(/(?:Ans|Answer|Correct):\s*([A-Da-d])/i);
            if (inlineMatch) {
                inlineAnswerLetter = inlineMatch[1].toUpperCase();
            }

            // Determine target letter from inline or trailing answer key map
            const targetLetter = inlineAnswerLetter || answerKeyMap.get(qNum) || "A";

            // Match target letter to the exact formatted option string
            let matchedCorrectOption = options.find(o => o.startsWith(`${targetLetter})`));
            if (!matchedCorrectOption && options.length > 0) {
                matchedCorrectOption = options[0]; // Safe fallback
            }

            if (options.length >= 2) {
                questions.push({
                    questionText,
                    options,
                    correctAnswer: matchedCorrectOption || (options[0] || "A) None")
                });
            }

            globalQuestionCounter++;
        }

        if (questions.length > 0) {
            parsedSections.push({
                sectionTitle: sec.title,
                questions
            });
        }
    }

    // If section extraction missed, wrap all parsed questions into one default section
    if (parsedSections.length === 0 && mainContent.trim().length > 0) {
        return [{
            sectionTitle: "SECTION 1 - MAIN EXAM",
            questions: []
        }];
    }

    return parsedSections;
}

// --- API ROUTE ---
aiRouter.post('/parse', upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    try {
        const { rawText } = req.body;
        let textToParse = rawText || "";

        // If file buffer exists, extract raw text directly via pdf-parse
        if (req.file) {
            const pdfData = await pdfParse(req.file.buffer);
            textToParse = pdfData.text;
        }

        if (!textToParse.trim()) {
            return res.status(400).json({ error: "No text or PDF file provided." });
        }

        const sections = parseExamText(textToParse);

        if (!sections.length || !sections[0].questions.length) {
            return res.status(422).json({
                error: "Could not detect numbered questions. Ensure questions follow '1. Question' and options follow 'A) ... B) ...'"
            });
        }

        res.json({ sections });
    } catch (error: any) {
        console.error("Deterministic Parse Error:", error);
        res.status(500).json({ error: "Failed to parse document format.", detail: error.message });
    }
});